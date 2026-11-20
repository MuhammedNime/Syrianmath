import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Bot,
  ClipboardCheck,
  Home,
  Layers,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AppRoute, HomeDashboard } from './components/HomeDashboard';
import { OfflineIndicator, PWAInstallButton } from './components/PWAControls';
import { api, EnrichedBook, GradeWithCounts, setStoredToken } from './lib/api';
import { registerAndroidBackHandler, syncStatusBarTheme } from './lib/native';

const AdminConsoleView = lazy(() =>
  import('./components/AdminConsoleView').then((m) => ({ default: m.AdminConsoleView }))
);
const ExercisesQuizzesView = lazy(() =>
  import('./components/ExercisesQuizzesView').then((m) => ({ default: m.ExercisesQuizzesView }))
);
const GradesLessonsView = lazy(() =>
  import('./components/GradesLessonsView').then((m) => ({ default: m.GradesLessonsView }))
);
const LessonPage = lazy(() =>
  import('./components/LessonPage').then((m) => ({ default: m.LessonPage }))
);
const LibraryView = lazy(() =>
  import('./components/LibraryView').then((m) => ({ default: m.LibraryView }))
);
const SmartTutorView = lazy(() =>
  import('./components/SmartTutorView').then((m) => ({ default: m.SmartTutorView }))
);
import {
  ActivityLog,
  CurriculumBook,
  Lesson,
  StudentLessonProgress,
  TutorMode,
  Unit,
  UserProfile,
} from './types';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('syrian_math_theme') === 'dark';
    } catch {
      return false;
    }
  });

  const [route, setRoute] = useState<AppRoute>('home');
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [tutorLessonId, setTutorLessonId] = useState<string | undefined>(undefined);
  const [tutorPromptIntent, setTutorPromptIntent] = useState<{
    text: string;
    bookId?: string;
    lessonId?: string;
    mode?: TutorMode;
    key: number;
  } | null>(null);
  const [libraryBookIntent, setLibraryBookIntent] = useState<{
    bookId: string;
    page: number;
    key: number;
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [grades, setGrades] = useState<GradeWithCounts[]>([]);
  const [selectedGradeId, setSelectedGradeId] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('syrian_math_guest_grade'));
      return saved >= 1 && saved <= 12 ? saved : 10;
    } catch {
      return 10;
    }
  });

  const [books, setBooks] = useState<CurriculumBook[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [curriculumLoading, setCurriculumLoading] = useState(true);

  const [progress, setProgress] = useState<StudentLessonProgress[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  const maxAllowedGrade =
    user && user.role === 'student' ? user.gradeId : 12;

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('syrian_math_theme', darkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
    void syncStatusBarTheme(darkMode);
  }, [darkMode]);

  // Native Android hardware back button handling
  useEffect(() => {
    return registerAndroidBackHandler(() => {
      if (searchOpen) {
        setSearchOpen(false);
        return true;
      }
      if (authModalOpen) {
        setAuthModalOpen(false);
        return true;
      }
      if (sidebarOpen) {
        setSidebarOpen(false);
        return true;
      }
      if (route === 'lesson') {
        setRoute('grades');
        return true;
      }
      if (route !== 'home') {
        setRoute('home');
        return true;
      }
      return false;
    });
  }, [searchOpen, authModalOpen, sidebarOpen, route]);

  // Global Ctrl+K / Cmd+K instant search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      const res = await api.getProgress();
      setProgress(res.progress);
      setActivities(res.activities);
    } catch {
      // Ignore transient errors
    }
  }, []);

  const loadGrades = useCallback(async () => {
    const res = await api.getGrades();
    setGrades(res.grades);
  }, []);

  const loadCurriculumForGrade = useCallback(async (gradeId: number) => {
    setCurriculumLoading(true);
    try {
      const res = await api.getCurriculum(gradeId);
      setBooks(res.books);
      setUnits(res.units);
      setLessons(res.lessons);
    } catch {
      setBooks([]);
      setUnits([]);
      setLessons([]);
    } finally {
      setCurriculumLoading(false);
    }
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [meRes, gradesRes] = await Promise.all([api.me(), api.getGrades()]);
        setGrades(gradesRes.grades);
        if (meRes.user) {
          setUser(meRes.user);
          setSelectedGradeId(meRes.user.gradeId);
        }
      } catch {
        // Ignore if not signed in
      }
      await loadProgress();
    }
    bootstrap();
  }, [loadProgress]);

  useEffect(() => {
    loadCurriculumForGrade(selectedGradeId);
  }, [selectedGradeId, loadCurriculumForGrade]);

  function handleSelectStudyGrade(gradeId: number) {
    const clamped =
      user && user.role === 'student'
        ? Math.min(gradeId, user.gradeId)
        : gradeId;
    setSelectedGradeId(clamped);
    if (!user) {
      try {
        localStorage.setItem('syrian_math_guest_grade', String(clamped));
      } catch {
        // Ignore
      }
    }
  }

  async function handleUpdateRegisteredGrade(gradeId: number) {
    if (user) {
      const res = await api.updateGrade(gradeId);
      setUser(res.user);
      setSelectedGradeId(res.user.gradeId);
      await loadProgress();
    } else {
      handleSelectStudyGrade(gradeId);
    }
  }

  function handleNavigate(nextRoute: AppRoute, lessonId?: string) {
    if (nextRoute === 'lesson' && lessonId) {
      setActiveLessonId(lessonId);
    }
    setRoute(nextRoute);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAskTutorForLesson(lesson: Lesson) {
    if (lesson.gradeId <= maxAllowedGrade) {
      setSelectedGradeId(lesson.gradeId);
    }
    setTutorLessonId(lesson.id);
    setRoute('tutor');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleOpenInBook(bookId: string, page: number) {
    setLibraryBookIntent({ bookId, page, key: Date.now() });
    setRoute('library');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAskTutorFromPage(book: EnrichedBook, page: number) {
    if (book.gradeId <= maxAllowedGrade) {
      setSelectedGradeId(book.gradeId);
    }
    setTutorPromptIntent({
      text: `اشرح لي الصفحة رقم ${page} من كتاب "${book.title}" ولخّص أفكارها وقوانينها وأمثلتها خطوة بخطوة:`,
      bookId: book.id,
      mode: 'explain',
      key: Date.now(),
    });
    setRoute('tutor');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleAskTutorPrompt(text: string, gradeId: number, lessonId?: string) {
    if (gradeId <= maxAllowedGrade) {
      setSelectedGradeId(gradeId);
    }
    if (lessonId) setTutorLessonId(lessonId);
    setTutorPromptIntent({
      text,
      lessonId,
      mode: 'solve',
      key: Date.now(),
    });
    setRoute('tutor');
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleLogout() {
    setStoredToken(null);
    setUser(null);
    loadProgress();
  }

  const navItems: Array<{
    id: AppRoute;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'grades', label: 'الصفوف والدروس', icon: Layers },
    { id: 'library', label: 'المكتبة', icon: BookOpen },
    { id: 'tutor', label: 'المدرس الذكي', icon: Bot },
    { id: 'exercises', label: 'التمارين', icon: ClipboardCheck },
  ];

  const isLessonCompleted = progress.some(
    (p) => p.lessonId === activeLessonId && p.completed
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Bar — 3 Clean Zones */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-14 sm:h-16 max-w-[1600px] items-center justify-between gap-2 sm:gap-4 lg:gap-8 px-3 sm:px-6">
          {/* Zone 1: Brand Wordmark (+ Mobile Menu trigger) */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="فتح القائمة الجانبية"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="truncate font-display text-sm font-extrabold tracking-tight text-blue-800 sm:text-base lg:text-lg whitespace-nowrap dark:text-sky-400"
            >
              المستشار الرياضي للمنهاج السوري
            </button>
          </div>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="التنقل الرئيسي"
            className="hidden items-center gap-5 xl:gap-6 lg:flex"
          >
            {navItems.map((item) => {
              const active =
                route === item.id || (route === 'lesson' && item.id === 'grades');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`border-b-2 py-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-blue-700 text-blue-700 dark:border-sky-400 dark:text-sky-400'
                      : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() =>
                  user.role === 'admin'
                    ? handleNavigate('admin')
                    : setAuthModalOpen(true)
                }
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 sm:px-4 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <UserIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[84px] truncate sm:max-w-[140px]">{user.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="min-h-[38px] rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0 sm:px-4 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                تسجيل الدخول
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Content Viewport */}
      <div className="mx-auto flex max-w-[1600px] gap-4 lg:gap-6 px-3 py-4 sm:px-6 sm:py-6">
        {/* Desktop Persistent Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between self-start rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-22 lg:flex dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition-colors hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                <span>بحث شامل في المنهاج</span>
              </span>
              <span dir="ltr" className="font-mono text-[10px] text-slate-400">
                Ctrl+K
              </span>
            </button>

            <div>
              <p className="mb-2 px-3 text-xs font-semibold text-slate-400">
                الأقسام التعليمية
              </p>
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active =
                    route === item.id ||
                    (route === 'lesson' && item.id === 'grades');
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleNavigate('admin')}
                  className={`flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    route === 'admin'
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Settings2 className="h-4 w-4 shrink-0" />
                  <span>لوحة الإدارة</span>
                </button>
              </div>
            </div>

            {/* Sidebar Grade Switcher */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
              <label
                htmlFor="sidebar-grade"
                className="mb-2 block px-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
              >
                {user?.role === 'student'
                  ? 'صف التصفح (صفك وما قبله)'
                  : 'الصف الدراسي النشط'}
              </label>
              <select
                id="sidebar-grade"
                value={selectedGradeId}
                onChange={(e) => handleSelectStudyGrade(Number(e.target.value))}
                className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                    {g.name}
                    {g.id > maxAllowedGrade ? ' (مقفل)' : ''}
                  </option>
                ))}
              </select>
              {user?.role === 'student' && (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-2 w-full rounded-lg px-2 py-1 text-right text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:text-sky-400 dark:hover:bg-blue-950/40"
                >
                  تعديل صفك المسجل ({grades.find((g) => g.id === user.gradeId)?.shortName})
                </button>
              )}
            </div>
          </div>

          {/* Theme Toggle, PWA Install & Account Controls */}
          <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <PWAInstallButton />

            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="flex min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 transition-colors hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span>{darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
              {darkMode ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-blue-700" />
              )}
            </button>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[40px] w-full items-center justify-between rounded-xl px-3 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <span>تسجيل الخروج</span>
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Drawer Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col justify-between bg-white p-5 shadow-xl dark:bg-slate-900">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <span className="font-display text-base font-bold text-blue-800 dark:text-sky-400">
                    القائمة الرئيسية
                  </span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    setSearchOpen(true);
                  }}
                  className="flex min-h-[42px] w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Search className="h-4 w-4 text-blue-700 dark:text-sky-400" />
                  <span>بحث شامل في الدروس والقوانين</span>
                </button>

                <div className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = route === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigate(item.id)}
                        className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                          active
                            ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleNavigate('admin')}
                    className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium ${
                      route === 'admin'
                        ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-sky-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>لوحة الإدارة</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    {user?.role === 'student'
                      ? 'صف التصفح (صفك وما قبله)'
                      : 'الصف الدراسي'}
                  </label>
                  <select
                    value={selectedGradeId}
                    onChange={(e) => handleSelectStudyGrade(Number(e.target.value))}
                    className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                        {g.name}
                        {g.id > maxAllowedGrade ? ' (مقفل)' : ''}
                      </option>
                    ))}
                  </select>
                  {user?.role === 'student' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSidebarOpen(false);
                        setAuthModalOpen(true);
                      }}
                      className="mt-2 w-full rounded-lg px-2 py-1 text-right text-[11px] font-medium text-blue-700 hover:bg-blue-50 dark:text-sky-400 dark:hover:bg-blue-950/40"
                    >
                      تعديل صفك المسجل ({grades.find((g) => g.id === user.gradeId)?.shortName})
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <PWAInstallButton />
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium dark:border-slate-700 dark:bg-slate-800"
                >
                  <span>{darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                  {darkMode ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-blue-700" />
                  )}
                </button>
                {user && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-xs font-medium text-rose-600 dark:text-rose-400"
                  >
                    <span>تسجيل الخروج</span>
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${route}-${activeLessonId}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {route === 'home' && (
                <HomeDashboard
                  user={user}
                  selectedGradeId={selectedGradeId}
                  maxAllowedGrade={maxAllowedGrade}
                  onSelectGrade={handleSelectStudyGrade}
                  onUpdateRegisteredGrade={handleUpdateRegisteredGrade}
                  onOpenAccountGrade={() => setAuthModalOpen(true)}
                  grades={grades}
                  gradeLessons={lessons}
                  progress={progress}
                  activities={activities}
                  onNavigate={handleNavigate}
                />
              )}

              <Suspense
                fallback={
                  <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    جارٍ تحميل القسم...
                  </div>
                }
              >
                {route === 'grades' && (
                  <GradesLessonsView
                    grades={grades}
                    selectedGradeId={selectedGradeId}
                    maxAllowedGrade={maxAllowedGrade}
                    onSelectGrade={handleSelectStudyGrade}
                    books={books}
                    units={units}
                    lessons={lessons}
                    progress={progress}
                    loading={curriculumLoading}
                    onOpenLesson={(id) => handleNavigate('lesson', id)}
                    onAskTutorForLesson={handleAskTutorForLesson}
                  />
                )}

                {route === 'lesson' && activeLessonId && (
                  <LessonPage
                    lessonId={activeLessonId}
                    onBack={() => handleNavigate('grades')}
                    onAskTutor={handleAskTutorForLesson}
                    onOpenInBook={handleOpenInBook}
                    onSelectSiblingLesson={(id) => setActiveLessonId(id)}
                    onProgressUpdated={loadProgress}
                    isCompleted={isLessonCompleted}
                  />
                )}

                {route === 'library' && (
                  <LibraryView
                    grades={grades}
                    selectedGradeId={selectedGradeId}
                    maxAllowedGrade={maxAllowedGrade}
                    user={user}
                    initialOpenBook={libraryBookIntent}
                    onOpenLesson={(id) => handleNavigate('lesson', id)}
                    onAskTutorFromPage={handleAskTutorFromPage}
                    onOpenAdmin={() => handleNavigate('admin')}
                    onRequireAuth={() => setAuthModalOpen(true)}
                    onLibraryChanged={() => {
                      loadGrades();
                      loadCurriculumForGrade(selectedGradeId);
                      loadProgress();
                    }}
                  />
                )}

                {route === 'tutor' && (
                  <SmartTutorView
                    grades={grades}
                    selectedGradeId={selectedGradeId}
                    maxAllowedGrade={maxAllowedGrade}
                    onSelectGrade={handleSelectStudyGrade}
                    initialLessonId={tutorLessonId}
                    initialPromptRequest={tutorPromptIntent}
                    user={user}
                    gradeLessons={lessons}
                  />
                )}

                {route === 'exercises' && (
                  <ExercisesQuizzesView
                    grades={grades}
                    selectedGradeId={selectedGradeId}
                    maxAllowedGrade={maxAllowedGrade}
                    onSelectGrade={handleSelectStudyGrade}
                    lessons={lessons}
                    onOpenLesson={(id) => handleNavigate('lesson', id)}
                    onAskTutor={handleAskTutorForLesson}
                    onAskTutorPrompt={handleAskTutorPrompt}
                  />
                )}

                {route === 'admin' && (
                  <AdminConsoleView
                    user={user}
                    grades={grades}
                    onRequireAuth={() => setAuthModalOpen(true)}
                    onDataChanged={() => {
                      loadGrades();
                      loadCurriculumForGrade(selectedGradeId);
                    }}
                    onOpenLesson={(id) => handleNavigate('lesson', id)}
                  />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-6 sm:flex-row">
          <p>المستشار الرياضي للمنهاج السوري · منصة تعليمية متكاملة لمادة الرياضيات</p>
          <p>الصفوف من الأول الأساسي حتى الثالث الثانوي العلمي</p>
        </div>
      </footer>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        grades={grades}
        onAuthenticated={(authedUser) => {
          setUser(authedUser);
          setSelectedGradeId(authedUser.gradeId);
          loadProgress();
        }}
        onGradeUpdated={(updatedUser) => {
          setUser(updatedUser);
          setSelectedGradeId(updatedUser.gradeId);
          loadProgress();
        }}
        onLogout={handleLogout}
      />

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        selectedGradeId={selectedGradeId}
        maxAllowedGrade={maxAllowedGrade}
        onOpenLesson={(id) => handleNavigate('lesson', id)}
      />

      <OfflineIndicator />
    </div>
  );
}
