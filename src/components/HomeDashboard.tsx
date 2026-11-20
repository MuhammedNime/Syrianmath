import React from 'react';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { GradeWithCounts } from '../lib/api';
import {
  ActivityLog,
  Lesson,
  StudentLessonProgress,
  UserProfile,
} from '../types';

export type AppRoute =
  | 'home'
  | 'grades'
  | 'library'
  | 'tutor'
  | 'exercises'
  | 'admin'
  | 'lesson';

interface HomeDashboardProps {
  user: UserProfile | null;
  selectedGradeId: number;
  maxAllowedGrade: number;
  onSelectGrade: (gradeId: number) => void;
  onUpdateRegisteredGrade: (gradeId: number) => Promise<void>;
  onOpenAccountGrade: () => void;
  grades: GradeWithCounts[];
  gradeLessons: Lesson[];
  progress: StudentLessonProgress[];
  activities: ActivityLog[];
  onNavigate: (route: AppRoute, lessonId?: string) => void;
}

function formatArabicDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('ar-SY', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function HomeDashboard({
  user,
  selectedGradeId,
  maxAllowedGrade,
  onSelectGrade,
  onUpdateRegisteredGrade,
  onOpenAccountGrade,
  grades,
  gradeLessons,
  progress,
  activities,
  onNavigate,
}: HomeDashboardProps) {
  const [editingRegisteredGrade, setEditingRegisteredGrade] = React.useState(false);
  const [savingGrade, setSavingGrade] = React.useState(false);

  const currentGrade =
    grades.find((g) => g.id === selectedGradeId) ?? grades[grades.length - 1];
  const registeredGrade = user
    ? grades.find((g) => g.id === user.gradeId)
    : currentGrade;

  const gradeProgress = progress.filter((p) => p.gradeId === selectedGradeId);
  const completedCount = gradeProgress.filter((p) => p.completed).length;
  const totalLessonsInGrade = Math.max(gradeLessons.length, 1);
  const completionPct = Math.min(
    100,
    Math.round((completedCount / totalLessonsInGrade) * 100)
  );

  const recentStudiedLessons = [...progress]
    .sort(
      (a, b) =>
        new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime()
    )
    .slice(0, 4)
    .map((p) => ({
      progress: p,
      lesson: gradeLessons.find((l) => l.id === p.lessonId) ?? null,
    }));

  const featureCards = [
    {
      id: 'library' as AppRoute,
      title: 'المكتبة التعليمية',
      subtitle: 'الكتب الرسمية، رفع ملفات PDF، واستخراج الفهرس والقوانين تلقائياً',
      icon: BookOpen,
      accent: 'text-blue-700 dark:text-blue-400',
      surface: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      id: 'tutor' as AppRoute,
      title: 'مدرس الرياضيات الذكي',
      subtitle: 'حل المسائل خطوة بخطوة، قراءة الصور وPDF، وحساب المصفوفات والمعادلات',
      icon: Bot,
      accent: 'text-teal-700 dark:text-teal-400',
      surface: 'bg-teal-50 dark:bg-teal-950/50',
    },
    {
      id: 'grades' as AppRoute,
      title: 'الدروس والوحدات',
      subtitle: 'تصفح وحدات وفصول صفك الدراسي مع الشرح النظري والأمثلة المحلولة',
      icon: Layers,
      accent: 'text-sky-700 dark:text-sky-400',
      surface: 'bg-sky-50 dark:bg-sky-950/50',
    },
    {
      id: 'exercises' as AppRoute,
      title: 'التمارين والاختبارات',
      subtitle: 'بنك تمارين متدرجة الصعوبة وأسئلة تفاعلية مع تصحيح فوري',
      icon: ClipboardCheck,
      accent: 'text-indigo-700 dark:text-indigo-400',
      surface: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero + Grade Selection */}
      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-700 dark:text-sky-400">
              المنهاج الدراسي الرسمي · الجمهورية العربية السورية
            </p>
            <h1 className="font-display text-2xl font-bold leading-snug text-slate-900 sm:text-3xl dark:text-white">
              {user
                ? `أهلاً بك، ${user.name}`
                : 'أهلاً بك في المستشار الرياضي للمنهاج السوري'}
            </h1>
            <p className="max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-300">
              منصتك المتكاملة لدراسة الرياضيات من الصف الأول حتى الثالث الثانوي العلمي:
              مناهج مفهرسة، شروحات دقيقة، تمارين تفاعلية، ومدرس رياضيات ذكي يرافقك خطوة بخطوة.
            </p>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
            {user?.role === 'student' && (
              <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/50 dark:bg-blue-950/30">
                <div className="text-xs text-slate-700 dark:text-slate-300">
                  <span>صفك الدراسي المسجل: </span>
                  <strong className="font-semibold text-blue-800 dark:text-sky-300">
                    {registeredGrade?.name}
                  </strong>
                  <span className="mr-1.5 text-slate-500 dark:text-slate-400">
                    (متاح لك صفك وما قبله فقط)
                  </span>
                </div>

                {editingRegisteredGrade ? (
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="تعديل الصف المسجل"
                      disabled={savingGrade}
                      defaultValue={user.gradeId}
                      onChange={async (e) => {
                        const nextId = Number(e.target.value);
                        setSavingGrade(true);
                        try {
                          await onUpdateRegisteredGrade(nextId);
                          setEditingRegisteredGrade(false);
                        } finally {
                          setSavingGrade(false);
                        }
                      }}
                      className="min-h-[34px] rounded-lg border border-blue-200 bg-white px-2.5 text-xs font-medium text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setEditingRegisteredGrade(false)}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingRegisteredGrade(true)}
                    className="self-start text-xs font-semibold text-blue-700 hover:underline sm:self-auto dark:text-sky-400"
                  >
                    تعديل الصف المسجل
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="home-grade-select"
                className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                <GraduationCap className="h-4 w-4 text-blue-700 dark:text-sky-400" />
                <span>
                  {user?.role === 'student'
                    ? 'اختر صف الدراسة (صفك وما قبله):'
                    : 'اختر صفك الدراسي:'}
                </span>
              </label>
              <select
                id="home-grade-select"
                value={selectedGradeId}
                onChange={(e) => onSelectGrade(Number(e.target.value))}
                className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white sm:w-72 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                    {g.name} ({g.stage}){g.id > maxAllowedGrade ? ' — مقفل' : ''}
                  </option>
                ))}
              </select>
            </div>

            {!user && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  يمكنك تحديد صفك والبدء فوراً، وتعديله لاحقاً في أي وقت من حسابك.
                </span>
                <button
                  type="button"
                  onClick={onOpenAccountGrade}
                  className="font-semibold text-blue-700 hover:underline dark:text-sky-400"
                >
                  حفظ الصف في حساب طالب
                </button>
              </div>
            )}

            {currentGrade && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                <span>{currentGrade.stage}</span>
                <span aria-hidden="true">·</span>
                <span>{currentGrade.booksCount} كتب متاحة</span>
                <span aria-hidden="true">·</span>
                <span>{currentGrade.unitsCount} وحدات</span>
                <span aria-hidden="true">·</span>
                <span>{currentGrade.lessonsCount} دروس مفهرسة</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <button
                type="button"
                onClick={() => onNavigate('grades')}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <span>متابعة دروس الصف</span>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tutor')}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-400 hover:text-teal-700 whitespace-nowrap sm:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-teal-500 dark:hover:text-teal-300"
              >
                <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>اسأل المدرس الذكي</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Academic Illustration Panel */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-teal-50 lg:col-span-5 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <img
            src="/src/assets/images/hero_math_academy_1795101194499.jpg"
            alt="رسوم هندسية ورياضية تعبر عن المستشار الرياضي للمنهاج السوري"
            referrerPolicy="no-referrer"
            className="h-48 w-full object-cover sm:h-64 lg:h-full"
          />
        </div>
      </section>

      {/* 4 Core Function Cards */}
      <section aria-label="الأقسام الرئيسية">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-right transition-all duration-150 hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <div>
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${card.surface}`}
                  >
                    <Icon className={`h-5 w-5 ${card.accent}`} />
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-sky-400">
                    {card.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {card.subtitle}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-sky-400">
                  <span>فتح القسم</span>
                  <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Progress Tracker + Recent Lessons + Recent Activities */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Progress Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              متابعة التقدم الدراسي
            </h2>
            <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {currentGrade?.name}
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                نسبة إنجاز دروس الصف
              </span>
              <span className="font-mono text-2xl font-bold text-blue-700 tabular-nums dark:text-sky-400">
                {completionPct}%
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-l from-teal-500 to-blue-600 transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  الدروس المنجزة
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-white">
                  {completedCount} / {gradeLessons.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  الاختبارات المقدمة
                </p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums dark:text-white">
                  {gradeProgress.filter((p) => typeof p.quizScore === 'number').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Studied Lessons */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              آخر الدروس المدروسة
            </h2>
            <Clock className="h-5 w-5 text-blue-700 dark:text-sky-400" />
          </div>

          {recentStudiedLessons.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                لم تبدأ بدراسة دروس هذا الصف بعد.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('grades')}
                className="mt-3 text-sm font-semibold text-blue-700 hover:underline dark:text-sky-400"
              >
                ابدأ الدرس الأول الآن
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentStudiedLessons.map(({ progress: p, lesson }) => {
                if (!lesson) return null;
                return (
                  <button
                    key={p.lessonId}
                    type="button"
                    onClick={() => onNavigate('lesson', lesson.id)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-right transition-colors hover:text-blue-700 dark:hover:text-sky-400"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        صفحة {lesson.pageStart}–{lesson.pageEnd} ·{' '}
                        {formatArabicDate(p.lastVisitedAt)}
                      </p>
                    </div>
                    {p.completed ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 md:col-span-2 xl:col-span-1 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              آخر الأنشطة
            </h2>
          </div>

          {activities.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              ستظهر هنا أحدث أنشطتك في الدروس والاختبارات والمدرس الذكي.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {act.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {act.subtitle} · {formatArabicDate(act.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
