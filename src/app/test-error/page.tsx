'use client';

import { useEffect } from 'react';

export default function TestErrorPage() {
  useEffect(() => {
    throw new Error('테스트 에러입니다!');
  }, []);

  return <div>Loading...</div>;
}
