"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export function Tooltip({ text, children, side = "top", className }: TooltipProps) {
    if (!text) return <>{children}</>;

    return (
        <div className={cn("group/tip relative inline-flex hover:z-[200]", className)}>
            {children}
            <div
                role="tooltip"
                className={cn(
                    "pointer-events-none absolute z-[200] max-w-[220px] break-words rounded-md",
                    "bg-[#0F172A] px-2 py-1 text-[10px] font-medium leading-snug text-white",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.3)]",
                    "opacity-0 transition-opacity duration-100 group-hover/tip:opacity-100",
                    side === "top"    && "bottom-full left-1/2 mb-2 -translate-x-1/2",
                    side === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2",
                    side === "left"   && "right-full top-1/2 mr-2 -translate-y-1/2",
                    side === "right"  && "left-full top-1/2 ml-2 -translate-y-1/2",
                )}
            >
                {text}
                <span
                    className={cn(
                        "absolute border-[4px]",
                        side === "top"    && "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[#0F172A]",
                        side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[#0F172A]",
                        side === "left"   && "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[#0F172A]",
                        side === "right"  && "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[#0F172A]",
                    )}
                />
            </div>
        </div>
    );
}
