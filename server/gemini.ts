import fs from 'node:fs';
import path from 'node:path';
import {
  createPartFromUri,
  FileState,
  GoogleGenAI,
  Part,
  ThinkingLevel,
  Type,
} from '@google/genai';
import {
  CurriculumBook,
  Lesson,
  TutorExplainStyle,
  TutorLanguage,
  TutorMode,
} from '../src/types';
import { UPLOADS_DIR } from './db';
import { SYRIAN_GRADES } from './seedData';

const INLINE_LIMIT_BYTES = 15 * 1024 * 1024; // Use Gemini Files API above 15MB
const FILE_CACHE_PATH = path.resolve(process.cwd(), 'data', 'gemini-file-cache.json');

type CachedGeminiFile = { uri: string; mimeType: string; expiresAt: number };

function loadPersistentFileCache(): Map<string, CachedGeminiFile> {
  const map = new Map<string, CachedGeminiFile>();
  try {
    if (fs.existsSync(FILE_CACHE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(FILE_CACHE_PATH, 'utf8')) as Record<
        string,
        CachedGeminiFile
      >;
      const now = Date.now();
      for (const [k, v] of Object.entries(parsed)) {
        if (v && v.uri && v.expiresAt > now) {
          map.set(k, v);
        }
      }
    }
  } catch {
    // Ignore cache read error
  }
  return map;
}

function savePersistentFileCache(map: Map<string, CachedGeminiFile>) {
  try {
    const dir = path.dirname(FILE_CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const obj: Record<string, CachedGeminiFile> = {};
    const now = Date.now();
    for (const [k, v] of map.entries()) {
      if (v.expiresAt > now) obj[k] = v;
    }
    fs.writeFileSync(FILE_CACHE_PATH, JSON.stringify(obj, null, 2), 'utf8');
  } catch {
    // Ignore cache write error
  }
}

const uploadedFileCache = loadPersistentFileCache();

function formatGeminiError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  try {
    const parsed = JSON.parse(raw) as {
      error?: { code?: number; message?: string; status?: string };
    };
    const code = parsed?.error?.code;
    const status = parsed?.error?.status;
    if (code === 503 || status === 'UNAVAILABLE') {
      return 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً حالياً (503). يرجى المحاولة مرة أخرى بعد لحظات.';
    }
    if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
      return 'تم تجاوز حد الطلبات المؤقت لخدمة الذكاء الاصطناعي. انتظر دقيقة ثم أعد المحاولة.';
    }
    if (code === 401 || code === 403) {
      return 'تعذر التحقق من صلاحية مفتاح الذكاء الاصطناعي (GEMINI_API_KEY).';
    }
    if (parsed?.error?.message) {
      return `تعذر الحصول على رد من الذكاء الاصطناعي: ${parsed.error.message}`;
    }
  } catch {
    // Non-JSON error message
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً حالياً. يرجى المحاولة مرة أخرى بعد ثوانٍ.';
  }
  return raw || 'حدث خطأ أثناء التواصل مع مدرس الرياضيات الذكي.';
}

function isTransientApiError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('UNAVAILABLE') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('high demand') ||
    msg.includes('overloaded') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT')
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`ETIMEDOUT: ${label} exceeded ${ms}ms`));
    }, ms);
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: {
    parts: Part[];
    conversation?: Array<{ role: 'user' | 'model'; parts: Part[] }>;
    systemInstruction?: string;
    thinkingLevel?: ThinkingLevel;
    responseMimeType?: string;
    responseSchema?: unknown;
    hasMedia?: boolean;
  }
) {
  const attempts: Array<{
    model: string;
    delayMs: number;
    useThinking: boolean;
    timeoutMs: number;
  }> = [
    {
      model: 'gemini-4-hydrogen',
      delayMs: 0,
      useThinking: true,
      timeoutMs: params.hasMedia ? 60000 : 30000,
    },
    {
      model: 'gemini-3.1-flash-lite',
      delayMs: 200,
      useThinking: false,
      timeoutMs: params.hasMedia ? 45000 : 20000,
    },
  ];

  let lastErr: unknown;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await new Promise((r) => setTimeout(r, attempt.delayMs));
    }
    try {
      const config: Record<string, unknown> = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (attempt.useThinking && params.thinkingLevel) {
        config.thinkingConfig = { thinkingLevel: params.thinkingLevel };
      }
      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }
      if (params.responseSchema) {
        config.responseSchema = params.responseSchema;
      }
      const contentsPayload =
        params.conversation && params.conversation.length > 0
          ? params.conversation
          : { parts: params.parts };
      return await withTimeout(
        ai.models.generateContent({
          model: attempt.model,
          contents: contentsPayload,
          config,
        }),
        attempt.timeoutMs,
        attempt.model
      );
    } catch (err) {
      lastErr = err;
      if (!isTransientApiError(err)) {
        throw err;
      }
    }
  }
  throw lastErr;
}

