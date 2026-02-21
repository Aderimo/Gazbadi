'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import CommentSection from '@/components/ui/CommentSection';
import { trackView } from '@/lib/user-profile';
import type { ContentItem, BlogContent } from '@/types';

interface BlogDetailClientProps {
  item: ContentItem;
}

export default function BlogDetailClient({ item }: BlogDetailClientProps) {
  const { locale } = useLanguage();

  useEffect(() => { trackView(item.slug); }, [item.slug]);

  const content = getLocalizedContent(
    item.content as { tr: BlogContent; en: BlogContent },
    locale
  );

  const publishedDate = new Date(item.createdAt).toLocaleDateString(
    locale === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <article className="min-h-screen bg-dark">
      {/* Cover Section */}
      <CoverSection
        coverImage={item.coverImage}
        title={content.title}
        summary={content.summary}
        date={publishedDate}
      />

      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Blog Body */}
        <section className="pt-12">
          <div className="glass-card p-6 sm:p-10">
            <MarkdownRenderer markdown={content.body} />
          </div>
        </section>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <section className="mt-12">
            <SectionHeading text={locale === 'tr' ? 'Etiketler' : 'Tags'} />
            <div className="mt-4 flex flex-wrap gap-2">
              {content.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full border border-accent-turquoise/20 bg-accent-turquoise/10 px-4 py-1.5 text-xs font-medium text-accent-turquoise"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Comments */}
        <CommentSection slug={item.slug} contentType="blog" locale={locale} />
      </div>
    </article>
  );
}


/* ─── Cover Section ─── */
function CoverSection({
  coverImage,
  title,
  summary,
  date,
}: {
  coverImage: string;
  title: string;
  summary: string;
  date: string;
}) {
  return (
    <header className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <OptimizedImage
        src={coverImage}
        alt={title}
        lazy={false}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent-turquoise">
            ✦ Blog
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-300/90">{summary}</p>
          <time className="mt-4 inline-block text-sm text-gray-400">{date}</time>
        </div>
      </div>
    </header>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-semibold text-white">{text}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-accent-turquoise/40 to-transparent" />
    </div>
  );
}

/* ─── Markdown Renderer (Enhanced) ─── */
function MarkdownRenderer({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let keyIdx = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) { i++; continue; }

    // Code block ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={keyIdx++} className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-black/40">
          {lang && <div className="border-b border-white/5 px-4 py-1.5 text-[10px] font-mono text-gray-500 uppercase">{lang}</div>}
          <pre className="p-4 text-sm leading-relaxed"><code className="font-mono text-gray-300">{codeLines.join('\n')}</code></pre>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      elements.push(<hr key={keyIdx++} className="my-8 border-white/10" />);
      i++; continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={keyIdx++} className="mt-8 mb-3 text-lg font-semibold text-accent-amber">{renderInline(trimmed.slice(4))}</h3>);
      i++; continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={keyIdx++} className="mt-10 mb-4 text-xl font-bold text-white">{renderInline(trimmed.slice(3))}</h2>);
      i++; continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={keyIdx++} className="mt-10 mb-4 text-2xl font-bold text-white">{renderInline(trimmed.slice(2))}</h1>);
      i++; continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote key={keyIdx++} className="my-4 border-l-2 border-accent-turquoise/50 bg-accent-turquoise/5 rounded-r-lg pl-4 pr-4 py-3 text-gray-300 italic">
          {quoteLines.map((ql, qi) => <p key={qi}>{renderInline(ql)}</p>)}
        </blockquote>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const text = lines[i].trim().replace(/^\d+\.\s/, '');
        listItems.push(
          <li key={i} className="text-gray-300 pl-1">{renderInline(text)}</li>
        );
        i++;
      }
      elements.push(
        <ol key={keyIdx++} className="my-3 list-decimal space-y-2 pl-6 marker:text-accent-turquoise">
          {listItems}
        </ol>
      );
      continue;
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const text = lines[i].trim().slice(2);
        listItems.push(
          <li key={i} className="flex items-start gap-2 text-gray-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-turquoise" />
            <span>{renderInline(text)}</span>
          </li>
        );
        i++;
      }
      elements.push(<ul key={keyIdx++} className="my-3 space-y-2 pl-1">{listItems}</ul>);
      continue;
    }

    // Paragraph
    elements.push(<p key={keyIdx++} className="leading-relaxed text-gray-300">{renderInline(trimmed)}</p>);
    i++;
  }

  return <div className="space-y-4">{elements}</div>;
}

/** Inline: **bold**, *italic*, `code`, [link](url) */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Match: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));

    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index} className="italic text-gray-200">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-accent-turquoise">{match[4]}</code>);
    } else if (match[5] && match[6]) {
      parts.push(<a key={match.index} href={match[6]} target="_blank" rel="noopener noreferrer" className="text-accent-turquoise underline decoration-accent-turquoise/30 hover:decoration-accent-turquoise transition-colors">{match[5]}</a>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
