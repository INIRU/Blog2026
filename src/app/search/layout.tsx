import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '검색',
  description: '블로그 글을 검색해보세요. 원하는 주제의 글을 쉽게 찾을 수 있습니다.',
  openGraph: {
    title: '검색 | INIRU Blog',
    description: '블로그 글을 검색해보세요.',
    url: 'https://blog.iniru.xyz/search',
    type: 'website',
  },
  alternates: {
    canonical: 'https://blog.iniru.xyz/search',
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
