import { ReactNode } from 'react';
import {
  GistEmbed,
  CodeSandboxEmbed,
  StackBlitzEmbed,
  CodePenEmbed,
  parseEmbedUrl,
} from '@/components/markdown/CodeEmbed';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';

interface CustomLinkProps {
  children?: ReactNode;
  href?: string;
  className?: string;
}

export function CustomLink({ children, href, className }: CustomLinkProps) {
  if (href) {
    const embed = parseEmbedUrl(href);
    if (embed) {
      switch (embed.type) {
        case 'gist':
          return <GistEmbed username={embed.username} gistId={embed.id} file={embed.file} />;
        case 'codesandbox':
          return <CodeSandboxEmbed sandboxId={embed.id} />;
        case 'stackblitz':
          return <StackBlitzEmbed projectId={embed.id} />;
        case 'codepen':
          return <CodePenEmbed username={embed.username} penId={embed.id} />;
      }
    }
  }

  return (
    <a
      href={href}
      className={className || styles.link}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
