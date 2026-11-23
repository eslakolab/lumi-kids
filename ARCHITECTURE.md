# المعمارية التقنية لمنصة لُومِي التعليمية (Lumi Kids Architecture)

## ١. نظرة عامة على النظام (System Architecture)
تم تصميم وتطوير تطبيق «لُومِي» كمنصة تعليمية عالمية تفاعلية للأطفال تعتمد على مبادئ **Clean Architecture** وهندسة البرمجيات المعيارية (Modular Component-Driven Architecture) المبنية على:
- **Frontend Core:** React 18 SPA + TypeScript + Vite.
- **Styling:** Tailwind CSS مع نظام تصميم مخصص لراحة بصر الطفل (Calm Warm Palette & Child Accessibility).
- **Audio Engine:** `soundManager` المبني على Web Audio API و SpeechSynthesis المتوافقين مع النطق الفونولوجي العربي الأصيل للحركات والسكون.
- **State Management:** مزيج منظم من React Contexts مستقلة لكل نطاق (AuthContext, SubscriptionContext, LanguageContext).

---

## ٢. فصل واجهة المستخدم عن منطق الأعمال (Separation of Concerns)
تم فصل طبقة العرض (UI Layer) تمامًا عن منطق النظام وطبقة الخدمات (Services Layer):

```
/src
├── /components          # مكونات العرض وتفاعل الطفل (UI Views & Modules)
│   ├── LettersModule.tsx       # مسرح الحروف المشكولة الموحد بدون تمرير
│   ├── SpellingModule.tsx      # التهجئة الصوتية التفاعلية وتنوين الضم
│   ├── ParentDashboard.tsx     # لوحة متابعة ولي الأمر ومسارات التعلم
│   ├── CertificateModal.tsx    # شاشة طباعة وتوليد شهادات التفوق
│   ├── RewardsAndBadgesModal.tsx # شاشات الأوسمة والتحفيز
│   ├── AdminDashboard.tsx      # لوحة تحكم الإدارة والنشر السحابي (CMS)
│   └── AdMobBanner.tsx         # لافتة الإعلانات الآمنة للأطفال
│
├── /context             # إدارة الحالة والتفاعل العام (Application Contexts)
│   ├── AuthContext.tsx         # تسجيل الدخول السحابي ومزامنة تقدم الطفل
│   ├── SubscriptionContext.tsx # متجر الاشتراكات وفحص صلاحية الإيصالات
│   └── LanguageContext.tsx     # إدارة التوطين وتعدد اللغات
│
├── /services            # منطق الأعمال والخدمات الخارجية (Business Services)
│   ├── admob.ts                # محرك إعلانات AdMob المتوافق مع COPPA
│   ├── analytics.ts            # خدمة Firebase Analytics للأحداث والمقاييس
│   ├── notifications.ts        # خدمة الإشعارات والتذكيرات اليومية
│   ├── security.ts             # تشفير البيانات، ترويسات API، وفحص التلاعب
│   ├── rewards.ts              # محرك النقاط والشارات وتوليد الشهادات
│   └── learningPaths.ts        # المسارات التعليمية ومحاكي الذكاء الاصطناعي التكيفي
│
└── /utils               # الأدوات المساعدة والموارد المشتركة
    ├── audio.ts                # محرك الصوت وتوليد النغمات
    ├── phonics.ts              # القواعد الصوتية للسكون والمدود والتنوين
    ├── letterImages.ts         # محلل الصور والأيقونات والأمثلة الواقعية
    └── cacheManager.ts         # إدارة التخزين المؤقت ووضع توفير الإنترنت
```

---

## ٣. الامتثال لقوانين حماية الأطفال (COPPA & Families Policy)
- **تصنيف الإعلانات (AdMob):** تصنيف صارم `maxAdContentRating: 'G'` مع تفعيل `tagForChildDirectedTreatment: true`. الإعلانات محجوبة تمامًا عن أي مستخدم مشترك.
- **الخصوصية والبيانات (Zero PII):** لا يتم جمع أسماء حقيقية أو صور شخصية أو بصمات أجهزة.
- **بوابة الوالدين (Parental Gate):** جميع العمليات التجارية (الاشتراكات، الدخول للإدارة، الروابط الخارجية) محمية بمسائل حسابية أو رمز مرور خاص بالبالغين لمنع نقرات الأطفال غير المقصودة.
- **حق النسيان ومحو البيانات:** توفير وظيفة فورية لمحو كافة السجلات والتقدم من الذاكرة بضغطة زر واحدة.

---

## ٤. قابلية التوسع والميزات المستقبلية (Extensibility & Future Roadmap)
1. **الذكاء الاصطناعي التكيفي (AI Tutor):**
   - تم بناء واجهة `learningPathsManager.getAIRecommendation` لتسمح مستقبلًا بربط نماذج Gemini API لتوليد تمارين وقصص مخصصة تتناسب لحظيًا مع سرعة استيعاب الطفل.
2. **تعدد الفصول والمسارات (Multi-Tenant & Multi-Curricula):**
   - هيكل المسارات `LearningTrack` مهيأ لدعم المدارس، الفصول الافتراضية، ومتابعة عدة أطفال تحت حساب ولي أمر واحد.
3. **النشر الفوري السحابي (OTA Live Publish):**
   - تتيح لوحة الإدارة نشر دروس وفيديوهات وألعاب واختبارات جديدة فورًا دون الحاجة لتحديث التطبيق عبر App Store أو Google Play.
