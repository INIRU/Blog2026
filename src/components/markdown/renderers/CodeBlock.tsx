'use client';

import { ReactNode, useState, lazy, Suspense } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { HiClipboard, HiCheck } from 'react-icons/hi';
import { CodeRunner } from '@/components/markdown/CodeRunner';
import { LanguageIcon } from '@/components/markdown/LanguageIcon';
import styles from '@/styles/components/markdown/MarkdownRenderer.module.css';
import { RUNNABLE_LANGUAGES } from '@/lib/markdown';
import { useMounted } from '@/hooks/useMounted';

const InteractivePlayground = lazy(() => import('@/components/markdown/InteractivePlayground'));

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  node?: any;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className={styles.copyButton} title="Copy code">
      {copied ? <HiCheck /> : <HiClipboard />}
    </button>
  );
}

export function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const codeString = String(children).replace(/\n$/, '');
  
  if (inline || !className?.includes('language-')) {
    return (
      <code className={styles.inlineCode} {...props}>
        {children}
      </code>
    );
  }

  const match = /language-(\w+)(?::(.+))?/.exec(className || '');
  const language = match ? match[1] : 'text';
  const metaParts = match?.[2]?.split(':') || [];
  
  const filename = metaParts.find(part => !['live', 'norun'].includes(part)) || null;
  const isLive = metaParts.includes('live') || className?.includes('live');
  const isNoRun = metaParts.includes('norun') || className?.includes('norun');
  
  const meta = props.node?.data?.meta || '';
  
  if (meta.includes('live') || (isLive && (language === 'jsx' || language === 'tsx' || language === 'js' || language === 'ts'))) {
    return (
      <Suspense fallback={<div className={styles.playgroundLoading}>Loading Playground...</div>}>
        <InteractivePlayground code={codeString} filename={filename || 'App.js'} />
      </Suspense>
    );
  }
  
  if (!meta.includes('norun') && !isNoRun) {
    if (RUNNABLE_LANGUAGES.includes(language.toLowerCase())) {
      return <CodeRunner code={codeString} language={language} filename={filename} />;
    }
  }

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <div className={styles.codeHeaderLeft}>
          <LanguageIcon language={language} size={16} />
          {filename ? (
            <span className={styles.filename}>{filename}</span>
          ) : (
            <span className={styles.language}>{language}</span>
          )}
        </div>
        <CopyButton code={codeString} />
      </div>
      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0 0 8px 8px',
          fontSize: '0.875rem',
          lineHeight: '1.7',
        }}
        lineNumberStyle={{
          minWidth: '2rem',
          paddingRight: '1rem',
          opacity: 0.5,
          userSelect: 'none',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}
