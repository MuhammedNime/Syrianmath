import React, { useEffect, useRef, useState } from 'react';
import type { MathfieldElement } from 'mathlive';
import { Check, Eraser, Keyboard, Loader2, Sigma, X } from 'lucide-react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'virtual-keyboard-mode'?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface LiveMathModalProps {
  open: boolean;
  initialLatex?: string;
  isEditing?: boolean;
  onClose: () => void;
  onConfirm: (latex: string) => void;
}

const MATH_SNIPPETS: Array<{ label: string; latex: string; title: string }> = [
  { label: 'كسر', latex: '\\frac{#0}{#?}', title: 'كسر اعتيادي' },
  { label: 'جذر', latex: '\\sqrt{#0}', title: 'جذر تربيعي' },
  { label: 'أس', latex: 'x^{#0}', title: 'قوة / أس' },
  { label: 'تكامل', latex: '\\int_{#0}^{#?} #? \\, dx', title: 'تكامل محدد' },
  { label: 'نهاية', latex: '\\lim_{x \\to #0}', title: 'نهاية دالة' },
  { label: 'مجموع', latex: '\\sum_{i=#0}^{#?}', title: 'مجموع سيجما' },
  { label: 'مصفوفة', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', title: 'مصفوفة 2×2' },
  { label: 'لوغاريتم', latex: '\\ln\\left(#0\\right)', title: 'لوغاريتم نيبيري' },
  { label: 'مشتق', latex: "f'(#0)", title: 'مشتق الدالة' },
  { label: 'دلتا', latex: '\\Delta = b^2 - 4ac', title: 'المميز دلتا' },
  { label: 'شعاع', latex: '\\vec{u}', title: 'متجه / شعاع' },
  { label: 'جا / جتا', latex: '\\sin\\left(#0\\right)', title: 'دالة مثلثية' },
];

export function LiveMathModal({
  open,
  initialLatex = '',
  isEditing = false,
  onClose,
  onConfirm,
}: LiveMathModalProps) {
  const mathFieldRef = useRef<MathfieldElement | null>(null);
  const [latexValue, setLatexValue] = useState(initialLatex);
  const [mathLiveReady, setMathLiveReady] = useState(false);
  const [mathLiveError, setMathLiveError] = useState(false);

  // Lazy-load MathLive only when the modal opens so it never blocks initial app boot
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setMathLiveError(false);

    import('mathlive')
      .then((mod) => {
        if (cancelled) return;
        try {
          if (mod.MathfieldElement) {
            mod.MathfieldElement.fontsDirectory = '/mathlive/fonts';
            mod.MathfieldElement.soundsDirectory = null;
          }
        } catch {
          // Ignore static asset assignment errors
        }
        setMathLiveReady(true);
      })
      .catch((err) => {
        console.error('Failed to load MathLive:', err);
        if (!cancelled) {
          setMathLiveError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLatexValue(initialLatex);
    if (!mathLiveReady) return;
    const timer = setTimeout(() => {
      const mf = mathFieldRef.current;
      if (mf) {
        mf.value = initialLatex;
        mf.mathVirtualKeyboardPolicy = 'manual';
        mf.focus();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [open, initialLatex, mathLiveReady]);

  useEffect(() => {
    const mf = mathFieldRef.current;
    if (!mf || !open || !mathLiveReady) return;

    const handleInput = () => {
      setLatexValue(mf.value || '');
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const trimmed = (mf.value || '').trim();
        if (trimmed) onConfirm(trimmed);
      }
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('keydown', handleKeyDown);
    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, mathLiveReady, onConfirm]);

  useEffect(() => {
    if (!open && typeof window !== 'undefined' && window.mathVirtualKeyboard) {
      try {
        window.mathVirtualKeyboard.hide();
      } catch {
        // ignore
      }
    }
  }, [open]);

  if (!open) return null;

  function insertSnippet(snippetLatex: string) {
    const mf = mathFieldRef.current;
    if (mf && mathLiveReady) {
      mf.executeCommand(['insert', snippetLatex]);
      mf.focus();
      setLatexValue(mf.value || '');
      return;
    }
    const cleanSnippet = snippetLatex.replace(/#[0?]/g, '');
    setLatexValue((prev) => `${prev}${prev ? ' ' : ''}${cleanSnippet}`);
  }

  function toggleVirtualKeyboard() {
    const mf = mathFieldRef.current;
    if (!mf || !mathLiveReady) return;
    mf.focus();
    if (window.mathVirtualKeyboard) {
      if (window.mathVirtualKeyboard.visible) {
        window.mathVirtualKeyboard.hide();
      } else {
        window.mathVirtualKeyboard.show();
      }
    } else {
      mf.executeCommand('toggleVirtualKeyboard');
    }
  }

  function handleRawLatexChange(nextLatex: string) {
    setLatexValue(nextLatex);
    if (mathFieldRef.current && mathLiveReady) {
      mathFieldRef.current.value = nextLatex;
    }
  }

  function handleClear() {
    setLatexValue('');
    if (mathFieldRef.current && mathLiveReady) {
      mathFieldRef.current.value = '';
      mathFieldRef.current.focus();
    }
  }

  function handleSubmit() {
    const finalLatex = (
      (mathLiveReady ? mathFieldRef.current?.value : undefined) ?? latexValue
    ).trim();
    if (!finalLatex) return;
    if (window.mathVirtualKeyboard) {
      try {
        window.mathVirtualKeyboard.hide();
      } catch {
        // ignore
      }
    }
    onConfirm(finalLatex);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="محرر المعادلات الحي"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-400">
              <Sigma className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {isEditing
                  ? 'تعديل المعادلة الرياضية (Live Math)'
                  : 'محرر المعادلات الحي (Live Math)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اكتب المعادلة بصرياً أو اختر من القوالب الجاهزة ثم أدرجها في المحادثة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide();
              } catch {
                // ignore
              }
              onClose();
            }}
            aria-label="إغلاق"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* Quick Formula Templates */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                قوالب رياضية سريعة
              </span>
              {mathLiveReady && (
                <button
                  type="button"
                  onClick={toggleVirtualKeyboard}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-sky-300"
                >
                  <Keyboard className="h-3.5 w-3.5" />
                  <span>لوحة الرموز الرياضية</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MATH_SNIPPETS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  title={s.title}
                  onClick={() => insertSnippet(s.latex)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-sky-500"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live MathField */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300">
              المعاينة والتحرير التفاعلي
            </label>
            {mathLiveError ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                تعذر تشغيل المحرر البصري، يمكنك كتابة صيغة LaTeX مباشرة في الحقل أدناه أو استخدام القوالب السريعة.
              </div>
            ) : !mathLiveReady ? (
              <div className="flex min-h-[76px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>جارٍ تهيئة لوحة Live Math...</span>
              </div>
            ) : (
              <math-field
                ref={(el) => {
                  mathFieldRef.current = el as unknown as MathfieldElement | null;
                }}
              />
            )}
          </div>

          {/* Synced Raw LaTeX */}
          <div>
            <label
              htmlFor="liveMathLatexInput"
              className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              صيغة LaTeX المباشرة
            </label>
            <input
              id="liveMathLatexInput"
              type="text"
              dir="ltr"
              value={latexValue}
              onChange={(e) => handleRawLatexChange(e.target.value)}
              placeholder="مثال: \int_0^1 x^2 \, dx"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-800 outline-none focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3.5 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Eraser className="h-4 w-4" />
            <span>مسح الحقل</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                try {
                  if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide();
                } catch {
                  // ignore
                }
                onClose();
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!latexValue.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              <span>{isEditing ? 'تحديث المعادلة' : 'إدراج المعادلة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
