import Link from "next/link";
import path from "node:path";
import type { ReactNode } from "react";
import {
  getDocPageHref,
  getRawDocHref,
  normalizeRepoRelativePath,
} from "../lib/docs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function resolveRelativeHref(currentPath: string, href: string) {
  if (
    !href ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const [targetPath, hash = ""] = href.split("#");
  const baseDir = path.posix.dirname(currentPath);
  const resolved = normalizeRepoRelativePath(
    path.posix.join(baseDir, targetPath),
  );
  if (!resolved) {
    return href;
  }

  const suffix = hash ? `#${hash}` : "";
  if (resolved.endsWith(".md")) {
    return `${getDocPageHref(resolved)}${suffix}`;
  }

  return `${getRawDocHref(resolved)}${suffix}`;
}

function renderInline(
  text: string,
  currentPath: string,
  keyPrefix: string,
): ReactNode[] {
  const tokens: ReactNode[] = [];
  const pattern =
    /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push(text.slice(cursor, match.index));
    }

    const [
      full,
      imageAlt,
      imageHref,
      linkText,
      linkHref,
      codeText,
      strongText,
      emText,
    ] = match;
    const key = `${keyPrefix}-${match.index}`;

    if (imageHref) {
      tokens.push(
        <img
          key={key}
          alt={imageAlt}
          className="doc-image"
          src={resolveRelativeHref(currentPath, imageHref)}
        />,
      );
    } else if (linkHref) {
      const href = resolveRelativeHref(currentPath, linkHref);
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:")
      ) {
        tokens.push(
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {linkText}
          </a>,
        );
      } else {
        tokens.push(
          <Link key={key} href={href}>
            {linkText}
          </Link>,
        );
      }
    } else if (codeText) {
      tokens.push(<code key={key}>{codeText}</code>);
    } else if (strongText) {
      tokens.push(<strong key={key}>{strongText}</strong>);
    } else if (emText) {
      tokens.push(<em key={key}>{emText}</em>);
    } else {
      tokens.push(full);
    }

    cursor = match.index + full.length;
  }

  if (cursor < text.length) {
    tokens.push(text.slice(cursor));
  }

  return tokens;
}

function splitTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function MarkdownRenderer(props: {
  content: string;
  currentPath: string;
}) {
  const lines = props.content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const codeMatch = line.match(/^```(.*)$/);
    if (codeMatch) {
      const language = codeMatch[1].trim();
      const content: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        content.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`code-${blocks.length}`} className="doc-code">
          <code data-language={language || undefined}>
            {content.join("\n")}
          </code>
        </pre>,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugify(text);
      const children = renderInline(
        text,
        props.currentPath,
        `heading-${blocks.length}`,
      );
      if (level === 1) {
        blocks.push(
          <h1 key={id} id={id}>
            {children}
          </h1>,
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={id} id={id}>
            {children}
          </h2>,
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={id} id={id}>
            {children}
          </h3>,
        );
      } else if (level === 4) {
        blocks.push(
          <h4 key={id} id={id}>
            {children}
          </h4>,
        );
      } else if (level === 5) {
        blocks.push(
          <h5 key={id} id={id}>
            {children}
          </h5>,
        );
      } else {
        blocks.push(
          <h6 key={id} id={id}>
            {children}
          </h6>,
        );
      }
      index += 1;
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      /^\|?[\s:-|]+\|?\s*$/.test(lines[index + 1])
    ) {
      const header = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].startsWith("|")) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push(
        <div key={`table-${blocks.length}`} className="table-wrap">
          <table className="table doc-table">
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={`th-${cellIndex}`}>
                    {renderInline(
                      cell,
                      props.currentPath,
                      `th-${blocks.length}-${cellIndex}`,
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`tr-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`td-${rowIndex}-${cellIndex}`}>
                      {renderInline(
                        cell,
                        props.currentPath,
                        `td-${blocks.length}-${rowIndex}-${cellIndex}`,
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`li-${itemIndex}`}>
              {renderInline(
                item,
                props.currentPath,
                `ul-${blocks.length}-${itemIndex}`,
              )}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${blocks.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`li-${itemIndex}`}>
              {renderInline(
                item,
                props.currentPath,
                `ol-${blocks.length}-${itemIndex}`,
              )}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith(">")) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {quote.map((item, itemIndex) => (
            <p key={`qp-${itemIndex}`}>
              {renderInline(
                item,
                props.currentPath,
                `quote-${blocks.length}-${itemIndex}`,
              )}
            </p>
          ))}
        </blockquote>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index]) &&
      !/^```/.test(lines[index]) &&
      !/^[-*]\s+/.test(lines[index]) &&
      !/^\d+\.\s+/.test(lines[index]) &&
      !lines[index].startsWith(">") &&
      !(
        lines[index].startsWith("|") &&
        index + 1 < lines.length &&
        /^\|?[\s:-|]+\|?\s*$/.test(lines[index + 1])
      )
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`p-${blocks.length}`}>
        {renderInline(
          paragraph.join(" "),
          props.currentPath,
          `p-${blocks.length}`,
        )}
      </p>,
    );
  }

  return <div className="doc-prose">{blocks}</div>;
}

export function MarkdownArticle(props: { content: string }) {
  return (
    <MarkdownRenderer
      content={props.content}
      currentPath="content/models/_inline.mdx"
    />
  );
}
