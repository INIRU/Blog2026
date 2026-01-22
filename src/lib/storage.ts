import { supabase } from './supabase/client';

const BUCKET_NAME = 'blog-images';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('WebP 변환 실패'));
          }
        },
        'image/webp',
        0.9
      );
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
}

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImage(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: '파일 크기는 20MB 이하여야 합니다.' };
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: '이미지 파일만 업로드할 수 있습니다.' };
  }

  try {
    const webpBlob = await convertToWebP(file);
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `uploads/${timestamp}-${randomStr}.webp`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, webpBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/webp',
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return { success: true, url: data.publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || '업로드 실패' };
  }
}

export function extractStoragePathFromUrl(url: string): { bucket: string; path: string } | null {
  if (!url) return null;
  
  const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\/(.+)$/);
  if (match) {
    return { bucket: match[1], path: match[2] };
  }
  return null;
}

export async function deleteImageByUrl(url: string): Promise<{ success: boolean; error?: string }> {
  const pathInfo = extractStoragePathFromUrl(url);
  
  if (!pathInfo) {
    return { success: true };
  }

  try {
    const { error } = await supabase.storage
      .from(pathInfo.bucket)
      .remove([pathInfo.path]);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function extractImagesFromMarkdown(markdown: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\)]+)\)/g;
  const urls: string[] = [];
  let match;
  
  while ((match = imageRegex.exec(markdown)) !== null) {
    urls.push(match[2]);
  }
  
  return urls;
}

export async function deletePostImages(content: string, thumbnailUrl?: string | null): Promise<void> {
  const imageUrls = extractImagesFromMarkdown(content);
  
  if (thumbnailUrl) {
    imageUrls.push(thumbnailUrl);
  }

  const supabaseUrls = imageUrls.filter((url) => url.includes('supabase'));
  
  await Promise.all(supabaseUrls.map((url) => deleteImageByUrl(url)));
}
