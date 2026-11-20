# دليل تشغيل وبناء تطبيق الأندرويد (Android Studio & GitHub)

تم تحويل المشروع إلى تطبيق أندرويد متكامل باستخدام **Capacitor 8** مع الحفاظ على تطبيق الويب والخادم الخلفي (`server.ts`) في نفس المستودع.

---

## 1. تشغيل التطبيق داخل Android Studio

1. ثبّت حزم Node.js محلياً ثم ابنِ الواجهة وزامنها مع مشروع الأندرويد:
   ```bash
   npm install
   npm run cap:sync
   ```
2. افتح مجلد `android/` مباشرة في **Android Studio** (أو عبر الأمر `npm run android:open`).
3. انتظر حتى ينهي **Gradle Sync** ثم اضغط **Run ▶** لتشغيل التطبيق على المحاكي أو هاتفك عبر USB.

---

## 2. ربط تطبيق الأندرويد بالخادم الخلفي (`VITE_API_BASE_URL`)

تطبيق الأندرويد يتضمن واجهة React والكتب/الدروس، بينما يتواصل مع الخادم (`server.ts`) من أجل الذكاء الاصطناعي، تسجيل الدخول، وملفات الـ PDF غير المخزنة محلياً:

* **أثناء التطوير على محاكي Android Studio (والخادم يعمل على جهازك على المنفذ `3000`):**
  أنشئ ملف `.env.production` أو مرّر المتغير قبل المزامنة:
  ```bash
  VITE_API_BASE_URL=http://10.0.2.2:3000 npm run cap:sync
  ```
* **للإنتاج (عند استضافة الخادم على Render / Railway / Cloud Run / VPS):**
  ```bash
  VITE_API_BASE_URL=https://your-backend-domain.com npm run cap:sync
  ```

> **ملاحظة:** لا تضع `GEMINI_API_KEY` داخل تطبيق الأندرويد أبداً؛ ضعه فقط في بيئة الخادم الخلفي (`server.ts`).

---

## 3. بناء ملف APK تلقائياً عبر GitHub Actions

يحتوي المستودع على سير عمل جاهز في `.github/workflows/android-apk.yml`:
1. ارفع المشروع إلى مستودعك على GitHub.
2. (اختياري) من إعدادات المستودع **Settings → Secrets and variables → Actions → Variables** أضف متغيراً باسم `VITE_API_BASE_URL` وقيمته رابط خادمك المستضاف.
3. ادخل إلى تبويب **Actions** وشغّل **Build Android APK** (أو ارفع أي تعديل على `main`)، ثم حمّل ملف `syrian-math-advisor-debug-apk` (`app-debug.apk`) مباشرة لتثبيته على أي هاتف أندرويد.

---

## 4. استخراج نسخة متجر Google Play (Release AAB / APK)

من داخل **Android Studio**:
* القائمة العلوية: **Build → Generate Signed Bundle / APK**
* اختر **Android App Bundle (.aab)** للنشر على Google Play، أو **APK** للتوزيع المباشر.
