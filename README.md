# INIRU Blog

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?logo=vercel)](https://vercel.com/)

Next.js 15 App Router 기반의 개인 블로그입니다.

**Live**: [https://blog.iniru.xyz](https://blog.iniru.xyz)

---

## Features

### 글 작성 & 관리
- Markdown 에디터 (툴바 지원)
- 이미지 업로드 + 크롭 + WebP 자동 변환
- 시리즈 기능 (연재물 관리)
- 글 미리보기 (발행 전 임시 URL)
- 태그 시스템

### 읽기 경험
- 읽기 진행률 바
- 목차 (Table of Contents) + 스크롤 하이라이트
- 이미지 Lightbox (클릭 시 확대, 좌우 네비게이션)
- 이전/다음 글 네비게이션
- 관련 글 추천

### 코드 블록
- Syntax Highlighting (30+ 언어)
- 언어별 아이콘 표시
- 파일명 지원 (` ```js:app.js `)
- 코드 복사 버튼
- **JS/TS 실시간 실행** (Run 버튼)
- 외부 코드 임베드 (Gist, CodeSandbox, StackBlitz, CodePen)

### 인터랙션
- 댓글 / 대댓글
- 좋아요
- 북마크 (localStorage)
- 공유 (클립보드 복사)
- 검색 + 자동완성

### UI/UX
- 다크모드 지원
- framer-motion 페이지 전환 애니메이션
- 반응형 디자인
- 404/500 에러 페이지

### SEO
- sitemap.xml 자동 생성
- robots.txt
- RSS 피드 (`/feed.xml`)
- OpenGraph 메타데이터
- JSON-LD 구조화 데이터

### Admin 대시보드
- 조회수/좋아요 통계
- 인기 글 Top 5
- 글 발행/비공개 전환
- 이미지 관리

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + CSS Modules |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Animation | framer-motion |
| Markdown | react-markdown + remark-gfm + rehype-raw |
| Code Highlight | react-syntax-highlighter |
| Analytics | Vercel Analytics + Speed Insights |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/INIRU/Blog.git
cd Blog
bun install
```

### 2. Environment Variables

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAIL=your_admin_email@example.com
```

### 3. Supabase Setup

Supabase SQL Editor에서 실행:

```sql
-- Posts 테이블
CREATE TABLE posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text DEFAULT '',
  content text NOT NULL,
  thumbnail_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  series_name text,
  series_order integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments 테이블
CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_view_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 좋아요 증가 함수
CREATE OR REPLACE FUNCTION increment_like_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts SET like_count = like_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

Supabase Storage에서 `blog-images` 버킷 생성 (Public 설정).

### 4. Run Development Server

```bash
bun dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin 페이지
│   ├── posts/[slug]/       # 글 상세
│   ├── preview/[id]/       # 미리보기
│   ├── search/             # 검색
│   └── tags/               # 태그
├── components/
│   ├── admin/              # Admin 컴포넌트
│   ├── comment/            # 댓글
│   ├── layout/             # Header, Footer
│   ├── markdown/           # Markdown 렌더러
│   ├── post/               # 글 관련
│   └── ui/                 # 공통 UI
├── contexts/               # React Context
├── lib/                    # 유틸리티
│   └── supabase/           # Supabase 클라이언트
└── styles/                 # CSS Modules
```

---

## Deployment

Vercel에 자동 배포:

```bash
vercel
```

또는 GitHub 연동 후 Push 시 자동 배포.

---

## License

MIT License

---

## Author

**INIRU**
- Blog: [https://blog.iniru.xyz](https://blog.iniru.xyz)
- GitHub: [@INIRU](https://github.com/INIRU)