async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  params: {
    parts: Part[];
    conversation?: Array<{ role: 'user' | 'model'; parts: Part[] }>;
    systemInstruction?: string;
    thinkingLevel?: ThinkingLevel;
    hasMedia?: boolean;
  },
  onDelta: (chunkText: string) => void
): Promise<string> {
  const attempts: Array<{
    model: string;
    delayMs: number;
    useThinking: boolean;
  }> = [
    {
      model: 'gemini-4-hydrogen',
      delayMs: 0,
      useThinking: true,
    },
    {
      model: 'gemini-3.1-flash-lite',
      delayMs: 150,
      useThinking: false,
    },
  ];

  let lastErr: unknown;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await new Promise((r) => setTimeout(r, attempt.delayMs));
    }
    let fullText = '';
    try {
      const config: Record<string, unknown> = {};
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (attempt.useThinking && params.thinkingLevel) {
        config.thinkingConfig = { thinkingLevel: params.thinkingLevel };
      }
      const contentsPayload =
        params.conversation && params.conversation.length > 0
          ? params.conversation
          : { parts: params.parts };

      const stream = await ai.models.generateContentStream({
        model: attempt.model,
        contents: contentsPayload,
        config,
      });

      for await (const chunk of stream) {
        const delta = chunk.text ?? '';
        if (delta) {
          fullText += delta;
          onDelta(delta);
        }
      }
      if (!fullText.trim()) {
        throw new Error('لم يرد نموذج الذكاء الاصطناعي بإجابة نصية.');
      }
      return fullText;
    } catch (err) {
      lastErr = err;
      // Only retry with fallback model if nothing has been streamed to client yet
      if (fullText.length > 0 || !isTransientApiError(err)) {
        throw err;
      }
    }
  }
  throw lastErr;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'مفتاح GEMINI_API_KEY غير مهيأ. يرجى إضافته في إعدادات الأسرار (Settings > Secrets) لتفعيل الذكاء الاصطناعي.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getCachedLargeFilePart(
  filePath: string,
  mimeType: string
): Part | null {
  if (!fs.existsSync(filePath)) return null;
  const stat = fs.statSync(filePath);
  const cacheKey = `${filePath}:${stat.size}:${stat.mtimeMs}`;
  const cached = uploadedFileCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return createPartFromUri(cached.uri, cached.mimeType);
  }
  return null;
}

async function buildMediaPart(
  ai: GoogleGenAI,
  file: {
    mimeType: string;
    filePath?: string;
    base64?: string;
    size?: number;
  }
): Promise<Part> {
  const stat =
    file.filePath && fs.existsSync(file.filePath)
      ? fs.statSync(file.filePath)
      : null;
  const fileSize = file.size ?? stat?.size ?? 0;

  if (file.filePath && fileSize > INLINE_LIMIT_BYTES) {
    const cacheKey = `${file.filePath}:${fileSize}:${stat?.mtimeMs ?? 0}`;
    const cached = uploadedFileCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return createPartFromUri(cached.uri, cached.mimeType);
    }

    let uploaded = await ai.files.upload({
      file: file.filePath,
      config: { mimeType: file.mimeType },
    });
    let attempts = 0;
    while (
      uploaded.state === FileState.PROCESSING &&
      uploaded.name &&
      attempts < 20
    ) {
      await new Promise((r) => setTimeout(r, 1000));
      uploaded = await ai.files.get({ name: uploaded.name });
      attempts++;
    }
    if (uploaded.state === FileState.FAILED) {
      throw new Error('تعذرت معالجة الملف الكبير عبر خدمة الملفات.');
    }
    if (!uploaded.uri) {
      throw new Error('لم يرجع رابط الملف بعد الرفع.');
    }
    const resolvedMime = uploaded.mimeType || file.mimeType;
    uploadedFileCache.set(cacheKey, {
      uri: uploaded.uri,
      mimeType: resolvedMime,
      expiresAt: Date.now() + 36 * 60 * 60 * 1000,
    });
    savePersistentFileCache(uploadedFileCache);
    return createPartFromUri(uploaded.uri, resolvedMime);
  }

  const base64Data =
    file.base64 ??
    (file.filePath ? fs.readFileSync(file.filePath).toString('base64') : '');

  return {
    inlineData: {
      mimeType: file.mimeType,
      data: base64Data,
    },
  };
}

export interface TutorChatInput {
  message: string;
  gradeId: number;
  maxAllowedGradeId: number;
  lesson?: Lesson | null;
  referenceBook?: CurriculumBook | null;
  allowedBooks: CurriculumBook[];
  allowedLessons: Lesson[];
  mode: TutorMode;
  explainStyle?: TutorExplainStyle;
  language?: TutorLanguage;
  stageScope?: 'curriculum' | 'general';
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  file?: {
    mimeType: string;
    filePath?: string;
    base64?: string;
    size?: number;
    fileName: string;
  };
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase();
}

const ARABIC_STOPWORDS = new Set([
  'اشرح',
  'شرح',
  'لي',
  'ما',
  'هي',
  'هو',
  'في',
  'من',
  'على',
  'عن',
  'باختصار',
  'كيف',
  'حل',
  'احسب',
  'اوجد',
  'للصف',
  'الصف',
  'درس',
  'كتاب',
]);

