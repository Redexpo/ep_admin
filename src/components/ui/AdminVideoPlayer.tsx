"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, RotateCw } from "lucide-react";

interface AdminVideoPlayerProps {
    screenUrl: string;
    cameraUrl?: string | null;
    audioUrl?: string | null;
    posterUrl?: string | null;
    duration: number;
}

function formatTime(s: number) {
    if (!isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AdminVideoPlayer({ screenUrl, cameraUrl, audioUrl, posterUrl, duration }: AdminVideoPlayerProps) {
    const screenRef = useRef<HTMLVideoElement>(null);
    const cameraRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const screenHls = useRef<Hls | null>(null);
    const cameraHls = useRef<Hls | null>(null);
    const audioHls = useRef<Hls | null>(null);
    const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Set true on first play click so canplay handler knows to auto-play
    const shouldAutoPlay = useRef(false);

    const [loaded, setLoaded] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [muted, setMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [ready, setReady] = useState(false);

    const [screenOn, setScreenOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [audioOn, setAudioOn] = useState(true);

    const totalDuration = duration || 0;
    const hasCam = !!cameraUrl;
    const hasAudio = !!audioUrl;

    const attachHls = useCallback((media: HTMLMediaElement, url: string, hlsRef: React.RefObject<Hls | null>) => {
        if (Hls.isSupported()) {
            const hls = new Hls({ capLevelToPlayerSize: true, abrEwmaDefaultEstimate: 4_000_000, startLevel: -1 });
            hls.loadSource(url);
            hls.attachMedia(media);
            hlsRef.current = hls;
        } else if (media.canPlayType("application/vnd.apple.mpegurl")) {
            media.src = url;
        }
    }, []);

    // Screen HLS — only attaches after user clicks play for the first time
    useEffect(() => {
        if (!loaded) return;
        const screen = screenRef.current;
        if (!screen || !screenUrl) return;

        attachHls(screen, screenUrl, screenHls);

        const onCanPlay = () => {
            setReady(true);
            if (shouldAutoPlay.current) {
                shouldAutoPlay.current = false;
                screen.play()
                    .then(() => {
                        cameraRef.current?.play().catch(() => {});
                        audioRef.current?.play().catch(() => {});
                        setPlaying(true);
                    })
                    .catch(() => {});
            }
        };
        const onTimeUpdate = () => {
            setCurrentTime(screen.currentTime);
            if (screen.buffered.length > 0) setBuffered(screen.buffered.end(screen.buffered.length - 1));
        };
        const onEnded = () => setPlaying(false);

        screen.addEventListener("canplay", onCanPlay);
        screen.addEventListener("timeupdate", onTimeUpdate);
        screen.addEventListener("ended", onEnded);

        return () => {
            screen.removeEventListener("canplay", onCanPlay);
            screen.removeEventListener("timeupdate", onTimeUpdate);
            screen.removeEventListener("ended", onEnded);
            screenHls.current?.destroy();
            screenHls.current = null;
        };
    }, [loaded, screenUrl, attachHls]);

    useEffect(() => {
        if (!loaded || !cameraUrl) return;
        const camera = cameraRef.current;
        if (!camera) return;
        attachHls(camera, cameraUrl, cameraHls);
        return () => { cameraHls.current?.destroy(); cameraHls.current = null; };
    }, [loaded, cameraUrl, attachHls]);

    useEffect(() => {
        if (!loaded || !audioUrl) return;
        const audio = audioRef.current;
        if (!audio) return;
        attachHls(audio, audioUrl, audioHls);
        return () => { audioHls.current?.destroy(); audioHls.current = null; };
    }, [loaded, audioUrl, attachHls]);

    // Route volume/mute to the correct audio source
    useEffect(() => {
        if (!loaded) return;
        if (hasAudio) {
            if (screenRef.current) screenRef.current.muted = true;
            if (cameraRef.current) cameraRef.current.muted = true;
            if (audioRef.current) {
                audioRef.current.muted = !audioOn || muted;
                audioRef.current.volume = volume;
            }
        } else {
            if (screenRef.current) {
                screenRef.current.muted = muted;
                screenRef.current.volume = volume;
            }
        }
    }, [loaded, hasAudio, audioOn, muted, volume]);

    // Drop screen to lowest quality when no visuals needed
    useEffect(() => {
        if (!loaded) return;
        if (!screenOn && !cameraOn && screenHls.current) screenHls.current.currentLevel = 0;
        else if (screenHls.current) screenHls.current.currentLevel = -1;
    }, [loaded, screenOn, cameraOn]);

    const syncTracks = useCallback((screenVideo: HTMLVideoElement) => {
        const camera = cameraRef.current;
        if (camera && cameraUrl) {
            camera.currentTime = screenVideo.currentTime;
            if (!screenVideo.paused) camera.play().catch(() => {});
            else camera.pause();
        }
        const audio = audioRef.current;
        if (audio && audioUrl) {
            audio.currentTime = screenVideo.currentTime;
            if (!screenVideo.paused) audio.play().catch(() => {});
            else audio.pause();
        }
    }, [cameraUrl, audioUrl]);

    // First play: trigger HLS load + auto-play via shouldAutoPlay ref
    const handleFirstPlay = useCallback(() => {
        shouldAutoPlay.current = true;
        setLoaded(true);
    }, []);

    const togglePlay = useCallback(async () => {
        const screen = screenRef.current;
        if (!screen) return;
        if (screen.paused) {
            await screen.play();
            cameraRef.current?.play().catch(() => {});
            audioRef.current?.play().catch(() => {});
            setPlaying(true);
        } else {
            screen.pause();
            cameraRef.current?.pause();
            audioRef.current?.pause();
            setPlaying(false);
        }
    }, []);

    const seek = useCallback((time: number) => {
        const screen = screenRef.current;
        if (!screen) return;
        screen.currentTime = time;
        syncTracks(screen);
    }, [syncTracks]);

    const skip = useCallback((delta: number) => {
        const screen = screenRef.current;
        if (!screen) return;
        const next = Math.min(Math.max(screen.currentTime + delta, 0), screen.duration || totalDuration);
        screen.currentTime = next;
        syncTracks(screen);
    }, [syncTracks, totalDuration]);

    const handleVolumeChange = (val: number) => { setVolume(val); setMuted(val === 0); };
    const toggleMute = () => setMuted(v => !v);

    const fullscreen = () => {
        const el = screenRef.current?.closest("[data-player-root]") as HTMLElement | null;
        el?.requestFullscreen().catch(() => {});
    };

    const resetControls = useCallback(() => {
        setShowControls(true);
        if (controlsTimer.current) clearTimeout(controlsTimer.current);
        controlsTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 2500);
    }, [playing]);

    useEffect(() => () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); }, []);

    const progressPct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
    const bufferedPct = totalDuration > 0 ? (buffered / totalDuration) * 100 : 0;

    const showScreen = screenOn;
    const showCamera = cameraOn && hasCam;
    const pip = showScreen && showCamera;
    const cameraFull = !showScreen && showCamera;
    const noVisuals = !showScreen && !showCamera;
    const controlsVisible = showControls || !playing;

    const toggles = [
        { label: 'Screen', on: screenOn, set: setScreenOn },
        ...(hasCam   ? [{ label: 'Camera', on: cameraOn, set: setCameraOn }] : []),
        ...(hasAudio ? [{ label: 'Audio',  on: audioOn,  set: setAudioOn  }] : []),
    ];

    return (
        <div
            data-player-root
            className="relative w-full aspect-video bg-black rounded-[32px] overflow-hidden group select-none"
            onMouseMove={() => loaded && resetControls()}
            onMouseLeave={() => loaded && playing && setShowControls(false)}
        >
            {/* ── PRE-LOAD STATE ── thumbnail + big play button, zero network requests ── */}
            {!loaded && (
                <div
                    className="absolute inset-0 cursor-pointer z-20"
                    onClick={handleFirstPlay}
                >
                    {posterUrl ? (
                        <img src={posterUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#0a0a0a]" />
                    )}
                    {/* Dark scrim + play button */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:scale-105 transition-transform">
                            <Play size={32} className="text-white fill-white ml-1.5" />
                        </div>
                    </div>
                </div>
            )}

            {/* ── POST-LOAD STATE ── video elements + controls ── */}
            {/* Always rendered so refs are available when loaded triggers HLS attach */}

            {hasAudio && <audio ref={audioRef} preload="none" />}

            <video
                ref={screenRef}
                className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${!showScreen ? 'opacity-0 pointer-events-none' : ''}`}
                preload="none"
                playsInline
            />

            {hasCam && (
                <video
                    ref={cameraRef}
                    className={`transition-all duration-200 ${
                        pip
                            ? 'absolute bottom-16 right-4 w-[22%] aspect-video rounded-xl border-2 border-white/20 shadow-lg object-cover z-10'
                            : cameraFull
                                ? 'absolute inset-0 w-full h-full object-cover'
                                : 'absolute w-0 h-0 opacity-0 pointer-events-none'
                    }`}
                    preload="none"
                    playsInline
                    muted
                />
            )}

            {/* Audio-only / nothing-selected overlay */}
            {loaded && noVisuals && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#08040f] pointer-events-none">
                    <div className="flex items-end gap-[3px] h-8 mb-3">
                        {[40, 70, 55, 90, 60, 80, 45, 75, 50].map((h, i) => (
                            <div
                                key={i}
                                className={`w-1 bg-[#8c00ff] rounded-full ${playing && audioOn ? 'animate-pulse' : ''}`}
                                style={{ height: `${h}%`, animationDelay: `${i * 0.08}s`, opacity: playing && audioOn ? 1 : 0.2 }}
                            />
                        ))}
                    </div>
                    <p className="text-white/30 text-[11px] font-bold tracking-widest uppercase">
                        {hasAudio && audioOn ? 'Audio Only' : 'No Track Selected'}
                    </p>
                </div>
            )}

            {/* Track toggles — only visible after load */}
            {loaded && (
                <div className={`absolute top-4 left-4 z-20 flex items-center gap-1.5 transition-opacity duration-200 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    {toggles.map(({ label, on, set }) => (
                        <button
                            key={label}
                            onClick={e => { e.stopPropagation(); set(v => !v); }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider backdrop-blur-sm transition-all active:scale-95 ${
                                on
                                    ? 'bg-[#8c00ff] text-white shadow-lg shadow-purple-900/50'
                                    : 'bg-black/50 text-white/30 line-through decoration-white/30'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* Click-to-play overlay (only after initial load) */}
            {loaded && <div className="absolute inset-0 cursor-pointer z-[5]" onClick={togglePlay} />}

            {/* Centre play button when paused (after load) */}
            {loaded && !playing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                        <Play size={26} className="text-white fill-white ml-1" />
                    </div>
                </div>
            )}

            {/* Controls bar */}
            {loaded && (
                <div className={`absolute bottom-0 left-0 right-0 px-5 pb-4 pt-12 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-200 z-20 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <div
                        className="relative h-1 rounded-full bg-white/20 cursor-pointer mb-3 group/bar"
                        onClick={e => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            seek(((e.clientX - rect.left) / rect.width) * totalDuration);
                        }}
                    >
                        <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${bufferedPct}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-[#8c00ff] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover/bar:opacity-100 transition-opacity"
                            style={{ left: `${progressPct}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors"><RotateCcw size={15} /></button>
                        <button onClick={togglePlay} className="text-white hover:text-[#8c00ff] transition-colors">
                            {playing ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                        </button>
                        <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors"><RotateCw size={15} /></button>
                        <span className="text-[11px] font-mono text-white/70 ml-1">
                            {formatTime(currentTime)} / {formatTime(totalDuration)}
                        </span>
                        <div className="flex-1" />
                        <button onClick={toggleMute} className="text-white/70 hover:text-white transition-colors">
                            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                            type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                            onChange={e => handleVolumeChange(Number(e.target.value))}
                            className="w-16 accent-[#8c00ff] cursor-pointer"
                        />
                        <button onClick={fullscreen} className="text-white/70 hover:text-white transition-colors"><Maximize size={15} /></button>
                    </div>
                </div>
            )}

            {/* Loading spinner — only after load triggered, before canplay */}
            {loaded && !ready && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div className="w-10 h-10 relative">
                        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#8c00ff] border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
            )}
        </div>
    );
}
