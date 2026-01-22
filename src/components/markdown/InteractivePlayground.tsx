'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { useTheme } from 'next-themes';
import { nightOwl } from '@codesandbox/sandpack-themes';

interface InteractivePlaygroundProps {
  code: string;
  filename?: string;
}

export default function InteractivePlayground({ code, filename = 'App.js' }: InteractivePlaygroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div style={{ margin: '2rem 0' }}>
      <Sandpack
        template="react"
        theme={isDark ? nightOwl : 'light'}
        files={{
          [filename]: code,
        }}
        options={{
          showLineNumbers: true,
          showInlineErrors: true,
          wrapContent: true,
          editorHeight: 400,
          resizablePanels: true,
        }}
      />
    </div>
  );
}
