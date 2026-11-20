import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ClipboardCheck,
  Download,
  FileText,
  FileUp,
  HardDrive,
  Search,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import { api, EnrichedBook, GradeWithCounts } from '../lib/api';
import {
  cacheBookInInternalMemory,
  CachedBookRecord,
  getAllCachedBooks,
  removeCachedBook,
} from '../lib/localCache';
import { UserProfile } from '../types';
import { PdfCanvasViewer } from './PdfCanvasViewer';

interface LibraryViewProps {
  grades: GradeWithCounts[];
  selectedGradeId: number;
  maxAllowedGrade: number;
  user: UserProfile | null;
  initialOpenBook?: { bookId: string; page: number; key: number } | null;
  onOpenLesson: (lessonId: string) => void;
  onAskTutorFromPage?: (book: EnrichedBook, page: number) => void;
  onOpenAdmin: () => void;
  onRequireAuth: () => void;
  onLibraryChanged: () => void;
}

export function LibraryView({
  grades,
  selectedGradeId,
  maxAllowedGrade,
  user,
  initialOpenBook,
  onOpenLesson,
  onAskTutorFromPage,
  onOpenAdmin,
  onRequireAuth,
  onLibraryChanged,
}: LibraryViewProps) {
  const [filterGrade, setFilterGrade] = useState<number | 'all'>(selectedGradeId);
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<EnrichedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedBookIds, setExpandedBookIds] = useState<Record<string, boolean>>({});

  // Internal Memory (IndexedDB) state
  const [cachedRecords, setCachedRecords] = useState<Record<string, CachedBookRecord>>({});
  const [cachingBookId, setCachingBookId] = useState<string | null>(null);
  const [offlineFallbackNotice, setOfflineFallbackNotice] = useState(false);

  // In-app PDF Viewer state (avoids window.open & works on Android WebView via PDF.js)
  const [pdfViewer, setPdfViewer] = useState<{
    book: EnrichedBook;
    pdfBlob: Blob;
    objectUrl: string;
    page: number;
    detectedPages?: number;
  } | null>(null);
  const [pageInput, setPageInput] = useState('1');
  const handledOpenKeyRef = React.useRef<number>(0);

  // PDF Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploadGrade, setUploadGrade] = useState<number>(
    Math.min(selectedGradeId, maxAllowedGrade)
  );
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const allowedGrades = grades.filter((g) => g.id <= maxAllowedGrade);

  async function refreshCachedMap() {
    const records = await getAllCachedBooks();
    const map: Record<string, CachedBookRecord> = {};
    for (const r of records) {
      map[r.book.id] = r;
    }
    setCachedRecords(map);
    return map;
  }

  useEffect(() => {
    refreshCachedMap();
  }, []);

  useEffect(() => {
    if (typeof filterGrade === 'number' && filterGrade > maxAllowedGrade) {
      setFilterGrade(maxAllowedGrade);
    }
    setUploadGrade((prev) => Math.min(prev, maxAllowedGrade));
  }, [maxAllowedGrade, filterGrade]);

  useEffect(() => {
    return () => {
      if (pdfViewer?.objectUrl) {
        URL.revokeObjectURL(pdfViewer.objectUrl);
      }
    };
  }, [pdfViewer]);

  async function fetchBooks(grade: number | 'all', q: string) {
    setLoading(true);
    setOfflineFallbackNotice(false);
    try {
      const targetGrade =
        grade === 'all' ? undefined : Math.min(grade, maxAllowedGrade);
      const res = await api.getLibraryBooks({
        grade: targetGrade,
        q: q.trim() || undefined,
      });
      setBooks(res.books);
      if (res.books.length > 0) {
        setExpandedBookIds((prev) =>
          Object.keys(prev).length === 0 ? { [res.books[0].id]: true } : prev
        );
      }
    } catch {
      // Fall back to internal IndexedDB cache when offline/unreachable
      const cached = await getAllCachedBooks();
      const lower = q.trim().toLowerCase();
      const filtered: EnrichedBook[] = cached
        .filter((r) => r.book.gradeId <= maxAllowedGrade)
        .filter((r) => (grade === 'all' ? true : r.book.gradeId === grade))
        .filter((r) => {
          if (!lower) return true;
          return (
            r.book.title.toLowerCase().includes(lower) ||
            r.book.summary.toLowerCase().includes(lower) ||
            r.lessons.some((l) => l.title.toLowerCase().includes(lower))
          );
        })
        .map((r) => ({
          ...r.book,
          units: r.units,
          lessons: r.lessons,
        }));
      setBooks(filtered);
      setOfflineFallbackNotice(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks(filterGrade, searchQuery);
    }, 180);
    return () => clearTimeout(timer);
  }, [filterGrade, searchQuery, maxAllowedGrade]);

  async function handleSaveBookToInternalMemory(book: EnrichedBook) {
    setCachingBookId(book.id);
    try {
      let pdfBlob: Blob | undefined = cachedRecords[book.id]?.pdfBlob;
      if (!pdfBlob && book.pdfFileName) {
        pdfBlob = await api.downloadBookPdf(book.id);
      }
      await cacheBookInInternalMemory({
        book,
        units: book.units,
        lessons: book.lessons,
        pdfBlob,
        cachedAt: new Date().toISOString(),
      });
      await refreshCachedMap();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setCachingBookId(null);
    }
  }

  async function handleOpenPdfBook(book: EnrichedBook, targetPage = 1) {
    setCachingBookId(book.id);
    try {
      let pdfBlob = cachedRecords[book.id]?.pdfBlob;
      if (!pdfBlob && book.pdfFileName) {
        pdfBlob = await api.downloadBookPdf(book.id);
        await cacheBookInInternalMemory({
          book,
          units: book.units,
          lessons: book.lessons,
          pdfBlob,
          cachedAt: new Date().toISOString(),
        });
        await refreshCachedMap();
      }
      if (!pdfBlob) {
        setUploadStatus({
          type: 'error',
          message: 'هذا الكتاب لا يحتوي على ملف PDF مرفق، يمكنك تصفح دروسه وفهرسه أدناه.',
        });
        return;
      }
      const safePage = Math.max(1, Math.min(book.pageCount || 999, Math.round(targetPage) || 1));
      const objectUrl = URL.createObjectURL(pdfBlob);
      setPageInput(String(safePage));
      setPdfViewer({ book, pdfBlob, objectUrl, page: safePage });
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setCachingBookId(null);
    }
  }

  useEffect(() => {
    if (!initialOpenBook || initialOpenBook.key === handledOpenKeyRef.current) return;
    if (loading) return;
    const match = books.find((b) => b.id === initialOpenBook.bookId);
    if (match) {
      handledOpenKeyRef.current = initialOpenBook.key;
      void handleOpenPdfBook(match, initialOpenBook.page);
    } else if (filterGrade !== 'all') {
      setFilterGrade('all');
    }
  }, [initialOpenBook, books, loading, filterGrade]);

  async function handleRemoveFromInternalMemory(bookId: string) {
    await removeCachedBook(bookId);
    await refreshCachedMap();
  }

  async function handleUploadPdf(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!pdfFile) return;

    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await api.uploadPdfBook({
        file: pdfFile,
        gradeId: uploadGrade,
        title: uploadTitle.trim() || undefined,
      });

      // Persist uploaded book + PDF blob immediately inside IndexedDB internal memory
      await cacheBookInInternalMemory({
        book: res.book,
        units: res.units,
        lessons: res.lessons,
        pdfBlob: pdfFile,
        cachedAt: new Date().toISOString(),
      });
      await refreshCachedMap();

      setUploadStatus({
        type: 'success',
        message: `تمت قراءة الكتاب وفهرسته وحفظه في الذاكرة الداخلية بنجاح: استخراج ${res.units.length} وحدات و ${res.lessons.length} دروس.`,
      });
      setPdfFile(null);
      setUploadTitle('');
      setFilterGrade(res.book.gradeId);
      setExpandedBookIds({ [res.book.id]: true });
      await fetchBooks(res.book.gradeId, '');
      onLibraryChanged();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: (err as Error).message,
      });
    } finally {
      setUploading(false);
    }
  }

  const cachedCount = Object.values(cachedRecords).filter(
    (r) => r.book.gradeId <= maxAllowedGrade
  ).length;

  return (
    <div className="space-y-6">
      {/* Library Header & Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-sky-400">
              المركز التعليمي للمناهج السورية · متاح لك حتى {grades.find((g) => g.id === maxAllowedGrade)?.shortName || `الصف ${maxAllowedGrade}`}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
              مكتبة المنهاج السوري للرياضيات
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              ابحث في الفهارس والوحدات والقوانين، وارفع كتب PDF لتبقى محفوظة تلقائياً في الذاكرة الداخلية لجهازك.
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 tabular-nums">
              <HardDrive className="h-3.5 w-3.5" />
              <span>
                الكتب المحفوظة في الذاكرة الداخلية: {cachedCount} كتاب
              </span>
            </p>
          </div>

          {user?.role === 'admin' && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowUpload((v) => !v)}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap sm:flex-none dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <FileUp className="h-4 w-4 shrink-0" />
                <span>رفع كتاب PDF</span>
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-400 whitespace-nowrap sm:flex-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <Settings2 className="h-4 w-4 shrink-0" />
                <span>إدارة الفهرس</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Grade Filter Bar */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 md:grid-cols-12 dark:border-slate-800">
          <div className="relative md:col-span-8">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن اسم كتاب، درس، مبرهنة، أو قانون رياضي..."
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="md:col-span-4">
            <select
              value={filterGrade}
              onChange={(e) =>
                setFilterGrade(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">
                {maxAllowedGrade < 12
                  ? `صفك والصفوف السابقة (1 - ${maxAllowedGrade})`
                  : 'جميع الصفوف (1 - 12)'}
              </option>
              {allowedGrades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {offlineFallbackNotice && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
            يتم عرض الكتب المحفوظة في الذاكرة الداخلية حالياً.
          </div>
        )}
      </div>

      {/* PDF Automatic Extraction & Indexing Drawer (Admin Only) */}
      {user?.role === 'admin' && showUpload && (
        <form
          onSubmit={handleUploadPdf}
          className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6 dark:border-blue-900/60 dark:bg-slate-900"
        >
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            المعالج الذكي لكتب المنهاج PDF
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            عند رفع ملف PDF يقوم النظام تلقائياً بقراءة الصفحات، فهرسة الوحدات والدروس، وحفظ الكتاب ونسخة PDF في الذاكرة الداخلية لجهازك للاستخدام الدائم.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                ملف الكتاب (PDF — حتى 100 ميغابايت)
              </label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) => {
                  const chosen = e.target.files?.[0] ?? null;
                  if (chosen && chosen.size > 100 * 1024 * 1024) {
                    setUploadStatus({
                      type: 'error',
                      message: 'حجم الملف يتجاوز الحد الأقصى المسموح به (100 ميغابايت).',
                    });
                    setPdfFile(null);
                    e.target.value = '';
                    return;
                  }
                  setUploadStatus(null);
                  setPdfFile(chosen);
                }}
                className="block w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-700 file:ml-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {pdfFile && (
                <p className="mt-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  الحجم: {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                الصف الدراسي للكتاب
              </label>
              <select
                value={uploadGrade}
                onChange={(e) => setUploadGrade(Number(e.target.value))}
                className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {allowedGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                عنوان الكتاب (اختياري)
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="يُستخرج تلقائياً إن تُرك فارغاً"
                className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {uploadStatus && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                uploadStatus.type === 'success'
                  ? 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {uploadStatus.message}
            </div>
          )}

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="min-h-[40px] rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={uploading || !pdfFile}
              className="min-h-[40px] rounded-xl bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600"
            >
              {uploading ? 'جارٍ قراءة الكتاب وحفظه...' : 'بدء التحليل والحفظ'}
            </button>
          </div>
        </form>
      )}

      {uploadStatus && !showUpload && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            uploadStatus.type === 'success'
              ? 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
          }`}
        >
          {uploadStatus.message}
        </div>
      )}

      {/* Books & Searchable TOC List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            لا توجد كتب مطابقة لبحثك ضمن صفك والصفوف السابقة. جرب تغيير الصف أو كلمة البحث أو ارفع كتاباً جديداً.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {books.map((book) => {
            const isExpanded = Boolean(expandedBookIds[book.id]);
            const cached = cachedRecords[book.id];
            const isCaching = cachingBookId === book.id;
            const hasPdfAvailable = Boolean(cached?.pdfBlob || book.pdfFileName);
            const gradeName =
              grades.find((g) => g.id === book.gradeId)?.name ?? `الصف ${book.gradeId}`;

            return (
              <div
                key={book.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 gap-3.5 sm:gap-4">
                    <img
                      src={
                        book.coverUrl ||
                        '/src/assets/images/book_cover_syrian_math_1795101193959.jpg'
                      }
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="h-24 w-16 sm:h-28 sm:w-20 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-blue-700 tabular-nums dark:text-sky-400">
                        {gradeName} · {book.part} · {book.pageCount} صفحة
                      </p>
                      <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {book.title}
                      </h2>
                      <p className="mt-1.5 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                        {book.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                        <span>
                          {book.units.length} وحدات · {book.lessons.length} دروس مفهرسة
                        </span>
                        {cached && (
                          <span className="inline-flex items-center gap-1 font-semibold text-teal-700 dark:text-teal-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              محفوظ في الذاكرة الداخلية
                              {cached.pdfBlob ? ' (مع ملف PDF)' : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {hasPdfAvailable && (
                      <button
                        type="button"
                        disabled={isCaching}
                        onClick={() => handleOpenPdfBook(book)}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-60 whitespace-nowrap dark:bg-teal-600"
                      >
                        <FileText className="h-4 w-4" />
                        <span>{isCaching ? 'جارٍ الفتح...' : 'فتح PDF'}</span>
                      </button>
                    )}

                    {cached ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveFromInternalMemory(book.id)}
                        title="حذف النسخة المحفوظة في الذاكرة الداخلية"
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>إزالة من الذاكرة</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isCaching}
                        onClick={() => handleSaveBookToInternalMemory(book)}
                        className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-800 transition-colors hover:bg-blue-100 disabled:opacity-60 whitespace-nowrap dark:border-blue-800 dark:bg-blue-950/40 dark:text-sky-300"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{isCaching ? 'جارٍ الحفظ...' : 'حفظ بالذاكرة الداخلية'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedBookIds((prev) => ({
                          ...prev,
                          [book.id]: !prev[book.id],
                        }))
                      }
                      className="inline-flex min-h-[40px] flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-blue-400 whitespace-nowrap dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <span>{isExpanded ? 'إخفاء الفهرس' : 'عرض الفهرس والدروس'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expandable Table of Contents */}
                {isExpanded && (
                  <div className="mt-6 space-y-4 border-t border-slate-100 pt-5 dark:border-slate-800">
                    {book.units.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        لم تتم إضافة وحدات لهذا الكتاب بعد.
                      </p>
                    ) : (
                      [...book.units]
                        .sort((a, b) => a.order - b.order)
                        .map((unit) => {
                          const unitLessons = [...book.lessons]
                            .filter((l) => l.unitId === unit.id)
                            .sort((a, b) => a.order - b.order);
                          return (
                            <div
                              key={unit.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2">
                                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                                  {unit.chapterLabel}: {unit.title}
                                </h3>
                                <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                  ص {unit.pageStart}–{unit.pageEnd}
                                </span>
                              </div>

                              <div className="divide-y divide-slate-200/70 dark:divide-slate-700/60">
                                {unitLessons.map((lesson) => {
                                  const isEx = Boolean(lesson.isUnitExercises);
                                  return (
                                    <button
                                      key={lesson.id}
                                      type="button"
                                      onClick={() => onOpenLesson(lesson.id)}
                                      className={`flex w-full items-center justify-between gap-3 py-2.5 text-right transition-colors ${
                                        isEx
                                          ? 'mt-1 rounded-lg bg-teal-50/80 px-2.5 text-teal-900 hover:bg-teal-100/80 dark:bg-teal-950/40 dark:text-teal-200 dark:hover:bg-teal-950/70'
                                          : 'hover:text-blue-700 dark:hover:text-sky-400'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {isEx ? (
                                          <ClipboardCheck className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400" />
                                        ) : (
                                          <BookOpen className="h-4 w-4 shrink-0 text-blue-600 dark:text-sky-400" />
                                        )}
                                        <span
                                          className={`truncate text-sm ${
                                            isEx
                                              ? 'font-semibold text-teal-900 dark:text-teal-200'
                                              : 'font-medium text-slate-800 dark:text-slate-200'
                                          }`}
                                        >
                                          {lesson.title}
                                        </span>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                                        <span>
                                          ص {lesson.pageStart}–{lesson.pageEnd}
                                        </span>
                                        <ChevronLeft className="h-4 w-4" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* In-App PDF Reader Modal */}
      {pdfViewer && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/75 p-2 sm:p-6 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={pdfViewer.book.title}
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div className="min-w-0">
                <h3 className="truncate font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {pdfViewer.book.title}
                </h3>
                <p className="text-xs text-teal-700 tabular-nums dark:text-teal-400">
                  مفتوح من الذاكرة الداخلية · صفحة {pdfViewer.page} من{' '}
                  {pdfViewer.detectedPages || pdfViewer.book.pageCount}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const maxP = pdfViewer.detectedPages || pdfViewer.book.pageCount || 999;
                    const p = Math.max(1, Math.min(maxP, Number(pageInput) || 1));
                    setPageInput(String(p));
                    setPdfViewer((prev) => (prev ? { ...prev, page: p } : prev));
                  }}
                  className="flex items-center gap-1"
                >
                  <label htmlFor="pdf-page-jump" className="text-xs text-slate-500 dark:text-slate-400">
                    صفحة:
                  </label>
                  <input
                    id="pdf-page-jump"
                    type="number"
                    min={1}
                    max={pdfViewer.detectedPages || pdfViewer.book.pageCount || 999}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    className="h-9 w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 text-center text-xs font-semibold text-slate-900 tabular-nums outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    انتقال
                  </button>
                </form>

                {onAskTutorFromPage && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetBook = pdfViewer.book;
                      const currentPage = Number(pageInput) || pdfViewer.page;
                      URL.revokeObjectURL(pdfViewer.objectUrl);
                      setPdfViewer(null);
                      onAskTutorFromPage(targetBook, currentPage);
                    }}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white hover:bg-blue-800 dark:bg-blue-600"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>اشرح هذه الصفحة بالذكاء</span>
                  </button>
                )}

                <a
                  href={pdfViewer.objectUrl}
                  download={`${pdfViewer.book.title}.pdf`}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">تنزيل نسخة</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(pdfViewer.objectUrl);
                    setPdfViewer(null);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="إغلاق القارئ"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <PdfCanvasViewer
              pdfBlob={pdfViewer.pdfBlob}
              page={pdfViewer.page}
              onPageChange={(nextPage) => {
                setPageInput(String(nextPage));
                setPdfViewer((prev) => (prev ? { ...prev, page: nextPage } : prev));
              }}
              onNumPagesDetected={(total) => {
                setPdfViewer((prev) =>
                  prev && prev.detectedPages !== total
                    ? { ...prev, detectedPages: total }
                    : prev
                );
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

