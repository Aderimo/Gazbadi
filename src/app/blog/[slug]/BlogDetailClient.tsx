'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { ContentItem, BlogContent } from '@/types';

interface BlogDetailClientProps {
  item: ContentItem;
}

export default function BlogDetailClient({ item }: BlogDetailClientProps) {
  const { locale } = useLanguage();
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

/* ─── Markdown Renderer ─── */
function MarkdownRenderer({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="mt-8 mb-3 text-lg font-semibold text-accent-amber">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="mt-10 mb-4 text-xl font-bold text-white">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="mt-10 mb-4 text-2xl font-bold text-white">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    // Bullet list
    if (trimmed.startsWith('- ')) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(
          <li key={i} className="flex items-start gap-2 text-gray-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-turquoise" />
            <span>{renderInline(lines[i].trim().slice(2))}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-3 space-y-2 pl-1">
          {listItems}
        </ul>
      );
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="leading-relaxed text-gray-300">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-4">{elements}</div>;
}

/** Inline Markdown: **bold** and *italic* */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic text-gray-200">
          {match[3]}
        </em>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
