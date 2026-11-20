import katex from 'katex';
import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  FileDown,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  LineChart,
  ListChecks,
  MessageSquarePlus,
  PanelRightClose,
  PanelRightOpen,
  Paperclip,
  PenTool,
  Plus,
  Printer,
  Search,
  Send,
  Sigma,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react';
import { api, EnrichedBook, GradeWithCounts } from '../lib/api';
import {
  Lesson,
  SavedTutorChat,
  SolvedFavoriteItem,
  TutorExplainStyle,
  TutorLanguage,
  TutorMessage,
  TutorMode,
  UserProfile,
} from '../types';
import { MathText } from './MathText';

const CameraCaptureModal = lazy(() =>
  import('./CameraCaptureModal').then((m) => ({ default: m.CameraCaptureModal }))
);
const DrawingCanvasModal = lazy(() =>
  import('./DrawingCanvasModal').then((m) => ({ default: m.DrawingCanvasModal }))
);
const LiveMathModal = lazy(() =>
  import('./LiveMathModal').then((m) => ({ default: m.LiveMathModal }))
);

interface SmartTutorViewProps {
  grades: GradeWithCounts[];
  selectedGradeId: number;
  maxAllowedGrade: number;
  onSelectGrade: (gradeId: number) => void;
  initialLessonId?: string;
  initialPromptRequest?: {
    text: string;
    bookId?: string;
    lessonId?: string;
    mode?: TutorMode;
    key: number;
  } | null;
  user?: UserProfile | null;
  gradeLessons: Lesson[];
}

const STORAGE_CHATS_KEY = 'syria_tutor_chats_v1';
const STORAGE_FAVORITES_KEY = 'syria_tutor_favorites_v1';
const STORAGE_EXPLAIN_KEY = 'syria_tutor_explain_style_v1';
const STORAGE_LANG_KEY = 'syria_tutor_lang_v1';

const TUTOR_MODES: Array<{
  id: TutorMode;
  label: string;
  slash: string;
  hint: string;
}> = [
  {
    id: 'solve',
    label: 'حل المسألة',
    slash: '/حل',
    hint: 'اكتب نص المسألة أو أدرج معادلة بـ f(x) أو أرفق صورة / رسم / PDF...',
  },
  {
    id: 'explain',
    label: 'شرح قانون',
    slash: '/اشرح',
    hint: 'اسأل عن أي نظرية أو قانون أو برهان في المنهاج...',
  },
  {
    id: 'graph',
    label: 'رسم بياني',
    slash: '/ارسم',
    hint: 'أدخل دالة مثل f(x) = x^2 - 4x + 3 لرسمها وتحليل تغيراتها...',
  },
  {
    id: 'grade_answer',
    label: 'تصحيح إجابة',
    slash: '/صحح',
    hint: 'اكتب المسألة متبوعة بحلك لنصححه ونكشف الأخطاء الشائعة...',
  },
  {
    id: 'generate_practice',
    label: 'توليد تمارين',
    slash: '/تمارين',
    hint: 'اطلب 3 تمارين متدرجة الصعوبة مطابقة للدرس المختار...',
  },
];

const SLASH_COMMANDS: Array<{
  cmd: string;
  title: string;
  desc: string;
  action: 'mode' | 'explain_quick' | 'explain_detailed' | 'clear' | 'live_math';
  mode?: TutorMode;
}> = [
  { cmd: '/حل', title: 'حل خطوة بخطوة', desc: 'تفعيل وضع الحل المفصل للمسألة', action: 'mode', mode: 'solve' },
  { cmd: '/اشرح', title: 'شرح قانون أو مفهوم', desc: 'شرح القاعدة مع مثال عددي من الكتاب', action: 'mode', mode: 'explain' },
  { cmd: '/ارسم', title: 'رسم بياني تفاعلي', desc: 'توليد مخطط Chart.js وجدول قيم للدالة', action: 'mode', mode: 'graph' },
  { cmd: '/صحح', title: 'تصحيح حل الطالب', desc: 'تدقيق خطوات حلك وتحديد موضع الخطأ', action: 'mode', mode: 'grade_answer' },
  { cmd: '/تمارين', title: 'توليد تمارين تدريبية', desc: '3 مسائل متدرجة الصعوبة مع الحل', action: 'mode', mode: 'generate_practice' },
  { cmd: '/سريع', title: 'أسلوب الشرح السريع', desc: '3 إلى 6 خطوات مركزة بدون إطالة', action: 'explain_quick' },
  { cmd: '/تفصيلي', title: 'أسلوب الشرح التفصيلي', desc: 'توضيح كل خطوة والقاعدة المستخدمة', action: 'explain_detailed' },
  { cmd: '/معادلة', title: 'فتح Live Math', desc: 'إدراج معادلة بصرية بلوحة الرموز', action: 'live_math' },
  { cmd: '/مسح', title: 'بدء محادثة جديدة', desc: 'بدء جلسة حوارية جديدة نظيفة', action: 'clear' },
];

const STARTER_PROMPTS: Array<{
  title: string;
  subtitle: string;
  prompt: string;
  mode: TutorMode;
}> = [
  {
    title: 'رسم دالة وتحليل تغيراتها',
    subtitle: 'تمثيل بياني تفاعلي مع جدول القيم',
    prompt: 'ارسم الدالة $f(x) = x^2 - 4x + 3$ بيانياً وحدد ذروة القطع ونقاط التقاطع مع المحورين',
    mode: 'graph',
  },
  {
    title: 'حل معادلة أو جملة معادلات',
    subtitle: 'خطوات منظمة مع التحقق النهائي',
    prompt: 'حل المعادلة $2x^2 - 5x + 2 = 0$ بطريقة المميز دلتا وتحقق من الجذور بالتعويض',
    mode: 'solve',
  },
  {
    title: 'تصحيح خطوات حل الطالب',
    subtitle: 'تدقيق تربوي وكشف الأخطاء الشائعة',
    prompt: 'صحح إجابتي: لحساب مشتق $\\ln(x^2 + 1)$ كتبت $\\frac{1}{x^2 + 1}$، هل حلي صحيح؟',
    mode: 'grade_answer',
  },
  {
    title: 'توليد تمارين تدريبية مشابهة',
    subtitle: 'أساسي · متوسط · تحدي وفق الكتاب',
    prompt: 'أنشئ لي 3 تمارين متدرجة الصعوبة في النهايات وحالات عدم التعيين مع الحل والتلميح',
    mode: 'generate_practice',
  },
];

