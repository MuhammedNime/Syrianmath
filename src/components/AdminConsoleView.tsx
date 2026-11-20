import React, { useEffect, useState } from 'react';
import {
  BookPlus,
  Edit3,
  FileCheck2,
  FolderPlus,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Video,
} from 'lucide-react';
import { api, GradeWithCounts } from '../lib/api';
import {
  CurriculumBook,
  Lesson,
  PdfProcessingJob,
  Unit,
  UserProfile,
} from '../types';

interface AdminConsoleViewProps {
  user: UserProfile | null;
  grades: GradeWithCounts[];
  onRequireAuth: () => void;
  onDataChanged: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export function AdminConsoleView({
  user,
  grades,
  onRequireAuth,
  onDataChanged,
  onOpenLesson,
}: AdminConsoleViewProps) {
  const [tab, setTab] = useState<'books' | 'lessons' | 'jobs'>('books');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [books, setBooks] = useState<CurriculumBook[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [jobs, setJobs] = useState<PdfProcessingJob[]>([]);
  const [usersCount, setUsersCount] = useState(0);

  // Add Book Form
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookGrade, setNewBookGrade] = useState(12);
  const [newBookPart, setNewBookPart] = useState('كتاب الطالب');
  const [newBookPages, setNewBookPages] = useState(200);
  const [newBookSummary, setNewBookSummary] = useState('');

  // Edit Book state
  const [editingBook, setEditingBook] = useState<CurriculumBook | null>(null);

  // Add Unit Form
  const [newUnitBookId, setNewUnitBookId] = useState('');
  const [newUnitLabel, setNewUnitLabel] = useState('وحدة جديدة');
  const [newUnitTitle, setNewUnitTitle] = useState('');

  // Lesson Editor state
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonDraft, setLessonDraft] = useState<Lesson | null>(null);
  const [newExQuestion, setNewExQuestion] = useState('');
  const [newExHint, setNewExHint] = useState('');
  const [newExSolution, setNewExSolution] = useState('');
  const [newExDifficulty, setNewExDifficulty] = useState<'أساسي' | 'متوسط' | 'تحدي'>('متوسط');

  // Create Lesson state
  const [createLessonUnitId, setCreateLessonUnitId] = useState('');
  const [createLessonTitle, setCreateLessonTitle] = useState('');

  // Reindexing indicator
  const [reindexingId, setReindexingId] = useState<string | null>(null);

  async function loadAdminData() {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminOverview();
      setBooks(res.books);
      setUnits(res.units);
      setLessons(res.lessons);
      setJobs(res.jobs);
      setUsersCount(res.usersCount);
      if (!newUnitBookId && res.books[0]) setNewUnitBookId(res.books[0].id);
      if (!createLessonUnitId && res.units[0]) setCreateLessonUnitId(res.units[0].id);
      if (!selectedLessonId && res.lessons[0]) {
        setSelectedLessonId(res.lessons[0].id);
        setLessonDraft(res.lessons[0]);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [user]);

  useEffect(() => {
    const found = lessons.find((l) => l.id === selectedLessonId) ?? null;
    setLessonDraft(found ? JSON.parse(JSON.stringify(found)) : null);
  }, [selectedLessonId, lessons]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <ShieldAlert className="mx-auto h-10 w-10 text-blue-700 dark:text-sky-400" />
        <h1 className="mt-3 font-display text-xl font-bold text-slate-900 dark:text-white">
          لوحة الإدارة مخصصة لحساب المشرف
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
          لتعديل الكتب والفهارس والدروس أو إضافة فيديوهات الشرح ومراجعة معالجة ملفات PDF، سجّل الدخول بحساب المشرف.
        </p>
        <button
          type="button"
          onClick={onRequireAuth}
          className="mt-5 min-h-[42px] rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 dark:bg-blue-600"
        >
          تسجيل الدخول بحساب المشرف
        </button>
      </div>
    );
  }

