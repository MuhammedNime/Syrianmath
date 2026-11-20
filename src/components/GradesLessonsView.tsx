import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Layers,
  PlayCircle,
  RotateCw,
  Search,
  Sigma,
  Sparkles,
} from 'lucide-react';
import { GradeWithCounts } from '../lib/api';
import {
  CurriculumBook,
  Lesson,
  StudentLessonProgress,
  Unit,
} from '../types';
import { FormulaBlock, MathText } from './MathText';

interface GradesLessonsViewProps {
  grades: GradeWithCounts[];
  selectedGradeId: number;
  maxAllowedGrade: number;
  onSelectGrade: (gradeId: number) => void;
  books: CurriculumBook[];
  units: Unit[];
  lessons: Lesson[];
  progress: StudentLessonProgress[];
  loading: boolean;
  onOpenLesson: (lessonId: string) => void;
  onAskTutorForLesson: (lesson: Lesson) => void;
}

export function GradesLessonsView({
  grades,
  selectedGradeId,
  maxAllowedGrade,
  onSelectGrade,
  books,
  units,
  lessons,
  progress,
  loading,
  onOpenLesson,
  onAskTutorForLesson,
}: GradesLessonsViewProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'curriculum' | 'formulas'>('curriculum');
  const [formulaSearch, setFormulaSearch] = useState('');
  const [formulaSubMode, setFormulaSubMode] = useState<'list' | 'flashcards'>('list');
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Record<string, boolean>>({});

  const currentGrade = grades.find((g) => g.id === selectedGradeId);
  const completedIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lessonId)
  );

  const visibleUnits =
    selectedBookId === 'all'
      ? units
      : units.filter((u) => u.bookId === selectedBookId);

  const videosInGrade = lessons.filter((l) => Boolean(l.videoUrl));

  const allGradeFormulas = useMemo(() => {
    const unitMap = new Map(units.map((u) => [u.id, u]));
    const bookMap = new Map(books.map((b) => [b.id, b]));
    const q = formulaSearch.trim().toLowerCase();

    return lessons
      .filter((l) => selectedBookId === 'all' || l.bookId === selectedBookId)
      .flatMap((lesson) =>
        lesson.formulas.map((formula) => ({
          formula,
          lesson,
          unit: unitMap.get(lesson.unitId),
          book: bookMap.get(lesson.bookId),
        }))
      )
      .filter((item) => {
        if (!q) return true;
        return (
          item.formula.title.toLowerCase().includes(q) ||
          item.formula.description.toLowerCase().includes(q) ||
          item.lesson.title.toLowerCase().includes(q) ||
          (item.unit?.title.toLowerCase().includes(q) ?? false)
        );
      });
  }, [lessons, units, books, selectedBookId, formulaSearch]);

  const safeCardIdx =
    allGradeFormulas.length > 0 ? Math.min(cardIdx, allGradeFormulas.length - 1) : 0;
  const activeCard = allGradeFormulas[safeCardIdx] ?? null;
  const masteredCount = allGradeFormulas.filter((x) => masteredIds[x.formula.id]).length;

  return (
    <div className="space-y-6">
      {/* Header & Strict Grade Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-sky-400">
              {currentGrade?.stage} ·{' '}
              {maxAllowedGrade < 12
                ? `متاح لك صفك (${grades.find((g) => g.id === maxAllowedGrade)?.shortName}) وما قبله`
                : 'محتوى مخصص للصف المختار فقط'}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              {currentGrade?.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {currentGrade?.description}
            </p>
          </div>

          <div className="shrink-0">
            <label htmlFor="grade-view-selector" className="sr-only">
              تغيير الصف الدراسي
            </label>
            <select
              id="grade-view-selector"
              value={selectedGradeId}
              onChange={(e) => {
                setSelectedBookId('all');
                onSelectGrade(Number(e.target.value));
              }}
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-600 sm:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {grades.map((g) => (
                <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                  {g.name}
                  {g.id > maxAllowedGrade ? ' (مقفل)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick 1-12 Grade Stepper Buttons */}
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          {grades.map((g) => {
            const active = g.id === selectedGradeId;
            const locked = g.id > maxAllowedGrade;
            return (
              <button
                key={g.id}
                type="button"
                disabled={locked}
                title={locked ? 'مقفل: أعلى من صفك الدراسي المسجل' : undefined}
                onClick={() => {
                  setSelectedBookId('all');
                  setCardIdx(0);
                  setCardFlipped(false);
                  onSelectGrade(g.id);
                }}
                className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-700 text-white dark:bg-blue-600'
                    : locked
                    ? 'cursor-not-allowed bg-slate-100/70 text-slate-400 opacity-50 dark:bg-slate-800/50 dark:text-slate-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {g.shortName}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher: Units/Lessons vs Formula Cheat Sheet & Flashcards */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('curriculum')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'curriculum'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>الوحدات والدروس</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('formulas')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                viewMode === 'formulas'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
              }`}
            >
              <Sigma className="h-3.5 w-3.5" />
              <span>دفتر القوانين والبطاقات</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Books Available for This Grade */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                الكتب المتاحة في {currentGrade?.shortName}
              </h2>
              {books.length > 1 && (
                <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedBookId('all')}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedBookId === 'all'
                        ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    كل الكتب
                  </button>
                  {books.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBookId(b.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedBookId === b.id
                          ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {b.part}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {books.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  لا توجد كتب مضافة لهذا الصف بعد. يمكنك رفع كتاب PDF من المكتبة أو إضافته من لوحة الإدارة.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="flex gap-3.5 sm:gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <img
                      src={
                        book.coverUrl ||
                        '/src/assets/images/book_cover_syrian_math_1795101193959.jpg'
                      }
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="h-24 w-16 sm:h-28 sm:w-20 shrink-0 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        {book.part} · {book.pageCount} صفحة · {book.year}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                        {book.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
                        {book.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {viewMode === 'formulas' ? (
            <section className="space-y-4">
              {/* Formula Sheet Controls */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      دفتر القوانين والمبرهنات — {currentGrade?.shortName}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {allGradeFormulas.length} قانون ومبرهنة · محفوظ للحفظ والمراجعة السريعة: {masteredCount}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={formulaSearch}
                        onChange={(e) => {
                          setFormulaSearch(e.target.value);
                          setCardIdx(0);
                          setCardFlipped(false);
                        }}
                        placeholder="ابحث عن قانون أو مبرهنة..."
                        className="h-9 rounded-xl border border-slate-200 bg-slate-50 pr-8 pl-3 text-xs text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setFormulaSubMode('list')}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          formulaSubMode === 'list'
                            ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        ملخص القوانين
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormulaSubMode('flashcards');
                          setCardFlipped(false);
                        }}
                        className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                          formulaSubMode === 'flashcards'
                            ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        بطاقات المراجعة
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {allGradeFormulas.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  لا توجد قوانين مطابقة لبحثك في هذا الصف أو الكتاب.
                </div>
              ) : formulaSubMode === 'flashcards' && activeCard ? (
                <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    <span>
                      بطاقة {safeCardIdx + 1} من {allGradeFormulas.length}
                    </span>
                    <span>
                      {activeCard.book?.part ? `${activeCard.book.part} · ` : ''}
                      {activeCard.lesson.title}
                    </span>
                  </div>

                  <div
                    onClick={() => setCardFlipped((f) => !f)}
                    className="mt-4 flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-slate-50/80 p-6 text-center transition-colors hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    {!cardFlipped ? (
                      <>
                        <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-sky-300">
                          السؤال — ما نص أو صيغة القانون؟
                        </span>
                        <h3 className="mt-4 font-display text-xl font-bold text-slate-900 dark:text-white">
                          {activeCard.formula.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {activeCard.unit?.title} · ص {activeCard.lesson.pageStart}–{activeCard.lesson.pageEnd}
                        </p>
                        <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-sky-400">
                          <RotateCw className="h-3.5 w-3.5" />
                          <span>انقر لقلب البطاقة وإظهار الصيغة الرياضية</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="rounded-lg bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
                          {activeCard.formula.title}
                        </span>
                        <div className="my-4 w-full overflow-x-auto rounded-xl bg-white px-4 py-3 text-slate-900 dark:bg-slate-900 dark:text-white">
                          <FormulaBlock expression={activeCard.formula.expression} display />
                        </div>
                        <div className="max-w-lg text-sm text-slate-700 dark:text-slate-300">
                          <MathText text={activeCard.formula.description} />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={safeCardIdx === 0}
                        onClick={() => {
                          setCardIdx((i) => Math.max(0, i - 1));
                          setCardFlipped(false);
                        }}
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                        <span>السابقة</span>
                      </button>
                      <button
                        type="button"
                        disabled={safeCardIdx >= allGradeFormulas.length - 1}
                        onClick={() => {
                          setCardIdx((i) => Math.min(allGradeFormulas.length - 1, i + 1));
                          setCardFlipped(false);
                        }}
                        className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        <span>التالية</span>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const id = activeCard.formula.id;
                          setMasteredIds((prev) => ({ ...prev, [id]: !prev[id] }));
                        }}
                        className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-3.5 text-xs font-semibold transition-colors ${
                          masteredIds[activeCard.formula.id]
                            ? 'bg-teal-700 text-white dark:bg-teal-600'
                            : 'border border-teal-300 bg-teal-50 text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>
                          {masteredIds[activeCard.formula.id] ? 'تم حفظ القانون' : 'تحديد كمحفوظ'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenLesson(activeCard.lesson.id)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-700 px-3.5 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>فتح الدرس</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {allGradeFormulas.map(({ formula, lesson, unit, book }) => (
                    <div
                      key={formula.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              {book?.part ? `${book.part} · ` : ''}
                              {unit?.title || lesson.title}
                            </p>
                            <h3 className="mt-0.5 font-display text-base font-bold text-blue-900 dark:text-sky-300">
                              {formula.title}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenLesson(lesson.id)}
                            className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300"
                          >
                            الدرس ←
                          </button>
                        </div>

                        <div className="my-3 overflow-x-auto rounded-xl bg-slate-50 px-3 py-3 text-slate-900 dark:bg-slate-800/70 dark:text-white">
                          <FormulaBlock expression={formula.expression} display />
                        </div>
                        <div className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          <MathText text={formula.description} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            /* Units & Lessons */
            <section className="space-y-4">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                الوحدات والفصول والدروس
              </h2>

            {visibleUnits.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  لا توجد وحدات مسجلة لهذا الاختيار حالياً.
                </p>
              </div>
            ) : (
              [...visibleUnits]
                .sort((a, b) => a.order - b.order)
                .map((unit) => {
                  const unitLessons = [...lessons]
                    .filter((l) => l.unitId === unit.id)
                    .sort((a, b) => a.order - b.order);
                  const parentBook = books.find((b) => b.id === unit.bookId);

                  return (
                    <div
                      key={unit.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                        <div>
                          <p className="text-xs font-medium text-blue-700 tabular-nums dark:text-sky-400">
                            {unit.chapterLabel} · {parentBook?.part ?? ''} · الصفحات{' '}
                            {unit.pageStart}–{unit.pageEnd}
                          </p>
                          <h3 className="mt-1 font-display text-xl font-bold text-slate-900 dark:text-white">
                            {unit.title}
                          </h3>
                          {unit.description && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              {unit.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {unitLessons.map((lesson, idx) => {
                          const isDone = completedIds.has(lesson.id);
                          const isEx = Boolean(lesson.isUnitExercises);
                          return (
                            <div
                              key={lesson.id}
                              className={`flex flex-col gap-3 py-4 first:pt-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between ${
                                isEx
                                  ? 'mt-2 rounded-xl border border-teal-200/80 bg-teal-50/50 px-4 py-3.5 dark:border-teal-900/60 dark:bg-teal-950/30'
                                  : ''
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  {isEx ? (
                                    <ClipboardCheck className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400" />
                                  ) : (
                                    <span className="font-mono text-xs font-semibold text-slate-400 tabular-nums">
                                      {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                  )}
                                  <h4
                                    className={`font-display text-base font-bold ${
                                      isEx
                                        ? 'text-teal-950 dark:text-teal-200'
                                        : 'text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    {lesson.title}
                                  </h4>
                                  {isDone && (
                                    <CheckCircle2
                                      className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400"
                                      aria-label="درس منجز"
                                    />
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                  الصفحات {lesson.pageStart}–{lesson.pageEnd} ·{' '}
                                  {lesson.formulas.length} قوانين ·{' '}
                                  {lesson.examples.length} أمثلة ·{' '}
                                  {lesson.exercises.length} تمارين ·{' '}
                                  {lesson.quiz.length} أسئلة اختبار
                                  {lesson.videoUrl ? ' · فيديو شرح متاح' : ''}
                                </p>
                              </div>

                              <div className="flex shrink-0 flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onAskTutorForLesson(lesson)}
                                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-400 hover:text-teal-700 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                  <span>اسأل المدرس</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenLesson(lesson.id)}
                                  className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition-colors whitespace-nowrap ${
                                    isEx
                                      ? 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-700'
                                      : 'bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700'
                                  }`}
                                >
                                  {isEx ? (
                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <BookOpen className="h-3.5 w-3.5" />
                                  )}
                                  <span>{isEx ? 'فتح التمرينات' : 'فتح الدرس'}</span>
                                  <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
            </section>
          )}

          {/* Explanatory Videos Section for This Grade */}
          {videosInGrade.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                فيديوهات الشرح المرتبطة بدروس الصف
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {videosInGrade.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onOpenLesson(l.id)}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-right transition-colors hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-9 w-9 shrink-0 text-blue-700 dark:text-sky-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {l.videoTitle || l.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          الدرس: {l.title}
                        </p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