function escapeHtmlAttr(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildMathChipHtml(latex: string): string {
  const clean = latex.trim();
  let rendered = clean;
  try {
    rendered = katex.renderToString(clean, { throwOnError: false, strict: false });
  } catch {
    rendered = escapeHtmlAttr(clean);
  }
  return `<span class="math-expression" contenteditable="false" dir="ltr" data-latex="${escapeHtmlAttr(
    clean
  )}">${rendered}</span>`;
}

function editorHtmlToPlainLatexText(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  temp.querySelectorAll('.math-expression').forEach((el) => {
    const latex = (el.getAttribute('data-latex') || '').trim();
    el.replaceWith(document.createTextNode(` $${latex}$ `));
  });
  // Preserve line breaks from div/p/br
  temp.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  return (temp.textContent || '')
    .replace(/\u200B/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function plainLatexTextToEditorHtml(text: string): string {
  const escaped = String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const withConverted = escaped
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `$$${inner}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner}$`);

  return withConverted
    .replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => `\u200B${buildMathChipHtml(inner)}\u200B`)
    .replace(/\$([^$\n]+)\$/g, (_m, inner) => `\u200B${buildMathChipHtml(inner)}\u200B`)
    .replace(/\n/g, '<br>');
}

function loadStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function SmartTutorView({
  grades,
  selectedGradeId,
  maxAllowedGrade,
  onSelectGrade,
  initialLessonId,
  initialPromptRequest,
  user,
  gradeLessons,
}: SmartTutorViewProps) {
  // Tutor Modes & Commands (Mathai01 style)
  const [mode, setMode] = useState<TutorMode>('solve');
  const [explainStyle, setExplainStyle] = useState<TutorExplainStyle>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPLAIN_KEY);
      return saved === 'quick' ? 'quick' : 'detailed';
    } catch {
      return 'detailed';
    }
  });
  const [language, setLanguage] = useState<TutorLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return saved === 'en' || saved === 'tr' ? saved : 'ar';
    } catch {
      return 'ar';
    }
  });
  const [stageScope, setStageScope] = useState<'curriculum' | 'general'>('curriculum');

  // Syrian Curriculum Context
  const [showContextBar, setShowContextBar] = useState(false);
  const [bookId, setBookId] = useState<string>('');
  const [unitId, setUnitId] = useState<string>('');
  const [availableBooks, setAvailableBooks] = useState<EnrichedBook[]>([]);
  const [lessonId, setLessonId] = useState<string>(initialLessonId || '');

  // Chat & Storage State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'chats' | 'favorites'>('chats');
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [savedChats, setSavedChats] = useState<SavedTutorChat[]>(() =>
    loadStoredJson<SavedTutorChat[]>(STORAGE_CHATS_KEY, [])
  );
  const [favorites, setFavorites] = useState<SolvedFavoriteItem[]>(() =>
    loadStoredJson<SolvedFavoriteItem[]>(STORAGE_FAVORITES_KEY, [])
  );
  const [currentChatId, setCurrentChatId] = useState<string>(() => `chat-${Date.now()}`);
  const [messages, setMessages] = useState<TutorMessage[]>([]);

  // Composer & Attachments State
  const [hasEditorText, setHasEditorText] = useState(false);
  const [slashQuery, setSlashQuery] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState<string | null>(null);
  const [toolsPopoverOpen, setToolsPopoverOpen] = useState(false);

  // Modals State
  const [liveMathOpen, setLiveMathOpen] = useState(false);
  const [liveMathInitialLatex, setLiveMathInitialLatex] = useState('');
  const [drawingOpen, setDrawingOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Request & UI Feedback State
  const [sending, setSending] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Sync Refs
  const hydratedUserIdRef = useRef<string | null>(null);
  const prewarmedBooksRef = useRef<Set<string>>(new Set());
  const handledPromptKeyRef = useRef<number>(0);

  // Refs for Rich Editor & Scrolling
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const editingChipRef = useRef<HTMLElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const endOfChatRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPLAIN_KEY, explainStyle);
    } catch {
      // ignore
    }
  }, [explainStyle]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(savedChats.slice(0, 30)));
    } catch {
      // ignore
    }
  }, [savedChats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(favorites.slice(0, 60)));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Sync saved chats & favorites with server for signed-in students/admins
  useEffect(() => {
    if (!user?.id) {
      hydratedUserIdRef.current = null;
      return;
    }
    let cancelled = false;
    api
      .getTutorState()
      .then((res) => {
        if (cancelled || !res.authenticated) return;
        setSavedChats((localChats) => {
          const map = new Map<string, SavedTutorChat>();
          for (const c of res.chats) map.set(c.id, c);
          for (const c of localChats) {
            const existing = map.get(c.id);
            if (!existing || c.updatedAt > existing.updatedAt) {
              map.set(c.id, c);
            }
          }
          return Array.from(map.values())
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
            .slice(0, 30);
        });
        setFavorites((localFavs) => {
          const map = new Map<string, SolvedFavoriteItem>();
          for (const f of res.favorites) map.set(f.id, f);
          for (const f of localFavs) {
            if (!map.has(f.id)) map.set(f.id, f);
          }
          return Array.from(map.values()).slice(0, 60);
        });
        hydratedUserIdRef.current = user.id;
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || hydratedUserIdRef.current !== user.id) return;
    const timer = window.setTimeout(() => {
      void api.saveTutorState(savedChats.slice(0, 30), favorites.slice(0, 60)).catch(() => undefined);
    }, 700);
    return () => window.clearTimeout(timer);
  }, [user?.id, savedChats, favorites]);

  // Load allowed curriculum books
  useEffect(() => {
    let cancelled = false;
    api
      .getLibraryBooks()
      .then((res) => {
        if (!cancelled) {
          const cap = Math.min(selectedGradeId, maxAllowedGrade);
          const allowed = res.books
            .filter((b) => b.gradeId <= cap)
            .sort((a, b) => {
              if (a.gradeId === selectedGradeId && b.gradeId !== selectedGradeId) return -1;
              if (b.gradeId === selectedGradeId && a.gradeId !== selectedGradeId) return 1;
              return b.gradeId - a.gradeId;
            });
          setAvailableBooks(allowed);
          if (bookId && !allowed.some((b) => b.id === bookId)) {
            setBookId('');
            setUnitId('');
            setLessonId('');
          }
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [selectedGradeId, maxAllowedGrade, bookId]);

  useEffect(() => {
    if (!initialLessonId) return;
    setLessonId(initialLessonId);
    for (const b of availableBooks) {
      const found = b.lessons.find((l) => l.id === initialLessonId);
      if (found) {
        setBookId(b.id);
        setUnitId(found.unitId);
        return;
      }
    }
  }, [initialLessonId, availableBooks]);

  const selectedBook = useMemo(
    () => availableBooks.find((b) => b.id === bookId) ?? null,
    [availableBooks, bookId]
  );

  // Silently pre-warm selected textbook PDF in Gemini File API cache
  useEffect(() => {
    if (!selectedBook?.pdfFileName) return;
    if (prewarmedBooksRef.current.has(selectedBook.id)) return;
    prewarmedBooksRef.current.add(selectedBook.id);
    void api.prewarmBookPdf(selectedBook.id).catch(() => undefined);
  }, [selectedBook]);

  // Handle incoming page/prompt intent from Library PDF viewer or Exam diagnosis
  useEffect(() => {
    if (!initialPromptRequest || initialPromptRequest.key === handledPromptKeyRef.current) {
      return;
    }
    handledPromptKeyRef.current = initialPromptRequest.key;
    if (initialPromptRequest.bookId) {
      setBookId(initialPromptRequest.bookId);
      setShowContextBar(true);
    }
    if (initialPromptRequest.lessonId) {
      setLessonId(initialPromptRequest.lessonId);
    }
    if (initialPromptRequest.mode) {
      setMode(initialPromptRequest.mode);
    }
    if (initialPromptRequest.text) {
      setEditorPromptText(initialPromptRequest.text, true);
    }
  }, [initialPromptRequest]);

  const selectableUnits = useMemo(() => {
    if (selectedBook) {
      return [...selectedBook.units].sort((a, b) => a.order - b.order);
    }
    const gradeBooks = availableBooks.filter((b) => b.gradeId === selectedGradeId);
    const sourceBooks = gradeBooks.length > 0 ? gradeBooks : availableBooks;
    return sourceBooks.flatMap((b) =>
      [...b.units].sort((a, b2) => a.order - b2.order)
    );
  }, [selectedBook, availableBooks, selectedGradeId]);

  const selectedUnit = useMemo(
    () => selectableUnits.find((u) => u.id === unitId) ?? null,
    [selectableUnits, unitId]
  );

  const selectableLessons = useMemo(() => {
    if (selectedUnit) {
      const parentBook = availableBooks.find((b) => b.id === selectedUnit.bookId);
      const pool = parentBook ? parentBook.lessons : gradeLessons;
      return [...pool]
        .filter((l) => l.unitId === selectedUnit.id)
        .sort((a, b) => a.order - b.order);
    }
    if (selectedBook) {
      const unitOrder = new Map(selectedBook.units.map((u) => [u.id, u.order]));
      return [...selectedBook.lessons].sort((a, b) => {
        const uDiff = (unitOrder.get(a.unitId) ?? 0) - (unitOrder.get(b.unitId) ?? 0);
        return uDiff !== 0 ? uDiff : a.order - b.order;
      });
    }
    return [...gradeLessons].sort((a, b) => a.order - b.order);
  }, [selectedUnit, selectedBook, availableBooks, gradeLessons]);

  useEffect(() => {
    if (unitId && !selectableUnits.some((u) => u.id === unitId)) {
      setUnitId('');
    }
  }, [selectableUnits, unitId]);

  useEffect(() => {
    if (lessonId && !selectableLessons.some((l) => l.id === lessonId)) {
      setLessonId('');
    }
  }, [selectableLessons, lessonId]);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Persist current conversation into savedChats automatically whenever messages change
  useEffect(() => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find((m) => m.role === 'user');
    const title = firstUserMsg
      ? firstUserMsg.content.replace(/\$+/g, '').slice(0, 48).trim() || 'محادثة رياضيات'
      : 'محادثة رياضيات';

    setSavedChats((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === currentChatId);
      const updatedEntry: SavedTutorChat = {
        id: currentChatId,
        title,
        gradeId: selectedGradeId,
        bookId: bookId || undefined,
        lessonId: lessonId || undefined,
        explainStyle,
        language,
        messages,
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = updatedEntry;
        return next;
      }
      return [updatedEntry, ...prev];
    });
  }, [messages, currentChatId, selectedGradeId, bookId, lessonId, explainStyle, language]);

  const activeGrade = grades.find((g) => g.id === selectedGradeId);
  const activeLesson = selectableLessons.find((l) => l.id === lessonId) ?? null;

  // --- Rich Editor Selection & Equation Helpers ---
  function saveEditorCursor() {
    const editor = editorRef.current;
    const sel = window.getSelection();
    if (!editor || !sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (editor.contains(range.startContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }

  function syncEditorState() {
    const editor = editorRef.current;
    if (!editor) return;
    const plain = editorHtmlToPlainLatexText(editor.innerHTML);
    setHasEditorText(plain.length > 0);

    if (plain.startsWith('/') && !plain.includes(' ') && !plain.includes('\n')) {
      setSlashQuery(plain);
    } else {
      setSlashQuery(null);
    }
  }

  function setEditorPromptText(plainText: string, focus = true) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = plainLatexTextToEditorHtml(plainText);
    syncEditorState();
    if (focus) {
      editor.focus();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      savedRangeRef.current = range;
    }
  }

  function insertLatexChipIntoEditor(latex: string) {
    const editor = editorRef.current;
    if (!editor) return;

    if (editingChipRef.current && editor.contains(editingChipRef.current)) {
      const target = editingChipRef.current;
      target.setAttribute('data-latex', latex.trim());
      try {
        target.innerHTML = katex.renderToString(latex.trim(), {
          throwOnError: false,
          strict: false,
        });
      } catch {
        target.textContent = latex.trim();
      }
      editingChipRef.current = null;
      syncEditorState();
      editor.focus();
      return;
    }

    const temp = document.createElement('span');
    temp.innerHTML = buildMathChipHtml(latex);
    const chipNode = temp.firstElementChild as HTMLElement;
    const zwsBefore = document.createTextNode('\u200B');
    const zwsAfter = document.createTextNode('\u200B ');

    const range = savedRangeRef.current;
    if (range && editor.contains(range.startContainer)) {
      range.deleteContents();
      range.insertNode(zwsAfter);
      range.insertNode(chipNode);
      range.insertNode(zwsBefore);
      const nextRange = document.createRange();
      nextRange.setStartAfter(zwsAfter);
      nextRange.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(nextRange);
      savedRangeRef.current = nextRange;
    } else {
      editor.appendChild(zwsBefore);
      editor.appendChild(chipNode);
      editor.appendChild(zwsAfter);
      editor.focus();
    }

    syncEditorState();
  }

  function openNewLiveMath() {
    saveEditorCursor();
    editingChipRef.current = null;
    setLiveMathInitialLatex('');
    setLiveMathOpen(true);
  }

  function handleEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const chip = target.closest('.math-expression') as HTMLElement | null;
    if (chip && editorRef.current?.contains(chip)) {
      editingChipRef.current = chip;
      setLiveMathInitialLatex(chip.getAttribute('data-latex') || '');
      setLiveMathOpen(true);
      return;
    }
    saveEditorCursor();
  }

  function handleEditorPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    // Support pasting image directly from clipboard
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find((item) => item.type.startsWith('image/'));
    if (imgItem) {
      const file = imgItem.getAsFile();
      if (file) {
        e.preventDefault();
        attachChosenFile(file);
        return;
      }
    }

    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const htmlFragment = plainLatexTextToEditorHtml(text);
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const div = document.createElement('div');
      div.innerHTML = htmlFragment;
      const frag = document.createDocumentFragment();
      let lastNode: Node | null = null;
      while (div.firstChild) {
        lastNode = frag.appendChild(div.firstChild);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += htmlFragment;
    }
    syncEditorState();
  }

  function handleEditorCopy(e: React.ClipboardEvent<HTMLDivElement>) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const container = document.createElement('div');
    container.appendChild(sel.getRangeAt(0).cloneContents());
    const chips = container.querySelectorAll('.math-expression');
    if (chips.length === 0) return;

    e.preventDefault();
    chips.forEach((chip) => {
      const latex = chip.getAttribute('data-latex') || '';
      chip.replaceWith(document.createTextNode(`$${latex}$`));
    });
    e.clipboardData.setData('text/plain', container.textContent || '');
  }

  function attachChosenFile(chosen: File, customPreviewUrl?: string) {
    if (chosen.size > 100 * 1024 * 1024) {
      setError('حجم الملف المرفق يتجاوز الحد الأقصى المسموح به (100 ميغابايت).');
      return;
    }
    setError(null);
    setAttachment(chosen);
    if (chosen.type.startsWith('image/')) {
      setAttachmentPreviewUrl(customPreviewUrl || URL.createObjectURL(chosen));
    } else {
      setAttachmentPreviewUrl(null);
    }
    setToolsPopoverOpen(false);
    showToast(`تم إرفاق: ${chosen.name}`);
  }

  function clearAttachment() {
    setAttachment(null);
    setAttachmentPreviewUrl(null);
  }

  // --- Send Message to Pure AI Tutor (SSE Streaming) ---
  async function sendTutorMessage(override?: {
    text?: string;
    mode?: TutorMode;
    file?: File | null;
    skipEditorClear?: boolean;
  }) {
    if (sending) return;
    const editor = editorRef.current;
    const rawText =
      override?.text !== undefined
        ? override.text
        : editor
          ? editorHtmlToPlainLatexText(editor.innerHTML)
          : '';
    const activeMode = override?.mode ?? mode;
    const fileToSend = override?.file !== undefined ? override.file : attachment;

    if (!rawText.trim() && !fileToSend) return;

    // Handle inline slash commands typed directly before sending
    const matchedSlash = SLASH_COMMANDS.find((c) => rawText.trim() === c.cmd);
    if (matchedSlash && !fileToSend) {
      applySlashCommand(matchedSlash);
      return;
    }

    setError(null);
    setSlashQuery(null);

    const attachmentType: TutorMessage['attachmentType'] = fileToSend
      ? fileToSend.type.includes('pdf')
        ? 'pdf'
        : fileToSend.type.startsWith('image/')
          ? 'image'
          : 'text'
      : undefined;

    const nowMs = Date.now();
    const userMsg: TutorMessage = {
      id: `u-${nowMs}`,
      role: 'user',
      content:
        rawText.trim() ||
        (fileToSend ? `مرفق للتحليل والحل: ${fileToSend.name}` : ''),
      attachmentName: fileToSend?.name,
      attachmentType,
      attachmentPreviewUrl:
        attachmentType === 'image' && attachmentPreviewUrl && !override?.file
          ? attachmentPreviewUrl
          : undefined,
      createdAt: new Date(nowMs).toISOString(),
    };

    const botMsgId = `a-${nowMs + 1}`;
    const placeholderBotMsg: TutorMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      createdAt: new Date(nowMs + 1).toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    setMessages([...nextHistory, placeholderBotMsg]);
    if (!override?.skipEditorClear && editor) {
      editor.innerHTML = '';
      setHasEditorText(false);
    }
    if (!override?.file) {
      clearAttachment();
    }
    setSending(true);
    setStreamingMsgId(botMsgId);

    try {
      const res = await api.askTutorStream(
        {
          message: rawText.trim(),
          gradeId: selectedGradeId,
          lessonId: lessonId || undefined,
          bookId: bookId || undefined,
          mode: activeMode,
          explainStyle,
          language,
          stageScope,
          history: nextHistory.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          file: fileToSend,
        },
        (delta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: m.content + delta } : m
            )
          );
        }
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId ? { ...m, content: res.reply || m.content } : m
        )
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== botMsgId || m.content.trim().length > 0));
      setError((err as Error).message);
    } finally {
      setSending(false);
      setStreamingMsgId(null);
    }
  }

  function applySlashCommand(item: (typeof SLASH_COMMANDS)[number]) {
    if (item.action === 'mode' && item.mode) {
      setMode(item.mode);
      if (editorRef.current) {
        const plain = editorHtmlToPlainLatexText(editorRef.current.innerHTML);
        if (plain.startsWith('/')) {
          editorRef.current.innerHTML = '';
          setHasEditorText(false);
        }
        editorRef.current.focus();
      }
      setSlashQuery(null);
      showToast(`تم تفعيل: ${item.title}`);
      return;
    }
    if (item.action === 'explain_quick') {
      setExplainStyle('quick');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setHasEditorText(false);
      setSlashQuery(null);
      showToast('تم تفعيل أسلوب الشرح السريع');
      return;
    }
    if (item.action === 'explain_detailed') {
      setExplainStyle('detailed');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setHasEditorText(false);
      setSlashQuery(null);
      showToast('تم تفعيل أسلوب الشرح التفصيلي');
      return;
    }
    if (item.action === 'live_math') {
      if (editorRef.current) editorRef.current.innerHTML = '';
      setHasEditorText(false);
      setSlashQuery(null);
      openNewLiveMath();
      return;
    }
    if (item.action === 'clear') {
      startNewChat();
    }
  }

  function startNewChat() {
    setMessages([]);
    setCurrentChatId(`chat-${Date.now()}`);
    setError(null);
    setSlashQuery(null);
    clearAttachment();
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setHasEditorText(false);
    }
    showToast('بدأت محادثة جديدة');
  }

  function loadSavedChat(chat: SavedTutorChat) {
    setCurrentChatId(chat.id);
    setMessages(chat.messages);
    setExplainStyle(chat.explainStyle);
    setLanguage(chat.language);
    if (chat.gradeId <= maxAllowedGrade) {
      onSelectGrade(chat.gradeId);
    }
    setBookId(chat.bookId || '');
    setLessonId(chat.lessonId || '');
    setError(null);
    setDrawerOpen(false);
  }

  function deleteSavedChat(chatId: string) {
    setSavedChats((prev) => prev.filter((c) => c.id !== chatId));
    if (chatId === currentChatId) {
      startNewChat();
    }
  }

  // --- Message Actions (Copy, Favorite, Deep Explain, Graph, Rating) ---
  async function handleCopyAnswer(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      showToast('تم نسخ الإجابة مع معادلات LaTeX');
    } catch {
      showToast('تعذر النسخ التلقائي — يمكنك التحديد والنسخ يدوياً');
    }
  }

  function getQuestionForMessage(msgIdx: number): string {
    for (let j = msgIdx - 1; j >= 0; j--) {
      if (messages[j]?.role === 'user') {
        return messages[j].content;
      }
    }
    return 'مسألة رياضية';
  }

  function isMessageFavorited(answerContent: string): boolean {
    return favorites.some((f) => f.answer === answerContent && f.isFavorite);
  }

  function toggleFavorite(msg: TutorMessage, msgIdx: number) {
    const question = getQuestionForMessage(msgIdx);
    const exists = favorites.find((f) => f.answer === msg.content);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== exists.id));
      showToast('تمت الإزالة من المفضلة');
    } else {
      const item: SolvedFavoriteItem = {
        id: `fav-${Date.now()}`,
        question,
        answer: msg.content,
        gradeId: selectedGradeId,
        isFavorite: true,
        createdAt: new Date().toISOString(),
      };
      setFavorites((prev) => [item, ...prev]);
      showToast('تم حفظ المسألة في المفضلة');
    }
  }

  function handleDeepExplain(msg: TutorMessage, msgIdx: number) {
    const question = getQuestionForMessage(msgIdx);
    const snippet = msg.content.slice(0, 500);
    const deepPrompt = `اشرح هذه المسألة بأسلوب تعليمي أعمق خطوة بخطوة مع توضيح المفاهيم، المعنى الهندسي أو الجبري، الأخطاء الشائعة التي يقع فيها الطلاب، وطريقة التحقق:\n\nالمسألة: ${question}\n\n(مرجع الحل السابق: ${snippet})`;
    void sendTutorMessage({
      text: deepPrompt,
      mode: 'deep_explain',
      file: null,
      skipEditorClear: true,
    });
  }

  function handleGraphFromMessage(msg: TutorMessage, msgIdx: number) {
    const question = getQuestionForMessage(msgIdx);
    const graphPrompt = `اعتماداً على المسألة التالية: (${question})، قدّم جدول قيم مساعداً وارسم تمثيلاً بيانياً تفاعلياً بصيغة Chart.js يوضح الدالة أو النقاط المحورية في المسألة.`;
    void sendTutorMessage({
      text: graphPrompt,
      mode: 'graph',
      file: null,
      skipEditorClear: true,
    });
  }

  function handleRateMessage(msgId: string, rating: 'up' | 'down') {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rating } : m))
    );
    showToast(rating === 'up' ? 'شكراً لتقييمك الإيجابي' : 'تم تسجيل ملاحظتك لتحسين الشرح');
  }

  function handleEquationClick(latex: string) {
    const editor = editorRef.current;
    if (editor) {
      saveEditorCursor();
      editingChipRef.current = null;
      insertLatexChipIntoEditor(latex);
    }
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(`$${latex}$`).catch(() => undefined);
    }
    showToast('تم إدراج المعادلة في المحرر ونسخها');
  }

  // --- Export Chat (Word .doc & Print/PDF) ---
  function exportChatToWord() {
    if (messages.length === 0) {
      showToast('لا توجد رسائل لتصديرها بعد');
      return;
    }
    const bodyHtml = messages
      .map((m) => {
        const who = m.role === 'user' ? 'الطالب' : 'المستشار الرياضي الذكي';
        const safeContent = m.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br>');
        return `<div style="margin-bottom:16px;padding:12px;border:1px solid #cbd5e1;border-radius:8px;">
          <div style="font-weight:bold;color:#1d4ed8;margin-bottom:6px;">${who}</div>
          <div>${safeContent}</div>
        </div>`;
      })
      .join('');

    const htmlDoc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" dir="rtl" lang="ar">
      <head><meta charset="utf-8"><title>محادثة المستشار الرياضي</title></head>
      <body style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
        <h2 style="color:#1e3a8a;">المستشار الرياضي للمنهاج السوري — ${activeGrade?.name ?? ''}</h2>
        <p style="color:#64748b;font-size:12px;">تاريخ التصدير: ${new Date().toLocaleDateString('ar-SY')}</p>
        <hr/>
        ${bodyHtml}
      </body>
    </html>`;

    const blob = new Blob(['\ufeff', htmlDoc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `syrian-math-chat-${new Date().toISOString().slice(0, 10)}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل ملف Word بنجاح');
  }

  function printChatPdf() {
    if (messages.length === 0) {
      showToast('لا توجد رسائل للطباعة أو الحفظ كـ PDF');
      return;
    }
    window.print();
  }

  const filteredSlashCommands = useMemo(() => {
    if (slashQuery === null) return [];
    const q = slashQuery.toLowerCase();
    return SLASH_COMMANDS.filter(
      (c) => c.cmd.includes(q) || c.title.includes(q)
    );
  }, [slashQuery]);

  const filteredFavorites = useMemo(() => {
    const q = favoriteSearch.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [favorites, favoriteSearch]);

  const activeModeObj = TUTOR_MODES.find((m) => m.id === mode) ?? TUTOR_MODES[0];

  return (
    <div className="relative flex h-[calc(100dvh-6.25rem)] min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white sm:h-[calc(100vh-7.75rem)] dark:border-slate-800 dark:bg-slate-900">
      {/* Toast Feedback */}
      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg dark:border-slate-600 dark:bg-slate-800"
        >
          {toast}
        </div>
      )}

      {/* Collapsible Saved Chats & Favorites Side Drawer */}
      {drawerOpen && (
        <aside className="flex w-72 shrink-0 flex-col border-l border-slate-200 bg-slate-50/90 sm:w-80 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              أرشيف المحادثات والمفضلة
            </h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="إغلاق الأرشيف"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3">
            <button
              type="button"
              onClick={startNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>بدء محادثة جديدة</span>
            </button>

            {/* Drawer Segmented Switch */}
            <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setDrawerTab('chats')}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  drawerTab === 'chats'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                المحادثات ({savedChats.length})
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('favorites')}
                className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  drawerTab === 'favorites'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                المفضلة ({favorites.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {drawerTab === 'chats' ? (
              savedChats.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  ستُحفظ محادثاتك تلقائياً هنا لتتمكن من الرجوع إليها في أي وقت.
                </div>
              ) : (
                <div className="space-y-2">
                  {savedChats.map((c) => {
                    const isActive = c.id === currentChatId;
                    const gName =
                      grades.find((g) => g.id === c.gradeId)?.shortName || `صف ${c.gradeId}`;
                    return (
                      <div
                        key={c.id}
                        className={`group flex items-start justify-between gap-2 rounded-xl border p-2.5 transition-colors ${
                          isActive
                            ? 'border-blue-300 bg-blue-50/70 dark:border-blue-800 dark:bg-blue-950/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => loadSavedChat(c)}
                          className="min-w-0 flex-1 text-right"
                        >
                          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                            {c.title}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            {gName} · {c.messages.length} رسالة
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSavedChat(c.id)}
                          aria-label="حذف المحادثة"
                          className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={favoriteSearch}
                    onChange={(e) => setFavoriteSearch(e.target.value)}
                    placeholder="ابحث في المفضلة..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-8 pl-3 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
                {filteredFavorites.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    لا توجد مسائل محفوظة في المفضلة بعد. اضغط على ⭐ أسفل أي حل لحفظه.
                  </div>
                ) : (
                  filteredFavorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-xs font-semibold text-slate-900 dark:text-white">
                          {fav.question}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setFavorites((prev) => prev.filter((x) => x.id !== fav.id))
                          }
                          aria-label="حذف من المفضلة"
                          className="shrink-0 text-amber-500 hover:text-rose-600"
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditorPromptText(fav.question, true);
                          setDrawerOpen(false);
                        }}
                        className="mt-2 text-[11px] font-semibold text-blue-700 hover:underline dark:text-sky-400"
                      >
                        إدراج السؤال في المحرر ←
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <button
              type="button"
              onClick={printChatPdf}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>طباعة / PDF</span>
            </button>
            <button
              type="button"
              onClick={exportChatToWord}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>تصدير Word</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Chat Workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Studio Header */}
        <div className="border-b border-slate-200 px-3.5 py-3 sm:px-5 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDrawerOpen((o) => !o)}
                title="سجل المحادثات والمفضلة"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {drawerOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </button>
              <img
                src="/src/assets/images/tutor_avatar_emblem_1795101194119.jpg"
                alt="شعار المستشار الرياضي الذكي"
                referrerPolicy="no-referrer"
                className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
              />
              <div className="min-w-0">
                <h1 className="truncate font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  المستشار الرياضي الذكي
                </h1>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {activeGrade?.name}
                  {selectedBook ? ` · ${selectedBook.title}` : ''}
                  {activeLesson ? ` · ${activeLesson.title}` : ''}
                </p>
              </div>
            </div>

            {/* Mathai01 Command Controls: Explanation Style, Stage Scope, Language, Context Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Explain Mode Segmented Toggle */}
              <div
                className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800"
                role="group"
                aria-label="أسلوب الشرح"
              >
                <button
                  type="button"
                  onClick={() => setExplainStyle('detailed')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    explainStyle === 'detailed'
                      ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  تفصيلي
                </button>
                <button
                  type="button"
                  onClick={() => setExplainStyle('quick')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    explainStyle === 'quick'
                      ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  سريع
                </button>
              </div>

              {/* Stage Scope Toggle */}
              <select
                value={stageScope}
                onChange={(e) =>
                  setStageScope(e.target.value === 'general' ? 'general' : 'curriculum')
                }
                aria-label="نطاق السياق"
                className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="curriculum">منهاج الصف</option>
                <option value="general">أسلوب عام</option>
              </select>

              {/* Language Switcher */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as TutorLanguage)}
                aria-label="لغة الرد"
                className="h-8 rounded-xl border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
              </select>

              {/* Expand Syrian Curriculum Context */}
              <button
                type="button"
                onClick={() => setShowContextBar((v) => !v)}
                className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-700 transition-colors hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <BookOpen className="h-3.5 w-3.5 text-blue-700 dark:text-sky-400" />
                <span className="hidden sm:inline">تحديد الكتاب/الدرس</span>
                {showContextBar ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewChat}
                  title="محادثة جديدة"
                  className="inline-flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">جديد</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Grade / Book / Unit / Lesson Picker */}
          {showContextBar && (
            <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:grid-cols-2 xl:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                <GraduationCap className="h-4 w-4 shrink-0 text-blue-700 dark:text-sky-400" />
                <select
                  value={selectedGradeId}
                  onChange={(e) => {
                    onSelectGrade(Number(e.target.value));
                    setBookId('');
                    setUnitId('');
                    setLessonId('');
                  }}
                  aria-label="الصف الدراسي"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none dark:text-slate-100"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id} disabled={g.id > maxAllowedGrade}>
                      {g.name}
                      {g.id > maxAllowedGrade ? ' (مقفل)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                <BookOpen className="h-4 w-4 shrink-0 text-teal-700 dark:text-teal-400" />
                <select
                  value={bookId}
                  onChange={(e) => {
                    setBookId(e.target.value);
                    setUnitId('');
                    setLessonId('');
                  }}
                  aria-label="الكتاب المرجعي"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none dark:text-slate-100"
                >
                  <option value="">كل كتب الصف المسموحة</option>
                  {availableBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.part})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                <Layers className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <select
                  value={unitId}
                  onChange={(e) => {
                    setUnitId(e.target.value);
                    setLessonId('');
                  }}
                  aria-label="الوحدة الدراسية"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none dark:text-slate-100"
                >
                  <option value="">جميع الوحدات</option>
                  {selectableUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.chapterLabel}: {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
                <ListChecks className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <select
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  aria-label="الدرس المحدد"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium text-slate-800 outline-none dark:text-slate-100"
                >
                  <option value="">جميع الدروس</option>
                  {selectableLessons.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} (ص {l.pageStart}-{l.pageEnd})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Mode Tabs Bar */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {TUTOR_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  mode === m.id
                    ? 'bg-blue-700 text-white dark:bg-blue-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span>{m.label}</span>
                <span
                  dir="ltr"
                  className={`font-mono text-[10px] ${
                    mode === m.id ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {m.slash}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-6 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-sky-400">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                اسأل المستشار الرياضي الذكي
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                محادثة ذكاء اصطناعي مباشرة مدعومة بـ <strong className="font-semibold">Live Math</strong> والرسوم البيانية التفاعلية والتصوير والرسم اليدوي، ملتزمة بمنهاج{' '}
                <span className="font-semibold text-blue-700 dark:text-sky-400">
                  {activeGrade?.name}
                </span>
                .
              </p>

              {/* Starter Interactive Command Cards */}
              <div className="mt-6 grid w-full gap-3 text-right sm:grid-cols-2">
                {STARTER_PROMPTS.map((sp) => (
                  <button
                    key={sp.title}
                    type="button"
                    onClick={() => {
                      setMode(sp.mode);
                      setEditorPromptText(sp.prompt, true);
                    }}
                    className="group rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-right transition-colors hover:border-blue-400 hover:bg-white dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-sky-500 dark:hover:bg-slate-800"
                  >
                    <p className="font-display text-sm font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-sky-400">
                      {sp.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {sp.subtitle}
                    </p>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>اكتب <code dir="ltr" className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">/</code> للأوامر السريعة</span>
                <span aria-hidden="true">·</span>
                <span>اضغط <strong className="text-slate-700 dark:text-slate-200">f(x)</strong> لكتابة المعادلات بـ Live Math</span>
                <span aria-hidden="true">·</span>
                <span>انقر على أي معادلة في الحل لإدراجها في المحرر</span>
              </div>
            </div>
          ) : (
            messages.map((msg, msgIdx) => {
              const isUser = msg.role === 'user';
              const isCurrentlyStreaming = !isUser && streamingMsgId === msg.id;
              if (isCurrentlyStreaming && !msg.content.trim()) {
                return null;
              }
              const favActive = !isUser && isMessageFavorited(msg.content);
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[94%] rounded-2xl px-4 py-3.5 sm:max-w-[85%] sm:px-5 sm:py-4 lg:max-w-3xl ${
                      isUser
                        ? 'bg-blue-700 text-white dark:bg-blue-600'
                        : 'border border-slate-200 bg-slate-50/80 text-slate-900 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-100'
                    }`}
                  >
                    {msg.attachmentPreviewUrl && (
                      <img
                        src={msg.attachmentPreviewUrl}
                        alt={msg.attachmentName || 'صورة مرفقة'}
                        className="mb-2.5 max-h-56 rounded-xl border border-white/20 object-contain"
                      />
                    )}
                    {msg.attachmentName && !msg.attachmentPreviewUrl && (
                      <div className="mb-2 flex items-center gap-2 rounded-lg bg-black/15 px-3 py-1.5 text-xs">
                        {msg.attachmentType === 'pdf' ? (
                          <FileText className="h-4 w-4 shrink-0" />
                        ) : (
                          <ImageIcon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="truncate">{msg.attachmentName}</span>
                      </div>
                    )}

                    {isUser ? (
                      <MathText
                        text={msg.content}
                        className="text-white [&_strong]:text-white [&_.katex]:text-white"
                      />
                    ) : (
                      <>
                        <MathText
                          text={msg.content}
                          onEquationClick={isCurrentlyStreaming ? undefined : handleEquationClick}
                        />
                        {!isCurrentlyStreaming && (
                          /* Clean Action Bar on Assistant Messages */
                          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-slate-200/80 pt-2.5 dark:border-slate-700/80">
                            <button
                              type="button"
                              onClick={() => void handleCopyAnswer(msg.content)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>نسخ</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFavorite(msg, msgIdx)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                                favActive
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700'
                              }`}
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${favActive ? 'fill-current' : ''}`}
                              />
                              <span>{favActive ? 'في المفضلة' : 'مفضلة'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={sending}
                              onClick={() => handleDeepExplain(msg, msgIdx)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-100/70 disabled:opacity-50 dark:text-sky-400 dark:hover:bg-blue-950/50"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>شرح معمق</span>
                            </button>
                            <button
                              type="button"
                              disabled={sending}
                              onClick={() => handleGraphFromMessage(msg, msgIdx)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-teal-700 transition-colors hover:bg-teal-100/70 disabled:opacity-50 dark:text-teal-400 dark:hover:bg-teal-950/50"
                            >
                              <LineChart className="h-3.5 w-3.5" />
                              <span>ارسم بيانياً</span>
                            </button>
                            <div className="mr-auto flex items-center gap-1">
                              <button
                                type="button"
                                aria-label="إجابة مفيدة"
                                onClick={() => handleRateMessage(msg.id, 'up')}
                                className={`rounded-lg p-1 transition-colors ${
                                  msg.rating === 'up'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                    : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700'
                                }`}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="تحتاج تحسيناً"
                                onClick={() => handleRateMessage(msg.id, 'down')}
                                className={`rounded-lg p-1 transition-colors ${
                                  msg.rating === 'down'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                    : 'text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-700'
                                }`}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {sending && !messages.some((m) => m.id === streamingMsgId && m.content.trim().length > 0) && (
            <div className="flex justify-end">
              <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-600 dark:bg-sky-400" />
                <span>جارٍ التحليل وصياغة الحل الرياضي خطوة بخطوة...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="إغلاق التنبيه"
                className="rounded-lg p-1 hover:bg-rose-100 dark:hover:bg-rose-900/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div ref={endOfChatRef} />
        </div>

        {/* Bottom Rich Composer Dock */}
        <div className="relative border-t border-slate-200 bg-white p-3.5 sm:px-5 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
          {/* Slash Command Palette */}
          {slashQuery !== null && filteredSlashCommands.length > 0 && (
            <div className="absolute right-4 bottom-full left-4 z-30 mb-2 max-w-md rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <p className="px-2.5 py-1 text-[11px] font-semibold text-slate-400">
                أوامر المستشار السريعة
              </p>
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {filteredSlashCommands.map((item) => (
                  <button
                    key={item.cmd}
                    type="button"
                    onClick={() => applySlashCommand(item)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-right transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                    <span
                      dir="ltr"
                      className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-sky-300"
                    >
                      {item.cmd}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Creative Tools Popover (+ Button) */}
          {toolsPopoverOpen && (
            <div className="absolute right-4 bottom-full z-30 mb-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  أدوات الإدخال الذكية
                </span>
                <button
                  type="button"
                  onClick={() => setToolsPopoverOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setToolsPopoverOpen(false);
                    setCameraOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition-colors hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <Camera className="h-5 w-5 text-blue-600 dark:text-sky-400" />
                  <span>كاميرا</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToolsPopoverOpen(false);
                    setDrawingOpen(true);
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <PenTool className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <span>لوح رسم</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToolsPopoverOpen(false);
                    imageInputRef.current?.click();
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition-colors hover:border-teal-400 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <ImageIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  <span>رفع صورة</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToolsPopoverOpen(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition-colors hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <Paperclip className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span>ملف PDF / TXT</span>
                </button>
              </div>
            </div>
          )}

          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-2.5 flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-sky-200">
              <div className="flex min-w-0 items-center gap-2.5">
                {attachmentPreviewUrl ? (
                  <img
                    src={attachmentPreviewUrl}
                    alt="معاينة المرفق"
                    className="h-10 w-10 shrink-0 rounded-lg border border-blue-200 object-cover dark:border-blue-700"
                  />
                ) : attachment.type.includes('pdf') ? (
                  <FileText className="h-4 w-4 shrink-0" />
                ) : (
                  <Paperclip className="h-4 w-4 shrink-0" />
                )}
                <span className="truncate font-medium">
                  {attachment.name} ({(attachment.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={clearAttachment}
                aria-label="إزالة المرفق"
                className="rounded-lg p-1 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const chosen = e.target.files?.[0];
              if (chosen) attachChosenFile(chosen);
              e.target.value = '';
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.txt,text/plain,image/*"
            className="hidden"
            onChange={(e) => {
              const chosen = e.target.files?.[0];
              if (chosen) attachChosenFile(chosen);
              e.target.value = '';
            }}
          />

          {/* Composer Row */}
          <div className="flex items-end gap-2">
            {/* + Creative Tools Button */}
            <button
              type="button"
              onClick={() => setToolsPopoverOpen((v) => !v)}
              title="أدوات الإدخال (كاميرا، رسم، صورة، ملف)"
              aria-label="أدوات الإدخال"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                toolsPopoverOpen
                  ? 'border-blue-600 bg-blue-700 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <Plus
                className={`h-5 w-5 transition-transform ${
                  toolsPopoverOpen ? 'rotate-45' : ''
                }`}
              />
            </button>

            {/* Rich Math Editor Box with Live Math f(x) Trigger */}
            <div className="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 focus-within:border-blue-600 focus-within:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus-within:bg-slate-900">
              <button
                type="button"
                onClick={openNewLiveMath}
                title="إدراج معادلة رياضية (Live Math)"
                className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 font-mono text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-sky-300"
              >
                <Sigma className="h-3.5 w-3.5" />
                <span dir="ltr">f(x)</span>
              </button>

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncEditorState}
                onKeyUp={saveEditorCursor}
                onMouseUp={saveEditorCursor}
                onClick={handleEditorClick}
                onPaste={handleEditorPaste}
                onCopy={handleEditorCopy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendTutorMessage();
                  }
                }}
                data-placeholder={activeModeObj.hint}
                className="math-rich-editor max-h-36 min-h-[30px] flex-1 overflow-y-auto px-1 py-1 text-sm leading-6 text-slate-900 outline-none dark:text-white"
              />
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => void sendTutorMessage()}
              disabled={sending || (!hasEditorText && !attachment)}
              className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-4 sm:px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              {sending ? (
                <Check className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      <Suspense fallback={null}>
        {liveMathOpen && (
          <LiveMathModal
            open={liveMathOpen}
            initialLatex={liveMathInitialLatex}
            isEditing={Boolean(editingChipRef.current)}
            onClose={() => {
              setLiveMathOpen(false);
              editingChipRef.current = null;
            }}
            onConfirm={(latex) => {
              setLiveMathOpen(false);
              insertLatexChipIntoEditor(latex);
            }}
          />
        )}

        {drawingOpen && (
          <DrawingCanvasModal
            open={drawingOpen}
            onClose={() => setDrawingOpen(false)}
            onConfirm={(file, previewUrl) => {
              setDrawingOpen(false);
              attachChosenFile(file, previewUrl);
            }}
          />
        )}

        {cameraOpen && (
          <CameraCaptureModal
            open={cameraOpen}
            onClose={() => setCameraOpen(false)}
            onConfirm={(file, previewUrl) => {
              setCameraOpen(false);
              attachChosenFile(file, previewUrl);
            }}
          />
        )}
      </Suspense>
    </div>
  );
}
