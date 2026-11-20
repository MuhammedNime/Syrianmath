import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import {
  ActivityLog,
  CurriculumBook,
  Lesson,
  PdfProcessingJob,
  SavedTutorChat,
  SolvedFavoriteItem,
  StudentLessonProgress,
  Unit,
  UserProfile,
  UserRole,
} from '../src/types';
import { SEED_BOOKS, SEED_LESSONS, SEED_UNITS } from './seedData';

export interface StoredUser extends UserProfile {
  passwordHash: string;
}

export interface DatabaseState {
  users: StoredUser[];
  books: CurriculumBook[];
  units: Unit[];
  lessons: Lesson[];
  processingJobs: PdfProcessingJob[];
  progressByUser: Record<string, StudentLessonProgress[]>;
  activitiesByUser: Record<string, ActivityLog[]>;
  tutorChatsByUser: Record<string, SavedTutorChat[]>;
  tutorFavoritesByUser: Record<string, SolvedFavoriteItem[]>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const AUTH_SECRET =
  process.env.AUTH_SECRET || 'syrian-math-advisor-session-secret';

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

function createInitialState(): DatabaseState {
  const studentId = 'user-student-1';
  const adminId = 'user-admin-1';

  const seedUsers: StoredUser[] = [
    {
      id: studentId,
      name: 'كريم الأحمد',
      email: 'student@syrianmath.sy',
      role: 'student',
      gradeId: 12,
      createdAt: '2026-09-10T09:00:00.000Z',
      passwordHash: bcrypt.hashSync('Student123!', 10),
    },
    {
      id: adminId,
      name: 'أ. سامر الحسن (المشرف)',
      email: 'admin@syrianmath.sy',
      role: 'admin',
      gradeId: 12,
      createdAt: '2026-09-01T08:00:00.000Z',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
    },
  ];

  return {
    users: seedUsers,
    books: SEED_BOOKS,
    units: SEED_UNITS,
    lessons: SEED_LESSONS,
    processingJobs: [
      {
        id: 'job-seed-1',
        bookId: 'book-g12-analysis',
        fileName: 'syrian-math-g12-analysis.pdf',
        gradeId: 12,
        status: 'completed',
        createdAt: '2026-09-01T08:00:00.000Z',
        completedAt: '2026-09-01T08:01:12.000Z',
        extractedUnitsCount: 2,
        extractedLessonsCount: 2,
        extractedFormulasCount: 4,
        extractedExercisesCount: 3,
        rawSummary: 'فهرسة كتاب التحليل الرياضي للصف الثالث الثانوي العلمي بنجاح.',
      },
    ],
    progressByUser: {
      [studentId]: [
        {
          lessonId: 'l-g12-1',
          gradeId: 12,
          completed: true,
          quizScore: 1,
          quizTotal: 1,
          lastVisitedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
        {
          lessonId: 'l-g12-3',
          gradeId: 12,
          completed: false,
          lastVisitedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        },
      ],
    },
    activitiesByUser: {
      [studentId]: [
        {
          id: 'act-1',
          userId: studentId,
          type: 'quiz_submit',
          title: 'إتمام اختبار نهاية درس النهايات والمقاربات',
          subtitle: 'الدرجة المحققة: 1 من 1 · الثالث الثانوي العلمي',
          gradeId: 12,
          lessonId: 'l-g12-1',
          createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
        {
          id: 'act-2',
          userId: studentId,
          type: 'lesson_view',
          title: 'مراجعة درس الأعداد العقدية والمصفوفات',
          subtitle: 'الجبر والهندسة التحليلية · صفحة 12',
          gradeId: 12,
          lessonId: 'l-g12-3',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
        },
      ],
    },
    tutorChatsByUser: {},
    tutorFavoritesByUser: {},
  };
}

let stateCache: DatabaseState | null = null;

function syncSeedCurriculum(state: DatabaseState): boolean {
  let changed = false;

  // Remove obsolete placeholder entries replaced by full Grade 7, Grade 8 & Grade 9 curriculum
  const obsoleteBookIds = new Set(['book-g8']);
  const beforeBooksLen = state.books.length;
  state.books = state.books.filter((b) => !obsoleteBookIds.has(b.id));
  if (state.books.length !== beforeBooksLen) {
    changed = true;
  }

  const obsoleteUnitIds = new Set(['u-g8-1']);
  const beforeUnitsLen = state.units.length;
  state.units = state.units.filter((u) => !obsoleteUnitIds.has(u.id));
  if (state.units.length !== beforeUnitsLen) {
    changed = true;
  }

  const obsoleteIds = new Set(['l-g7-1', 'l-g8-1', 'l-g9-1', 'l-g9-2', 'l-g9-3']);
  const beforeLen = state.lessons.length;
  state.lessons = state.lessons.filter((l) => !obsoleteIds.has(l.id));
  if (state.lessons.length !== beforeLen) {
    changed = true;
  }

  for (const sb of SEED_BOOKS) {
    const idx = state.books.findIndex((b) => b.id === sb.id);
    if (idx === -1) {
      state.books.push(sb);
      changed = true;
    } else if (
      state.books[idx].indexedAt !== sb.indexedAt ||
      state.books[idx].pdfFileName !== sb.pdfFileName ||
      state.books[idx].pageCount !== sb.pageCount ||
      state.books[idx].summary !== sb.summary
    ) {
      state.books[idx] = sb;
      changed = true;
    }
  }

  for (const su of SEED_UNITS) {
    const idx = state.units.findIndex((u) => u.id === su.id);
    if (idx === -1) {
      state.units.push(su);
      changed = true;
    } else if (
      state.units[idx].title !== su.title ||
      state.units[idx].pageStart !== su.pageStart ||
      state.units[idx].pageEnd !== su.pageEnd ||
      state.units[idx].description !== su.description
    ) {
      state.units[idx] = su;
      changed = true;
    }
  }

  for (const sl of SEED_LESSONS) {
    const idx = state.lessons.findIndex((l) => l.id === sl.id);
    if (idx === -1) {
      state.lessons.push(sl);
      changed = true;
    } else if (
      state.lessons[idx].title !== sl.title ||
      state.lessons[idx].pageStart !== sl.pageStart ||
      state.lessons[idx].pageEnd !== sl.pageEnd ||
      state.lessons[idx].order !== sl.order ||
      Boolean(state.lessons[idx].isUnitExercises) !== Boolean(sl.isUnitExercises) ||
      state.lessons[idx].quiz.length !== sl.quiz.length ||
      state.lessons[idx].quiz[0]?.id !== sl.quiz[0]?.id
    ) {
      state.lessons[idx] = sl;
      changed = true;
    }
  }

  return changed;
}

export function getDb(): DatabaseState {
  if (stateCache) return stateCache;
  ensureDirs();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      stateCache = JSON.parse(raw) as DatabaseState;
      let dirty = false;
      if (!stateCache.tutorChatsByUser) {
        stateCache.tutorChatsByUser = {};
        dirty = true;
      }
      if (!stateCache.tutorFavoritesByUser) {
        stateCache.tutorFavoritesByUser = {};
        dirty = true;
      }
      if (syncSeedCurriculum(stateCache) || dirty) {
        saveDb();
      }
      return stateCache;
    } catch {
      // Fallback to fresh seed if corrupted
    }
  }
  stateCache = createInitialState();
  saveDb();
  return stateCache;
}

export function saveDb(): void {
  ensureDirs();
  if (!stateCache) return;
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(stateCache, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function sanitizeUser(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    gradeId: user.gradeId,
    createdAt: user.createdAt,
  };
}

export function createAuthToken(user: StoredUser): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyAuthToken(token: string | undefined): StoredUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub: string;
      exp: number;
    };
    if (decoded.exp < Date.now()) return null;
    const db = getDb();
    return db.users.find((u) => u.id === decoded.sub) ?? null;
  } catch {
    return null;
  }
}