function findBestMatchingLesson(input: TutorChatInput): Lesson | null {
  if (input.lesson) return input.lesson;

  const queryWords = normalizeArabic(input.message)
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !ARABIC_STOPWORDS.has(w));

  const eligible = input.allowedLessons.filter(
    (l) => l.gradeId <= input.maxAllowedGradeId
  );
  if (eligible.length === 0) return null;

  let best: Lesson | null = null;
  let bestScore = 0;

  for (const l of eligible) {
    let score = 0;
    if (input.referenceBook && l.bookId === input.referenceBook.id) score += 15;
    if (l.gradeId === input.gradeId) score += 10;

    const titleNorm = normalizeArabic(l.title);
    const bodyNorm = normalizeArabic(
      `${l.theory} ${l.objectives.join(' ')} ${l.formulas.map((f) => `${f.title} ${f.description}`).join(' ')}`
    );

    let keywordHits = 0;
    for (const w of queryWords) {
      if (titleNorm.includes(w)) {
        score += 45;
        keywordHits++;
      } else if (bodyNorm.includes(w)) {
        score += 20;
        keywordHits++;
      }
    }
    if (keywordHits > 0 && score > bestScore) {
      bestScore = score;
      best = l;
    }
  }

  return bestScore >= 35 ? best : null;
}

function buildCurriculumFallbackReply(input: TutorChatInput): string | null {
  const matched = findBestMatchingLesson(input);
  if (!matched) return null;

  const book = input.allowedBooks.find((b) => b.id === matched.bookId);
  const grade = SYRIAN_GRADES.find((g) => g.id === matched.gradeId);

  const lines: string[] = [];
  lines.push(
    `**المرجع المعتمد:** ${book ? book.title : grade?.name ?? `الصف ${matched.gradeId}`} · **${matched.title}** (ص ${matched.pageStart}–${matched.pageEnd})`
  );
  lines.push('');
  lines.push(`### الشرح الأساسي من الكتاب:`);
  lines.push(matched.theory);

  if (matched.formulas.length > 0) {
    lines.push('');
    lines.push(`### القوانين والمبرهنات الأساسية:`);
    for (const f of matched.formulas.slice(0, 3)) {
      lines.push(`- **${f.title}:** $$${f.expression}$$${f.description ? ` (${f.description})` : ''}`);
    }
  }

  if (input.mode === 'generate_practice' && matched.exercises.length > 0) {
    lines.push('');
    lines.push(`### تمارين تدريبية من الدرس:`);
    matched.exercises.slice(0, 3).forEach((ex, idx) => {
      lines.push(`${idx + 1}. **(${ex.difficulty})** ${ex.question}\n   - **تلميح:** ${ex.hint}\n   - **الحل:** ${ex.solution}`);
    });
  } else if (matched.examples.length > 0) {
    const ex = matched.examples[0];
    lines.push('');
    lines.push(`### مثال محلول (${ex.title}):`);
    lines.push(ex.problem);
    ex.steps.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });
    lines.push(`**النتيجة:** ${ex.answer}`);
  }

  lines.push('');
  lines.push(
    `*(ملاحظة: خدمة الذكاء الاصطناعي تشهد ضغطاً مؤقتاً حالياً، لذا تم استخراج الشرح والأمثلة من فهرس الكتاب المدرسي المعتمد مباشرة).*`
  );
  return lines.join('\n');
}

function extractRequestedPageNumber(message: string): number | null {
  const match = message.match(/(?:الصفحة|صفحة|صفحه|ص\.?|page|p\.?)\s*(?:رقم)?\s*(\d{1,3})/i);
  if (!match) return null;
  const num = Number(match[1]);
  return Number.isInteger(num) && num > 0 ? num : null;
}

function resolveBookPdfPath(book: CurriculumBook): string | null {
  if (!book.pdfFileName) return null;
  const candidate = book.pdfFileName.startsWith('public/')
    ? path.resolve(process.cwd(), book.pdfFileName)
    : path.join(UPLOADS_DIR, book.pdfFileName);
  return fs.existsSync(candidate) ? candidate : null;
}

