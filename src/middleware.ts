import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // 관리자 경로(/admin) 또는 미리보기(/preview) 경로 보호
  if (pathname.startsWith('/admin') || pathname.startsWith('/preview')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      }
    });

    const token = req.cookies.get('sb-lpgqcleszdlldneiwgep-auth-token')?.value;

    // 비로그인 상태에서는 로그인 페이지 접근 허용
    if (!token) {
      return res;
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res;
      }

      const adminEmail = process.env.ADMIN_EMAIL;
      
      if (user.email !== adminEmail) {
        // 관리자가 아니면 홈으로 리다이렉트
        return NextResponse.redirect(new URL('/', req.url));
      }
    } catch (err) {
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/preview/:path*'],
};
