import katex from 'katex';
import React, { Suspense, lazy } from 'react';

const MathChartBlock = lazy(() =>
  import('./MathChartBlock').then((m) => ({ default: m.MathChartBlock }))
);

export function renderKatexToHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return latex;
  }
}

export function FormulaBlock({
  expression,
  display = true,
  className = '',
}: {
  expression: string;
  display?: boolean;
  className?: string;
}) {
  const html = renderKatexToHtml(expression, display);
  return (
    <span
      dir="ltr"
      className={`inline-block max-w-full overflow-x-auto align-middle ${display ? 'w-full text-center' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Convert Mathai01-style HTML structural tags and LaTeX delimiters
 * into clean Markdown/LaTeX segments while preserving $...$, $$...$$ and ```chart blocks.
 */
function normalizeRichMathText(raw: string): string {
  let text = String(raw || '');

  // Convert \[...\] and \(...\) to $$...$$ and $...$
  text = text
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$${String(inner || '').trim()}$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${String(inner || '').trim()}$`);

  // Convert common HTML structural tags into clean Markdown equivalents
  text = text
    .replace(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi, '\n## $1\n')
    .replace(/<h[3456][^>]*>([\s\S]*?)<\/h[3456]>/gi, '\n### $1\n')
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`')
    .replace(/<hr\s*\/?>/gi, '\n---\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?p[^>]*>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, '\n');

  // Convert <ol><li>...</li></ol> to numbered lines
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, inner) => {
    let idx = 0;
    return (
      '\n' +
      String(inner).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_lm, liBody) => {
        idx += 1;
        return `${idx}. ${String(liBody).trim()}\n`;
      }) +
      '\n'
    );
  });

  // Convert <ul><li>...</li></ul> to bullet lines
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, inner) => {
    return (
      '\n' +
      String(inner).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_lm, liBody) => {
        return `- ${String(liBody).trim()}\n`;
      }) +
      '\n'
    );
  });

  // Convert simple HTML <table> to Markdown table
  text = text.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_m, tableInner) => {
    const rows: string[][] = [];
    const trMatches = String(tableInner).match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
    for (const tr of trMatches) {
      const cells = (tr.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || []).map((cell) =>
        cell
          .replace(/<\/?t[hd][^>]*>/gi, '')
          .replace(/\n+/g, ' ')
          .trim()
      );
      if (cells.length > 0) rows.push(cells);
    }
    if (rows.length === 0) return '';
    const header = `| ${rows[0].join(' | ')} |`;
    const sep = `| ${rows[0].map(() => '---').join(' | ')} |`;
    const body = rows
      .slice(1)
      .map((r) => `| ${r.join(' | ')} |`)
      .join('\n');
    return `\n${header}\n${sep}\n${body}\n`;
  });

  // Strip any remaining stray HTML tags safely (outside code/math)
  text = text.replace(/<\/?(?:span|section|article|header|footer|thead|tbody|tr|td|th|li|ol|ul)[^>]*>/gi, '');

  return text;
}

function sanitizeSvgMarkup(rawSvg: string): string | null {
  const match = String(rawSvg || '').match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return null;
  let svg = match[0];
  svg = svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:href|xlink:href)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, '')
    .replace(/(?:href|xlink:href)\s*=\s*(?:"\s*data:text\/html[^"]*"|'\s*data:text\/html[^']*')/gi, '');

  // Ensure responsive sizing while preserving viewBox
  svg = svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    const cleaned = attrs
      .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
      .trim();
    return `<svg ${cleaned} class="max-w-full h-auto mx-auto block" style="max-height:280px">`;
  });
  return svg;
}

/**
 * Renders mixed Arabic/English/Turkish text + **bold** + `code` + tables + lists +
 * inline $...$ and block $$...$$ LaTeX + ```chart Chart.js blocks + ```svg geometry blocks safely in RTL/LTR.
 */