function resolveAutoReferenceBook(
  input: TutorChatInput,
  requestedPage: number | null
): CurriculumBook | null {
  if (input.referenceBook) return input.referenceBook;

  const eligibleBooks = input.allowedBooks.filter(
    (b) => b.gradeId <= input.maxAllowedGradeId
  );
  if (input.lesson) {
    const byLesson = eligibleBooks.find((b) => b.id === input.lesson!.bookId);
    if (byLesson && resolveBookPdfPath(byLesson)) return byLesson;
  }

  const normMsg = normalizeArabic(input.message);
  const explicitGradeId = normMsg.includes('سابع')
    ? 7
    : normMsg.includes('ثامن')
      ? 8
      : normMsg.includes('تاسع')
        ? 9
        : null;
  const targetGradeId =
    explicitGradeId !== null && explicitGradeId <= input.maxAllowedGradeId
      ? explicitGradeId
      : input.gradeId;

  const gradeBooksWithPdf = eligibleBooks.filter(
    (b) => b.gradeId === targetGradeId && Boolean(resolveBookPdfPath(b))
  );
  if (gradeBooksWithPdf.length === 0) return null;
  if (gradeBooksWithPdf.length === 1) return gradeBooksWithPdf[0];

  if (normMsg.includes('هندس')) {
    const geo = gradeBooksWithPdf.find((b) => normalizeArabic(b.title).includes('هندس'));
    if (geo) return geo;
  }
  if (normMsg.includes('جبر')) {
    const alg = gradeBooksWithPdf.find((b) => normalizeArabic(b.title).includes('جبر'));
    if (alg) return alg;
  }
  if (normMsg.includes('تحليل')) {
    const an = gradeBooksWithPdf.find((b) => normalizeArabic(b.title).includes('تحليل'));
    if (an) return an;
  }

  if (requestedPage !== null) {
    const matchingLesson = input.allowedLessons.find(
      (l) =>
        l.gradeId === targetGradeId &&
        l.pageStart <= requestedPage &&
        l.pageEnd >= requestedPage &&
        gradeBooksWithPdf.some((b) => b.id === l.bookId)
    );
    if (matchingLesson) {
      return gradeBooksWithPdf.find((b) => b.id === matchingLesson.bookId) ?? gradeBooksWithPdf[0];
    }
  }

  return gradeBooksWithPdf[0];
}

function buildCurriculumGroundingText(
  input: TutorChatInput,
  requestedPage: number | null,
  resolvedBook: CurriculumBook | null
): string {
  const queryWords = normalizeArabic(input.message)
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !ARABIC_STOPWORDS.has(w));

  const scoreLesson = (l: Lesson): number => {
    let score = 0;
    if (l.id === input.lesson?.id) score += 1000;
    if (requestedPage !== null && l.pageStart <= requestedPage && l.pageEnd >= requestedPage) {
      score += 650;
    } else if (requestedPage !== null && Math.abs(l.pageStart - requestedPage) <= 4) {
      score += 180;
    }
    if (resolvedBook && l.bookId === resolvedBook.id) score += 200;
    if (l.gradeId === input.gradeId) score += 100;
    const hay = normalizeArabic(
      `${l.title} ${l.theory} ${l.formulas.map((f) => f.title).join(' ')}`
    );
    for (const w of queryWords) {
      if (hay.includes(w)) score += 35;
    }
    return score;
  };

  const eligible = input.allowedLessons.filter(
    (l) => l.gradeId <= input.maxAllowedGradeId
  );

  // Top 6 detailed lessons for fast prompt size
  const detailedLessons = [...eligible]
    .sort((a, b) => scoreLesson(b) - scoreLesson(a) || b.gradeId - a.gradeId)
    .slice(0, 6);

  // Compact table of contents for target grade lessons
  const targetToc = eligible
    .filter((l) => l.gradeId === input.gradeId)
    .map((l) => `ص${l.pageStart}-${l.pageEnd}: ${l.title}`)
    .join(' | ');

  const booksSummary = input.allowedBooks
    .filter((b) => b.gradeId <= input.maxAllowedGradeId)
    .sort((a, b) => b.gradeId - a.gradeId)
    .slice(0, 8)
    .map((b) => `- [الصف ${b.gradeId}] ${b.title} (${b.part}): ${b.summary}`)
    .join('\n');

  const lessonsContext = detailedLessons
    .map((l, idx) => {
      const formulas = l.formulas
        .map((f) => `${f.title}: $${f.expression}$`)
        .join(' ؛ ');
      const includeExercises =
        idx < 2 ||
        (requestedPage !== null && l.pageStart <= requestedPage && l.pageEnd >= requestedPage);
      const examplesText =
        includeExercises && l.examples.length > 0
          ? `\n  أمثلة الدرس: ${l.examples
              .slice(0, 2)
              .map((ex) => `${ex.title}: ${ex.problem} -> ${ex.answer}`)
              .join(' | ')}`
          : '';
      const exercisesText =
        includeExercises && l.exercises.length > 0
          ? `\n  تمارين الدرس: ${l.exercises
              .slice(0, 4)
              .map((ex) => `${ex.question} (الحل: ${ex.solution})`)
              .join(' | ')}`
          : '';
      return `• [الصف ${l.gradeId} | ص ${l.pageStart}-${l.pageEnd}] ${l.title}\n  الشرح: ${l.theory}\n  القوانين: ${formulas || 'مفاهيم أساسية'}${examplesText}${exercisesText}`;
    })
    .join('\n');

  return `\n[الكتب المعتمدة للطالب (الصف ${input.maxAllowedGradeId} وما قبله)]:\n${booksSummary}${targetToc ? `\n\n[فهرس دروس الصف ${input.gradeId}]: ${targetToc}` : ''}\n\n[أقرب الدروس والقوانين للسؤال]:\n${lessonsContext}`;
}

