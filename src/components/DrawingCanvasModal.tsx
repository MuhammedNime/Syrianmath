import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Circle,
  Eraser,
  Grid3X3,
  Minus,
  PenTool,
  Square,
  Trash2,
  Triangle,
  Undo2,
  X,
} from 'lucide-react';

interface DrawingCanvasModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File, previewUrl: string) => void;
}

type DrawTool = 'free' | 'line' | 'triangle' | 'circle' | 'rect' | 'eraser';

const PEN_COLORS = [
  { label: 'أسود', value: '#0f172a' },
  { label: 'أزرق', value: '#1d4ed8' },
  { label: 'أحمر', value: '#dc2626' },
  { label: 'أخضر', value: '#059669' },
  { label: 'بنفسجي', value: '#7c3aed' },
];

const TOOLS: Array<{
  id: DrawTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'free', label: 'قلم حر', icon: PenTool },
  { id: 'line', label: 'خط / مسطرة', icon: Minus },
  { id: 'triangle', label: 'مثلث', icon: Triangle },
  { id: 'circle', label: 'دائرة', icon: Circle },
  { id: 'rect', label: 'مستطيل', icon: Square },
  { id: 'eraser', label: 'ممحاة', icon: Eraser },
];

export function DrawingCanvasModal({
  open,
  onClose,
  onConfirm,
}: DrawingCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [penColor, setPenColor] = useState('#0f172a');
  const [penWidth, setPenWidth] = useState(4);
  const [tool, setTool] = useState<DrawTool>('free');
  const [showGrid, setShowGrid] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const historyRef = useRef<ImageData[]>([]);
  const snapshotRef = useRef<ImageData | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasInk(false);
  }, [open]);

  if (!open) return null;

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function drawShape(
    ctx: CanvasRenderingContext2D,
    activeTool: DrawTool,
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) {
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    if (activeTool === 'line') {
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
    } else if (activeTool === 'rect') {
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (activeTool === 'triangle') {
      const topX = (start.x + end.x) / 2;
      ctx.moveTo(topX, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(start.x, end.y);
      ctx.closePath();
    } else if (activeTool === 'circle') {
      const cx = (start.x + end.x) / 2;
      const cy = (start.y + end.y) / 2;
      const r = Math.hypot(end.x - start.x, end.y - start.y) / 2;
      ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2);
    }

    ctx.stroke();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    const pt = getPoint(e);
    startPointRef.current = pt;

    if (tool === 'free' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : penColor;
      ctx.lineWidth = tool === 'eraser' ? penWidth * 2.5 : penWidth;
    } else {
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    setIsDrawing(true);
    setHasInk(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const pt = getPoint(e);

    if (tool === 'free' || tool === 'eraser') {
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    } else if (snapshotRef.current && startPointRef.current) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      drawShape(ctx, tool, startPointRef.current, pt);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      if (tool === 'free' || tool === 'eraser') {
        ctx.closePath();
      } else if (snapshotRef.current && startPointRef.current) {
        const pt = getPoint(e);
        ctx.putImageData(snapshotRef.current, 0, 0);
        drawShape(ctx, tool, startPointRef.current, pt);
      }
      snapshotRef.current = null;
      startPointRef.current = null;
      historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (historyRef.current.length > 25) {
        historyRef.current.shift();
      }
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    }
    setIsDrawing(false);
  }

  function handleUndo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev) {
      ctx.putImageData(prev, 0, 0);
    }
    setHasInk(historyRef.current.length > 1);
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
    setHasInk(false);
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let targetCanvas: HTMLCanvasElement = canvas;
    if (showGrid) {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const eCtx = exportCanvas.getContext('2d');
      if (eCtx) {
        eCtx.fillStyle = '#ffffff';
        eCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Faint coordinate grid
        eCtx.strokeStyle = '#e2e8f0';
        eCtx.lineWidth = 1;
        for (let gx = 0; gx <= exportCanvas.width; gx += 32) {
          eCtx.beginPath();
          eCtx.moveTo(gx, 0);
          eCtx.lineTo(gx, exportCanvas.height);
          eCtx.stroke();
        }
        for (let gy = 0; gy <= exportCanvas.height; gy += 32) {
          eCtx.beginPath();
          eCtx.moveTo(0, gy);
          eCtx.lineTo(exportCanvas.width, gy);
          eCtx.stroke();
        }

        // Subtle axes
        eCtx.strokeStyle = '#cbd5e1';
        eCtx.lineWidth = 1.5;
        eCtx.beginPath();
        eCtx.moveTo(exportCanvas.width / 2, 0);
        eCtx.lineTo(exportCanvas.width / 2, exportCanvas.height);
        eCtx.moveTo(0, exportCanvas.height / 2);
        eCtx.lineTo(exportCanvas.width, exportCanvas.height / 2);
        eCtx.stroke();

        // Blend user ink cleanly over grid
        eCtx.globalCompositeOperation = 'multiply';
        eCtx.drawImage(canvas, 0, 0);
        targetCanvas = exportCanvas;
      }
    }

    targetCanvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `handwritten-math-${Date.now()}.png`, {
        type: 'image/png',
      });
      const previewUrl = targetCanvas.toDataURL('image/png');
      onConfirm(file, previewUrl);
    }, 'image/png');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="لوح الرسم اليدوي والهندسي"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <PenTool className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                لوح رسم المسائل والأشكال الهندسية
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                استخدم القلم الحر أو أدوات الهندسة (خط، مثلث، دائرة، شبكة إحداثية) ليقرأها الذكاء ويحلّها
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

        <div className="space-y-3 p-5">
          {/* Shape & Drawing Tools Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex flex-wrap items-center gap-1.5">
              {TOOLS.map((t) => {
                const Icon = t.icon;
                const active = tool === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTool(t.id)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setShowGrid((g) => !g)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  showGrid
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>شبكة إحداثية</span>
              </button>
            </div>
          </div>

          {/* Colors, Thickness & Actions Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex items-center gap-2">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.label}
                  onClick={() => {
                    setPenColor(c.value);
                    if (tool === 'eraser') setTool('free');
                  }}
                  style={{ backgroundColor: c.value }}
                  className={`h-6 w-6 rounded-full border-2 transition-transform ${
                    tool !== 'eraser' && penColor === c.value
                      ? 'scale-110 border-blue-500 ring-2 ring-blue-300'
                      : 'border-white dark:border-slate-700'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="tabular-nums">السماكة: {penWidth}px</span>
                <input
                  type="range"
                  min={2}
                  max={14}
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-24 accent-blue-600"
                />
              </label>
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>تراجع</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>مسح</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700">
            <canvas
              ref={canvasRef}
              width={640}
              height={360}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="block w-full touch-none cursor-crosshair bg-white"
            />
            {showGrid && (
              <svg
                viewBox="0 0 640 360"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
              >
                <defs>
                  <pattern
                    id="canvas-grid-pattern"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="0.7"
                    />
                  </pattern>
                </defs>
                <rect width="640" height="360" fill="url(#canvas-grid-pattern)" />
                <line x1="320" y1="0" x2="320" y2="360" stroke="#64748b" strokeWidth="1.2" />
                <line x1="0" y1="180" x2="640" y2="180" stroke="#64748b" strokeWidth="1.2" />
              </svg>
            )}
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
            onClick={handleConfirm}
            disabled={!hasInk}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            <span>إرفاق الرسم للمحادثة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
