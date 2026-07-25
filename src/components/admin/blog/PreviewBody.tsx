type PreviewBodyProps = {
    html: string;
};

// Mirrors lc_web's PostBody prose styles so the admin preview looks
// identical to how the article will render on the public marketing site.
export default function PreviewBody({ html }: PreviewBodyProps) {
    return (
        <div
            className="post-body text-[16px] leading-[1.75] text-[#2b2b32]
                 [&_p]:mt-6 [&_p:first-child]:mt-0
                 [&_p.lead]:text-[18px] [&_p.lead]:leading-[1.7] [&_p.lead]:text-[#0f0f11] [&_p.lead]:font-medium
                 [&_h2]:mt-12 [&_h2]:mb-3 [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-[#0f0f11]
                 [&_h3]:mt-10 [&_h3]:mb-2 [&_h3]:text-[20px] [&_h3]:font-semibold [&_h3]:leading-snug [&_h3]:tracking-[-0.01em] [&_h3]:text-[#0f0f11]
                 [&_ul]:mt-5 [&_ul]:space-y-2 [&_ul]:pl-5
                 [&_ol]:mt-5 [&_ol]:space-y-2 [&_ol]:pl-5
                 [&_ul_li]:list-disc [&_ul_li]:marker:text-[#8c00ff]
                 [&_ol_li]:list-decimal [&_ol_li]:marker:font-semibold [&_ol_li]:marker:text-[#8c00ff]
                 [&_li]:pl-1
                 [&_strong]:font-semibold [&_strong]:text-[#0f0f11]
                 [&_em]:italic
                 [&_a]:font-medium [&_a]:text-[#8c00ff] [&_a]:underline [&_a]:decoration-[#8c00ff]/30 [&_a]:underline-offset-4 [&_a:hover]:decoration-[#8c00ff]
                 [&_blockquote]:my-8 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#8c00ff] [&_blockquote]:bg-[#f3eefe]/60 [&_blockquote]:px-6 [&_blockquote]:py-5 [&_blockquote]:text-[16px] [&_blockquote]:italic [&_blockquote]:leading-relaxed [&_blockquote]:text-[#0f0f11]
                 [&_code]:rounded-md [&_code]:border [&_code]:border-slate-200 [&_code]:bg-slate-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-mono [&_code]:text-[#0f0f11]
                 [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-900 [&_pre]:p-5 [&_pre]:text-[13px] [&_pre]:leading-relaxed [&_pre]:text-slate-100
                 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
                 [&_img]:my-8 [&_img]:w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-slate-200
                 [&_hr]:my-10 [&_hr]:border-slate-200
                 [&_table]:my-8 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-2xl [&_table]:border [&_table]:border-slate-200 [&_table]:text-[14px]
                 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#0f0f11]
                 [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top [&_td]:text-[#2b2b32]
                 [&_tr:nth-child(even)_td]:bg-slate-50/40"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
