'use client';

import { useEmbedLoad } from '@/hooks/useEmbedLoad';
import styles from '@/styles/components/markdown/CodeEmbed.module.css';

interface GistEmbedProps {
  gistId: string;
  username: string;
  file?: string;
}

export function GistEmbed({ gistId, username, file }: GistEmbedProps) {
  const { isLoaded, handleLoad } = useEmbedLoad();
  const gistUrl = file
    ? `https://gist.github.com/${username}/${gistId}.js?file=${file}`
    : `https://gist.github.com/${username}/${gistId}.js`;

  return (
    <div className={styles.embedWrapper}>
      {!isLoaded && <div className={styles.loading}>Gist 로딩 중...</div>}
      <iframe
        src={`data:text/html;charset=utf-8,
          <head>
            <base target="_blank">
            <style>
              body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              .gist .gist-file { border: none !important; margin-bottom: 0 !important; }
              .gist .gist-data { border-bottom: none !important; }
              .gist .blob-wrapper { border-radius: 0 !important; }
            </style>
          </head>
          <body>
            <script src="${gistUrl}"></script>
          </body>`}
        className={styles.gistFrame}
        onLoad={handleLoad}
        sandbox="allow-scripts allow-same-origin allow-popups"
        title={`GitHub Gist: ${gistId}`}
      />
    </div>
  );
}

interface CodeSandboxEmbedProps {
  sandboxId: string;
}

export function CodeSandboxEmbed({ sandboxId }: CodeSandboxEmbedProps) {
  const { isLoaded, handleLoad } = useEmbedLoad();

  return (
    <div className={styles.embedWrapper}>
      {!isLoaded && <div className={styles.loading}>CodeSandbox 로딩 중...</div>}
      <iframe
        src={`https://codesandbox.io/embed/${sandboxId}?fontsize=14&hidenavigation=1&theme=dark&view=preview`}
        className={styles.sandboxFrame}
        onLoad={handleLoad}
        allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
        sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        title={`CodeSandbox: ${sandboxId}`}
      />
    </div>
  );
}

interface StackBlitzEmbedProps {
  projectId: string;
}

export function StackBlitzEmbed({ projectId }: StackBlitzEmbedProps) {
  const { isLoaded, handleLoad } = useEmbedLoad();

  return (
    <div className={styles.embedWrapper}>
      {!isLoaded && <div className={styles.loading}>StackBlitz 로딩 중...</div>}
      <iframe
        src={`https://stackblitz.com/edit/${projectId}?embed=1&file=index.js&theme=dark`}
        className={styles.sandboxFrame}
        onLoad={handleLoad}
        title={`StackBlitz: ${projectId}`}
      />
    </div>
  );
}

interface CodePenEmbedProps {
  username: string;
  penId: string;
}

export function CodePenEmbed({ username, penId }: CodePenEmbedProps) {
  const { isLoaded, handleLoad } = useEmbedLoad();

  return (
    <div className={styles.embedWrapper}>
      {!isLoaded && <div className={styles.loading}>CodePen 로딩 중...</div>}
      <iframe
        src={`https://codepen.io/${username}/embed/${penId}?default-tab=result&theme-id=dark`}
        className={styles.sandboxFrame}
        onLoad={handleLoad}
        allowFullScreen
        title={`CodePen: ${penId}`}
      />
    </div>
  );
}

export function parseEmbedUrl(url: string) {
  const gistMatch = url.match(/gist\.github\.com\/([^/]+)\/([a-f0-9]+)(?:#file-(.+))?/);
  if (gistMatch) {
    return {
      type: 'gist' as const,
      username: gistMatch[1],
      id: gistMatch[2],
      file: gistMatch[3]?.replace(/-/g, '.'),
    };
  }

  const codesandboxMatch = url.match(/codesandbox\.io\/(?:s|embed)\/([a-z0-9-]+)/i);
  if (codesandboxMatch) {
    return { type: 'codesandbox' as const, id: codesandboxMatch[1] };
  }

  const stackblitzMatch = url.match(/stackblitz\.com\/(?:edit|embed)\/([a-z0-9-]+)/i);
  if (stackblitzMatch) {
    return { type: 'stackblitz' as const, id: stackblitzMatch[1] };
  }

  const codepenMatch = url.match(/codepen\.io\/([^/]+)\/(?:pen|embed)\/([a-zA-Z0-9]+)/);
  if (codepenMatch) {
    return { type: 'codepen' as const, username: codepenMatch[1], id: codepenMatch[2] };
  }

  return null;
}
