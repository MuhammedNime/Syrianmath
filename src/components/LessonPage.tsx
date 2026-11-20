import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  PlayCircle,
} from 'lucide-react';
import { api } from '../lib/api';
import { CurriculumBook, GradeInfo, Lesson, Unit } from '../types';
import { FormulaBlock, MathText } from './MathText';

interface LessonPageProps {
  lessonId: string;
  onBack: () => void;
  onAskTutor: (lesson: Lesson) => void;
  onOpenInBook?: (bookId: string, page: number) => void;
  onSelectSiblingLesson: (lessonId: string) => void;
  onProgressUpdated: () => void;
  isCompleted: boolean;
}

function extractYoutubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}

export function LessonPage({
  lessonId,
  onBack,
  onAskTutor,
  onOpenInBook,
  onSelectSiblingLesson,
  onProgressUpdated,
  isCompleted,
}: LessonPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [book, setBook] = useState<CurriculumBook | null>(null);
  const [grade, setGrade] = useState<GradeInfo | null>(null);
  const [siblings, setSiblings] = useState<Lesson[]>([]);

  const [openExerciseIds, setOpenExerciseIds] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
    results: Array<{
      questionId: string;
      correctIndex: number;
      isCorrect: boolean;
      explanation: string;
    }>;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setQuizResult(null);
    setOpenExerciseIds({});

    api
      .getLesson(lessonId)
      .then((res) => {
        if (!active) return;
        setLesson(res.lesson);
        setUnit(res.unit);
        setBook(res.book);
        setGrade(res.grade);
        setSiblings(res.siblingLessons);
        api
          .recordLessonProgress(res.lesson.id)
          .then(() => onProgressUpdated())
          .catch(() => {});
      })
      .catch((err) => {
        if (!active) return;
        setError((err as Error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lessonId]);

  async function toggleCompleted() {
    if (!lesson) return;
    await api.recordLessonProgress(lesson.id, !isCompleted);
    onProgressUpdated();
  }

  async function handleSubmitQuiz() {
    if (!lesson) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.submitQuiz(lesson.id, quizAnswers);
      setQuizResult(res);
      onProgressUpdated();
    } finally {
      setSubmittingQuiz(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900 dark:bg-slate-900">
        <p className="text-sm text-rose-700 dark:text-rose-300">
          {error || 'تعذر تحميل الدرس.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
        >
          العودة إلى الدروس
        </button>
      </div>
    );
  }

  const embedUrl = extractYoutubeEmbedUrl(lesson.videoUrl);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Lesson Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-sky-400"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة إلى قائمة الدروس</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleCompleted}
              className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap sm:flex-none sm:px-4 ${
                isCompleted
                  ? 'border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{isCompleted ? 'تم إنجاز الدرس' : 'تحديد كمنجز'}</span>
            </button>

            {book?.pdfFileName && onOpenInBook && (
              <button
                type="button"
                onClick={() => onOpenInBook(book.id, lesson.pageStart)}
                className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 transition-colors hover:bg-teal-100 whitespace-nowrap sm:flex-none sm:px-4 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
              >
                <span>عرض في الكتاب (ص {lesson.pageStart}–{lesson.pageEnd})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onAskTutor(lesson)}
              className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap sm:flex-none sm:px-4 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span>اسأل المدرس الذكي</span>
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
          <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            {grade?.name} · {book?.title} · {unit?.title} · الصفحات {lesson.pageStart}–
            {lesson.pageEnd} · {lesson.durationMinutes} دقيقة
          </p>
          <h1 className="mt-2 font-display text-xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            {lesson.title}
          </h1>
        </div>
      </div>

      {/* Sibling Lessons Switcher if Unit has multiple lessons */}
      {siblings.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {siblings.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSiblingLesson(s.id)}
              className={`min-h-[38px] shrink-0 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                s.id === lesson.id
                  ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-blue-500 dark:bg-blue-950/50 dark:text-sky-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      {/* Objectives + Theory */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            أهداف الدرس
          </h2>
          <ul className="mt-4 space-y-3">
            {lesson.objectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm leading-6 text-slate-700 dark:text-slate-300">
                <span className="mt-1 font-mono text-xs font-bold text-blue-700 tabular-nums dark:text-sky-400">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <MathText text={obj} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            الشرح النظري والمفاهيم الأساسية
          </h2>
          <div className="mt-4 min-w-0 text-slate-700 dark:text-slate-300">
            <MathText text={lesson.theory} />
          </div>
        </div>
      </div>

      {/* Formulas & Definitions */}
      {lesson.formulas.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            القوانين والتعاريف الأساسية
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {lesson.formulas.map((f) => (
              <div
                key={f.id}
                className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50"
              >
                <h3 className="font-display text-sm font-bold text-blue-800 dark:text-sky-300">
                  {f.title}
                </h3>
                <div className="my-3 overflow-x-auto rounded-lg bg-white px-3 py-3 text-slate-900 dark:bg-slate-900 dark:text-white">
                  <FormulaBlock expression={f.expression} display />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <MathText text={f.description} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Explanation if Linked */}
      {embedUrl && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-blue-700 dark:text-sky-400" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {lesson.videoTitle || 'فيديو شرح الدرس'}
            </h2>
          </div>
          <div className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <iframe
              src={embedUrl}
              title={lesson.videoTitle || lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </section>
      )}

      {/* Solved Examples */}
      {lesson.examples.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            الأمثلة المحلولة
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {lesson.examples.map((ex, idx) => (
              <div key={ex.id} className="py-5 first:pt-2 last:pb-0">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  مثال {idx + 1}: {ex.title}
                </h3>
                <div className="mt-2 rounded-xl bg-slate-50 p-4 text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                  <MathText text={ex.problem} />
                </div>
                <div className="mt-3 space-y-2 pr-2">
                  {ex.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <span className="mt-1 font-mono text-xs font-semibold text-teal-700 tabular-nums dark:text-teal-400">
                        {sIdx + 1})
                      </span>
                      <div className="flex-1">
                        <MathText text={step} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-sm font-semibold text-teal-900 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
                  <MathText text={`**الجواب النهائي:** ${ex.answer}`} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Practice Exercises */}
      {lesson.exercises.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            التمارين التدريبية
          </h2>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {lesson.exercises.map((er, idx) => {
              const isOpen = Boolean(openExerciseIds[er.id]);
              return (
                <div key={er.id} className="py-4 first:pt-2 last:pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        تمرين {idx + 1} · المستوى: {er.difficulty}
                      </p>
                      <div className="mt-1 text-slate-900 dark:text-slate-100">
                        <MathText text={er.question} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenExerciseIds((prev) => ({
                          ...prev,
                          [er.id]: !prev[er.id],
                        }))
                      }
                      className="inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-400 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {isOpen ? (
                        <>
                          <span>إخفاء الحل</span>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <span>عرض التلميح والحل</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
                      <div className="text-slate-600 dark:text-slate-300">
                        <MathText text={`**تلميح:** ${er.hint}`} />
                      </div>
                      <div className="border-t border-slate-200 pt-2 text-slate-900 dark:border-slate-700 dark:text-white">
                        <MathText text={`**الحل:** ${er.solution}`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Interactive Quiz */}
      {lesson.quiz.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-700 dark:text-sky-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                أسئلة تفاعلية للتحقق من الفهم
              </h2>
            </div>
            {quizResult && (
              <span className="font-mono text-sm font-bold text-teal-700 tabular-nums dark:text-teal-400">
                النتيجة: {quizResult.score} / {quizResult.total}
              </span>
            )}
          </div>

          <div className="mt-5 space-y-6">
            {lesson.quiz.map((q, idx) => {
              const selected = quizAnswers[q.id];
              const evalItem = quizResult?.results.find(
                (r) => r.questionId === q.id
              );

              return (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="font-medium text-slate-900 dark:text-white">
                    <MathText text={`${idx + 1}. ${q.question}`} />
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selected === optIdx;
                      const isCorrectOpt = evalItem && evalItem.correctIndex === optIdx;
                      const isWrongChosen =
                        evalItem && isChosen && !evalItem.isCorrect;

                      let btnStyle =
                        'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
                      if (evalItem) {
                        if (isCorrectOpt) {
                          btnStyle =
                            'border-teal-500 bg-teal-50 text-teal-900 dark:border-teal-600 dark:bg-teal-950/60 dark:text-teal-200';
                        } else if (isWrongChosen) {
                          btnStyle =
                            'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200';
                        }
                      } else if (isChosen) {
                        btnStyle =
                          'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/60 dark:text-sky-200';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() =>
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [q.id]: optIdx,
                            }))
                          }
                          className={`min-h-[42px] rounded-xl border px-4 py-2 text-right text-sm transition-colors ${btnStyle}`}
                        >
                          <MathText text={opt} />
                        </button>
                      );
                    })}
                  </div>

                  {evalItem && (
                    <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <MathText
                        text={`${
                          evalItem.isCorrect ? '**إجابة صحيحة:**' : '**التفسير:**'
                        } ${evalItem.explanation}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={
                submittingQuiz ||
                Object.keys(quizAnswers).length < lesson.quiz.length
              }
              onClick={handleSubmitQuiz}
              className="min-h-[42px] rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {submittingQuiz ? 'جارٍ التصحيح...' : 'تصحيح الإجابات وحفظ النتيجة'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
