export const RUNNABLE_LANGUAGES = ['javascript', 'js', 'typescript', 'ts'];

export interface MarkdownImage {
  alt: string;
  src: string;
}

export function extractImagesFromMarkdown(content: string): MarkdownImage[] {
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const matches: MarkdownImage[] = [];
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    matches.push({ alt: match[1], src: match[2] });
  }
  return matches;
}
