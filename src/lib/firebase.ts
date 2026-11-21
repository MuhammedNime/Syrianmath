import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  getFirestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ActivityLog,
  SavedTutorChat,
  SolvedFavoriteItem,
  StudentLessonProgress,
  TutorMode,
  UserProfile,
  UserRole,
} from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

function toIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function sanitizeId(raw: string): string {
  const cleaned = String(raw || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 120);
  return cleaned || `id_${Date.now()}`;
}

export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export async function ensureFirebaseUserProfile(
  fbUser: FirebaseUser,
  preferredGradeId?: number
): Promise<UserProfile> {
  const uid = sanitizeId(fbUser.uid);
  const profilePath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;

  let snap;
  try {
    snap = await getDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, profilePath);
  }

  if (snap.exists()) {
    const data = snap.data();
    const currentGrade = Number(data.gradeId) || 10;
    const nextGrade =
      preferredGradeId && preferredGradeId >= 1 && preferredGradeId <= 12
        ? preferredGradeId
        : currentGrade;

    if (preferredGradeId && nextGrade !== currentGrade) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          gradeId: nextGrade,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, profilePath);
      }
    }

    return {
      id: uid,
      name: String(data.displayName || fbUser.displayName || 'طالب'),
      email: fbUser.email || '',
      role: (data.role === 'admin' ? 'admin' : 'student') as UserRole,
      gradeId: nextGrade,
      createdAt: toIso(data.createdAt),
    };
  }

  const gradeId =
    preferredGradeId && preferredGradeId >= 1 && preferredGradeId <= 12
      ? preferredGradeId
      : 10;
  const displayName = (fbUser.displayName || fbUser.email?.split('@')[0] || 'طالب').slice(0, 120);
  const isBootstrapAdmin =
    fbUser.email === 'muhammedcemal.nime@gmail.com' && fbUser.emailVerified;
  const role: UserRole = isBootstrapAdmin ? 'admin' : 'student';

  const batch = writeBatch(db);
  batch.set(doc(db, 'users', uid), {
    uid,
    displayName,
    gradeId,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, 'users', uid, 'private', 'info'), {
    uid,
    email: (fbUser.email || 'student@syrianmath.sy').slice(0, 254),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${profilePath} & ${privatePath}`);
  }

  return {
    id: uid,
    name: displayName,
    email: fbUser.email || '',
    role,
    gradeId,
    createdAt: new Date().toISOString(),
  };
}

export async function updateFirebaseUserGrade(
  uid: string,
  gradeId: number
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const safeGrade = Math.min(12, Math.max(1, Math.round(gradeId)));
  const profilePath = `users/${safeUid}`;
  try {
    await updateDoc(doc(db, 'users', safeUid), {
      gradeId: safeGrade,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }
}

export async function loadProgressFromFirestore(uid: string): Promise<{
  progress: StudentLessonProgress[];
  activities: ActivityLog[];
}> {
  const safeUid = sanitizeId(uid);
  const progressPath = `users/${safeUid}/progress`;
  const activityPath = `users/${safeUid}/activities`;

  let progressSnap;
  try {
    progressSnap = await getDocs(
      query(collection(db, 'users', safeUid, 'progress'), where('userId', '==', safeUid))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, progressPath);
  }

  let activitySnap;
  try {
    activitySnap = await getDocs(
      query(
        collection(db, 'users', safeUid, 'activities'),
        where('userId', '==', safeUid),
        orderBy('createdAt', 'desc'),
        limit(30)
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, activityPath);
  }

  const progress: StudentLessonProgress[] = progressSnap.docs.map((d) => {
    const data = d.data();
    return {
      lessonId: String(data.lessonId || d.id),
      gradeId: Number(data.gradeId) || 10,
      completed: Boolean(data.completed),
      quizScore: typeof data.quizScore === 'number' ? data.quizScore : undefined,
      quizTotal: typeof data.quizTotal === 'number' ? data.quizTotal : undefined,
      lastVisitedAt: toIso(data.lastVisitedAt),
    };
  });

  const activities: ActivityLog[] = activitySnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: safeUid,
      type: (data.type || 'lesson_view') as ActivityLog['type'],
      title: String(data.title || ''),
      subtitle: String(data.subtitle || ''),
      gradeId: Number(data.gradeId) || 10,
      createdAt: toIso(data.createdAt),
    };
  });

  return { progress, activities };
}

export async function saveLessonProgressToFirestore(
  uid: string,
  item: StudentLessonProgress
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const safeLessonId = sanitizeId(item.lessonId);
  const path = `users/${safeUid}/progress/${safeLessonId}`;
  const ref = doc(db, 'users', safeUid, 'progress', safeLessonId);

  let existingSnap;
  try {
    existingSnap = await getDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const gradeId = Math.min(12, Math.max(1, Math.round(item.gradeId || 10)));
  const payload: Record<string, unknown> = {
    gradeId,
    completed: Boolean(item.completed),
    lastVisitedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (typeof item.quizScore === 'number') {
    payload.quizScore = Math.min(500, Math.max(0, Math.round(item.quizScore)));
  }
  if (typeof item.quizTotal === 'number') {
    payload.quizTotal = Math.min(500, Math.max(0, Math.round(item.quizTotal)));
  }

  try {
    if (existingSnap.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, {
        userId: safeUid,
        lessonId: safeLessonId,
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      existingSnap.exists() ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function logActivityToFirestore(
  uid: string,
  entry: Omit<ActivityLog, 'id' | 'userId' | 'createdAt'>
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const actId = sanitizeId(`act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  const path = `users/${safeUid}/activities/${actId}`;
  try {
    await setDoc(doc(db, 'users', safeUid, 'activities', actId), {
      userId: safeUid,
      type: entry.type,
      title: String(entry.title || 'نشاط دراسي').slice(0, 200),
      subtitle: String(entry.subtitle || '').slice(0, 300),
      gradeId: Math.min(12, Math.max(1, Math.round(entry.gradeId || 10))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function loadTutorStateFromFirestore(uid: string): Promise<{
  chats: SavedTutorChat[];
  favorites: SolvedFavoriteItem[];
}> {
  const safeUid = sanitizeId(uid);
  const chatsPath = `users/${safeUid}/tutorChats`;
  const favsPath = `users/${safeUid}/tutorFavorites`;

  let chatsSnap;
  try {
    chatsSnap = await getDocs(
      query(
        collection(db, 'users', safeUid, 'tutorChats'),
        where('userId', '==', safeUid),
        orderBy('updatedAt', 'desc'),
        limit(30)
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, chatsPath);
  }

  let favsSnap;
  try {
    favsSnap = await getDocs(
      query(
        collection(db, 'users', safeUid, 'tutorFavorites'),
        where('userId', '==', safeUid),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, favsPath);
  }

  const chats: SavedTutorChat[] = chatsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: String(data.title || 'محادثة'),
      gradeId: Number(data.gradeId) || 10,
      explainStyle: 'detailed',
      language: 'ar',
      messages: Array.isArray(data.messages) ? data.messages : [],
      updatedAt: toIso(data.updatedAt),
    };
  });

  const favorites: SolvedFavoriteItem[] = favsSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      question: String(data.question || ''),
      answer: String(data.answer || ''),
      gradeId: Number(data.gradeId) || 10,
      isFavorite: true,
      createdAt: toIso(data.createdAt),
    };
  });

  return { chats, favorites };
}

export async function syncTutorChatToFirestore(
  uid: string,
  chat: SavedTutorChat,
  mode: TutorMode = 'solve'
): Promise<void> {
  if (!chat.messages || chat.messages.length === 0) return;
  const safeUid = sanitizeId(uid);
  const safeChatId = sanitizeId(chat.id);
  const path = `users/${safeUid}/tutorChats/${safeChatId}`;
  const ref = doc(db, 'users', safeUid, 'tutorChats', safeChatId);

  const boundedMessages = chat.messages.slice(-100).map((m) => ({
    id: String(m.id || ''),
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.content || '').slice(0, 12000),
    createdAt: String(m.createdAt || new Date().toISOString()),
  }));

  let snap;
  try {
    snap = await getDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  const payload = {
    title: String(chat.title || 'محادثة رياضيات').slice(0, 200),
    gradeId: Math.min(12, Math.max(1, Math.round(chat.gradeId || 10))),
    mode,
    messages: boundedMessages,
    updatedAt: serverTimestamp(),
  };

  try {
    if (snap.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, {
        userId: safeUid,
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(
      error,
      snap.exists() ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function saveTutorFavoriteToFirestore(
  uid: string,
  item: SolvedFavoriteItem,
  mode: TutorMode = 'solve'
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const safeFavId = sanitizeId(item.id);
  const path = `users/${safeUid}/tutorFavorites/${safeFavId}`;
  try {
    await setDoc(doc(db, 'users', safeUid, 'tutorFavorites', safeFavId), {
      userId: safeUid,
      question: String(item.question || 'سؤال').slice(0, 2000),
      answer: String(item.answer || 'إجابة').slice(0, 20000),
      gradeId: Math.min(12, Math.max(1, Math.round(item.gradeId || 10))),
      mode,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
