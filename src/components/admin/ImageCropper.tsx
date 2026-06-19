'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import styles from '@/styles/components/admin/ImageCropper.module.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  initialAspectRatio?: number;
  cropShape?: 'rect' | 'round';
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  initialAspectRatio = 16 / 9,
  cropShape = 'rect',
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropAreaChange = useCallback(
    (_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const image = new Image();
      image.src = imageSrc;
      
      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context를 가져올 수 없습니다');
      }

      const rotRad = (rotation * Math.PI) / 180;

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotRad);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          }
          setIsProcessing(false);
        },
        'image/webp',
        0.95
      );
    } catch (error) {
      console.error('이미지 크롭 실패:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.cropperOverlay}>
      <div className={styles.cropperContainer}>
        <div className={styles.cropperHeader}>
          <h3 className={styles.cropperTitle}>이미지 자르기</h3>
          <button onClick={onCancel} className={styles.closeButton} type="button">
            <HiOutlineX />
          </button>
        </div>

        <div className={styles.cropperArea}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            cropShape={cropShape}
          />
        </div>

        <div className={styles.cropperControls}>
          <div className={styles.controlGroup}>
            <label>확대/축소</label>
            <div className={styles.sliderContainer}>
              <span>-</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className={styles.slider}
              />
              <span>+</span>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label>회전</label>
            <div className={styles.sliderContainer}>
              <span>↶</span>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className={styles.slider}
              />
              <span>↷</span>
            </div>
          </div>

          <div className={styles.controlGroup}>
            <label>비율</label>
            <div className={styles.aspectButtons}>
              <button
                type="button"
                onClick={() => setAspectRatio(1)}
                className={aspectRatio === 1 ? styles.active : ''}
              >
                1:1
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(4 / 3)}
                className={Math.abs(aspectRatio - 4 / 3) < 0.01 ? styles.active : ''}
              >
                4:3
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio(16 / 9)}
                className={Math.abs(aspectRatio - 16 / 9) < 0.01 ? styles.active : ''}
              >
                16:9
              </button>
            </div>
          </div>
        </div>

        <div className={styles.cropperFooter}>
          <button onClick={onCancel} className={styles.cancelBtn} type="button">
            <HiOutlineX />
            <span>취소</span>
          </button>
          <button
            onClick={createCroppedImage}
            className={styles.cropBtn}
            disabled={isProcessing}
            type="button"
          >
            <HiOutlineCheck />
            <span>{isProcessing ? '처리 중...' : '자르기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