async function prepareTutorContext(ai: GoogleGenAI, input: TutorChatInput) {
  const grade =
    SYRIAN_GRADES.find((g) => g.id === input.gradeId) ?? SYRIAN_GRADES[11];
  const maxGrade =
    SYRIAN_GRADES.find((g) => g.id === input.maxAllowedGradeId) ?? grade;

  const explainStyle: TutorExplainStyle = input.explainStyle ?? 'detailed';
  const language: TutorLanguage = input.language ?? 'ar';
  const stageScope = input.stageScope ?? 'curriculum';

  const explainInstructionByLang: Record<TutorExplainStyle, Record<TutorLanguage, string>> = {
    quick: {
      ar: 'وضع الشرح: سريع (أولوية عليا على القواعد التفصيلية). قدّم الإجابة بخطوات مختصرة جداً (3-6 خطوات كحد أقصى) بدون حشو، واذكر النتيجة النهائية بوضوح.',
      en: 'Explanation mode: Quick. Provide very concise steps (max 3–6) without fluff, and state the final result clearly.',
      tr: 'Açıklama modu: Hızlı. Çok kısa adımlar ver (en fazla 3–6 adım), gereksiz ayrıntılardan kaçın ve sonucu net belirt.',
    },
    detailed: {
      ar: 'وضع الشرح: تفصيلي. قدّم كل خطوة بوضوح مع ذكر القاعدة المستخدمة، ولا تتجاوز أي انتقال منطقي.',
      en: 'Explanation mode: Detailed. Explain each step clearly and mention the rule used; do not skip logical steps.',
      tr: 'Açıklama modu: Detaylı. Her adımı açıkça açıkla ve kullanılan kuralı belirt; mantıksal adımları atlama.',
    },
  };

  const languageInstruction =
    language === 'en'
      ? 'OUTPUT LANGUAGE OVERRIDE: Respond strictly in English. Do not use Arabic. Keep KaTeX delimiters ($...$, $$...$$), ```chart, and ```svg blocks unchanged; write all explanations in English.'
      : language === 'tr'
        ? 'OUTPUT LANGUAGE OVERRIDE: Respond strictly in Turkish. Do not use Arabic. Keep KaTeX delimiters ($...$, $$...$$), ```chart, and ```svg blocks unchanged; write all explanations in Turkish.'
        : 'لغة الإجابة: العربية الفصحى التعليمية الواضحة.';

  const modeInstructions: Record<TutorMode, string> = {
    solve:
      'حل المسألة خطوة بخطوة بوضوح ومنهجية الكتب المدرسية السورية المعتمدة مع ذكر اسم الكتاب/الصف والقانون المستخدم في كل خطوة.',
    explain:
      'اشرح القانون أو النظرية الرياضية بطريقة مبسطة ومرتبة من الكتاب المدرسي مع مثال عددي من مستوى الصف المحدد وما قبله.',
    grade_answer:
      'صحّح إجابة الطالب بدقة. حدد أين أصاب وأين أخطأ بلطف تربوي، واشرح سبب الخطأ وفق قوانين الكتاب المدرسي، ثم اكتب الحل الصحيح.',
    generate_practice:
      'أنشئ 3 تمارين تدريبية متدرجة الصعوبة (أساسي، متوسط، تحدي) مطابقة للكتب المدرسية المعتمدة للصف المحدد وما قبله، مع تلميح مختصر وإجابة نهائية لكل تمرين.',
    graph:
      'حلل الدالة أو المعادلة أو البيانات، وقدّم جدول قيم مساعداً، ثم أرفق رسماً بيانياً تفاعلياً إلزامياً بصيغة ```chart { "type": "line", "data": { "labels": [...], "datasets": [...] }, "options": { "responsive": true } } ``` مع توضيح النقاط المحورية.',
    deep_explain:
      'اشرح المسألة والمفاهيم المحيطة بها بأسلوب تعليمي معمّق خطوة بخطوة، مع توضيح الفكرة الهندسية/الجبرية، والأخطاء الشائعة التي يقع فيها الطلاب، وطريقة التحقق من صحة النتيجة.',
  };

  const lessonContext = input.lesson
    ? `\nالدرس الحالي المختار: "${input.lesson.title}" (الصف ${input.lesson.gradeId}، الصفحات ${input.lesson.pageStart}-${input.lesson.pageEnd}).\nأهداف الدرس: ${input.lesson.objectives.join('، ')}.`
    : '';

  const requestedPage = extractRequestedPageNumber(input.message);
  const resolvedBook = resolveAutoReferenceBook(input, requestedPage);

  const refBookContext = resolvedBook
    ? `\nالكتاب المرجعي المعتمد: "${resolvedBook.title}" (الصف ${resolvedBook.gradeId}). التزم بالحل من هذا الكتاب ومناهج الصفوف السابقة له عند الحاجة.`
    : '';

  const curriculumGrounding = buildCurriculumGroundingText(
    input,
    requestedPage,
    resolvedBook
  );

  const stageContextInstruction =
    stageScope === 'general'
      ? `سياق المستوى: أسلوب عام مرن يراعي حدود صف الطالب (${maxGrade.name} وما قبله) مع قابلية التبسيط والتوضيح لجميع المستويات.`
      : `قواعد المنهاج الصارمة:
- صف الطالب المسجل هو **${maxGrade.name}** (الصف رقم ${input.maxAllowedGradeId})، والصف المستهدف حالياً هو **${grade.name}** (الصف رقم ${input.gradeId}).
- يجب أن يكون الحل والشرح مستنداً **حكماً** إلى الكتب المدرسية المعتمدة في المنهاج السوري لصف الطالب (**الصف ${input.maxAllowedGradeId}**) والصفوف **الأدنى/السابقة له فقط** (الصفوف 1 حتى ${input.maxAllowedGradeId}).
- **ممنوع منعاً باتاً** استخدام قوانين أو نظريات أو طرق حل من صفوف أعلى من الصف ${input.maxAllowedGradeId} (مثلاً لا تستخدم الاشتقاق أو النهايات أو التكامل أو الأعداد العقدية لطالب في الصف التاسع أو العاشر؛ بل حلّ له بطرق الجبر والهندسة والمبرهنات الموجودة في صفه والصفوف السابقة له).
- اذكر في بداية أو ثنايا الحل المرجع الدراسي المستخدم (اسم الكتاب/الدرس والصف).`;

  const systemInstruction = `أنت "المستشار الرياضي الذكي" — معلم رياضيات خبير يجمع بين الدقة الأكاديمية والوضوح البيداغوجي في منصة «المستشار الرياضي للمنهاج السوري».

${languageInstruction}
${explainInstructionByLang[explainStyle][language]}
${stageContextInstruction}
المطلوب في هذا الطلب: ${modeInstructions[input.mode]}

**بنية الإجابة المثالية (التزم بها في كل حل):**
1. **عنوان واضح للمسألة** (استخدم \`### عنوان المسألة\`) يوضح نوع المسألة والفكرة الأساسية في سطر واحد.
2. **الخطوات المنظمة:** قسّم الحل إلى خطوات مرقمة (\`1.\`، \`2.\`، ...) أو فقرات موجزة، واذكر في كل خطوة: **الإجراء** ثم **القاعدة أو النظرية المستخدمة**.
3. **تنسيق KaTeX الدقيق:**
   - استخدم \`$...$\` للرموز والمعادلات داخل السطر (مثل \`$x = 3$\` أو \`$\\Delta = b^2 - 4ac$\`).
   - استخدم \`$$...$$\` للمعادلات المحورية المهمة على سطر مستقل.
   - إذا كانت المعادلة طويلة، قسّمها باستخدام بيئة \`\\begin{aligned} ... \\end{aligned}\`.
4. **تنسيق الجداول (عند مقارنة القيم أو تلخيص المعطيات أو دراسة التغيرات):** استخدم جداول Markdown نظيفة.
5. **الرسوم البيانية التفاعلية (Chart.js):** عندما تساعد الرسمة البيانية في فهم دالة أو بيانات إحصائية أو يطلب الطالب رسم دالة، أرفق كتلة JSON صالحة تماماً بصيغة:
\`\`\`chart
{
  "type": "line",
  "data": { "labels": ["-2", "-1", "0", "1", "2"], "datasets": [{ "label": "f(x)", "data": [4, 1, 0, 1, 4] }] },
  "options": { "responsive": true }
}
\`\`\`
6. **الرسوم الهندسية التوضيحية (SVG):** عندما تكون المسألة هندسية (مثلث قائم، فيثاغورث، تالس، دائرة ومماس، متوازي أضلاع، هرم، مخروط، زوايا، إحداثيات نقاط)، أرفق رسماً هندسياً توضيحياً نظيفاً بصيغة:
\`\`\`svg
<svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
  <!-- خطوط وأشكال هندسية واضحة بخلفية بيضاء ورموز A, B, C واضحة وعلامة زاوية قائمة عند الحاجة -->
</svg>
\`\`\`
احرص أن تكون كل النصوص والرموز داخل SVG بلون داكن واضح (\`#0f172a\` أو \`#1d4ed8\`) مع هوامش كافية داخل \`viewBox\` وبدون أي وسوم \`<script>\`.
7. **الخلاصة والتحقق النهائي:** اختم الحل دائماً بإبراز النتيجة النهائية بوضوح والتحقق من صحتها (مثل التعويض المباشر في المعادلة)، وتجنب الحشو أو تكرار الكلام.
8. **إكمال الحل دائماً:** لا تقطع أي خطوة في المنتصف مهما كانت المسألة طويلة.${lessonContext}${refBookContext}${curriculumGrounding}`;

  const currentParts: Part[] = [];
  let hasMediaAttached = Boolean(input.file);

  // Attach reference PDF if available on disk (awaiting upload/cache so Gemini reads the requested page)
  if (
    resolvedBook &&
    resolvedBook.gradeId <= input.maxAllowedGradeId &&
    !input.file
  ) {
    const pdfPath = resolveBookPdfPath(resolvedBook);
    const shouldAttachPdf =
      Boolean(input.referenceBook) ||
      requestedPage !== null ||
      /تمرين|تمارين|تدرب|تحقق|صفح|كتاب|الكتاب|سؤال|مسألة/.test(input.message);

    if (pdfPath && shouldAttachPdf) {
      try {
        const size = fs.statSync(pdfPath).size;
        const cachedPart = getCachedLargeFilePart(pdfPath, 'application/pdf');
        if (cachedPart) {
          currentParts.push(cachedPart);
          hasMediaAttached = true;
        } else {
          const mediaPart = await buildMediaPart(ai, {
            mimeType: 'application/pdf',
            filePath: pdfPath,
            size,
          });
          currentParts.push(mediaPart);
          hasMediaAttached = true;
        }
      } catch (pdfErr) {
        console.warn('Could not attach reference PDF to Gemini:', pdfErr);
      }
    }
  }

  let textFilePrefix = '';
  if (input.file) {
    const isPlainText =
      input.file.mimeType === 'text/plain' ||
      input.file.fileName.toLowerCase().endsWith('.txt');
    if (isPlainText && input.file.filePath && fs.existsSync(input.file.filePath)) {
      const fileText = fs.readFileSync(input.file.filePath, 'utf-8').slice(0, 30000);
      textFilePrefix = `[محتوى الملف النصي المرفق: ${input.file.fileName}]\n${fileText}\n\n---\n\n`;
    } else {
      currentParts.push(await buildMediaPart(ai, input.file));
      hasMediaAttached = true;
    }
  }

  const finalUserText =
    `${textFilePrefix}${input.message}`.trim() ||
    'اقرأ المسألة الموجودة في الصورة أو الملف المرفق وحلها خطوة بخطوة وفق الكتاب المدرسي.';
  currentParts.push({ text: finalUserText });

  const priorHistory = (input.history ?? [])
    .filter((m) => m.content && m.content.trim().length > 0)
    .slice(-10)
    .map((m) => ({
      role: (m.role === 'assistant' ? 'model' : 'user') as 'user' | 'model',
      parts: [{ text: m.content }] as Part[],
    }));

  while (priorHistory.length > 0 && priorHistory[0].role === 'model') {
    priorHistory.shift();
  }

  const lastTurn = priorHistory[priorHistory.length - 1];
  if (
    lastTurn &&
    lastTurn.role === 'user' &&
    lastTurn.parts[0]?.text?.trim() === input.message.trim()
  ) {
    priorHistory.pop();
  }

  const conversation: Array<{ role: 'user' | 'model'; parts: Part[] }> = [
    ...priorHistory,
    { role: 'user', parts: currentParts },
  ];

  return {
    systemInstruction,
    currentParts,
    conversation,
    hasMediaAttached,
    thinkingLevel:
      explainStyle === 'quick' ? ThinkingLevel.LOW : ThinkingLevel.MEDIUM,
  };
}