export function MathText({
  text,
  className = '',
  onEquationClick,
}: {
  text: string;
  className?: string;
  onEquationClick?: (latex: string) => void;
}) {
  if (!text) return null;

  const normalized = normalizeRichMathText(text);

  // 1. Split out ```chart ... ```, ```svg ... ``` and ```code``` blocks first
  const segmentRegex = /(```chart[\s\S]*?```|```svg[\s\S]*?```|```(?:[a-zA-Z0-9_-]*)?\n[\s\S]*?```|\$\$[\s\S]*?\$\$)/g;
  const blocks = normalized.split(segmentRegex).filter((b) => b.length > 0);

  return (
    <div
      className={`min-w-0 space-y-2.5 break-words leading-relaxed ${
        onEquationClick ? 'chat-math-interactive' : ''
      } ${className}`}
    >
      {blocks.map((block, bIdx) => {
        // Chart.js block
        if (block.startsWith('```chart') && block.endsWith('```')) {
          const jsonBody = block.slice('```chart'.length, -3).trim();
          return (
            <Suspense
              key={bIdx}
              fallback={
                <div className="my-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
                  جارٍ تحميل الرسم البياني...
                </div>
              }
            >
              <MathChartBlock rawJson={jsonBody} />
            </Suspense>
          );
        }

        // Geometry SVG diagram block
        if (block.startsWith('```svg') && block.endsWith('```')) {
          const svgRaw = block.slice('```svg'.length, -3).trim();
          const safeSvg = sanitizeSvgMarkup(svgRaw);
          if (!safeSvg) return null;
          return (
            <figure
              key={bIdx}
              dir="ltr"
              className="my-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-xs dark:border-slate-700"
            >
              <div
                className="flex justify-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: safeSvg }}
              />
              <figcaption
                dir="rtl"
                className="mt-2 border-t border-slate-100 pt-1.5 text-center text-[11px] font-medium text-slate-500"
              >
                رسم هندسي توضيحي
              </figcaption>
            </figure>
          );
        }

        // Code block
        if (block.startsWith('```') && block.endsWith('```')) {
          const codeBody = block.replace(/^```[a-zA-Z0-9_-]*\n?/, '').slice(0, -3).trim();
          return (
            <pre
              key={bIdx}
              dir="ltr"
              className="my-2 max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-3.5 text-left font-mono text-xs text-slate-100 dark:border-slate-700"
            >
              <code>{codeBody}</code>
            </pre>
          );
        }

        // Display block math $$...$$
        if (block.startsWith('$$') && block.endsWith('$$')) {
          const expr = block.slice(2, -2).trim();
          if (!expr) return null;
          return (
            <div
              key={bIdx}
              dir="ltr"
              onClick={() => onEquationClick?.(expr)}
              title={onEquationClick ? 'انقر لإدراج أو نسخ المعادلة' : undefined}
              className={`my-2 max-w-full overflow-x-auto rounded-xl bg-slate-50 px-3 py-3 text-center sm:px-4 dark:bg-slate-800/70 ${
                onEquationClick
                  ? 'cursor-pointer border border-transparent transition-colors hover:border-blue-300 dark:hover:border-sky-600'
                  : ''
              }`}
              dangerouslySetInnerHTML={{ __html: renderKatexToHtml(expr, true) }}
            />
          );
        }

        // Regular prose / headings / lists / markdown tables
        return (
          <ProseBlock
            key={bIdx}
            text={block}
            onEquationClick={onEquationClick}
          />
        );
      })}
    </div>
  );
}

function ProseBlock({
  text,
  onEquationClick,
}: {
  text: string;
  onEquationClick?: (latex: string) => void;
}) {
  const lines = text.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal divider
    if (/^---+$/.test(trimmed)) {
      elements.push(
        <hr key={`hr-${i}`} className="my-2 border-slate-200 dark:border-slate-700" />
      );
      i++;
      continue;
    }

    // Markdown table detection
    if (
      trimmed.startsWith('|') &&
      i + 1 < lines.length &&
      /^\|?[\s:|-]+\|/.test(lines[i + 1].trim())
    ) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const parseCells = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = parseCells(tableLines[0]);
      const rows = tableLines.slice(2).map(parseCells);

      elements.push(
        <div
          key={`tbl-${i}`}
          className="my-2 max-w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <table className="w-full border-collapse text-center text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
              <tr>
                {headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="border-b border-slate-200 px-3 py-2 font-semibold dark:border-slate-700"
                  >
                    {renderInlineSegments(h, onEquationClick)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
              {rows.map((r, rIdx) => (
                <tr key={rIdx}>
                  {r.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-2 text-slate-700 tabular-nums dark:text-slate-200"
                    >
                      {renderInlineSegments(cell, onEquationClick)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const hMatch = trimmed.match(/^(#{2,4})\s+([\s\S]+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const content = renderInlineSegments(hMatch[2], onEquationClick);
      if (level === 2) {
        elements.push(
          <h3
            key={`h2-${i}`}
            className="pt-2 font-display text-base sm:text-lg font-bold text-blue-900 dark:text-sky-300"
          >
            {content}
          </h3>
        );
      } else {
        elements.push(
          <h4
            key={`h3-${i}`}
            className="pt-1.5 font-display text-[15px] sm:text-base font-bold text-slate-900 dark:text-white"
          >
            {content}
          </h4>
        );
      }
      i++;
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal space-y-1.5 ps-5 text-[15px] leading-7"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineSegments(item, onEquationClick)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="list-disc space-y-1.5 ps-5 text-[15px] leading-7"
        >
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineSegments(item, onEquationClick)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${i}`} className="text-[15px] leading-7">
        {renderInlineSegments(rawLine, onEquationClick)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

function renderInlineSegments(
  line: string,
  onEquationClick?: (latex: string) => void
): React.ReactNode[] {
  // Split by inline math $...$
  const parts = line.split(/(\$[^$\n]+\$)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const expr = part.slice(1, -1);
      return (
        <span
          key={idx}
          dir="ltr"
          onClick={onEquationClick ? () => onEquationClick(expr) : undefined}
          title={onEquationClick ? 'انقر لإدراج أو نسخ المعادلة' : undefined}
          className={`mx-1 inline-block align-baseline text-slate-900 dark:text-slate-100 ${
            onEquationClick ? 'math-clickable' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: renderKatexToHtml(expr, false) }}
        />
      );
    }

    // Handle **bold**, *italic*, and `inline code`
    const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g;
    const subParts = part.split(tokenRegex);
    return (
      <React.Fragment key={idx}>
        {subParts.map((sp, spIdx) => {
          if (sp.startsWith('**') && sp.endsWith('**') && sp.length >= 4) {
            return (
              <strong
                key={spIdx}
                className="font-semibold text-slate-900 dark:text-white"
              >
                {sp.slice(2, -2)}
              </strong>
            );
          }
          if (sp.startsWith('`') && sp.endsWith('`') && sp.length >= 2) {
            return (
              <code
                key={spIdx}
                dir="ltr"
                className="mx-0.5 rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-700 dark:text-slate-100"
              >
                {sp.slice(1, -1)}
              </code>
            );
          }
          if (sp.startsWith('*') && sp.endsWith('*') && sp.length >= 2) {
            return <em key={spIdx}>{sp.slice(1, -1)}</em>;
          }
          return <React.Fragment key={spIdx}>{sp}</React.Fragment>;
        })}
      </React.Fragment>
    );
  });
}
