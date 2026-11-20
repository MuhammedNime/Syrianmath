import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Calculator, ClipboardCheck, Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { GlobalSearchResponse } from '../types';
import { FormulaBlock, MathText } from './MathText';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
  selectedGradeId: number;
  maxAllowedGrade: number;
  onOpenLesson: (lessonId: string) => void;
}

export function GlobalSearchModal({
  open,
  onClose,
  selectedGradeId,
  maxAllowedGrade,
  onOpenLesson,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [gradeScope, setGradeScope] = useState<'all_allowed' | 'current'>('all_allowed');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResponse>({
    lessons: [],
    formulas: [],
    exercises: [],
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ lessons: [], formulas: [], exercises: [] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      api
        .globalSearch(
          trimmed,
          gradeScope === 'current' ? Math.min(selectedGradeId, maxAllowedGrade) : undefined
        )
        .then((res) => {
          if (!cancelled) setResults(res);
        })
        .catch(() => {
          if (!cancelled) setResults({ lessons: [], formulas: [], exercises: [] });
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, gradeScope, selectedGradeId, maxAllowedGrade]);

  if (!open) return null;

  const totalHits =
    results.lessons.length + results.formulas.length + results.exercises.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-12 sm:pt-20 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="البحث الشامل في المنهاج"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 shrink-0 text-blue-700 dark:text-sky-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن درس، مبرهنة، قانون (مثل: فيثاغورث، تالس، معادلة)..."
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
          <select
            value={gradeScope}
            onChange={(e) =>
              setGradeScope(e.target.value === 'current' ? 'current' : 'all_allowed')
            }
            aria-label="نطاق البحث"
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all_allowed">كل صفوفي المتاحة</option>
            <option value="current">الصف الحالي فقط ({selectedGradeId})</option>
          </select>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق البحث"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {query.trim().length < 2 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              اكتب حرفين على الأقل للبحث الفوري عبر الدروس والقوانين والتمارين المسموحة لك.
            </div>
          ) : loading ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              جارٍ البحث في كتب المنهاج...
            </div>
          ) : totalHits === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              لم يتم العثور على نتائج مطابقة لـ «{query}». جرب كلمة مفتاحية أخرى.
            </div>
          ) : (
            <div className="space-y-5">
              {results.lessons.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-3.5 w-3.5 text-blue-700 dark:text-sky-400" />
                    <span>الدروس ({results.lessons.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.lessons.map((item) => (
                      <button
                        key={item.lessonId}
                        type="button"
                        onClick={() => {
                          onOpenLesson(item.lessonId);
                          onClose();
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-right transition-colors hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-sky-500"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="shrink-0 text-[11px] font-medium text-blue-700 tabular-nums dark:text-sky-400">
                            الصف {item.gradeId} · ص {item.pageStart}–{item.pageEnd}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.bookTitle} · {item.unitTitle}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.formulas.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Calculator className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />
                    <span>القوانين والمبرهنات ({results.formulas.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.formulas.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onOpenLesson(item.lessonId);
                          onClose();
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-right transition-colors hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
                            الصف {item.gradeId} · {item.lessonTitle}
                          </span>
                        </div>
                        <div className="mt-2 overflow-x-auto rounded-lg bg-white px-2.5 py-2 text-slate-900 dark:bg-slate-900 dark:text-white">
                          <FormulaBlock expression={item.expression} display={false} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.exercises.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <ClipboardCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>التمارين ({results.exercises.length})</span>
                  </h3>
                  <div className="space-y-1.5">
                    {results.exercises.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onOpenLesson(item.lessonId);
                          onClose();
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-right transition-colors hover:border-amber-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            الصف {item.gradeId} · {item.lessonTitle}
                          </span>
                          <span>المستوى: {item.difficulty}</span>
                        </div>
                        <div className="mt-1 line-clamp-2 text-xs text-slate-800 dark:text-slate-200">
                          <MathText text={item.question} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
          <span>اضغط على أي نتيجة لفتح الدرس مباشرة</span>
          <span dir="ltr" className="font-mono">
            Ctrl+K / Esc
          </span>
        </div>
      </div>
    </div>
  );
}
