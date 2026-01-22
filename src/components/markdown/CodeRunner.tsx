'use client';

import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { HiPlay, HiTrash, HiClipboard, HiCheck } from 'react-icons/hi';
import { LanguageIcon } from '@/components/markdown/LanguageIcon';
import styles from '@/styles/components/markdown/CodeRunner.module.css';

interface CodeRunnerProps {
  code: string;
  language: string;
  filename?: string | null;
}

interface ExecutionResult {
  output: string[];
  error: string | null;
  duration: number;
}

export function CodeRunner({ code, language, filename }: CodeRunnerProps) {
  const { resolvedTheme } = useTheme();
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const isRunnable = ['javascript', 'js', 'typescript', 'ts'].includes(language.toLowerCase());

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeCode = useCallback(async () => {
    if (!isRunnable || isRunning) return;

    setIsRunning(true);
    setResult(null);

    const output: string[] = [];
    const startTime = performance.now();

    const customConsole = {
      log: (...args: unknown[]) => {
        output.push(args.map(formatValue).join(' '));
      },
      error: (...args: unknown[]) => {
        output.push(`[Error] ${args.map(formatValue).join(' ')}`);
      },
      warn: (...args: unknown[]) => {
        output.push(`[Warn] ${args.map(formatValue).join(' ')}`);
      },
      info: (...args: unknown[]) => {
        output.push(`[Info] ${args.map(formatValue).join(' ')}`);
      },
      table: (data: unknown) => {
        output.push(JSON.stringify(data, null, 2));
      },
      clear: () => {
        output.length = 0;
      },
    };

    try {
      const wrappedCode = `
        (function(console) {
          "use strict";
          ${code}
        })
      `;

      const fn = eval(wrappedCode);
      const returnValue = fn(customConsole);

      if (returnValue !== undefined) {
        output.push(`→ ${formatValue(returnValue)}`);
      }

      const duration = performance.now() - startTime;
      setResult({ output, error: null, duration });
    } catch (err) {
      const duration = performance.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);
      setResult({ output, error: errorMessage, duration });
    }

    setIsRunning(false);
  }, [code, isRunnable, isRunning]);

  const clearResult = () => {
    setResult(null);
  };

  return (
    <div className={styles.codeRunner}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <LanguageIcon language={language} size={16} />
          {filename ? (
            <span className={styles.filename}>{filename}</span>
          ) : (
            <span className={styles.language}>{language}</span>
          )}
          {isRunnable && <span className={styles.runnableBadge}>실행 가능</span>}
        </div>
        <div className={styles.actions}>
          {isRunnable && (
            <button
              onClick={executeCode}
              disabled={isRunning}
              className={styles.runButton}
              title="코드 실행 (Ctrl+Enter)"
            >
              <HiPlay />
              {isRunning ? '실행 중...' : '실행'}
            </button>
          )}
          <button onClick={handleCopy} className={styles.copyButton} title="복사">
            {copied ? <HiCheck /> : <HiClipboard />}
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        style={isDark ? oneDark : oneLight}
        language={language}
        PreTag="div"
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.7',
          borderRadius: result ? 0 : '0 0 8px 8px',
        }}
        lineNumberStyle={{
          minWidth: '2rem',
          paddingRight: '1rem',
          opacity: 0.5,
          userSelect: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>

      {result && (
        <div className={styles.output}>
          <div className={styles.outputHeader}>
            <span className={styles.outputTitle}>
              출력 {result.error ? '(에러)' : ''}
              <span className={styles.duration}>{result.duration.toFixed(1)}ms</span>
            </span>
            <button onClick={clearResult} className={styles.clearButton} title="결과 지우기">
              <HiTrash />
            </button>
          </div>
          <div className={styles.outputContent}>
            {result.output.map((line, i) => (
              <div key={i} className={styles.outputLine}>
                {line}
              </div>
            ))}
            {result.error && <div className={styles.errorLine}>{result.error}</div>}
            {result.output.length === 0 && !result.error && (
              <div className={styles.emptyOutput}>출력 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (typeof value === 'symbol') return value.toString();
  if (Array.isArray(value)) {
    if (value.length > 10) {
      return `[${value.slice(0, 10).map(formatValue).join(', ')}, ... +${value.length - 10} items]`;
    }
    return `[${value.map(formatValue).join(', ')}]`;
  }
  if (typeof value === 'object') {
    try {
      const str = JSON.stringify(value, null, 2);
      if (str.length > 500) {
        return str.slice(0, 500) + '...';
      }
      return str;
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  return String(value);
}
