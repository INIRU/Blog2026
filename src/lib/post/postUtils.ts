/**
 * Post 관련 유틸리티 함수 모음
 */

/**
 * 글 읽기 시간 추정
 * @param content 글 내용
 * @returns 예상 읽기 시간 (분)
 */
export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * 한국어 날짜 포맷
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 한국어 날짜 문자열
 */
export function formatKoDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 한국어 날짜 및 시간 포맷
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 포맷된 한국어 날짜 및 시간 문자열
 */
export function formatKoDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 상대적 시간 표시 (예: "2시간 전", "3일 전")
 * @param date 날짜 문자열 또는 Date 객체
 * @returns 상대적 시간 문자열
 */
export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 30) return `${diffDays}일 전`;
  if (diffMonths < 12) return `${diffMonths}개월 전`;
  return `${diffYears}년 전`;
}

/**
 * 숫자를 천 단위 콤마로 포맷
 * @param num 숫자
 * @returns 포맷된 문자열
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}
