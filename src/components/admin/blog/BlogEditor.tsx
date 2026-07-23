'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading2, Heading3, List, ListOrdered, Quote, Code,
    Link as LinkIcon, Image as ImageIcon, Undo2, Redo2,
    Minus, Pilcrow,
} from 'lucide-react';

type BlogEditorProps = {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
};

function ToolbarButton({
    active,
    disabled,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                active
                    ? 'border-[#8c00ff]/40 bg-[#f3eefe] text-[#8c00ff]'
                    : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />;
}

function Toolbar({ editor }: { editor: Editor }) {
    const promptLink = () => {
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL', previous ?? 'https://');
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const promptImage = () => {
        const url = window.prompt('Image URL', 'https://');
        if (!url) return;
        editor.chain().focus().setImage({ src: url, alt: '' }).run();
    };

    return (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-slate-100 bg-white/95 px-3 py-2 backdrop-blur">
            <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                <Undo2 size={15} />
            </ToolbarButton>
            <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                <Redo2 size={15} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}>
                <Pilcrow size={15} />
            </ToolbarButton>
            <ToolbarButton title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                <Heading2 size={15} />
            </ToolbarButton>
            <ToolbarButton title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                <Heading3 size={15} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={15} />
            </ToolbarButton>
            <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={15} />
            </ToolbarButton>
            <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon size={15} />
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough size={15} />
            </ToolbarButton>
            <ToolbarButton title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
                <Code size={15} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={15} />
            </ToolbarButton>
            <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={15} />
            </ToolbarButton>
            <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus size={15} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Link" active={editor.isActive('link')} onClick={promptLink}>
                <LinkIcon size={15} />
            </ToolbarButton>
            <ToolbarButton title="Image" onClick={promptImage}>
                <ImageIcon size={15} />
            </ToolbarButton>
        </div>
    );
}

export default function BlogEditor({ value, onChange, placeholder }: BlogEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Underline,
            Placeholder.configure({
                placeholder: placeholder ?? 'Start writing your article…',
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                protocols: ['https', 'http', 'mailto'],
                HTMLAttributes: {
                    class: 'text-[#8c00ff] underline decoration-[#8c00ff]/30 underline-offset-4 hover:decoration-[#8c00ff]',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'my-4 rounded-xl border border-slate-200',
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    'blog-editor prose max-w-none px-6 py-6 focus:outline-none min-h-[420px] text-[15px] leading-[1.75] text-[#0f172a] ' +
                    '[&_p]:my-3 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-[-0.02em] ' +
                    '[&_h3]:mt-6 [&_h3]:mb-1 [&_h3]:text-[18px] [&_h3]:font-semibold ' +
                    '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 ' +
                    '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8c00ff] [&_blockquote]:bg-[#f3eefe]/50 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic ' +
                    '[&_code]:rounded [&_code]:border [&_code]:border-slate-200 [&_code]:bg-slate-50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono ' +
                    '[&_hr]:my-6 [&_hr]:border-slate-200 ' +
                    '[&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-slate-400',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Keep external value in sync (e.g. when loading an existing post)
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (value && value !== current) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
    }, [editor, value]);

    if (!editor) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="h-12 border-b border-slate-100" />
                <div className="min-h-[420px] px-6 py-6 text-[14px] text-slate-400">
                    Loading editor…
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
