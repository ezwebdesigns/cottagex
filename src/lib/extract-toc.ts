export type TocItem = { id: string; text: string; level: number };

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const headingRegex = /<h([23])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;

export function generateToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '');
    if (text.trim()) {
      items.push({ id: slugify(text), text, level });
    }
  }
  return items;
}

export function injectHeadingIds(html: string): string {
  return html.replace(headingRegex, (match, level, content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const id = slugify(text);
    return `<h${level} id="${id}" class="scroll-mt-24">${content}</h${level}>`;
  });
}