export async function prewarmBookPdfCache(book: CurriculumBook): Promise<{
  cached: boolean;
  reason?: string;
}> {
  const pdfPath = resolveBookPdfPath(book);
  if (!pdfPath) {
    return { cached: false, reason: 'no_pdf' };
  }
  const existing = getCachedLargeFilePart(pdfPath, 'application/pdf');
  if (existing) {
    return { cached: true };
  }
  const ai = getAiClient();
  const size = fs.statSync(pdfPath).size;
  await buildMediaPart(ai, {
    mimeType: 'application/pdf',
    filePath: pdfPath,
    size,
  });
  return { cached: true };
}

export async function askSmartTutor(input: TutorChatInput): Promise<{
  reply: string;
}> {
  const ai = getAiClient();
  const ctx = await prepareTutorContext(ai, input);

  try {
    const response = await generateContentWithFallback(ai, {
      parts: ctx.currentParts,
      conversation: ctx.conversation,
      systemInstruction: ctx.systemInstruction,
      thinkingLevel: ctx.thinkingLevel,
      hasMedia: ctx.hasMediaAttached,
    });

    const reply = response.text?.trim();
    if (!reply) {
      throw new Error('لم يرد نموذج الذكاء الاصطناعي بإجابة نصية.');
    }

    return { reply };
  } catch (err) {
    if (isTransientApiError(err) && !input.file) {
      const fallbackReply = buildCurriculumFallbackReply(input);
      if (fallbackReply) {
        return { reply: fallbackReply };
      }
    }
    throw new Error(formatGeminiError(err));
  }
}