  async function handleAddBook(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await api.adminCreateBook({
        title: newBookTitle,
        gradeId: newBookGrade,
        part: newBookPart,
        pageCount: newBookPages,
        summary: newBookSummary,
      });
      setNewBookTitle('');
      setNewBookSummary('');
      setNotice('تمت إضافة الكتاب بنجاح.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSaveBookEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingBook) return;
    setError(null);
    try {
      await api.adminUpdateBook(editingBook.id, editingBook);
      setEditingBook(null);
      setNotice('تم تحديث بيانات الكتاب والصف الدراسي المرتبط به.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDeleteBook(id: string) {
    setError(null);
    try {
      await api.adminDeleteBook(id);
      setNotice('تم حذف الكتاب ووحداته ودروسه.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleReindexBook(id: string) {
    setReindexingId(id);
    setError(null);
    setNotice(null);
    try {
      const res = await api.adminReindexBook(id);
      setNotice(
        `اكتملت إعادة فهرسة "${res.book.title}": ${res.units.length} وحدات و ${res.lessons.length} دروس.`
      );
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setReindexingId(null);
    }
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault();
    if (!newUnitBookId || !newUnitTitle.trim()) return;
    try {
      await api.adminCreateUnit({
        bookId: newUnitBookId,
        chapterLabel: newUnitLabel,
        title: newUnitTitle.trim(),
      });
      setNewUnitTitle('');
      setNotice('تمت إضافة الوحدة إلى الفهرس.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleCreateLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!createLessonUnitId || !createLessonTitle.trim()) return;
    try {
      const res = await api.adminCreateLesson({
        unitId: createLessonUnitId,
        title: createLessonTitle.trim(),
      });
      setCreateLessonTitle('');
      setSelectedLessonId(res.lesson.id);
      setNotice('تم إنشاء الدرس الجديد ويمكنك تعديله الآن.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSaveLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!lessonDraft) return;
    setError(null);
    try {
      await api.adminUpdateLesson(lessonDraft.id, lessonDraft);
      setNotice(`تم حفظ التعديلات على درس "${lessonDraft.title}".`);
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function handleAddExerciseToDraft() {
    if (!lessonDraft || !newExQuestion.trim()) return;
    setLessonDraft({
      ...lessonDraft,
      exercises: [
        ...lessonDraft.exercises,
        {
          id: `er-${Date.now()}`,
          question: newExQuestion.trim(),
          difficulty: newExDifficulty,
          hint: newExHint.trim() || 'راجع قوانين الدرس.',
          solution: newExSolution.trim() || 'الحل مضاف من الإدارة.',
        },
      ],
    });
    setNewExQuestion('');
    setNewExHint('');
    setNewExSolution('');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
              إدارة المحتوى التعليمي والفهرسة الآلية
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              لوحة تحكم المنهاج السوري
            </h1>
            <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {books.length} كتب · {units.length} وحدات · {lessons.length} دروس ·{' '}
              {jobs.length} عمليات PDF · {usersCount} مستخدمين
            </p>
          </div>

          <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTab('books')}
              className={`min-h-[38px] shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap sm:px-4 ${
                tab === 'books'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              الكتب والفهارس
            </button>
            <button
              type="button"
              onClick={() => setTab('lessons')}
              className={`min-h-[38px] shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap sm:px-4 ${
                tab === 'lessons'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              تعديل الدروس والفيديو
            </button>
            <button
              type="button"
              onClick={() => setTab('jobs')}
              className={`min-h-[38px] shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap sm:px-4 ${
                tab === 'jobs'
                  ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              معالجة PDF والنتائج
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
            {notice}
          </div>
        )}
      </div>

      {/* TAB 1: Books & Units */}
      {tab === 'books' && (
        <div className="space-y-6">
          {/* Add Book & Add Unit Forms */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <form
              onSubmit={handleAddBook}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-4 flex items-center gap-2">
                <BookPlus className="h-5 w-5 text-blue-700 dark:text-sky-400" />
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  إضافة كتاب جديد
                </h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="عنوان الكتاب (مثال: التحليل الرياضي - البكالوريا)"
                  className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newBookGrade}
                    onChange={(e) => setNewBookGrade(Number(e.target.value))}
                    className="col-span-2 min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={10}
                    value={newBookPages}
                    onChange={(e) => setNewBookPages(Number(e.target.value))}
                    placeholder="الصفحات"
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  value={newBookPart}
                  onChange={(e) => setNewBookPart(e.target.value)}
                  placeholder="الجزء (مثال: الجزء الأول)"
                  className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <textarea
                  rows={2}
                  value={newBookSummary}
                  onChange={(e) => setNewBookSummary(e.target.value)}
                  placeholder="وصف موجز لمحتوى الكتاب..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  className="min-h-[40px] w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                >
                  حفظ الكتاب
                </button>
              </div>
            </form>

            {/* Add Unit + Add Lesson Quick Creation */}
            <div className="space-y-6">
              <form
                onSubmit={handleAddUnit}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    إضافة وحدة إلى الفهرس
                  </h2>
                </div>
                <div className="space-y-3">
                  <select
                    value={newUnitBookId}
                    onChange={(e) => setNewUnitBookId(e.target.value)}
                    className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newUnitLabel}
                      onChange={(e) => setNewUnitLabel(e.target.value)}
                      placeholder="الوحدة الثالثة"
                      className="min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <input
                      type="text"
                      required
                      value={newUnitTitle}
                      onChange={(e) => setNewUnitTitle(e.target.value)}
                      placeholder="عنوان الوحدة"
                      className="col-span-2 min-h-[40px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[40px] rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    إضافة الوحدة
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleCreateLesson}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-700 dark:text-sky-400" />
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    إضافة درس جديد
                  </h2>
                </div>
                <div className="space-y-3">
                  <select
                    value={createLessonUnitId}
                    onChange={(e) => setCreateLessonUnitId(e.target.value)}
                    className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.chapterLabel}: {u.title}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={createLessonTitle}
                      onChange={(e) => setCreateLessonTitle(e.target.value)}
                      placeholder="عنوان الدرس الجديد"
                      className="min-h-[40px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="min-h-[40px] rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                    >
                      إنشاء
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Edit Book Inline Panel */}
          {editingBook && (
            <form
              onSubmit={handleSaveBookEdit}
              className="rounded-2xl border border-blue-300 bg-blue-50/40 p-6 dark:border-blue-800 dark:bg-slate-900"
            >
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                تعديل كتاب: {editingBook.title}
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, title: e.target.value })
                  }
                  className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <select
                  value={editingBook.gradeId}
                  onChange={(e) =>
                    setEditingBook({
                      ...editingBook,
                      gradeId: Number(e.target.value),
                    })
                  }
                  className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={editingBook.part}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, part: e.target.value })
                  }
                  className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          )}

          {/* Books List: Stacked Cards on Mobile, Table on Tablet/Desktop */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900 dark:text-white">
              قائمة الكتب المسجلة ({books.length})
            </h2>
            {loading ? (
              <p className="text-sm text-slate-500">جارٍ التحميل...</p>
            ) : (
              <>
                <div className="divide-y divide-slate-100 md:hidden dark:divide-slate-800">
                  {books.map((book) => (
                    <div key={book.id} className="space-y-3 py-4 first:pt-1 last:pb-1">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {book.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                          {grades.find((g) => g.id === book.gradeId)?.shortName} ·{' '}
                          {book.part} · {book.pageCount} صفحة
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBook(book)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          disabled={reindexingId === book.id}
                          onClick={() => handleReindexBook(book.id)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-teal-700 disabled:opacity-50 dark:border-slate-700 dark:text-teal-400"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              reindexingId === book.id ? 'animate-spin' : ''
                            }`}
                          />
                          <span>
                            {reindexingId === book.id ? 'جارٍ الفهرسة...' : 'إعادة الفهرسة'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBook(book.id)}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 dark:border-rose-900 dark:text-rose-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <th className="py-3 font-medium">الكتاب</th>
                        <th className="py-3 font-medium">الصف الدراسي</th>
                        <th className="py-3 font-medium">الصفحات</th>
                        <th className="py-3 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {books.map((book) => (
                        <tr key={book.id}>
                          <td className="py-3 font-medium text-slate-900 dark:text-white">
                            {book.title}
                            <span className="block text-xs font-normal text-slate-500">
                              {book.part}
                            </span>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-300">
                            {grades.find((g) => g.id === book.gradeId)?.shortName}
                          </td>
                          <td className="py-3 font-mono text-xs text-slate-600 tabular-nums dark:text-slate-300">
                            {book.pageCount}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingBook(book)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 dark:border-slate-700 dark:text-slate-200"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                disabled={reindexingId === book.id}
                                onClick={() => handleReindexBook(book.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-teal-700 hover:border-teal-400 disabled:opacity-50 dark:border-slate-700 dark:text-teal-400"
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 ${
                                    reindexingId === book.id ? 'animate-spin' : ''
                                  }`}
                                />
                                <span>
                                  {reindexingId === book.id
                                    ? 'جارٍ الفهرسة...'
                                    : 'إعادة الفهرسة'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBook(book.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Edit Lessons, Exercises, YouTube Videos */}
      {tab === 'lessons' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              محرر الدروس والتمارين وفيديوهات الشرح
            </h2>
            <select
              value={selectedLessonId}
              onChange={(e) => setSelectedLessonId(e.target.value)}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-900 sm:max-w-md dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  الصف {l.gradeId} — {l.title}
                </option>
              ))}
            </select>
          </div>

          {lessonDraft && (
            <form onSubmit={handleSaveLesson} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    عنوان الدرس
                  </label>
                  <input
                    type="text"
                    value={lessonDraft.title}
                    onChange={(e) =>
                      setLessonDraft({ ...lessonDraft, title: e.target.value })
                    }
                    className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    من صفحة
                  </label>
                  <input
                    type="number"
                    value={lessonDraft.pageStart}
                    onChange={(e) =>
                      setLessonDraft({
                        ...lessonDraft,
                        pageStart: Number(e.target.value),
                      })
                    }
                    className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                    إلى صفحة
                  </label>
                  <input
                    type="number"
                    value={lessonDraft.pageEnd}
                    onChange={(e) =>
                      setLessonDraft({
                        ...lessonDraft,
                        pageEnd: Number(e.target.value),
                      })
                    }
                    className="min-h-[40px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">
                  الشرح النظري (يدعم صيغ LaTeX داخل $...$)
                </label>
                <textarea
                  rows={4}
                  value={lessonDraft.theory}
                  onChange={(e) =>
                    setLessonDraft({ ...lessonDraft, theory: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* YouTube Video Linker */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-700 dark:text-sky-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    ربط فيديو يوتيوب للدرس
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="url"
                    dir="ltr"
                    value={lessonDraft.videoUrl ?? ''}
                    onChange={(e) =>
                      setLessonDraft({
                        ...lessonDraft,
                        videoUrl: e.target.value,
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-left text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={lessonDraft.videoTitle ?? ''}
                    onChange={(e) =>
                      setLessonDraft({
                        ...lessonDraft,
                        videoTitle: e.target.value,
                      })
                    }
                    placeholder="عنوان الفيديو (مثال: شرح درس النهايات بالكامل)"
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Add Exercise to Lesson */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">
                  إضافة تمرين جديد للدرس (التمارين الحالية: {lessonDraft.exercises.length})
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    type="text"
                    value={newExQuestion}
                    onChange={(e) => setNewExQuestion(e.target.value)}
                    placeholder="نص التمرين الجديد..."
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <select
                    value={newExDifficulty}
                    onChange={(e) =>
                      setNewExDifficulty(
                        e.target.value as 'أساسي' | 'متوسط' | 'تحدي'
                      )
                    }
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    <option value="أساسي">أساسي</option>
                    <option value="متوسط">متوسط</option>
                    <option value="تحدي">تحدي</option>
                  </select>
                  <input
                    type="text"
                    value={newExHint}
                    onChange={(e) => setNewExHint(e.target.value)}
                    placeholder="تلميح للحل..."
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={newExSolution}
                    onChange={(e) => setNewExSolution(e.target.value)}
                    placeholder="الحل النموذجي..."
                    className="min-h-[40px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddExerciseToDraft}
                  className="mt-3 rounded-xl border border-blue-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:bg-slate-900 dark:text-sky-400"
                >
                  إدراج التمرين في الدرس
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenLesson(lessonDraft.id)}
                  className="text-sm font-semibold text-blue-700 hover:underline dark:text-sky-400"
                >
                  معاينة صفحة الدرس المستقلة
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] rounded-xl bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                >
                  حفظ تعديلات الدرس
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: PDF Processing Jobs & Extraction Review */}
      {tab === 'jobs' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              سجل معالجة كتب PDF ونتائج الاستخراج
            </h2>
          </div>

          {jobs.length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد عمليات معالجة مسجلة.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-2 py-4 first:pt-2 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {job.fileName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      الصف {job.gradeId} · الحالة:{' '}
                      {job.status === 'completed'
                        ? 'مكتمل'
                        : job.status === 'failed'
                        ? 'فشل'
                        : 'قيد المعالجة'}{' '}
                      · وحدات: {job.extractedUnitsCount} · دروس:{' '}
                      {job.extractedLessonsCount} · قوانين:{' '}
                      {job.extractedFormulasCount} · تمارين:{' '}
                      {job.extractedExercisesCount}
                    </p>
                    {job.rawSummary && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        {job.rawSummary}
                      </p>
                    )}
                    {job.errorMessage && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                        {job.errorMessage}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
