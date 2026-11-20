import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfCanvasViewerProps {
  pdfBlob: Blob;
  page: number;
  onPageChange: (page: number) => void;
  onNumPagesDetected?: (numPages: number) => void;
}

export function PdfCanvasViewer({
  pdfBlob,
  page,
  onPageChange,
  onNumPagesDetected,
}: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask | null = null;

    async function loadPdf() {
      setLoadingDoc(true);
      setError(null);
      try {
        const buffer = await pdfBlob.arrayBuffer();
        if (cancelled) return;
        loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const doc = await loadingTask.promise;
        if (cancelled) {
          void doc.cleanup();
          return;
        }
        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        onNumPagesDetected?.(doc.numPages);
        if (page > doc.numPages) {
          onPageChange(doc.numPages);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error)?.message || 'تعذر فتح ملف الكتاب.');
        }
      } finally {
        if (!cancelled) {
          setLoadingDoc(false);
        }
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      if (loadingTask) {
        void loadingTask.destroy();
      }
      if (pdfDocRef.current) {
        void pdfDocRef.current.cleanup();
        pdfDocRef.current = null;
      }
    };
  }, [pdfBlob]);

  useEffect(() => {
    let cancelled = false;

    async function renderCurrentPage() {
      const doc = pdfDocRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!doc || !canvas || !container || loadingDoc) return;

      const targetPage = Math.max(1, Math.min(doc.numPages, page));
      setRenderingPage(true);

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // Ignore cancellation error
        }
        renderTaskRef.current = null;
      }

      try {
        const pdfPage = await doc.getPage(targetPage);
        if (cancelled) return;

        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, container.clientWidth - 24);
        const fitScale = Math.min(2.2, availableWidth / baseViewport.width);
        const scale = Math.max(0.5, fitScale * zoom);
        const viewport = pdfPage.getViewport({ scale });
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, viewport.width, viewport.height);
        }

        const task = pdfPage.render({
          canvas,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        const name = (err as { name?: string })?.name;
        if (!cancelled && name !== 'RenderingCancelledException') {
          setError('تعذر عرض هذه الصفحة من الكتاب.');
        }
      } finally {
        if (!cancelled) {
          setRenderingPage(false);
        }
      }
    }

    void renderCurrentPage();

    return () => {
      cancelled = true;
    };
  }, [page, zoom, loadingDoc, numPages]);

  const effectiveTotal = numPages || 1;
  const safePage = Math.max(1, Math.min(effectiveTotal, page));

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-slate-100 dark:bg-slate-950">
      {/* Touch-friendly Mobile/Desktop PDF Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={safePage <= 1 || loadingDoc}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ChevronRight className="h-4 w-4" />
            <span>السابقة</span>
          </button>
          <span className="px-2 text-xs font-semibold text-slate-700 tabular-nums dark:text-slate-200">
            {safePage} / {numPages || '...'}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(effectiveTotal, safePage + 1))}
            disabled={safePage >= effectiveTotal || loadingDoc}
            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <span>التالية</span>
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
            disabled={zoom <= 0.6}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="تصغير"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="min-w-[44px] text-center font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2.4, Number((z + 0.2).toFixed(2))))}
            disabled={zoom >= 2.4}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-45 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label="تكبير"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="إعادة ضبط التكبير"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Canvas Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto p-3 flex flex-col items-center"
      >
        {loadingDoc ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            <p className="text-sm font-medium">جارٍ تجهيز صفحات الكتاب...</p>
          </div>
        ) : error ? (
          <div className="my-12 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        ) : (
          <div className="relative inline-block rounded-lg bg-white shadow-md">
            {renderingPage && (
              <div className="pointer-events-none absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-medium text-white">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>جارٍ التحميل</span>
              </div>
            )}
            <canvas ref={canvasRef} className="block rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