export async function askSmartTutorStream(
  input: TutorChatInput,
  onDelta: (delta: string) => void
): Promise<{ reply: string }> {
  const ai = getAiClient();
  const ctx = await prepareTutorContext(ai, input);

  try {
    const reply = await generateContentStreamWithFallback(
      ai,
      {
        parts: ctx.currentParts,
        conversation: ctx.conversation,
        systemInstruction: ctx.systemInstruction,
        thinkingLevel: ctx.thinkingLevel,
        hasMedia: ctx.hasMediaAttached,
      },
      onDelta
    );
    return { reply: reply.trim() };
  } catch (err) {
    if (isTransientApiError(err) && !input.file) {
      const fallbackReply = buildCurriculumFallbackReply(input);
      if (fallbackReply) {
        onDelta(fallbackReply);
        return { reply: fallbackReply };
      }
    }
    throw new Error(formatGeminiError(err));
  }
}

export interface ExtractedBookPayload {
  title: string;
  part: string;
  gradeId: number;
  pageCount: number;
  summary: string;
  units: Array<{
    chapterLabel: string;
    title: string;
    description: string;
    pageStart: number;
    pageEnd: number;
    lessons: Array<{
      title: string;
      pageStart: number;
      pageEnd: number;
      objectives: string[];
      theory: string;
      formulas: Array<{ title: string; expression: string; description: string }>;
      examples: Array<{ title: string; problem: string; steps: string[]; answer: string }>;
      exercises: Array<{
        question: string;
        difficulty: 'أساسي' | 'متوسط' | 'تحدي';
        hint: string;
        solution: string;
      }>;
      quiz: Array<{
        question: string;
        options: string[];
        correctIndex: number;
        explanation: string;
      }>;
    }>;
  }>;
}