export function recordActivity(
  userId: string,
  entry: Omit<ActivityLog, 'id' | 'userId' | 'createdAt'>
): ActivityLog {
  const db = getDb();
  const item: ActivityLog = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  if (!db.activitiesByUser[userId]) {
    db.activitiesByUser[userId] = [];
  }
  db.activitiesByUser[userId].unshift(item);
  db.activitiesByUser[userId] = db.activitiesByUser[userId].slice(0, 30);
  saveDb();
  return item;
}

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  gradeId: number;
  role?: UserRole;
}): { user: UserProfile; token: string } {
  const db = getDb();
  const normalizedEmail = params.email.trim().toLowerCase();
  if (db.users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('البريد الإلكتروني مسجل مسبقاً');
  }
  const newUser: StoredUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: params.name.trim(),
    email: normalizedEmail,
    role: params.role === 'admin' ? 'admin' : 'student',
    gradeId: Math.min(12, Math.max(1, Number(params.gradeId) || 12)),
    createdAt: new Date().toISOString(),
    passwordHash: bcrypt.hashSync(params.password, 10),
  };
  db.users.push(newUser);
  db.progressByUser[newUser.id] = [];
  db.activitiesByUser[newUser.id] = [
    {
      id: `act-welcome-${Date.now()}`,
      userId: newUser.id,
      type: 'lesson_view',
      title: 'إنشاء حساب طالب جديد في المنصة',
      subtitle: `الصف الدراسي المختار: الصف ${newUser.gradeId}`,
      gradeId: newUser.gradeId,
      createdAt: new Date().toISOString(),
    },
  ];
  saveDb();
  return { user: sanitizeUser(newUser), token: createAuthToken(newUser) };
}

export function getSupabaseStatus() {
  const configured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
  return {
    supabaseConfigured: configured,
    persistentStoreActive: true,
  };
}
