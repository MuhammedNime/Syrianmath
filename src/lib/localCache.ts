import { CurriculumBook, Lesson, Unit } from '../types';

const DB_NAME = 'syrian_math_internal_memory';
const DB_VERSION = 1;
const STORE_BOOKS = 'cached_books';

export interface CachedBookRecord {
  book: CurriculumBook;
  units: Unit[];
  lessons: Lesson[];
  pdfBlob?: Blob;
  cachedAt: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'book.id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function cacheBookInInternalMemory(
  record: CachedBookRecord
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readwrite');
      const store = tx.objectStore(STORE_BOOKS);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback gracefully if storage quota/private mode restricts IndexedDB
  }
}

export async function getAllCachedBooks(): Promise<CachedBookRecord[]> {
  try {
    const db = await openDb();
    return await new Promise<CachedBookRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const store = tx.objectStore(STORE_BOOKS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as CachedBookRecord[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function getCachedBookById(
  bookId: string
): Promise<CachedBookRecord | null> {
  try {
    const db = await openDb();
    return await new Promise<CachedBookRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readonly');
      const store = tx.objectStore(STORE_BOOKS);
      const req = store.get(bookId);
      req.onsuccess = () => resolve((req.result as CachedBookRecord) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function removeCachedBook(bookId: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_BOOKS, 'readwrite');
      const store = tx.objectStore(STORE_BOOKS);
      store.delete(bookId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}
