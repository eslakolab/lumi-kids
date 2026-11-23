# 🌟 تطبيق لومي للأطفال (Lumi Kids Learning & Speech Platform)

> **تطبيق تعليمي وتفاعلي متكامل للأطفال** يركز على تنمية النطق، الحروف، الكلمات، القصص المصورة الواقعية، الرياضيات، العلوم المبسطة، والألعاب الذهنية للأطفال مع دعم كامل لمعايير متجر Google Play وسياسات العائلة (Families Policy).

---

## 📋 محتويات المشروع (Table of Contents)
1. [المواصفات التقنية (Tech Stack)](#-المواصفات-التقنية-tech-stack)
2. [التشغيل المحلي (Local Development)](#-التشغيل-المحلي-local-development)
3. [كيفية رفع المشروع على GitHub (Push to GitHub)](#-كيفية-رفع-المشروع-على-github-push-to-github)
4. [إنشاء حزمة أندرويد AAB للنشر في Google Play](#-إنشاء-حزمة-أندرويد-aab-للنشر-في-google-play)
5. [إعداد الاشتراكات وGoogle Play Billing](#-إعداد-الاشتراكات-وgoogle-play-billing)
6. [هيكل المجلدات (Project Structure)](#-هيكل-المجلدات-project-structure)

---

## 🛠 المواصفات التقنية (Tech Stack)
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Modern Child-Friendly UI/UX)
- **Speech & Audio:** Web Speech API (TTS) + Offline Canvas Lip-Sync Engine
- **Icons:** Lucide React
- **PWA & TWA Ready:** PWA Manifest, Service Worker, `twa-manifest.json` (Bubblewrap / Google Trusted Web Activity)
- **Google Play Compliance:** Google Play Billing v6/v7 Bridge (`/src/services/googlePlayBilling.ts`), Parental Gate (بوابة الرقابة الأبوية), Family Safety, Strict No-PII Data Policy.

---

## 🚀 التشغيل المحلي (Local Development)

### 1. المتطلبات الأساسية
- تثبيت **Node.js** (الإصدار 18 أو أحدث)
- مدير الحزم `npm` أو `pnpm` أو `bun`

### 2. التثبيت والتشغيل
```bash
# تثبيت الحزم والمكتبات
npm install

# تشغيل خادم التطوير المحلي
npm run dev
```
افتح المتصفح على: `http://localhost:3000` أو العنوان الظاهر في الطرفية (Terminal).

### 3. بناء نسخة الإنتاج (Production Build)
```bash
npm run build
```
سيتم إنشاء ملفات الويب الجاهزة داخل مجلد `dist/`.

---

## 🐙 كيفية رفع المشروع على GitHub (Push to GitHub)

اتبع هذه الخطوات البسيطة لإنشاء مستودع خاص أو عام ورفع الكود إليه:

```bash
# 1. الدخول إلى مجلد المشروع
cd lumi-kids

# 2. تهيئة مستودع Git
git init

# 3. إضافة جميع الملفات (تم استثناء node_modules تلقائياً بواسطة .gitignore)
git add .

# 4. تسجيل أول حفظ (Commit)
git commit -m "feat: Initial commit of Lumi Kids App"

# 5. تعيين الفرع الرئيسي
git branch -M main

# 6. ربط المشروع بمستودعك الجديد على GitHub (استبدل USERNAME باسم حسابك و REPO باسم المستودع)
git remote add origin https://github.com/USERNAME/lumi-kids.git

# 7. رفع الكود
git push -u origin main
```

---

## 📱 إنشاء حزمة أندرويد AAB للنشر في Google Play

تم تجهيز هذا المشروع بمعايير **Google Trusted Web Activity (TWA)** وملف `twa-manifest.json` المعتمد رسمياً من Google لتحويل تطبيقات الويب التقدمية (PWA) إلى ملفات **Android App Bundle (`.aab`)** قابلة للنشر الفوري في Google Play Console.

### الطريقة الأولى (الأسهل والأسرع دون الحاجة لتثبيت برامج): عبر PWABuilder من Microsoft
1. ارفع نسخة التطبيق على أي استضافة (Vercel, Netlify, Firebase Hosting, Cloud Run).
2. افتح موقع: [PWABuilder.com](https://www.pwabuilder.com)
3. أدخل رابط تطبيقك واضغط **Start**.
4. سيتعرف الموقع على ملف `manifest.json` وخصائص PWA بنسبة 100%.
5. اضغط **Package For Stores** واختر **Android**.
6. حمّل حزمة الـ Android التي تحتوي على ملف `app-release.aab` ومفتاح التوقيع الرقمي (Signing Key).

### الطريقة الثانية: باستخدام أداة Google الرسمية Bubblewrap CLI
```bash
# تثبيت أداة Bubblewrap الرسمية من Google
npm install -g @bubblewrap/cli

# تهيئة حزمة الأندرويد من ملف التكوين الجاهز
bubblewrap init --manifest=twa-manifest.json

# بناء ملف AAB الموقّع للنشر
bubblewrap build
```
ستحصل على ملف: `app-release-signed.aab` جاهز للرفع على مسار الإنتاج في Google Play Console.

---

## 💳 إعداد الاشتراكات وGoogle Play Billing

التطبيق يحتوي مسبقاً على جسر برمجي متكامل (`src/services/googlePlayBilling.ts`) يتوافق مع **Google Play Billing Library v6 & v7**:

1. **معرفات الاشتراكات (Product IDs) في Google Play Console:**
   - اشتراك شهري: `lumi_monthly_plan`
   - اشتراك سنوي: `lumi_yearly_plan`
2. **شروط Google الإلزامية المتوفرة بالتطبيق:**
   - شاشة خطط اشتراك مخصصة ومحمية ببوابة الوالدين (`Parental Gate`).
   - توضيح مدة الاشتراك، التجديد التلقائي، وسياسة الإلغاء قبل تأكيد الدفع.
   - رابط مباشر لسياسة الخصوصية وحماية بيانات الأطفال.
   - دعم التفعيل التلقائي للاشتراك ومزامنة الحسابات.

---

## 📁 هيكل المجلدات (Project Structure)

```text
├── public/                 # الأيقونات وملفات PWA والحزم المضغوطة
├── src/
│   ├── assets/             # الصور والرسوميات عالية الجودة لقصص وأنشطة الأطفال
│   ├── components/         # المكونات والشاشات التعليمية والتربوية
│   │   ├── HomeScreen.tsx           # الشاشة الرئيسية التفاعلية
│   │   ├── LettersModule.tsx        # وحدة الحروف الهجائية بالصوت والحركة
│   │   ├── WordsModule.tsx          # وحدة الكلمات بالتشكيل
│   │   ├── StoriesModule.tsx        # قصص واقعية مصورة مع نطق تفاعلي
│   │   ├── MathModule.tsx           # الحساب والأرقام
│   │   ├── ChemistryModule.tsx      # تجارب العلوم المبسطة
│   │   ├── ColoringModule.tsx       # ستوديو التلوين
│   │   ├── BrainGamesModule.tsx     # ألعاب تنمية الذكاء والذاكرة
│   │   ├── SubscriptionPlans.tsx    # شاشة الاشتراكات المتوافقة مع متجر Google
│   │   ├── ParentalGateModal.tsx    # بوابة التحقق الأبوي للأمان
│   │   └── ParentDashboard.tsx      # لوحة متابعة أداء الطفل للوالدين
│   ├── context/            # إدارة الحالة (Language, Subscription, Auth)
│   ├── services/           # خدمات النطق، التحليلات، ونظام دفع Google Play
│   │   └── googlePlayBilling.ts     # مكتبة ربط Google Play In-App Billing
│   └── data/               # بنك الأسئلة والقصص والحروف والشخصيات
├── index.html              # المدخل الرئيسي لصفحة الويب
├── twa-manifest.json       # تكوين Google Trusted Web Activity لبناء AAB
├── vite.config.ts          # إعدادات Vite وPWA Workbox
└── package.json            # الاعتماديات وأوامر التشغيل
```

---

## 🔒 حماية الأطفال والخصوصية (COPPA & GDPR-K Compliance)
- لا يتم جمع بيانات تعريفية للأطفال (No PII).
- الإعلانات (إن وجدت في الوضع المجاني) معلّمة بوسم الأطفال (`max_ad_content_rating: G`).
- بوابة رقابة أبوية (`Parental Gate`) تمنع وصول الأطفال لأي روابط خارجية أو شاشات الدفع والاشتراك.
- لا توجد مشتريات عشوائية داخل اللعبة.