export async function extractBookFromPdf(params: {
  fileName: string;
  filePath?: string;
  base64Pdf?: string;
  fileSize?: number;
  hintGradeId?: number;
  hintTitle?: string;
  hintSummary?: string;
}): Promise<ExtractedBookPayload> {
  const ai = getAiClient();
  const hasPdf = Boolean(params.filePath || params.base64Pdf);

  const promptText = hasPdf
    ? `قم بتحليل كتاب الرياضيات المرفق بصيغة PDF واسم الملف "${params.fileName}" وفق المنهاج السوري الرسمي.
استخرج:
1. اسم الكتاب والجزء والصف الدراسي المناسب من 1 إلى 12 (إن تعذر الجزم اعتمد ${params.hintGradeId ?? 12}).
2. فهرس الكتاب مقسماً إلى وحدات وفصول ودروس مع أرقام الصفحات التقريبية أو الفعلية.
3. لكل درس استخرج: الأهداف التعليمية، الشرح النظري المركز، القوانين والتعاريف بصيغة LaTeX صحيحة، أمثلة محلولة خطوة بخطوة، تمارين تدريبية مع التلميح والحل، وسؤال اختيار من متعدد.
تأكد من دقة المحتوى العربي والرموز الرياضية بصيغة LaTeX محصورة بين $...$ داخل النصوص، وبدون $ في حقل expression داخل formulas.`
    : `أعد فهرسة وتوليد بنية كتاب رياضيات للمنهاج السوري بعنوان "${params.hintTitle ?? params.fileName}" للصف رقم ${params.hintGradeId ?? 12}.
الملخص المتاح: ${params.hintSummary ?? 'كتاب رياضيات في المنهاج السوري'}.
أنشئ وحدات ودروساً متكاملة مع القوانين (LaTeX) والأمثلة والتمارين والاختبارات وأرقام الصفحات.`;

  const parts: Part[] = [];

  if (hasPdf) {
    parts.push(
      await buildMediaPart(ai, {
        mimeType: 'application/pdf',
        filePath: params.filePath,
        base64: params.base64Pdf,
        size: params.fileSize,
      })
    );
  }
  parts.push({ text: promptText });

  const response = await generateContentWithFallback(ai, {
    parts,
    thinkingLevel: ThinkingLevel.LOW,
    responseMimeType: 'application/json',
    responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          part: { type: Type.STRING },
          gradeId: { type: Type.INTEGER },
          pageCount: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          units: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapterLabel: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                pageStart: { type: Type.INTEGER },
                pageEnd: { type: Type.INTEGER },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      pageStart: { type: Type.INTEGER },
                      pageEnd: { type: Type.INTEGER },
                      objectives: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      theory: { type: Type.STRING },
                      formulas: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            expression: { type: Type.STRING },
                            description: { type: Type.STRING },
                          },
                          required: ['title', 'expression', 'description'],
                        },
                      },
                      examples: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            title: { type: Type.STRING },
                            problem: { type: Type.STRING },
                            steps: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                            answer: { type: Type.STRING },
                          },
                          required: ['title', 'problem', 'steps', 'answer'],
                        },
                      },
                      exercises: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            difficulty: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            solution: { type: Type.STRING },
                          },
                          required: ['question', 'difficulty', 'hint', 'solution'],
                        },
                      },
                      quiz: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            options: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                            },
                            correctIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING },
                          },
                          required: ['question', 'options', 'correctIndex', 'explanation'],
                        },
                      },
                    },
                    required: [
                      'title',
                      'pageStart',
                      'pageEnd',
                      'objectives',
                      'theory',
                      'formulas',
                      'examples',
                      'exercises',
                      'quiz',
                    ],
                  },
                },
              },
              required: ['chapterLabel', 'title', 'description', 'pageStart', 'pageEnd', 'lessons'],
            },
          },
        },
      required: ['title', 'part', 'gradeId', 'pageCount', 'summary', 'units'],
    },
  });

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('تعذر استخراج بنية الكتاب من ملف PDF.');
  }
  return JSON.parse(text) as ExtractedBookPayload;
}
