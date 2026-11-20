import React, { useEffect, useState } from 'react';
import {
  Check,
  GraduationCap,
  LogIn,
  LogOut,
  ShieldCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { api, GradeWithCounts, setStoredToken } from '../lib/api';
import { UserProfile } from '../types';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  grades: GradeWithCounts[];
  onAuthenticated: (user: UserProfile) => void;
  onGradeUpdated: (user: UserProfile) => void;
  onLogout: () => void;
}

export function AuthModal({
  open,
  onClose,
  user,
  grades,
  onAuthenticated,
  onGradeUpdated,
  onLogout,
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gradeId, setGradeId] = useState<number>(user?.gradeId ?? 10);
  const [loginGradeId, setLoginGradeId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setGradeId(user.gradeId);
    }
    setSavedNotice(null);
    setError(null);
  }, [user, open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await api.login(
          email,
          password,
          loginGradeId === '' ? undefined : Number(loginGradeId)
        );
        setStoredToken(res.token);
        onAuthenticated(res.user);
      } else {
        const res = await api.register({ name, email, password, gradeId });
        setStoredToken(res.token);
        onAuthenticated(res.user);
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(demoEmail: string, demoPass: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(
        demoEmail,
        demoPass,
        loginGradeId === '' ? undefined : Number(loginGradeId)
      );
      setStoredToken(res.token);
      onAuthenticated(res.user);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUserGrade(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedNotice(null);
    setLoading(true);
    try {
      const res = await api.updateGrade(gradeId);
      onGradeUpdated(res.user);
      setSavedNotice('تم حفظ صفك الدراسي الجديد وتحديث المحتوى المتاح.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="إعدادات الحساب وتسجيل الدخول"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        {user ? (
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  ملف الطالب والصف الدراسي
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {user.name} · {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            {savedNotice && (
              <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
                {savedNotice}
              </div>
            )}

            <form onSubmit={handleSaveUserGrade} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  صفك الدراسي المسجل (قابل للتعديل في أي وقت)
                </label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(Number(e.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.stage})
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  ملاحظة: يتيح لك صفك الدراسي الوصول إلى دروس وكتب وتمارين صفك والصفوف السابقة له فقط، ويلتزم المدرس الذكي بحل المسائل وفق مناهج صفك وما قبله.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 dark:bg-blue-600"
              >
                <Check className="h-4 w-4" />
                <span>{loading ? 'جارٍ الحفظ...' : 'حفظ وتحديث الصف الدراسي'}</span>
              </button>
            </form>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {tab === 'login' ? 'تسجيل الدخول إلى المنصة' : 'إنشاء حساب طالب جديد'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  حدد صفك الدراسي للوصول إلى كتبك واختباراتك والمدرس الذكي
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                }}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === 'login'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError(null);
                }}
                className={`min-h-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === 'register'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                }`}
              >
                حساب جديد
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: سلمى محمود"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      الصف الدراسي
                    </label>
                    <select
                      value={gradeId}
                      onChange={(e) => setGradeId(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {grades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@syrianmath.sy"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-400"
                />
              </div>

              {tab === 'login' && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    تحديد / تعديل الصف عند الدخول (اختياري)
                  </label>
                  <select
                    value={loginGradeId}
                    onChange={(e) =>
                      setLoginGradeId(
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-600 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">استخدام الصف المحفوظ في الحساب</option>
                    {grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {tab === 'login' ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span>
                  {loading
                    ? 'جارٍ المعالجة...'
                    : tab === 'login'
                    ? 'دخول'
                    : 'إنشاء الحساب'}
                </span>
              </button>
            </form>

            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className="mb-2.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                دخول سريع للحسابات الجاهزة:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickLogin('student@syrianmath.sy', 'Student123!')}
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-700"
                >
                  <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>حساب طالب</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => quickLogin('admin@syrianmath.sy', 'Admin123!')}
                  className="flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-teal-700"
                >
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>حساب مشرف (الإدارة)</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
