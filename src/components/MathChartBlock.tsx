import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart,
  ChartConfiguration,
  registerables,
} from 'chart.js';
import { Download } from 'lucide-react';

Chart.register(...registerables);

interface MathChartBlockProps {
  rawJson: string;
}

export function MathChartBlock({ rawJson }: MathChartBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const parsedConfig = useMemo<ChartConfiguration | null>(() => {
    try {
      const cleaned = rawJson.trim();
      const parsed = JSON.parse(cleaned) as ChartConfiguration;
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [rawJson]);

  useEffect(() => {
    if (!parsedConfig) {
      setParseError('تعذر قراءة بيانات الرسم البياني.');
      return;
    }
    setParseError(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)';
    const palette = ['#2563eb', '#0d9488', '#d97706', '#dc2626', '#7c3aed'];

    const datasets = Array.isArray(parsedConfig.data.datasets)
      ? parsedConfig.data.datasets.map((ds, idx) => {
          const color = palette[idx % palette.length];
          return {
            borderColor: color,
            backgroundColor:
              parsedConfig.type === 'line'
                ? `${color}22`
                : `${color}88`,
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 3.5,
            pointHoverRadius: 5,
            ...ds,
          };
        })
      : [];

    const mergedConfig: ChartConfiguration = {
      ...parsedConfig,
      data: {
        ...parsedConfig.data,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: { family: 'IBM Plex Sans Arabic, sans-serif', size: 12 },
            },
          },
          ...(parsedConfig.options?.plugins ?? {}),
        },
        scales:
          parsedConfig.type === 'pie' || parsedConfig.type === 'doughnut'
            ? undefined
            : {
                x: {
                  ticks: { color: textColor },
                  grid: { color: gridColor },
                },
                y: {
                  ticks: { color: textColor },
                  grid: { color: gridColor },
                },
                ...(parsedConfig.options?.scales ?? {}),
              },
        ...(parsedConfig.options ?? {}),
      },
    };

    try {
      chartInstanceRef.current = new Chart(ctx, mergedConfig);
    } catch {
      setParseError('تعذر إنشاء الرسم البياني لهذه البيانات.');
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [parsedConfig]);

  function handleDownloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `math-chart-${Date.now()}.png`;
    a.click();
  }

  if (parseError) {
    return (
      <div className="my-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        {parseError}
      </div>
    );
  }

  return (
    <div className="my-3 rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          تمثيل بياني تفاعلي
        </span>
        <button
          type="button"
          onClick={handleDownloadPng}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Download className="h-3.5 w-3.5" />
          <span>حفظ الصورة</span>
        </button>
      </div>
      <div className="relative h-64 w-full" dir="ltr">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
