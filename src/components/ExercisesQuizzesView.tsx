import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Play,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { api, GradeWithCounts } from '../lib/api';
import { Lesson, QuizQuestion } from '../types';
import { MathText } from './MathText';

interface ExercisesQuizzesViewProps {
  grades: GradeWithCounts[];
  selectedGradeId: number;
  maxAllowedGrade: number;
  onSelectGrade: (gradeId: number) => void;
  lessons: Lesson[];
  onOpenLesson: (lessonId: string) => void;
  onAskTutor: (lesson: Lesson) => void;
  onAskTutorPrompt?: (prompt: string, gradeId: number, lessonId?: string) => void;
}

interface ExamQuestionItem {
  id: string;
  lesson: Lesson;
  quiz: QuizQuestion;
}

function formatTimer(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function ExercisesQuizzesView({
  grades,
  selectedGradeId,
  maxAllowedGrade,
  onSelectGrade,
  lessons,
  onOpenLesson,
  onAskTutor,
  onAskTutorPrompt,
}: ExercisesQuizzesViewProps) {
  const [viewMode, setViewMode] = useState<'bank' | 'exam'>('bank');

  // Exercises Bank State
  const [difficultyFilter, setDifficultyFilter] = useState<
    'الكل' | 'أساسي' | 'متوسط' | 'تحدي'
  >('الكل');
  const [scope, setScope] = useState<'current' | 'cumulative'>('current');
  const [cumulativeLessons, setCumulativeLessons] = useState<Lesson[] | null>(null);
  const [loadingCumulative, setLoadingCumulative] = useState(false);

  const [openSolutions, setOpenSolutions] = useState<Record<string, boolean>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [checkedQuizzes, setCheckedQuizzes] = useState<Record<string, boolean>>({});

  // Timed Exam Simulator State
  const [examCount, setExamCount] = useState<number>(10);
  const [examMinutes, setExamMinutes] = useState<number>(15);
  const [examStage, setExamStage] = useState<'setup' | 'active' | 'results'>('setup');
  const [examQuestions, setExamQuestions] = useState<ExamQuestionItem[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [totalExamSeconds, setTotalExamSeconds] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    if (scope !== 'cumulative') {
      setCumulativeLessons(null);
      return;
    }
    setLoadingCumulative(true);
    api
      .getCurriculum(selectedGradeId, true)
      .then((res) => {
        if (!cancelled) {
          setCumulativeLessons(res.lessons);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCumulativeLessons(lessons);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCumulative(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, selectedGradeId, lessons]);

  const activeGrade = grades.find((g) => g.id === selectedGradeId);
  const sourceLessons =
    scope === 'cumulative' && cumulativeLessons ? cumulativeLessons : lessons;

  const exerciseItems = sourceLessons.flatMap((lesson) =>
    lesson.exercises
      .filter((er) => difficultyFilter === 'الكل' || er.difficulty === difficultyFilter)
      .map((er) => ({ lesson, exercise: er }))
  );

  const quizItems = sourceLessons.flatMap((lesson) =>
    lesson.quiz.map((q) => ({ lesson, quiz: q }))
  );

  // Countdown tick during active timed exam
  useEffect(() => {
    if (examStage !== 'active') return;
    if (remainingSeconds <= 0) {
      finishExam(true);
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [examStage, remainingSeconds]);

  function startTimedExam() {
    if (quizItems.length === 0) return;
    const pool = [...quizItems].map((item) => ({
      id: item.quiz.id,
      lesson: item.lesson,
      quiz: item.quiz,
    }));
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const count = examCount === 0 ? pool.length : Math.min(examCount, pool.length);
    const chosen = pool.slice(0, count);
    const secs = examMinutes * 60;

    setExamQuestions(chosen);
    setExamAnswers({});
    setRemainingSeconds(secs);
    setTotalExamSeconds(secs);
    setExamStage('active');
  }

  const examReport = useMemo(() => {
    if (examQuestions.length === 0) {
      return { score: 0, total: 0, percent: 0, lessonBreakdown: [] as Array<{ lesson: Lesson; correct: number; total: number; accuracy: number }> };
    }
    let score = 0;
    const byLesson = new Map<string, { lesson: Lesson; correct: number; total: number }>();

    for (const item of examQuestions) {
      const chosen = examAnswers[item.id];
      const isCorrect = chosen === item.quiz.correctIndex;
      if (isCorrect) score += 1;

      const cur = byLesson.get(item.lesson.id) ?? {
        lesson: item.lesson,
        correct: 0,
        total: 0,
      };
      cur.total += 1;
      if (isCorrect) cur.correct += 1;
      byLesson.set(item.lesson.id, cur);
    }

    const lessonBreakdown = Array.from(byLesson.values())
      .map((b) => ({
        ...b,
        accuracy: Math.round((b.correct / b.total) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy);

    const total = examQuestions.length;
    const percent = Math.round((score / total) * 100);
    return { score, total, percent, lessonBreakdown };
  }, [examQuestions, examAnswers]);

  function finishExam(_autoSubmitted = false) {
    if (examStage !== 'active') return;
    setExamStage('results');

    const weakTitles = examReport.lessonBreakdown
      .filter((b) => b.accuracy < 75)
      .map((b) => b.lesson.title);

    const scopeLabel =
      scope === 'cumulative'
        ? `${activeGrade?.shortName ?? ''} وما قبله`
        : `${activeGrade?.shortName ?? ''}`;

    void api
      .submitExamProgress({
        score: examReport.score,
        total: examReport.total,
        scopeLabel,
        gradeId: selectedGradeId,
        weakUnits: weakTitles,
      })
      .catch(() => undefined);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-sky-400">
              {activeGrade?.name}
              {scope === 'cumulative' ? ' والصفوف السابقة' : ''}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              بنك التمارين ومحاكي الامتحان المؤقّت
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              تدرّب على مسائل صفك الدراسي والصفوف السابقة له، أو خض مذاكرة مؤقّتة مع تشخيص نقاط الضعف.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              aria-label="تغيير الصف"
              value={selectedGradeId}
              disabled={examStage === 'active'}
              onChange={(e) => onSelectGrade(Number(e.target.value))}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 disabled:opacity-60 sm:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                  {g.name}
                  {g.id > maxAllowedGrade ? ' (مقفل)' : ''}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                disabled={examStage === 'active'}
                onClick={() => setScope('current')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-60 ${
                  scope === 'current'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                الصف المختار فقط
              </button>
              <button
                type="button"
                disabled={examStage === 'active'}
                onClick={() => setScope('cumulative')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-60 ${
                  scope === 'cumulative'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {loadingCumulative ? 'جارٍ التحميل...' : 'مع الصفوف السابقة'}
              </button>
            </div>
          </div>
        </div>

        {/* Mode Switcher: Practice Bank vs Timed Exam Simulator */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('bank')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'bank'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>بنك التمارين والأسئلة</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('exam')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'exam'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>محاكي الامتحان المؤقّت</span>
            </button>
          </div>

          {viewMode === 'bank' && (
            <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {(['الكل', 'أساسي', 'متوسط', 'تحدي'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficultyFilter(lvl)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap sm:flex-none ${
                    difficultyFilter === lvl
                      ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {viewMode === 'exam' ? (
        /* Timed Exam Simulator */
        <section className="space-y-5">
          {examStage === 'setup' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-sky-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    إعداد جلسة امتحان أو مذاكرة مؤقّتة
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    سيتم اختيار أسئلة عشوائية من {quizItems.length} سؤالاً متاحاً في النطاق المحدد، مع مؤقّت تنازلي وتقرير دقيق لنقاط القوة والضعف حسب الدرس.
                  </p>
                </div>
              </div>

              {quizItems.length === 0 ? (
                <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                  لا توجد أسئلة اختبار متاحة لهذا الصف حالياً. جرب تفعيل «مع الصفوف السابقة» في الأعلى.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      عدد الأسئلة في الامتحان
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '5', val: 5 },
                        { label: '10', val: 10 },
                        { label: '15', val: 15 },
                        { label: 'الكل', val: 0 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setExamCount(opt.val)}
                          className={`rounded-xl border py-2.5 text-xs font-bold tabular-nums transition-colors ${
                            examCount === opt.val
                              ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-sky-500 dark:bg-blue-950/60 dark:text-sky-300'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      المدة الزمنية للامتحان
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '10 دقائق', val: 10 },
                        { label: '15 دقيقة', val: 15 },
                        { label: '30 دقيقة', val: 30 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setExamMinutes(opt.val)}
                          className={`rounded-xl border py-2.5 text-xs font-bold transition-colors ${
                            examMinutes === opt.val
                              ? 'border-blue-600 bg-blue-50 text-blue-800 dark:border-sky-500 dark:bg-blue-950/60 dark:text-sky-300'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {quizItems.length > 0 && (
                <div className="mt-6 flex justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={startTimedExam}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4" />
                    <span>بدء الامتحان الآن</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {examStage === 'active' && (
            <div className="space-y-4">
              {/* Sticky Exam Status & Countdown Bar */}
              <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex items-center gap-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-sm font-bold tabular-nums ${
                      remainingSeconds <= 120
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-sky-300'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    <span dir="ltr">{formatTimer(remainingSeconds)}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 tabular-nums dark:text-slate-300">
                    تمت الإجابة عن {Object.keys(examAnswers).length} من {examQuestions.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => finishExam(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 dark:bg-teal-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>إنهاء وتصحيح الامتحان</span>
                </button>
              </div>

              {/* Exam Questions */}
              <div className="space-y-4">
                {examQuestions.map(({ id, lesson, quiz }, qIdx) => {
                  const chosen = examAnswers[id];
                  return (
                    <div
                      key={id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-blue-700 tabular-nums dark:text-sky-400">
                          السؤال {qIdx + 1} من {examQuestions.length}
                        </span>
                        <span>
                          {lesson.title} (الصف {lesson.gradeId})
                        </span>
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        <MathText text={quiz.question} />
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {quiz.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() =>
                                setExamAnswers((prev) => ({ ...prev, [id]: optIdx }))
                              }
                              className={`min-h-[42px] rounded-xl border px-3.5 py-2 text-right text-sm transition-colors ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-sky-500 dark:bg-blue-950/60 dark:text-sky-200'
                                  : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <MathText text={opt} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {examStage === 'results' && (
            <div className="space-y-5">
              {/* Summary Score Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        examReport.percent >= 70
                          ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      <Award className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        نتيجة الامتحان المؤقّت · الوقت المستغرق:{' '}
                        <span dir="ltr" className="font-mono tabular-nums">
                          {formatTimer(Math.max(0, totalExamSeconds - remainingSeconds))}
                        </span>
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 tabular-nums dark:text-white">
                        {examReport.score} من {examReport.total} ({examReport.percent}%)
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onAskTutorPrompt && examReport.score < examReport.total && (
                      <button
                        type="button"
                        onClick={() => {
                          const wrongItems = examQuestions
                            .filter((q) => examAnswers[q.id] !== q.quiz.correctIndex)
                            .slice(0, 4)
                            .map((q) => `- (${q.lesson.title}): ${q.quiz.question}`)
                            .join('\n');
                          const firstWrongLesson = examQuestions.find(
                            (q) => examAnswers[q.id] !== q.quiz.correctIndex
                          )?.lesson;
                          onAskTutorPrompt(
                            `أخطأت في الأسئلة التالية خلال المذاكرة المؤقّتة، اشرح لي الأفكار الصحيحة وسبب الأخطاء خطوة بخطوة:\n${wrongItems}`,
                            firstWrongLesson?.gradeId ?? selectedGradeId,
                            firstWrongLesson?.id
                          );
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                      >
                        <Bot className="h-4 w-4" />
                        <span>اسأل الذكاء عن أخطائي</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExamStage('setup')}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>امتحان جديد</span>
                    </button>
                  </div>
                </div>

                {/* Weakness Diagnostics Per Lesson / Topic */}
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    تشخيص الأداء حسب الدروس (مرتب من الأكثر احتياجاً للمراجعة)
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {examReport.lessonBreakdown.map(({ lesson, correct, total, accuracy }) => {
                      const needsReview = accuracy < 70;
                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 ${
                            needsReview
                              ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30'
                              : 'border-teal-200 bg-teal-50/50 dark:border-teal-900/50 dark:bg-teal-950/20'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              {needsReview ? (
                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                              )}
                              <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                {lesson.title}
                              </p>
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-600 tabular-nums dark:text-slate-300">
                              {correct} من {total} صحيح ({accuracy}%) ·{' '}
                              {needsReview ? 'تحتاج مراجعة' : 'أداء ممتاز'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenLesson(lesson.id)}
                            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-400"
                          >
                            مراجعة الدرس
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Full Answer Review */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  مراجعة الإجابات والتفسيرات
                </h3>
                <div className="mt-4 space-y-4">
                  {examQuestions.map(({ id, lesson, quiz }, idx) => {
                    const chosen = examAnswers[id];
                    const isRight = chosen === quiz.correctIndex;
                    return (
                      <div
                        key={id}
                        className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">
                            {idx + 1}. {lesson.title}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              isRight
                                ? 'text-teal-700 dark:text-teal-400'
                                : 'text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {isRight ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>إجابة صحيحة</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3.5 w-3.5" />
                                <span>
                                  {chosen === undefined ? 'لم تتم الإجابة' : 'إجابة خاطئة'}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          <MathText text={quiz.question} />
                        </div>
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="text-teal-700 dark:text-teal-400">
                            <strong>الإجابة الصحيحة:</strong>{' '}
                            <span className="inline-block">
                              <MathText text={quiz.options[quiz.correctIndex]} />
                            </span>
                          </p>
                          <div className="rounded-lg bg-slate-50 p-2.5 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <MathText text={`**التفسير:** ${quiz.explanation}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Practice Bank Mode */
        <>
          {/* Interactive Quizzes Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-blue-700 dark:text-sky-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                أسئلة الاختبار السريعة ({quizItems.length})
              </h2>
            </div>

            {quizItems.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                لا توجد أسئلة اختبار مضافة لهذا الصف بعد.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                {quizItems.map(({ lesson, quiz }) => {
                  const selected = quizAnswers[quiz.id];
                  const isChecked = Boolean(checkedQuizzes[quiz.id]);
                  return (
                    <div
                      key={quiz.id}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          من درس: {lesson.title}
                          {scope === 'cumulative'
                            ? ` (${grades.find((g) => g.id === lesson.gradeId)?.shortName || ''})`
                            : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenLesson(lesson.id)}
                          className="text-xs font-semibold text-blue-700 hover:underline dark:text-sky-400"
                        >
                          فتح الدرس
                        </button>
                      </div>

                      <div className="font-medium text-slate-900 dark:text-white">
                        <MathText text={quiz.question} />
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {quiz.options.map((opt, idx) => {
                          const isChosen = selected === idx;
                          const isRight = idx === quiz.correctIndex;
                          let cls =
                            'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';
                          if (isChecked) {
                            if (isRight) {
                              cls =
                                'border-teal-500 bg-teal-50 text-teal-900 dark:border-teal-600 dark:bg-teal-950/60 dark:text-teal-200';
                            } else if (isChosen && !isRight) {
                              cls =
                                'border-rose-400 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200';
                            }
                          } else if (isChosen) {
                            cls =
                              'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/60 dark:text-sky-200';
                          }

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setQuizAnswers((p) => ({ ...p, [quiz.id]: idx }));
                                setCheckedQuizzes((p) => ({ ...p, [quiz.id]: false }));
                              }}
                              className={`min-h-[40px] rounded-xl border px-3.5 py-2 text-right text-sm transition-colors ${cls}`}
                            >
                              <MathText text={opt} />
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          disabled={selected === undefined}
                          onClick={() =>
                            setCheckedQuizzes((p) => ({ ...p, [quiz.id]: true }))
                          }
                          className="rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-40 dark:bg-blue-600"
                        >
                          تحقق من الإجابة
                        </button>

                        {isChecked && (
                          <div className="flex-1 text-xs text-slate-600 dark:text-slate-300">
                            <MathText text={quiz.explanation} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Exercises Bank */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              التمارين المسائلية ({exerciseItems.length})
            </h2>

            {exerciseItems.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                لا توجد تمارين ضمن هذا التصنيف.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                {exerciseItems.map(({ lesson, exercise }) => {
                  const isOpen = Boolean(openSolutions[exercise.id]);
                  return (
                    <div key={exercise.id} className="py-4 first:pt-2 last:pb-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {lesson.title}
                            {scope === 'cumulative'
                              ? ` (${grades.find((g) => g.id === lesson.gradeId)?.shortName || ''})`
                              : ''}{' '}
                            · المستوى: {exercise.difficulty}
                          </p>
                          <div className="mt-1 text-slate-900 dark:text-slate-100">
                            <MathText text={exercise.question} />
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onAskTutor(lesson)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-teal-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <Bot className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                            <span>اشرح بالذكاء</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenLesson(lesson.id)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                            <span>الدرس</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSolutions((prev) => ({
                                ...prev,
                                [exercise.id]: !prev[exercise.id],
                              }))
                            }
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                          >
                            <span>{isOpen ? 'إخفاء الحل' : 'عرض الحل'}</span>
                            {isOpen ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
                          <MathText text={`**تلميح:** ${exercise.hint}`} />
                          <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                            <MathText text={`**الحل:** ${exercise.solution}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
