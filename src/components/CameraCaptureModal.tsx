import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, Upload, X } from 'lucide-react';

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File, previewUrl: string) => void;
}

export function CameraCaptureModal({
  open,
  onClose,
  onConfirm,
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  async function startCamera() {
    setCameraError(null);
    setCapturedUrl(null);
    setCapturedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 50);
    } catch {
      setCameraError(
        'تعذر الوصول إلى الكاميرا. تأكد من منح الإذن في المتصفح أو اختر صورة من جهازك.'
      );
      setCameraActive(false);
    }
  }

  useEffect(() => {
    if (open) {
      void startCamera();
    } else {
      stopStream();
      setCapturedUrl(null);
      setCapturedFile(null);
      setCameraError(null);
    }
    return () => stopStream();
  }, [open]);

  if (!open) return null;

  function takeSnapshot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera-math-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        setCapturedFile(file);
        setCapturedUrl(dataUrl);
        stopStream();
      },
      'image/jpeg',
      0.92
    );
  }

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    stopStream();
    const url = URL.createObjectURL(chosen);
    setCapturedFile(chosen);
    setCapturedUrl(url);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="التقاط صورة مسألة"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                تصوير المسألة بالكاميرا
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                التقط صورة واضحة للمسألة من الدفتر أو الكتاب المدرسي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {cameraError && !capturedUrl && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              {cameraError}
            </div>
          )}

          {capturedUrl ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <img
                src={capturedUrl}
                alt="معاينة الصورة الملتقطة"
                className="max-h-72 w-full object-contain"
              />
            </div>
          ) : cameraActive ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 dark:border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-72 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <Camera className="mb-2 h-8 w-8 text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الكاميرا غير نشطة حالياً
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChosen}
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            {!capturedUrl && cameraActive && (
              <button
                type="button"
                onClick={takeSnapshot}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
              >
                <Camera className="h-4 w-4" />
                <span>التقاط الصورة</span>
              </button>
            )}
            {capturedUrl && (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>إعادة التصوير</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Upload className="h-4 w-4" />
              <span>اختيار صورة من الجهاز</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!capturedFile || !capturedUrl}
            onClick={() => {
              if (capturedFile && capturedUrl) {
                onConfirm(capturedFile, capturedUrl);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600"
          >
            <Check className="h-4 w-4" />
            <span>إرفاق الصورة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
