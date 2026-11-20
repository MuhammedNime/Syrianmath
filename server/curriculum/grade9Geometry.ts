import { CurriculumBook, Lesson, Unit } from '../../src/types';

export const GRADE9_GEOMETRY_BOOK: CurriculumBook = {
  id: 'book-g9-geo',
  gradeId: 9,
  title: 'الرياضيات - الهندسة (كتاب الطالب) - الصف التاسع',
  part: 'كتاب الطالب · 2025 - 2026',
  author: 'وزارة التربية - الجمهورية العربية السورية',
  year: '2025 - 2026',
  pageCount: 84,
  coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
  pdfFileName: 'public/assets/aistudio/______________________-_________5ddc1097.pdf',
  isIndexed: true,
  indexedAt: '2026-11-19T09:05:00.000Z',
  summary:
    'الكتاب الرسمي للهندسة للصف التاسع الأساسي (2025 - 2026): النسب المثلثية لزاوية حادة وخواص التناسب، مبرهنة النسب الثلاث (تالس) وعكسها والتشابه، الزوايا والمضلعات في الدائرة والرباعي الدائري، والمجسّمات ومقاطعها.',
};

export const GRADE9_GEOMETRY_UNITS: Unit[] = [
  {
    id: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 1,
    chapterLabel: 'الوحدة الأولى',
    title: 'النسب المثلثية لزاوية حادّة',
    description:
      'بعض خواص التناسب، تعريف النسب المثلثية لزاوية حادة في مثلث قائم، المتطابقتان المثلثيتان، ونسب الزوايا الشهيرة 30° و 45° و 60°.',
    pageStart: 2,
    pageEnd: 19,
  },
  {
    id: 'u-g9-geo-2',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 2,
    chapterLabel: 'الوحدة الثانية',
    title: 'مبرهنة النّسب الثلاث',
    description:
      'مبرهنة النسب الثلاث (مبرهنة تالس)، عكس مبرهنة النسب الثلاث والقطعة الواصلة بين منتصفي ضلعين، والتشابه ومعامل التكبير والتصغير.',
    pageStart: 20,
    pageEnd: 38,
  },
  {
    id: 'u-g9-geo-3',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 3,
    chapterLabel: 'الوحدة الثالثة',
    title: 'الزوايا والمضلّعات في الدائرة، المضلّعات المنتظمة',
    description:
      'الزوايا المحيطية والمركزية والمماسية، الأوتار والأقواس والمماس، الرباعي الدائري وخواصه، والمضلعات المنتظمة المرسومة في دائرة.',
    pageStart: 39,
    pageEnd: 59,
  },
  {
    id: 'u-g9-geo-4',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 4,
    chapterLabel: 'الوحدة الرابعة',
    title: 'مجسّمات ومقاطع',
    description:
      'الموشور والأسطوانة والهرم والمخروط الدوراني، السطح الكروي والمجسم الكروي، ومقاطع المجسمات بمستوٍ وحساب حجم جذع الهرم والمخروط.',
    pageStart: 60,
    pageEnd: 84,
  },
];

export const GRADE9_GEOMETRY_LESSONS: Lesson[] = [
  // ======================== الوحدة الأولى ========================
  {
    id: 'l-g9-geo-1-1',
    unitId: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 1,
    title: 'بعض خواص التناسب',
    pageStart: 4,
    pageEnd: 6,
    durationMinutes: 35,
    objectives: [
      'تمييز طرفي التناسب ووسطي التناسب في العلاقة a/b = c/d.',
      'تطبيق خواص التناسب السبع (القلب، التبديل بين الطرفين أو الوسطين، تثبيت المقام أو البسط مع الجمع أو الطرح).',
      'حل مسائل هندسية وعددية باستعمال خواص التناسب.',
    ],
    theory:
      'إذا كانت $a$ و $b$ و $c$ و $d$ أربعة أعداد غير معدومة، ففي التناسب $\\frac{a}{b} = \\frac{c}{d}$ نسمي $a$ و $d$ طرفي التناسب، ونسمي $b$ و $c$ وسطي التناسب، ويتحقق الجداء التقاطعي $a \\times d = b \\times c$.\nنستخدم خواص التناسب في تحويل التناسب إلى تناسبات مكافئة تسهل حساب الأطوال أو الأعداد المجهولة عندما يُعطى مجموعهما أو فرقهما مع نسبتهما.',
    formulas: [
      {
        id: 'f-g9-geo-1-1-a',
        title: 'قلب النسبتين وتبديل الطرفين أو الوسطين',
        expression:
          '\\frac{a}{b} = \\frac{c}{d} \\implies \\frac{b}{a} = \\frac{d}{c}, \\quad \\frac{d}{b} = \\frac{c}{a}, \\quad \\frac{a}{c} = \\frac{b}{d}',
        description: 'في أي تناسب غير معدوم الحدود، يمكن قلب النسبتين أو المبادلة بين الطرفين أو بين الوسطين.',
      },
      {
        id: 'f-g9-geo-1-1-b',
        title: 'تثبيت المقامين مع إضافة أو طرح البسط',
        expression:
          '\\frac{a}{b} = \\frac{c}{d} \\implies \\frac{a+b}{b} = \\frac{c+d}{d} \\quad (a+b \\neq 0), \\qquad \\frac{a-b}{b} = \\frac{c-d}{d} \\quad (a-b \\neq 0)',
        description: 'تُستخدم عند معرفة مجموع المقدارين $(a+b)$ أو فرقهما $(a-b)$.',
      },
      {
        id: 'f-g9-geo-1-1-c',
        title: 'تثبيت البسطين مع إضافة أو طرح البسط للمقام',
        expression:
          '\\frac{a}{b} = \\frac{c}{d} \\implies \\frac{a}{b+a} = \\frac{c}{d+c}, \\qquad \\frac{a}{b-a} = \\frac{c}{d-c}',
        description: 'بشرط ألا ينعدم أي من المقامات الجديدة.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-1-1-a',
        title: 'حساب طولي جزأي قطعة مستقيمة (ص 5)',
        problem:
          'النقطة $N$ تقع على القطعة $[AB]$ طولها $AB = 100$، ونعلم أن $\\frac{AN}{NB} = \\frac{2}{3}$. احسب كلاً من $AN$ و $NB$.',
        steps: [
          'لدينا $\\frac{AN}{NB} = \\frac{2}{3}$. نثبت المقامين ونضيف كل مقام إلى البسط الموافق له:',
          '$\\frac{AN + NB}{NB} = \\frac{2 + 3}{3}$.',
          'بما أن $AN + NB = AB = 100$، نحصل على $\\frac{100}{NB} = \\frac{5}{3}$.',
          'ومنه $NB = \\frac{100 \\times 3}{5} = 60$، ثم $AN = 100 - 60 = 40$.',
        ],
        answer: '$NB = 60$ و $AN = 40$',
      },
      {
        id: 'ex-g9-geo-1-1-b',
        title: 'إيجاد عددين عُرف مجموعهما ونسبتهما (تحقق ص 6)',
        problem: 'إذا كان $\\frac{a}{2} = \\frac{b}{3}$ وكان $a + b = 15$ فاحسب كلاً من $a$ و $b$.',
        steps: [
          'نبادل بين الوسطين في التناسب فنكتب $\\frac{a}{b} = \\frac{2}{3}$.',
          'نثبت المقامين ونضيف كل مقام إلى بسطه: $\\frac{a+b}{b} = \\frac{2+3}{3} = \\frac{5}{3}$.',
          'نعوض $a+b = 15$: $\\frac{15}{b} = \\frac{5}{3} \\implies b = \\frac{15 \\times 3}{5} = 9$.',
          'ومنه $a = 15 - 9 = 6$.',
        ],
        answer: '$a = 6$ و $b = 9$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-1-1-a',
        question: 'جد عددين موجبين مجموعهما $27$ ونسبتهما $\\frac{1}{2}$ (تحقق من فهمك ص 6).',
        difficulty: 'أساسي',
        hint: 'ليكن العددان $x$ و $y$ حيث $\\frac{x}{y} = \\frac{1}{2}$، ثم ثبّت المقام واجمع.',
        solution: '$\\frac{x+y}{y} = \\frac{1+2}{2} \\implies \\frac{27}{y} = \\frac{3}{2} \\implies y = 18$ و $x = 9$.',
      },
      {
        id: 'er-g9-geo-1-1-b',
        question:
          'في المثلث $ABC$ قياس $\\hat{C} = 110^\\circ$ و $\\frac{\\hat{A}}{\\hat{B}} = \\frac{3}{4}$. احسب قياس كل من الزاويتين $\\hat{A}$ و $\\hat{B}$ (تدرب ص 6).',
        difficulty: 'متوسط',
        hint: 'مجموع زوايا المثلث $180^\\circ$، إذن $\\hat{A} + \\hat{B} = 180^\\circ - 110^\\circ = 70^\\circ$.',
        solution: '$\\frac{\\hat{A}+\\hat{B}}{\\hat{B}} = \\frac{3+4}{4} \\implies \\frac{70^\\circ}{\\hat{B}} = \\frac{7}{4} \\implies \\hat{B} = 40^\\circ$ و $\\hat{A} = 30^\\circ$.',
      },
      {
        id: 'er-g9-geo-1-1-c',
        question: 'جد عددين موجبين فرقهما $28$ ونسبتهما $\\frac{12}{5}$ (تدرب ص 6).',
        difficulty: 'متوسط',
        hint: 'استعمل خاصية تثبيت المقام والطرح: $\\frac{a-b}{b} = \\frac{12-5}{5}$.',
        solution: '$\\frac{28}{b} = \\frac{7}{5} \\implies b = 20$ و $a = 20 + 28 = 48$.',
      },
      {
        id: 'er-g9-geo-1-1-d',
        question:
          'يزيد عمر سارة على عمر سلمى بمقدار أربع سنوات، فإذا كانت نسبة عمريهما $\\frac{3}{5}$ فاحسب عمر كل منهما (تدرب ص 6).',
        difficulty: 'متوسط',
        hint: 'ليكن عمر سلمى $x$ وعمر سارة $y$، إذن $y - x = 4$ و $\\frac{x}{y} = \\frac{3}{5}$.',
        solution: '$\\frac{x}{y-x} = \\frac{3}{5-3} \\implies \\frac{x}{4} = \\frac{3}{2} \\implies x = 6$ سنوات لسلمى، وعمر سارة $y = 10$ سنوات.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-1-1-a',
        question: 'إذا كان $\\frac{x}{y} = \\frac{3}{5}$ وكان $x + y = 24$، فما قيمة $y$؟',
        options: ['$9$', '$12$', '$15$', '$18$'],
        correctIndex: 2,
        explanation: '$\\frac{x+y}{y} = \\frac{3+5}{5} = \\frac{8}{5} \\implies \\frac{24}{y} = \\frac{8}{5} \\implies y = 15$.',
      },
      {
        id: 'q-g9-geo-1-1-b',
        question: 'في التناسب $\\frac{a}{b} = \\frac{c}{d}$، أيّ التناسبات الآتية ناتجة عن المبادلة بين الوسطين؟',
        options: [
          '$\\frac{b}{a} = \\frac{d}{c}$',
          '$\\frac{a}{c} = \\frac{b}{d}$',
          '$\\frac{d}{b} = \\frac{c}{a}$',
          '$\\frac{a+b}{b} = \\frac{c+d}{d}$',
        ],
        correctIndex: 1,
        explanation: 'المبادلة بين الوسطين $b$ و $c$ تعطي $\\frac{a}{c} = \\frac{b}{d}$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-1-2',
    unitId: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 2,
    title: 'النسب المثلثية لزاوية حادّة',
    pageStart: 7,
    pageEnd: 10,
    durationMinutes: 40,
    objectives: [
      'تعريف جيب الزاوية الحادة وتجيبها وظلها في مثلث قائم.',
      'تحديد الضلع المقابلة والضلع المجاورة والوتر بالنسبة لكل زاوية حادة.',
      'حساب طول ضلع أو وتر في مثلث قائم بمعرفة إحدى النسب المثلثية وطول ضلع آخر.',
    ],
    theory:
      'في مثلث $ABC$ قائم الزاوية في $A$:\n- تجيب الزاوية الحادة $\\hat{B}$ هو نسبة طول الضلع المجاورة لها إلى طول الوتر، ونرمز له $\\cos\\hat{B}$.\n- جيب الزاوية الحادة $\\hat{B}$ هو نسبة طول الضلع المقابلة لها إلى طول الوتر، ونرمز له $\\sin\\hat{B}$.\n- ظل الزاوية الحادة $\\hat{B}$ هو نسبة طول الضلع المقابلة لها إلى طول الضلع المجاورة لها، ونرمز له $\\tan\\hat{B}$.\n\nملاحظات مهمة:\n1. النسب المثلثية ليس لها وحدات قياس.\n2. النسب المثلثية لزاوية حادة أعداد موجبة تماماً، وبما أن الوتر هو أطول أضلاع المثلث القائم فإن $0 < \\sin\\hat{B} < 1$ و $0 < \\cos\\hat{B} < 1$.',
    formulas: [
      {
        id: 'f-g9-geo-1-2-a',
        title: 'تعريف تجيب وجيب وظل زاوية حادة',
        expression:
          '\\cos\\hat{B} = \\frac{\\text{المجاور}}{\\text{الوتر}} = \\frac{BA}{BC}, \\quad \\sin\\hat{B} = \\frac{\\text{المقابل}}{\\text{الوتر}} = \\frac{AC}{BC}, \\quad \\tan\\hat{B} = \\frac{\\text{المقابل}}{\\text{المجاور}} = \\frac{AC}{AB}',
        description: 'في المثلث $ABC$ القائم الزاوية في $A$.',
      },
      {
        id: 'f-g9-geo-1-2-b',
        title: 'حصر الجيب والتجيب',
        expression: '0 < \\cos\\hat{B} < 1, \\qquad 0 < \\sin\\hat{B} < 1',
        description: 'لأن طول كل ضلع قائمة أصغر تماماً من طول الوتر.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-1-2-a',
        title: 'حساب طول الوتر بمعرفة الجيب (ص 8)',
        problem:
          'في المثلث $ABC$ القائم في $B$، لدينا $BC = 8$ و $\\sin\\widehat{BAC} = \\frac{4}{5}$. احسب طول الوتر $AC$.',
        steps: [
          'في المثلث $ABC$ القائم في $B$: الضلع المقابلة للزاوية $\\widehat{BAC}$ هي $BC$ والوتر هو $AC$.',
          'إذن $\\sin\\widehat{BAC} = \\frac{BC}{AC}$.',
          'نعوض: $\\frac{4}{5} = \\frac{8}{AC} \\implies AC = \\frac{8 \\times 5}{4} = 10$.',
        ],
        answer: '$AC = 10$',
      },
      {
        id: 'ex-g9-geo-1-2-b',
        title: 'حساب ضلع مجاورة بمعرفة التجيب (ص 9)',
        problem:
          'في المثلث $EFG$ القائم في $E$، لدينا $FG = 7.5$ و $\\cos\\widehat{EFG} = \\frac{2}{3}$. احسب الطول $FE$.',
        steps: [
          'في المثلث $EFG$ القائم في $E$: $\\cos\\widehat{EFG} = \\frac{EF}{FG}$.',
          'أي $\\frac{2}{3} = \\frac{EF}{7.5} \\implies EF = 7.5 \\times \\frac{2}{3} = 5$.',
        ],
        answer: '$EF = 5$',
      },
      {
        id: 'ex-g9-geo-1-2-c',
        title: 'حساب ضلع مقابلة بمعرفة الظل (ص 9)',
        problem:
          'المثلث $KLM$ قائم في $M$، فيه $KM = 5.4$ و $\\tan\\widehat{MKL} = \\frac{1}{3}$. احسب الطول $ML$.',
        steps: [
          'في المثلث $KLM$ القائم في $M$: $\\tan\\widehat{MKL} = \\frac{ML}{KM}$.',
          'أي $\\frac{1}{3} = \\frac{ML}{5.4} \\implies ML = \\frac{5.4}{3} = 1.8$.',
        ],
        answer: '$ML = 1.8$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-1-2-a',
        question:
          '$DEF$ مثلث قائم في $E$، فيه $ED = 6\\text{ cm}$ و $EF = 8\\text{ cm}$. احسب طول الوتر $DF$، ثم احسب $\\cos\\hat{D}$ و $\\sin\\hat{D}$ و $\\tan\\hat{D}$ (تدرب ص 10).',
        difficulty: 'أساسي',
        hint: 'استعمل مبرهنة فيثاغورس لحساب الوتر $DF$ أولاً.',
        solution:
          '$DF = \\sqrt{6^2 + 8^2} = \\sqrt{100} = 10\\text{ cm}$. ومنه $\\cos\\hat{D} = \\frac{6}{10} = 0.6$، $\\sin\\hat{D} = \\frac{8}{10} = 0.8$، $\\tan\\hat{D} = \\frac{8}{6} = \\frac{4}{3}$.',
      },
      {
        id: 'er-g9-geo-1-2-b',
        question:
          'في الدائرة $\\mathcal{C}$ التي قطرها $[MN]$ يساوي $12$ و $P$ نقطة منها تحقق $\\widehat{PMN} = 30^\\circ$. ما نوع المثلث $MPN$؟ واحسب $PN$ ثم استنتج $\\sin 30^\\circ$ علماً أن $OPN$ متساوي الأضلاع (تدرب ص 10).',
        difficulty: 'تحدي',
        hint: 'المثلث المرسوم في دائرة وأحد أضلاعه قطر فيها يكون قائماً. وبما أن $OP=ON=6$ و $\\widehat{PNM}=60^\\circ$ فالمثلث $OPN$ متساوي الأضلاع.',
        solution:
          'المثلث $MPN$ قائم في $P$ و $\\widehat{PNM}=60^\\circ$. المثلث $OPN$ متساوي الأضلاع إذن $PN = ON = 6$. ومنه $\\sin 30^\\circ = \\frac{PN}{MN} = \\frac{6}{12} = \\frac{1}{2}$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-1-2-a',
        question: 'في المثلث $ABC$ القائم في $B$، النسبة $\\frac{AB}{AC}$ تساوي:',
        options: ['$\\sin\\hat{A}$', '$\\cos\\hat{A}$', '$\\tan\\hat{C}$', '$\\cos\\hat{C}$'],
        correctIndex: 1,
        explanation: 'الوتر هو $AC$، والضلع $AB$ مجاورة للزاوية $\\hat{A}$، إذن $\\cos\\hat{A} = \\frac{AB}{AC}$ (وهي أيضاً $\\sin\\hat{C}$).',
      },
      {
        id: 'q-g9-geo-1-2-b',
        question: 'أيّ القيم الآتية لا يمكن أن تكون قيمة لجيب زاوية حادة $\\sin\\theta$؟',
        options: ['$0.25$', '$\\frac{3}{5}$', '$1.2$', '$\\frac{\\sqrt{3}}{2}$'],
        correctIndex: 2,
        explanation: 'جيب الزاوية الحادة يحقق دوماً $0 < \\sin\\theta < 1$، لذا القيمة $1.2$ مستحيلة.',
      },
    ],
  },
  {
    id: 'l-g9-geo-1-3',
    unitId: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 3,
    title: 'علاقتان مهمتان بين النسب المثلثية',
    pageStart: 11,
    pageEnd: 12,
    durationMinutes: 35,
    objectives: [
      'استنتاج المتطابقتين المثلثيتين الأساسيتين لزاوية حادة.',
      'استعمال $\\cos^2\\theta + \\sin^2\\theta = 1$ لحساب الجيب بمعرفة التجيب أو العكس.',
      'استعمال $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ لحساب أي نسبة من النسب الثلاث بمعرفة النسبتين الأخريين.',
    ],
    theory:
      'إذا كان $\\theta$ قياس زاوية حادة في مثلث قائم، فبفضل مبرهنة فيثاغورس نصل إلى علاقتين أساسيتين تربطان بين $\\sin\\theta$ و $\\cos\\theta$ و $\\tan\\theta$، وتتيحان حساب جميع النسب المثلثية انطلاقاً من نسبة واحدة معلومة.',
    formulas: [
      {
        id: 'f-g9-geo-1-3-a',
        title: 'المتطابقة المثلثية الأولى (فيثاغورس المثلثية)',
        expression: '\\cos^2\\theta + \\sin^2\\theta = 1',
        description: 'تفيد في حساب $\\sin\\theta$ بمعرفة $\\cos\\theta$ أو العكس.',
      },
      {
        id: 'f-g9-geo-1-3-b',
        title: 'المتطابقة المثلثية الثانية (علاقة الظل)',
        expression: '\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}',
        description: 'تفيد في حساب أيّ من النسب الثلاث بمعرفة النسبتين الأخريين.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-1-3-a',
        title: 'حساب sin و tan بمعرفة cos (ص 11)',
        problem: 'ليكن $\\cos\\hat{B} = \\frac{\\sqrt{3}}{2}$ لزاوية حادة $\\hat{B}$. احسب $\\sin\\hat{B}$ ثم $\\tan\\hat{B}$.',
        steps: [
          'لدينا $\\cos^2\\hat{B} + \\sin^2\\hat{B} = 1$، إذن $\\frac{3}{4} + \\sin^2\\hat{B} = 1$.',
          'ومنه $\\sin^2\\hat{B} = 1 - \\frac{3}{4} = \\frac{1}{4}$. ولأن $\\sin\\hat{B} > 0$ فإن $\\sin\\hat{B} = \\sqrt{\\frac{1}{4}} = \\frac{1}{2}$.',
          'لدينا $\\tan\\hat{B} = \\frac{\\sin\\hat{B}}{\\cos\\hat{B}} = \\frac{1}{2} \\div \\frac{\\sqrt{3}}{2} = \\frac{1}{2} \\times \\frac{2}{\\sqrt{3}} = \\frac{1}{\\sqrt{3}}$.',
        ],
        answer: '$\\sin\\hat{B} = \\frac{1}{2}$ و $\\tan\\hat{B} = \\frac{1}{\\sqrt{3}}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-1-3-a',
        question: 'مثلث قائم فيه $\\theta$ زاوية حادة و $\\cos\\theta = \\frac{4}{5}$. احسب $\\sin^2\\theta$ ثم $\\sin\\theta$ (تحقق ص 12).',
        difficulty: 'أساسي',
        hint: 'استعمل $\\sin^2\\theta = 1 - \\cos^2\\theta$.',
        solution: '$\\sin^2\\theta = 1 - \\frac{16}{25} = \\frac{9}{25} \\implies \\sin\\theta = \\frac{3}{5}$.',
      },
      {
        id: 'er-g9-geo-1-3-b',
        question: '$ABC$ مثلث قائم في $A$ و $\\sin\\hat{B} = \\frac{7}{25}$. احسب $\\cos\\hat{B}$ ثم $\\tan\\hat{B}$ (تحقق ص 12).',
        difficulty: 'متوسط',
        hint: '$25^2 - 7^2 = 625 - 49 = 576 = 24^2$.',
        solution: '$\\cos^2\\hat{B} = 1 - \\frac{49}{625} = \\frac{576}{625} \\implies \\cos\\hat{B} = \\frac{24}{25}$، و $\\tan\\hat{B} = \\frac{7/25}{24/25} = \\frac{7}{24}$.',
      },
      {
        id: 'er-g9-geo-1-3-c',
        question: '$ABC$ مثلث قائم في $A$ و $\\tan\\hat{B} = \\frac{3}{4}$. احسب كلاً من $\\sin\\hat{B}$ و $\\cos\\hat{B}$ (تدرب ص 12).',
        difficulty: 'تحدي',
        hint: 'بما أن $\\frac{\\sin\\hat{B}}{\\cos\\hat{B}} = \\frac{3}{4}$ فإن $\\sin\\hat{B} = \\frac{3}{4}\\cos\\hat{B}$، عوض في $\\cos^2\\hat{B}+\\sin^2\\hat{B}=1$.',
        solution: '$\\cos^2\\hat{B} + \\frac{9}{16}\\cos^2\\hat{B} = 1 \\implies \\frac{25}{16}\\cos^2\\hat{B} = 1 \\implies \\cos\\hat{B} = \\frac{4}{5}$ و $\\sin\\hat{B} = \\frac{3}{5}$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-1-3-a',
        question: 'إذا كانت $\\theta$ زاوية حادة بحيث $\\cos\\theta = \\frac{5}{13}$ و $\\tan\\theta = \\frac{12}{5}$، فإن $\\sin\\theta$ يساوي:',
        options: ['$\\frac{5}{12}$', '$\\frac{12}{13}$', '$\\frac{7}{13}$', '$\\frac{13}{12}$'],
        correctIndex: 1,
        explanation: '$\\sin\\theta = \\tan\\theta \\times \\cos\\theta = \\frac{12}{5} \\times \\frac{5}{13} = \\frac{12}{13}$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-1-4',
    unitId: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 4,
    title: 'نسب زوايا شهيرة (30° و 45° و 60°)',
    pageStart: 13,
    pageEnd: 15,
    durationMinutes: 40,
    objectives: [
      'حفظ واستنتاج النسب المثلثية للزوايا الشهيرة $30^\\circ$ و $45^\\circ$ و $60^\\circ$.',
      'معرفة خاصية المثلث الثلاثيني الستيني: الضلع المقابلة للزاوية $30^\\circ$ تساوي نصف الوتر.',
      'حساب أطوال أضلاع ومساحات وارتفاعات في تطبيقات عملية وهندسية.',
    ],
    theory:
      'المثلث القائم الذي قياسا زاويتيه الحادتين $30^\\circ$ و $60^\\circ$ نسميه المثلث الثلاثيني الستيني، وفيه طول الضلع المقابلة للزاوية $30^\\circ$ يساوي نصف طول الوتر.\nأما المثلث القائم المتساوي الساقين فقياس كل من زاويتيه الحادتين $45^\\circ$. كما أن الزاويتين الحادتين في أي مثلث قائم متتامتان: $\\sin\\hat{B} = \\cos(90^\\circ - \\hat{B})$ و $\\cos\\hat{B} = \\sin(90^\\circ - \\hat{B})$.',
    formulas: [
      {
        id: 'f-g9-geo-1-4-a',
        title: 'نسب الزاوية 30°',
        expression: '\\sin 30^\\circ = \\frac{1}{2}, \\quad \\cos 30^\\circ = \\frac{\\sqrt{3}}{2}, \\quad \\tan 30^\\circ = \\frac{\\sqrt{3}}{3} = \\frac{1}{\\sqrt{3}}',
        description: 'في المثلث الثلاثيني الستيني.',
      },
      {
        id: 'f-g9-geo-1-4-b',
        title: 'نسب الزاوية 45°',
        expression: '\\sin 45^\\circ = \\frac{\\sqrt{2}}{2}, \\quad \\cos 45^\\circ = \\frac{\\sqrt{2}}{2}, \\quad \\tan 45^\\circ = 1',
        description: 'في المثلث القائم المتساوي الساقين.',
      },
      {
        id: 'f-g9-geo-1-4-c',
        title: 'نسب الزاوية 60° وعلاقة المتممة',
        expression: '\\sin 60^\\circ = \\frac{\\sqrt{3}}{2}, \\quad \\cos 60^\\circ = \\frac{1}{2}, \\quad \\tan 60^\\circ = \\sqrt{3}, \\quad \\sin\\hat{B}=\\cos(90^\\circ-\\hat{B})',
        description: 'الزاويتان الحادتان في المثلث القائم متتامتان.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-1-4-a',
        title: 'حساب طول الوتر بمعرفة ضلع قائمة وزاوية 60° (ص 14)',
        problem: '$ABC$ مثلث قائم في $B$، فيه $BC = 8\\text{ cm}$ و $\\widehat{BAC} = 60^\\circ$. احسب الطول $AC$.',
        steps: [
          'الضلع المعلومة $BC$ تقابل الزاوية $\\hat{A}$، لذلك نستعمل الجيب: $\\sin\\hat{A} = \\frac{BC}{AC}$.',
          '$\\sin 60^\\circ = \\frac{8}{AC} \\implies \\frac{\\sqrt{3}}{2} = \\frac{8}{AC}$.',
          'ومنه $AC = \\frac{16}{\\sqrt{3}}\\text{ cm}$.',
        ],
        answer: '$AC = \\frac{16}{\\sqrt{3}}\\text{ cm}$',
      },
      {
        id: 'ex-g9-geo-1-4-b',
        title: 'حساب ضلع قائمة بمعرفة ضلع قائمة أخرى وزاوية 30° (ص 15)',
        problem: 'المثلث $KLM$ قائم في $M$، فيه $KM = 7\\sqrt{3}\\text{ m}$ و $\\widehat{MKL} = 30^\\circ$. احسب الطول $ML$.',
        steps: [
          'في المثلث $KLM$ القائم في $M$: $\\tan\\hat{K} = \\frac{ML}{KM}$.',
          'إذن $\\tan 30^\\circ = \\frac{ML}{7\\sqrt{3}} \\implies \\frac{1}{\\sqrt{3}} = \\frac{ML}{7\\sqrt{3}}$.',
          'ومنه $ML = 7\\text{ m}$.',
        ],
        answer: '$ML = 7\\text{ m}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-1-4-a',
        question: '$ABCD$ مربع طول ضلعه $1$. ما قياس الزاوية $\\widehat{BAC}$؟ واحسب طول قطر المربع $AC$ (تحقق ص 15).',
        difficulty: 'أساسي',
        hint: 'القطر في المربع ينصف الزاوية القائمة، ثم استعمل $\\sin 45^\\circ$ أو $\\cos 45^\\circ$.',
        solution: '$\\widehat{BAC} = 45^\\circ$. وباستعمال $\\cos 45^\\circ = \\frac{AB}{AC}$ نجد $AC = \\frac{1}{\\sqrt{2}/2} = \\sqrt{2}$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-1-4-a',
        question: 'ما قيمة كل من $\\sin 30^\\circ$ و $\\tan 45^\\circ$؟',
        options: ['$\\frac{1}{2}$ و $1$', '$\\frac{\\sqrt{3}}{2}$ و $1$', '$\\frac{1}{2}$ و $\\sqrt{3}$', '$\\frac{\\sqrt{2}}{2}$ و $1$'],
        correctIndex: 0,
        explanation: 'في المثلث الثلاثيني الستيني $\\sin 30^\\circ = \\frac{1}{2}$ وفي القائم المتساوي الساقين $\\tan 45^\\circ = 1$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-1-ex',
    unitId: 'u-g9-geo-1',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 5,
    isUnitExercises: true,
    title: 'تمرينات الوحدة الأولى: النسب المثلثية لزاوية حادّة',
    pageStart: 16,
    pageEnd: 19,
    durationMinutes: 45,
    objectives: [
      'تثبيت مهارات استخدام خواص التناسب والنسب المثلثية في حل المسائل الهندسية والحياتية.',
      'التمرن على أسئلة «اختبر معلوماتي» ومسائل الوحدة الأولى الكاملة.',
    ],
    theory:
      'تجمع تمرينات الوحدة الأولى تطبيقات شاملة على خواص التناسب السبع، وحساب النسب المثلثية الثلاث ($\\sin, \\cos, \\tan$) في المثلث القائم، والمتطابقتين المثلثيتين $\\sin^2\\hat{B}+\\cos^2\\hat{B}=1$ و $\\tan\\hat{B}=\\frac{\\sin\\hat{B}}{\\cos\\hat{B}}$، إضافة إلى الزوايا الشهيرة $30^\\circ, 45^\\circ, 60^\\circ$.',
    formulas: [
      {
        id: 'f-g9-geo-1-ex-a',
        title: 'خلاصة قوانين الوحدة الأولى',
        expression: '\\sin^2\\hat{B} + \\cos^2\\hat{B} = 1, \\qquad \\tan\\hat{B} = \\frac{\\sin\\hat{B}}{\\cos\\hat{B}}',
        description: 'مراجعة سريعة لقوانين حل تمرينات الوحدة الأولى.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-1-ex-a',
        title: 'مثال من تمرينات الوحدة: حساب ارتفاع مبنى (تمرين 14 ص 19)',
        problem:
          'لقياس ارتفاع $HB$ لواجهة مبنى، اتخذ مهندس نقطة $P$ تبعد $5\\text{ m}$ عن قاعدة المبنى $B$ ووضع جهاز رصده في $O$ على ارتفاع $1.7\\text{ m}$ فوجد $\\widehat{IOH}=76.8^\\circ$. احسب ارتفاع المبنى علماً أن $\\tan 76.8^\\circ \\approx 4.26$.',
        steps: [
          'في المثلث $OIH$ القائم في $I$ لدينا $OI = PB = 5\\text{ m}$.',
          '$\\tan 76.8^\\circ = \\frac{IH}{OI} \\implies IH = 5 \\times 4.26 = 21.3\\text{ m}$.',
          'نضيف ارتفاع جهاز الرصد: $HB = IH + IB = 21.3 + 1.7 = 23\\text{ m}$.',
        ],
        answer: 'ارتفاع المبنى $HB \\approx 23\\text{ m}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-1-ex-a',
        question:
          'شجرة انكسرت بفعل عاصفة وبقيت متصلة بالقاعدة $P$ ولامس رأسها الأرض في $S$ على بعد $4\\text{ m}$ بزاوية $30^\\circ$ مع الأرض. احسب ارتفاع الشجرة قبل العاصفة (تمرين 13 ص 19).',
        difficulty: 'متوسط',
        hint: 'ارتفاع الشجرة الكلي هو مجموع الجزء القائم $CP$ والجزء المائل $CS$.',
        solution: '$CP = 4\\tan 30^\\circ = \\frac{4}{\\sqrt{3}}\\text{ m}$، و $CS = \\frac{4}{\\cos 30^\\circ} = \\frac{8}{\\sqrt{3}}\\text{ m}$. الارتفاع الكلي $= \\frac{12}{\\sqrt{3}} = 4\\sqrt{3}\\text{ m}$.',
      },
      {
        id: 'er-g9-geo-1-ex-b',
        question:
          'في مثلث $ABC$ قائم في $A$، نعلم أن $\\cos\\hat{B} = \\frac{5}{13}$ وطول الوتر $BC = 26\\text{ cm}$. احسب $AB$ و $AC$ و $\\sin\\hat{B}$ (تدرب الوحدة ص 17).',
        difficulty: 'أساسي',
        hint: 'احسب $AB = BC \\cos\\hat{B}$ ثم استخدم فيثاغورس أو المتطابقة المثلثية الأولى.',
        solution: '$AB = 26 \\times \\frac{5}{13} = 10\\text{ cm}$، و $\\sin\\hat{B} = \\sqrt{1 - \\frac{25}{169}} = \\frac{12}{13}$، ومنه $AC = 24\\text{ cm}$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-1-ex-a',
        question: 'في مثلث $DEF$ قائم في $E$، فيه $EF=5\\text{ cm}$ و $\\hat{F}=30^\\circ$، ما طول $DE$ (ص 16)؟',
        options: ['$2.5\\text{ cm}$', '$5\\sqrt{3}\\text{ cm}$', '$\\frac{5}{\\sqrt{3}}\\text{ cm}$', '$10\\text{ cm}$'],
        correctIndex: 2,
        explanation: '$\\tan 30^\\circ = \\frac{DE}{EF} \\implies DE = 5 \\times \\frac{1}{\\sqrt{3}} = \\frac{5}{\\sqrt{3}}\\text{ cm}$.',
      },
      {
        id: 'q-g9-geo-1-ex-b',
        question: 'في المثلث $KLM$ القائم في $K$، إذا كان $KL = 2$ والوتر $LM = 2\\sqrt{2}$ فإن قياس الزاوية $\\hat{M}$ يساوي (ص 16):',
        options: ['$30^\\circ$', '$45^\\circ$', '$60^\\circ$', '$40^\\circ$'],
        correctIndex: 1,
        explanation: '$\\sin\\hat{M} = \\frac{2}{2\\sqrt{2}} = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\implies \\hat{M} = 45^\\circ$.',
      },
    ],
  },

  // ======================== الوحدة الثانية ========================
  {
    id: 'l-g9-geo-2-1',
    unitId: 'u-g9-geo-2',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 1,
    title: 'مبرهنة النّسب الثلاث (مبرهنة تالس)',
    pageStart: 22,
    pageEnd: 24,
    durationMinutes: 40,
    objectives: [
      'معرفة نص مبرهنة النسب الثلاث وتمييز حالاتها الثلاث في المستوي.',
      'تنظيم جدول تناسب أطوال الأضلاع المتقابلة بترتيب صحيح للرؤوس.',
      'حساب أطوال قطع مستقيمة مجهولة عندما يقطع مستقيمان متوازيان مستقيمين متقاطعين.',
    ],
    theory:
      'ليكن $(d)$ و $(d\')$ مستقيمين متقاطعين في $A$. النقطتان $B$ و $M$ من $(d)$ مختلفتان عن $A$، والنقطتان $C$ و $N$ من $(d\')$ مختلفتان عن $A$ أيضاً. إذا كان المستقيمان $(BC)$ و $(MN)$ متوازيين، فإن:\n$$\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}$$\nعند استعمال المبرهنة، نرتب الحروف في جدول التناسب بحيث تقع النقاط التي تنتمي إلى مستقيم واحد في عمود واحد.\nنتيجة مهمة: إذا كان $(BM)$ و $(CN)$ متقاطعين في $A$ وكان $\\frac{AM}{AB} \\neq \\frac{AN}{AC}$، كان المستقيمان $(BC)$ و $(MN)$ غير متوازيين.',
    formulas: [
      {
        id: 'f-g9-geo-2-1-a',
        title: 'مبرهنة النسب الثلاث (تالس)',
        expression: '(MN) \\parallel (BC) \\implies \\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{MN}{BC}',
        description: 'تتحقق في الحالات الثلاث: النقطتان بين الرأس والقاعدة، أو على امتداديهما، أو على شكل فراشة (تقاطع في $A$).',
      },
      {
        id: 'f-g9-geo-2-1-b',
        title: 'نفي التوازي',
        expression: '\\frac{AM}{AB} \\neq \\frac{AN}{AC} \\implies (MN) \\nparallel (BC)',
        description: 'اختلاف النسبتين يثبت عدم توازي المستقيمين.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-2-1-a',
        title: 'استعمال مبرهنة النسب الثلاث في حالة التقاطع (ص 24)',
        problem:
          'في الشكل المستقيمان $(AC)$ و $(BD)$ متقاطعان في $O$، والمستقيمان $(AB)$ و $(CD)$ متوازيان. إذا كان $OA=3\\text{ cm}$، $OC=2.4\\text{ cm}$، $OB=3.6\\text{ cm}$، احسب الطول $OD$.',
        steps: [
          'المستقيمان $(AC)$ و $(BD)$ متقاطعان في $O$، والمستقيمان $(AB)$ و $(CD)$ متوازيان.',
          'فاستناداً إلى مبرهنة النسب الثلاث المطبقة على المثلثين $OAB$ و $OCD$ يكون: $\\frac{OA}{OC} = \\frac{OB}{OD} = \\frac{AB}{CD}$.',
          'نعوض الأطوال المعلومة: $\\frac{3}{2.4} = \\frac{3.6}{OD} \\implies 3 \\times OD = 3.6 \\times 2.4$.',
          'إذن $OD = 1.2 \\times 2.4 = 2.88\\text{ cm}$.',
        ],
        answer: '$OD = 2.88\\text{ cm}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-2-1-a',
        question:
          'المستقيمان $(FI)$ و $(GJ)$ متوازيان، والنقاط $E, F, G$ على استقامة واحدة و $E, I, J$ على استقامة واحدة حيث $EF=2$، $EG=5$، $EI=3.6$، $GJ=6$. احسب كلاً من الطولين $EJ$ و $FI$ (تدرب ص 24).',
        difficulty: 'متوسط',
        hint: 'المثلثان $EFI$ و $EGJ$ في حالة تناسب: $\\frac{EF}{EG} = \\frac{EI}{EJ} = \\frac{FI}{GJ}$.',
        solution: '$\\frac{2}{5} = \\frac{3.6}{EJ} \\implies EJ = 9$. وكذلك $\\frac{2}{5} = \\frac{FI}{6} \\implies FI = 2.4$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-2-1-a',
        question: 'في المثلث $ABC$، $(MN) \\parallel (BC)$ حيث $AM=2\\text{ cm}$، $AB=6\\text{ cm}$، $AN=1.6\\text{ cm}$. فإن الطول $AC$ يساوي (ص 21):',
        options: ['$5.6\\text{ cm}$', '$4.6\\text{ cm}$', '$4.8\\text{ cm}$', '$3.2\\text{ cm}$'],
        correctIndex: 2,
        explanation: '$\\frac{2}{6} = \\frac{1.6}{AC} \\implies AC = 3 \\times 1.6 = 4.8\\text{ cm}$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-2-2',
    unitId: 'u-g9-geo-2',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 2,
    title: 'عكس مبرهنة النّسب الثلاث',
    pageStart: 25,
    pageEnd: 28,
    durationMinutes: 40,
    objectives: [
      'إثبات توازي مستقيمين باستعمال عكس مبرهنة النسب الثلاث والتحقق من شرط الترتيب المماثل للنقاط.',
      'استنتاج مبرهنة مستقيم المنتصفين في مثلث كحالة خاصة لعكس مبرهنة النسب الثلاث.',
    ],
    theory:
      '$(d)$ و $(d\')$ مستقيمان متقاطعان في $A$. $B$ و $M$ نقطتان من $(d)$ مختلفتان عن $A$، و $C$ و $N$ نقطتان من $(d\')$ مختلفتان عن $A$ أيضاً.\nإذا كان $\\frac{AM}{AB} = \\frac{AN}{AC}$ **وكان ترتيب النقاط $A$ و $B$ و $M$ على $(d)$ مماثلاً لترتيب النقاط $A$ و $C$ و $N$ على $(d\')$**، كان المستقيمان $(BC)$ و $(MN)$ متوازيين.\n\n**حالة خاصة (مبرهنة مستقيم المنتصفين):** القطعة المستقيمة الواصلة بين منتصفي ضلعين في مثلث توازي الضلع الثالثة وتساوي نصف طولها.',
    formulas: [
      {
        id: 'f-g9-geo-2-2-a',
        title: 'عكس مبرهنة النسب الثلاث',
        expression:
          '\\frac{AM}{AB} = \\frac{AN}{AC} \\text{ وبترتيب مماثل } \\implies (MN) \\parallel (BC)',
        description: 'لا بد من تحقق شرطي التناسب وترتيب النقاط على المستقيمين المتقاطعين.',
      },
      {
        id: 'f-g9-geo-2-2-b',
        title: 'مبرهنة مستقيم المنتصفين',
        expression: 'M \\text{ منتصف } [AB], \\; N \\text{ منتصف } [AC] \\implies (MN) \\parallel (BC) \\text{ و } MN = \\frac{1}{2}BC',
        description: 'حالة خاصة عند $\\frac{AM}{AB} = \\frac{AN}{AC} = \\frac{1}{2}$.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-2-2-a',
        title: 'إثبات عدم توازي مستقيمين (ص 27)',
        problem:
          'في المثلث $ABC$، لدينا $AB=35\\text{ cm}$، $AC=52\\text{ cm}$، $AM=11.9\\text{ cm}$، $AN=18.2\\text{ cm}$. أثبت أن $(MN)$ و $(BC)$ غير متوازيين.',
        steps: [
          'نحسب النسبتين كل واحدة على حدة: $\\frac{AM}{AB} = \\frac{11.9}{35} = 0.34$، و $\\frac{AN}{AC} = \\frac{18.2}{52} = 0.35$.',
          'بما أن $\\frac{AM}{AB} \\neq \\frac{AN}{AC}$، نستنتج أن المستقيمين $(MN)$ و $(BC)$ غير متوازيين.',
        ],
        answer: '$(MN)$ و $(BC)$ غير متوازيين',
      },
      {
        id: 'ex-g9-geo-2-2-b',
        title: 'إثبات التوازي بعكس مبرهنة النسب الثلاث (ص 27)',
        problem:
          'يتقاطع $(BC)$ و $(EF)$ في $A$ حيث $B \\in [AC]$ و $E \\in [AF]$ ولدينا $AB=5.4\\text{ cm}$، $AC=9\\text{ cm}$، $AE=7.5\\text{ cm}$، $AF=12.5\\text{ cm}$. أثبت أن $(BE) \\parallel (FC)$.',
        steps: [
          'نحسب النسبتين: $\\frac{AB}{AC} = \\frac{5.4}{9} = 0.6$ و $\\frac{AE}{AF} = \\frac{7.5}{12.5} = 0.6$.',
          'نجد أن $\\frac{AB}{AC} = \\frac{AE}{AF}$.',
          'النقاط $A, B, C$ على $(BC)$ بترتيب مماثل لترتيب $A, E, F$ على $(EF)$. فحسب عكس مبرهنة النسب الثلاث يكون $(BE) \\parallel (FC)$.',
        ],
        answer: '$(BE) \\parallel (FC)$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-2-2-a',
        question:
          'قطرا الرباعي $ABCD$ متقاطعان في $O$، ونعلم أن $OA=6.5\\text{ cm}$، $OB=5\\text{ cm}$، $OC=9.1\\text{ cm}$، $OD=7\\text{ cm}$. أثبت أن الرباعي $ABCD$ شبه منحرف (تدرب ص 28).',
        difficulty: 'متوسط',
        hint: 'احسب $\\frac{OA}{OC}$ و $\\frac{OB}{OD}$ بعد الاختزال وتحقق من ترتيب النقاط.',
        solution:
          '$\\frac{OA}{OC} = \\frac{6.5}{9.1} = \\frac{5}{7}$ و $\\frac{OB}{OD} = \\frac{5}{7}$. والنقاط $A,O,C$ بترتيب مماثل لـ $B,O,D$، إذن $(AB) \\parallel (DC)$ فالشكل شبه منحرف.',
      },
      {
        id: 'er-g9-geo-2-2-b',
        question:
          'في المثلث $ADE$، لدينا $AB=14\\text{ cm}$، $AD=21\\text{ cm}$، $AC=22\\text{ cm}$، $AE=33\\text{ cm}$ حيث $B \\in [AD]$ و $C \\in [AE]$. احسب النسبتين $\\frac{AB}{AD}$ و $\\frac{AC}{AE}$ واستنتج توازي $(BC)$ و $(DE)$ (تدرب ص 28).',
        difficulty: 'أساسي',
        hint: 'اختزل الكسرين $\\frac{14}{21}$ و $\\frac{22}{33}$.',
        solution: '$\\frac{AB}{AD} = \\frac{14}{21} = \\frac{2}{3}$ و $\\frac{AC}{AE} = \\frac{22}{33} = \\frac{2}{3}$ وبنفس الترتيب إذن $(BC) \\parallel (DE)$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-2-2-a',
        question: 'في المثلث $ABC$، $E$ منتصف $[AB]$ و $F$ منتصف $[AC]$، وإذا كان $BC = 12\\text{ cm}$ فإن $EF$ يساوي (ص 33):',
        options: ['$7.75\\text{ cm}$', '$6\\text{ cm}$', '$4.8\\text{ cm}$', '$24\\text{ cm}$'],
        correctIndex: 1,
        explanation: 'حسب مبرهنة مستقيم المنتصفين، $EF = \\frac{1}{2}BC = 6\\text{ cm}$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-2-3',
    unitId: 'u-g9-geo-2',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 3,
    title: 'التشابه',
    pageStart: 29,
    pageEnd: 32,
    durationMinutes: 40,
    objectives: [
      'تعرف المثلثين المتشابهين ومعامل التكبير ($k > 1$) ومعامل التصغير ($0 < k < 1$).',
      'تطبيق خواص التشابه على الزوايا والأطوال ($k$) والمساحات ($k^2$) والحجوم ($k^3$).',
      'ربط مبرهنة النسب الثلاث بالتشابه ومبرهنة فيثاغورس.',
    ],
    theory:
      'إذا تناسبت أطوال الأضلاع المتقابلة في مثلثين، كان المثلثان متشابهين ويكون أحدهما مصغراً أو مكبراً عن الآخر أو مطابقاً له.\nفي تشابه نسبته $k > 0$:\n- إذا كانت $k > 1$ يؤول التشابه إلى **تكبير** الشكل.\n- إذا كانت $0 < k < 1$ يؤول التشابه إلى **تصغير** الشكل.\n\n**الخاصة 1:** التشابه بنسبة $k$ يحافظ على قياسات الزوايا، ويُضرب كل طول بالعدد $k$.\n**الخاصة 2:** تُضرب مساحة السطح بالعدد $k^2$، ويُضرب حجم المجسم بالعدد $k^3$.',
    formulas: [
      {
        id: 'f-g9-geo-2-3-a',
        title: 'تأثير التشابه بنسبة k على الأطوال والمساحات والحجوم',
        expression: 'L\' = k \\cdot L, \\qquad \\mathcal{S}\' = k^2 \\cdot \\mathcal{S}, \\qquad \\mathcal{V}\' = k^3 \\cdot \\mathcal{V}',
        description: 'مع بقاء قياسات جميع الزوايا متساوية دون تغيير.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-2-3-a',
        title: 'تشابه مثلثين وحساب الزوايا والأطوال (ص 31)',
        problem:
          'المثلث $ABC$ تكبير للمثلث $EFG$ بنسبة $k=1.5$ مع $\\widehat{ABC}=\\widehat{EFG}$ و $\\widehat{CAB}=30^\\circ$ و $\\hat{G}=53^\\circ$ و $EF=2\\text{ cm}$ و $EG=2.6\\text{ cm}$. احسب $\\widehat{FEG}$ و $\\widehat{ACB}$ والطولين $AB$ و $AC$.',
        steps: [
          'جدول الرؤوس المتقابلة: $(E, F, G)$ تقابل $(A, B, C)$.',
          'بما أن التشابه يحافظ على الزوايا: $\\widehat{FEG} = \\widehat{CAB} = 30^\\circ$، و $\\hat{C} = \\hat{G} = 53^\\circ$.',
          'من تناسب الأضلاع: $\\frac{AB}{EF} = \\frac{AC}{EG} = 1.5$.',
          'ومنه $AB = 1.5 \\times 2 = 3\\text{ cm}$ و $AC = 1.5 \\times 2.6 = 3.9\\text{ cm}$.',
        ],
        answer: '$\\widehat{FEG}=30^\\circ$، $\\widehat{ACB}=53^\\circ$، $AB=3\\text{ cm}$، $AC=3.9\\text{ cm}$',
      },
      {
        id: 'ex-g9-geo-2-3-b',
        title: 'تأثير التصغير على الحجم (ص 32)',
        problem:
          'لدى بائع مرطبات عبوتان متشابهتان، سعة الكبيرة $12\\text{ cl}$ والصغيرة تصغير للكبيرة بنسبة $75\\%$. احسب سعة العبوة الصغيرة.',
        steps: [
          'نسبة التصغير $k = 0.75$.',
          'حسب الخاصة 2: $\\mathcal{V}\' = k^3 \\times \\mathcal{V} = (0.75)^3 \\times 12 \\approx 5.06 \\approx 5\\text{ cl}$.',
        ],
        answer: 'سعة العبوة الصغيرة تساوي تقريباً $5\\text{ cl}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-2-3-a',
        question:
          'اقترح مهندس معماري بناء صومعة حبوب بحجم $900\\text{ m}^3$، فصمم نموذجاً مصغراً لها بمقياس $\\frac{1}{20}$. احسب حجم النموذج المصمم (تحقق ص 32).',
        difficulty: 'متوسط',
        hint: 'تضرب الحجوم بمكعب مقياس التصغير $\\left(\\frac{1}{20}\\right)^3$.',
        solution: '$\\mathcal{V}\' = \\left(\\frac{1}{20}\\right)^3 \\times 900 = \\frac{900}{8000} = 0.1125\\text{ m}^3$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-2-3-base',
        question: 'إذا كان مثلث $A\'B\'C\'$ تكبيراً لمثلث $ABC$ بنسبة $k = 3$، فبكم تُضرب مساحته؟',
        options: ['$3$', '$6$', '$9$', '$27$'],
        correctIndex: 2,
        explanation: 'تُضرب المساحات بمربع نسبة التشابه: $k^2 = 3^2 = 9$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-2-ex',
    unitId: 'u-g9-geo-2',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 4,
    isUnitExercises: true,
    title: 'تمرينات الوحدة الثانية: مبرهنة النّسب الثلاث',
    pageStart: 33,
    pageEnd: 38,
    durationMinutes: 45,
    objectives: [
      'تطبيق مبرهنة النسب الثلاث وعكسها في مسائل التقاطع والتوازي.',
      'استثمار خواص التشابه في المساحات والحجوم ونماذج القياس.',
    ],
    theory:
      'تشمل تمرينات الوحدة الثانية مسائل متكاملة على مبرهنة تالس (النسب الثلاث)، وعكسها لإثبات التوازي أو نفيه، ومستقيم المنتصفين في المثلث، ومسائل التكبير والتصغير ($k, k^2, k^3$).',
    formulas: [
      {
        id: 'f-g9-geo-2-ex-a',
        title: 'خلاصة قوانين الوحدة الثانية',
        expression: '(MN)\\parallel(BC) \\iff \\frac{AM}{AB}=\\frac{AN}{AC}=\\frac{MN}{BC}, \\qquad \\mathcal{S}\'=k^2\\mathcal{S}, \\; \\mathcal{V}\'=k^3\\mathcal{V}',
        description: 'مراجعة شاملة لمبرهنة النسب الثلاث والتشابه.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-2-ex-a',
        title: 'مسألة شاملة من تمرينات الوحدة (تمرين 12 ص 37)',
        problem:
          'مساحة المثلث $ABC$ تساوي $25\\text{ cm}^2$ وقياسا اثنتين من زواياه $65^\\circ$ و $80^\\circ$. المثلث $EFG$ تكبير للمثلث $ABC$ بنسبة $2$. احسب قياسات زوايا $EFG$ ومساحته.',
        steps: [
          'الزاوية الثالثة في $ABC$: $180^\\circ - (65^\\circ + 80^\\circ) = 35^\\circ$.',
          'بما أن التشابه يحافظ على قياسات الزوايا، فزوايا $EFG$ هي $65^\\circ, 80^\\circ, 35^\\circ$.',
          'المساحة تُضرب بمربع نسبة التكبير: $\\mathcal{S}(EFG) = 2^2 \\times 25 = 100\\text{ cm}^2$.',
        ],
        answer: 'الزوايا $65^\\circ, 80^\\circ, 35^\\circ$ والمساحة $100\\text{ cm}^2$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-2-ex-a',
        question:
          'مثلث $ABC$ فيه $AB=6\\text{ cm}$ و $AC=9\\text{ cm}$. نعين $M \\in [AB]$ بحيث $AM=2\\text{ cm}$ و $N \\in [AC]$ بحيث $AN=3\\text{ cm}$. هل $(MN) \\parallel (BC)$؟ علّل (تمرينات الوحدة ص 36).',
        difficulty: 'أساسي',
        hint: 'قارن النسبتين $\\frac{AM}{AB}$ و $\\frac{AN}{AC}$ ثم طبّق عكس تالس.',
        solution: '$\\frac{AM}{AB}=\\frac{2}{6}=\\frac{1}{3}$ و $\\frac{AN}{AC}=\\frac{3}{9}=\\frac{1}{3}$. والنقاط على استقامة بالترتيب نفسه، إذن $(MN)\\parallel(BC)$.',
      },
      {
        id: 'er-g9-geo-2-ex-b',
        question:
          'مخروط صُنع له نموذج مصغر بنسبة $k = \\frac{1}{5}$. إذا كان حجم النموذج المصغر $8\\text{ cm}^3$ فما حجم المخروط الأصلي؟ (تمرينات الوحدة ص 38)',
        difficulty: 'متوسط',
        hint: '$\\mathcal{V}_{\\text{مصغر}} = \\left(\\frac{1}{5}\\right)^3 \\mathcal{V}_{\\text{أصلي}}$.',
        solution: '$\\mathcal{V}_{\\text{أصلي}} = 8 \\times 5^3 = 8 \\times 125 = 1000\\text{ cm}^3$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-2-3-a',
        question: 'إذا ضربنا أطوال أضلاع مثلث بالعدد $3$، فإن قياسات زواياه (ص 34):',
        options: ['تُضرب بالعدد 9', 'تُضرب بالعدد 3', 'لا تتغير', 'تنقص للثلث'],
        correctIndex: 2,
        explanation: 'التشابه (التكبير أو التصغير) يحافظ على قياسات الزوايا.',
      },
      {
        id: 'q-g9-geo-2-3-b',
        question: 'إذا كُبّر مجسم بنسبة $2$ (مثل أسطوانة تضاعفت أبعادها)، فإن حجم المجسم المكبر يساوي (ص 34):',
        options: ['مثلي حجم الأصلي', 'أربعة أمثال حجم الأصلي', 'ثمانية أمثال حجم الأصلي', 'ستة أمثال حجم الأصلي'],
        correctIndex: 2,
        explanation: 'نسبة الحجوم تساوي مكعب نسبة التشابه: $2^3 = 8$.',
      },
    ],
  },

  // ======================== الوحدة الثالثة ========================
  {
    id: 'l-g9-geo-3-1',
    unitId: 'u-g9-geo-3',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 1,
    title: 'زوايا محيطية وزوايا مركزية والمماس',
    pageStart: 40,
    pageEnd: 46,
    durationMinutes: 45,
    objectives: [
      'التمييز بين الزاوية المحيطية والزاوية المركزية والزاوية المماسية والقوس المقابلة لها.',
      'حساب قياسات الزوايا والأقواس في الدائرة باستعمال علاقات التساوي والنصف.',
      'معرفة خواص الأوتار المتساوية وخواص مماس الدائرة.',
    ],
    theory:
      '- **الزاوية المحيطية:** رأسها على الدائرة وضلعاها وتران فيها. **الزاوية المركزية:** رأسها مركز الدائرة.\n- **خاصة أساسية:** قياس الزاوية المحيطية يساوي نصف قياس الزاوية المركزية المشتركة معها بالقوس.\n- **نتيجة:** قياسا زاويتين محيطيتين مشتركتين بالقوس في دائرة متساويان.\n- **الزاوية المماسية:** رأسها على الدائرة وأحد ضلعيها وتر والآخر مماس للدائرة، وتُقاس بنصف القوس الذي تقابله (تساوي المحيطية المشتركة معها بالقوس).\n- **خواص المماس والوتر:** المستقيم المار بمركز دائرة ويعامد وتراً يمر من منتصفه. ومماس الدائرة في نقطة $A$ يعامد نصف القطر $[OA]$. ومن نقطة خارج دائرة يمكن رسم مماسين متساويي الطول.',
    formulas: [
      {
        id: 'f-g9-geo-3-1-a',
        title: 'العلاقة بين المحيطية والمركزية والمماسية',
        expression: '\\widehat{AMB} = \\frac{1}{2}\\widehat{AOB} = \\frac{1}{2}\\widehat{AB}, \\qquad \\widehat{CBE} = \\widehat{CAB} = \\frac{1}{2}\\widehat{COB}',
        description: 'عند اشتراك المحيطية والمركزية والمماسية بالقوس ذاته.',
      },
      {
        id: 'f-g9-geo-3-1-b',
        title: 'خواص الأقواس والأوتار',
        expression: 'AB = CD \\iff \\widehat{AB} = \\widehat{CD} \\iff \\widehat{AOB} = \\widehat{COD}',
        description: 'الأوتار المتساوية تحدد أقواساً متساوية وزوايا مركزية ومحيطية متساوية.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-3-1-a',
        title: 'حساب زوايا مثلث مرسوم في دائرة (ص 45)',
        problem:
          '$A, B, C, M$ نقاط من دائرة مركزها $O$، حيث $\\widehat{AOB} = 84^\\circ$ و $\\widehat{BMC} = 31^\\circ$. احسب قياسات زوايا المثلث $ABC$.',
        steps: [
          'المحيطية $\\widehat{ACB}$ والمركزية $\\widehat{AOB}$ مشتركتان بالقوس $\\widehat{AB}$، إذن $\\widehat{ACB} = \\frac{1}{2}\\widehat{AOB} = 42^\\circ$.',
          'المحيطيتان $\\widehat{BAC}$ و $\\widehat{BMC}$ مشتركتان بالقوس $\\widehat{BC}$، إذن $\\widehat{BAC} = \\widehat{BMC} = 31^\\circ$.',
          'في المثلث $ABC$: $\\widehat{ABC} = 180^\\circ - (42^\\circ + 31^\\circ) = 107^\\circ$.',
        ],
        answer: '$\\hat{C}=42^\\circ$، $\\hat{A}=31^\\circ$، $\\hat{B}=107^\\circ$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-3-1-a',
        question:
          '$A, B, C$ ثلاث نقاط من دائرة مركزها $O$. نعلم أن $\\widehat{BAC} = 65^\\circ$. احسب قياس كل من $\\widehat{BOC}$ و $\\widehat{OBC}$ و $\\widehat{OCB}$ (تدرب ص 46).',
        difficulty: 'أساسي',
        hint: '$OB = OC$ أنصاف أقطار، إذن $OBC$ مثلث متساوي الساقين.',
        solution: '$\\widehat{BOC} = 2 \\times 65^\\circ = 130^\\circ$. وفي المثلث المتساوي الساقين $OBC$: $\\widehat{OBC} = \\widehat{OCB} = \\frac{180^\\circ - 130^\\circ}{2} = 25^\\circ$.',
      },
      {
        id: 'er-g9-geo-3-1-b',
        question:
          '$[BC]$ قطر في دائرة مركزها $A$، و $E$ نقطة منها تحقق $\\widehat{BAE} = 120^\\circ$، و $(ED)$ و $(CM)$ مماسان للدائرة. احسب $\\widehat{CAE}$ و $\\widehat{ECB}$ و $\\widehat{CBE}$ و $\\widehat{CED}$ و $\\widehat{BCM}$ (تدرب ص 46).',
        difficulty: 'متوسط',
        hint: 'المثلث $EBC$ قائم في $E$ لأن $[BC]$ قطر، و $\\widehat{CAE} = 180^\\circ - 120^\\circ$.',
        solution:
          '$\\widehat{CAE} = 60^\\circ$، وبما أن $AE=AC$ فالمثلث $AEC$ متساوي الأضلاع إذن $\\widehat{ECB}=60^\\circ$ و $\\widehat{CBE}=30^\\circ$. والزاوية المماسية $\\widehat{CED} = \\widehat{CBE} = 30^\\circ$، و $\\widehat{BCM}=90^\\circ$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-3-1-a',
        question: '$A, E, F$ ثلاث نقاط من دائرة مركزها $O$، إذا كان $\\widehat{OFE} = 36^\\circ$ فإن $\\widehat{EAF}$ يساوي (ص 54):',
        options: ['$54^\\circ$', '$72^\\circ$', '$108^\\circ$', '$36^\\circ$'],
        correctIndex: 0,
        explanation: 'في المثلث المتساوي الساقين $OFE$: $\\widehat{EOF} = 180^\\circ - 2(36^\\circ) = 108^\\circ$، إذن المحيطية $\\widehat{EAF} = \\frac{108^\\circ}{2} = 54^\\circ$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-3-2',
    unitId: 'u-g9-geo-3',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 2,
    title: 'الرباعي الدائري',
    pageStart: 47,
    pageEnd: 50,
    durationMinutes: 40,
    objectives: [
      'تعرف الرباعي الدائري وتمييزه عن باقي الرباعيات.',
      'تطبيق خواص الرباعي الدائري (تكامل الزوايا المتقابلة والزاوية الخارجية).',
      'إثبات أن رباعياً ما هو رباعي دائري بإحدى الطريقتين العكسيتين.',
    ],
    theory:
      'الرباعي الدائري هو رباعي تقع رؤوسه الأربعة على دائرة واحدة.\n**خواص الرباعي الدائري:**\n1. الزاويتان المتقابلتان في رباعي دائري متكاملتان (مجموعهما $180^\\circ$).\n2. الزاوية الخارجية في رباعي دائري تساوي الزاوية المقابلة لمجاورتها.\n3. إذا كانت النقاط $A, B, C, D$ على دائرة واحدة وكانت $A$ و $C$ في جهة واحدة بالنسبة إلى $(BD)$ كانت الزاويتان $\\widehat{BAD}$ و $\\widehat{BCD}$ متساويتين.\n\n**عكس الخواص (لإثبات أن الرباعي دائري):**\n- إذا تكاملت زاويتان متقابلتان في شكل رباعي، كان الرباعي دائرياً.\n- إذا تساوت الزاويتان $\\widehat{BAD}$ و $\\widehat{BCD}$ وكانتا في جهة واحدة بالنسبة للمستقيم $(BD)$، كان الرباعي دائرياً.',
    formulas: [
      {
        id: 'f-g9-geo-3-2-a',
        title: 'شرط وخاصة التكامل في الرباعي الدائري',
        expression: 'ABCD \\text{ رباعي دائري} \\iff \\hat{A} + \\hat{C} = 180^\\circ \\iff \\hat{B} + \\hat{D} = 180^\\circ',
        description: 'مجموع كل زاويتين متقابلتين يساوي $180^\\circ$.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-3-2-a',
        title: 'إثبات أن أربع نقاط تقع على دائرة واحدة وتعيين مركزها (ص 49)',
        problem:
          'في الرباعي $ABEF$ لدينا $\\hat{B} = \\hat{F} = 90^\\circ$ و $AF = 3$ و $FE = 4$. أثبت أن النقاط $A, B, E, F$ تقع على دائرة واحدة، وعيّن مركزها وطول نصف قطرها.',
        steps: [
          'بما أن $\\hat{B} + \\hat{F} = 90^\\circ + 90^\\circ = 180^\\circ$ وهما متقابلتان، فالرباعي $ABEF$ دائري أي تقع نقاطه على دائرة واحدة.',
          'بما أن $AFE$ قائم في $F$، فمركز الدائرة المارة برؤوسه هو منتصف الوتر $[AE]$.',
          'حسب فيثاغورس: $AE^2 = 3^2 + 4^2 = 25 \\implies AE = 5$، إذن نصف القطر $R = \\frac{5}{2} = 2.5$.',
        ],
        answer: 'المركز منتصف $[AE]$ ونصف القطر $R = 2.5$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-3-2-a',
        question:
          '$ABCD$ رباعي دائري مركز دائرته $O$، نعلم أن $\\widehat{ADC} = 72^\\circ$. احسب قياس الزاوية $\\widehat{ABC}$ (تمرين 16 ص 58).',
        difficulty: 'أساسي',
        hint: 'الزاويتان $\\widehat{ADC}$ و $\\widehat{ABC}$ متقابلتان في رباعي دائري.',
        solution: '$\\widehat{ABC} = 180^\\circ - 72^\\circ = 108^\\circ$.',
      },
      {
        id: 'er-g9-geo-3-2-b',
        question:
          'في الشكل المرسوم (تدرب 3 ص 50)، $(BE)$ و $(DH)$ مماسان للدائرة $\\mathcal{C}(O, 6)$ في $B$ و $D$، و $\\widehat{BOD} = 60^\\circ$. احسب $DH$ وأثبت أن $O, B, E, D$ تقع على دائرة واحدة.',
        difficulty: 'تحدي',
        hint: 'المماس يعامد نصف القطر، إذن $\\widehat{OBE} = \\widehat{ODE} = 90^\\circ$، والمثلث $ODH$ قائم في $D$.',
        solution:
          'في المثلث $ODH$ القائم في $D$: $DH = OD \\tan 60^\\circ = 6\\sqrt{3}$. وبما أن $\\widehat{OBE} + \\widehat{ODE} = 90^\\circ + 90^\\circ = 180^\\circ$، فالرباعي $OBED$ دائري مركز دائرته منتصف $[OE]$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-3-2-a',
        question: 'في رباعي دائري $ABCD$، إذا كان قياس الزاوية $\\hat{A} = 70^\\circ$، فإن قياس الزاوية $\\hat{C}$ المقابلة لها يساوي (ص 49):',
        options: ['$70^\\circ$', '$110^\\circ$', '$20^\\circ$', '$140^\\circ$'],
        correctIndex: 1,
        explanation: 'الزاويتان المتقابلتان في الرباعي الدائري متكاملتان: $180^\\circ - 70^\\circ = 110^\\circ$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-3-3',
    unitId: 'u-g9-geo-3',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 3,
    title: 'المضلّعات المنتظمة',
    pageStart: 51,
    pageEnd: 54,
    durationMinutes: 40,
    objectives: [
      'تعريف المضلع المنتظم ومعرفة أن كل مضلع منتظم قابل للارتسام في دائرة.',
      'حساب قياس الزاوية المركزية والزاوية الداخلية لمضلع منتظم عدد أضلاعه $n$.',
      'حساب طول ضلع المثلث المتساوي الأضلاع والمربع والمسدس المنتظم بدلالة نصف قطر الدائرة المارة برؤوسه.',
    ],
    theory:
      'المضلع المنتظم هو مضلع قياسات زواياه متساوية وأطوال أضلاعه متساوية.\n**خواص:**\n1. كل مضلع منتظم قابل للارتسام في دائرة، ويسمى مركز الدائرة المارة برؤوسه مركز المضلع المنتظم.\n2. إذا كان $[AB]$ ضلعاً في مضلع منتظم مركزه $O$ وعدد أضلاعه $n$، فإن قياس الزاوية المركزية $\\widehat{AOB} = \\frac{360^\\circ}{n}$.\n- في المثلث المتساوي الأضلاع: الزاوية الداخلية $60^\\circ$ والمركزية $120^\\circ$ وطول ضلعه $R\\sqrt{3}$.\n- في المربع: الزاوية الداخلية $90^\\circ$ والمركزية $90^\\circ$ وطول ضلعه $R\\sqrt{2}$.\n- في المسدس المنتظم: الزاوية الداخلية $120^\\circ$ والمركزية $60^\\circ$ وطول ضلعه يساوي نصف القطر $R$.',
    formulas: [
      {
        id: 'f-g9-geo-3-3-a',
        title: 'الزاوية المركزية لمضلع منتظم',
        expression: '\\widehat{AOB} = \\frac{360^\\circ}{n}',
        description: 'حيث $n$ عدد أضلاع المضلع المنتظم.',
      },
      {
        id: 'f-g9-geo-3-3-b',
        title: 'أطوال أضلاع المضلعات الشهيرة بدلالة نصف القطر R',
        expression: 'a_3 = R\\sqrt{3}, \\qquad a_4 = R\\sqrt{2}, \\qquad a_6 = R',
        description: 'على الترتيب للمثلث المتساوي الأضلاع والمربع والمسدس المنتظم.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-3-3-a',
        title: 'حساب زاوية مثمّن منتظم (ص 52)',
        problem: '$ABCDEFGH$ مثمّن منتظم مرسوم في دائرة مركزها $O$. ما قياس الزاوية $\\widehat{ABC}$؟',
        steps: [
          'نحسب الزاوية المركزية: $\\widehat{AOB} = \\frac{360^\\circ}{8} = 45^\\circ$.',
          'في المثلث المتساوي الساقين $OAB$: $\\widehat{ABO} = \\frac{180^\\circ - 45^\\circ}{2} = 67.5^\\circ$.',
          'بالمثل في $OBC$: $\\widehat{CBO} = 67.5^\\circ$. إذن $\\widehat{ABC} = 67.5^\\circ + 67.5^\\circ = 135^\\circ$.',
        ],
        answer: '$\\widehat{ABC} = 135^\\circ$',
      },
      {
        id: 'ex-g9-geo-3-3-b',
        title: 'حساب طول ضلع مثلث متساوي الأضلاع في دائرة (ص 53)',
        problem: 'مثلث متساوي الأضلاع $ABC$ مرسوم في دائرة مركزها $O$ ونصف قطرها $1.4\\text{ cm}$. احسب $AB$.',
        steps: [
          'نرسم ارتفاع $OAH$ على $[AB]$، وبما أن $(OA)$ محور تناظر للزاوية $60^\\circ$ فإن $\\widehat{OAH} = 30^\\circ$.',
          'في المثلث $OAH$ القائم في $H$: $\\cos 30^\\circ = \\frac{AH}{1.4} \\implies AH = 1.4 \\times \\frac{\\sqrt{3}}{2}$.',
          'إذن $AB = 2 AH = 1.4\\sqrt{3}\\text{ cm}$.',
        ],
        answer: '$AB = 1.4\\sqrt{3}\\text{ cm}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-3-3-a',
        question: '$ABCD$ مربع مرسوم في دائرة مركزها $O$ ونصف قطرها $4\\text{ cm}$. احسب طول ضلعه $AB$ ومحيطه ومساحته (تدرب ص 53).',
        difficulty: 'أساسي',
        hint: 'المثلث $OAB$ قائم في $O$ ومتساوي الساقين حيث $OA=OB=4\\text{ cm}$.',
        solution: '$AB = 4\\sqrt{2}\\text{ cm}$، المحيط $= 16\\sqrt{2}\\text{ cm}$، المساحة $= (4\\sqrt{2})^2 = 32\\text{ cm}^2$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-3-3-base',
        question: 'ما طول ضلع مسدس منتظم مرسوم داخل دائرة نصف قطرها $R = 6\\text{ cm}$؟',
        options: ['$3\\text{ cm}$', '$6\\text{ cm}$', '$6\\sqrt{2}\\text{ cm}$', '$6\\sqrt{3}\\text{ cm}$'],
        correctIndex: 1,
        explanation: 'طول ضلع المسدس المنتظم يساوي نصف قطر الدائرة المارة برؤوسه $a_6 = R = 6\\text{ cm}$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-3-ex',
    unitId: 'u-g9-geo-3',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 4,
    isUnitExercises: true,
    title: 'تمرينات الوحدة الثالثة: الزوايا والمضلّعات في الدائرة',
    pageStart: 55,
    pageEnd: 59,
    durationMinutes: 45,
    objectives: [
      'التمرن على حساب الزوايا المحيطية والمركزية والمماسية في الدائرة.',
      'توظيف خواص الرباعي الدائري والمضلعات المنتظمة في مسائل البراهين.',
    ],
    theory:
      'تضم تمرينات الوحدة الثالثة مسائل شاملة عن الزوايا في الدائرة (المحيطية تساوي نصف المركزية المشتركة معها بالقوس، وتساوي المماسية)، وخواص الرباعي الدائري (كل زاويتين متقابلتين متكاملتان)، والمضلعات المنتظمة المرسومة في دائرة.',
    formulas: [
      {
        id: 'f-g9-geo-3-ex-a',
        title: 'خلاصة قوانين الوحدة الثالثة',
        expression: '\\widehat{AMB} = \\frac{1}{2}\\widehat{AOB}, \\qquad \\hat{A}+\\hat{C}=180^\\circ, \\qquad \\alpha_n = \\frac{360^\\circ}{n}',
        description: 'مراجعة سريعة لقوانين الدائرة والرباعي الدائري والمضلعات المنتظمة.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-3-ex-a',
        title: 'مثال من تمرينات الوحدة: محيط مسدس في دائرة (ص 55)',
        problem: 'مسدس منتظم مرسوم في دائرة قطرها $5\\text{ cm}$. احسب محيطه.',
        steps: [
          'نصف قطر الدائرة $R = \\frac{5}{2} = 2.5\\text{ cm}$.',
          'طول ضلع المسدس المنتظم يساوي نصف القطر $a_6 = R = 2.5\\text{ cm}$.',
          'محيط المسدس $= 6 \\times 2.5 = 15\\text{ cm}$.',
        ],
        answer: '$15\\text{ cm}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-3-ex-a',
        question: 'النقطة $O$ مركز مثمّن منتظم أحد أضلاعه $[AB]$. احسب قياس الزاوية المركزية $\\widehat{AOB}$ وقياس الزاوية الداخلية للمثمّن (تمرينات الوحدة ص 54–56).',
        difficulty: 'أساسي',
        hint: 'اقسم $360^\\circ$ على عدد الأضلاع $8$، ثم استنتج الداخلية من المثلث المتساوي الساقين.',
        solution: 'المركزية $\\widehat{AOB} = \\frac{360^\\circ}{8} = 45^\\circ$، والزاوية الداخلية $= 180^\\circ - 45^\\circ = 135^\\circ$.',
      },
      {
        id: 'er-g9-geo-3-ex-b',
        question: '$ABCD$ رباعي دائري فيه $\\hat{A} = 72^\\circ$ و $\\hat{B} = 105^\\circ$. احسب قياسي الزاويتين $\\hat{C}$ و $\\hat{D}$ (تدرب الوحدة ص 57).',
        difficulty: 'أساسي',
        hint: 'كل زاويتين متقابلتين في الرباعي الدائري متكاملتان.',
        solution: '$\\hat{C} = 180^\\circ - 72^\\circ = 108^\\circ$ و $\\hat{D} = 180^\\circ - 105^\\circ = 75^\\circ$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-3-3-a',
        question: 'النقطة $O$ مركز مثمّن منتظم أحد أضلاعه $[AB]$، فقياس الزاوية $\\widehat{AOB}$ يساوي (ص 54):',
        options: ['$30^\\circ$', '$45^\\circ$', '$60^\\circ$', '$90^\\circ$'],
        correctIndex: 1,
        explanation: '$\\frac{360^\\circ}{8} = 45^\\circ$.',
      },
      {
        id: 'q-g9-geo-3-3-b',
        question: 'مسدس منتظم مرسوم في دائرة قطرها $5\\text{ cm}$، محيط هذا المسدس يساوي (ص 55):',
        options: ['$15\\text{ cm}$', '$30\\text{ cm}$', '$10\\text{ cm}$', '$25\\text{ cm}$'],
        correctIndex: 0,
        explanation: 'نصف القطر $R = 2.5\\text{ cm}$ وهو يساوي طول ضلع المسدس، إذن المحيط $= 6 \\times 2.5 = 15\\text{ cm}$.',
      },
    ],
  },

  // ======================== الوحدة الرابعة ========================
  {
    id: 'l-g9-geo-4-1',
    unitId: 'u-g9-geo-4',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 1,
    title: 'تذكرة بالمجسّمات (الموشور والأسطوانة والهرم والمخروط)',
    pageStart: 62,
    pageEnd: 65,
    durationMinutes: 40,
    objectives: [
      'حساب المساحة الجانبية والمساحة الكلية والحجم للموشور القائم والأسطوانة الدورانية.',
      'تطبيق قانون حجم الهرم وحجم المخروط الدوراني $\\mathcal{V} = \\frac{1}{3}\\mathcal{S}h$.',
    ],
    theory:
      '- **الموشور القائم والأسطوانة الدورانية:** المساحة الجانبية = محيط القاعدة × الارتفاع، المساحة الكلية = المساحة الجانبية + ضعفي مساحة القاعدة، والحجم = مساحة القاعدة × الارتفاع.\n- **الهرم والمخروط الدوراني:** حجم الهرم أو المخروط الدوراني يساوي ثلث جداء مساحة القاعدة بالارتفاع.',
    formulas: [
      {
        id: 'f-g9-geo-4-1-a',
        title: 'الموشور والأسطوانة ومتوازي المستطيلات والمكعب',
        expression:
          'S_L = P_{\\text{base}} \\times h, \\quad S_T = S_L + 2\\mathcal{S}, \\quad \\mathcal{V}_{\\text{cyl}} = \\pi r^2 h, \\quad \\mathcal{V}_{\\text{cube}} = x^3',
        description: 'قوانين المساحات والحجوم للمجسمات المنتظمة القائمة.',
      },
      {
        id: 'f-g9-geo-4-1-b',
        title: 'حجم الهرم وحجم المخروط الدوراني',
        expression: '\\mathcal{V} = \\frac{1}{3}\\mathcal{S} h, \\qquad \\mathcal{V}_{\\text{cone}} = \\frac{1}{3}\\pi r^2 h',
        description: 'حيث $\\mathcal{S}$ مساحة القاعدة و $h$ الارتفاع.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-4-1-a',
        title: 'مساحات وحجم أسطوانة دورانية (ص 63)',
        problem: 'أسطوانة دورانية ارتفاعها $40\\text{ cm}$ ونصف قطر قاعدتها $7.5\\text{ cm}$. أوجد مساحتها الجانبية والكلية وحجمها.',
        steps: [
          'المساحة الجانبية: $S_L = 2\\pi \\times 7.5 \\times 40 = 600\\pi\\text{ cm}^2$.',
          'المساحة الكلية: $S_T = 600\\pi + 2\\pi(7.5)^2 = 600\\pi + 112.5\\pi = 712.5\\pi\\text{ cm}^2$.',
          'الحجم: $\\mathcal{V} = \\pi(7.5)^2 \\times 40 = 2250\\pi\\text{ cm}^3$.',
        ],
        answer: '$S_L = 600\\pi\\text{ cm}^2$، $S_T = 712.5\\pi\\text{ cm}^2$، $\\mathcal{V} = 2250\\pi\\text{ cm}^3$',
      },
      {
        id: 'ex-g9-geo-4-1-b',
        title: 'حساب حجم مخروط دوراني (ص 64)',
        problem: 'مخروط دوراني ارتفاعه $h = 4\\text{ cm}$ ونصف قطر قاعدته $r = 1.5\\text{ cm}$. احسب حجمه.',
        steps: [
          '$\\mathcal{V} = \\frac{1}{3}(\\pi r^2)h = \\frac{1}{3}(\\pi \\times 1.5^2) \\times 4 = 3\\pi\\text{ cm}^3$.',
        ],
        answer: '$\\mathcal{V} = 3\\pi\\text{ cm}^3$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-4-1-a',
        question: 'احسب حجم هرم ارتفاعه $15\\text{ cm}$، وقاعدته مربع طول ضلعه $12\\text{ cm}$ (تحقق ص 64).',
        difficulty: 'أساسي',
        hint: 'مساحة القاعدة $\\mathcal{S} = 12^2 = 144\\text{ cm}^2$.',
        solution: '$\\mathcal{V} = \\frac{1}{3} \\times 144 \\times 15 = 720\\text{ cm}^3$.',
      },
      {
        id: 'er-g9-geo-4-1-b',
        question: 'مخروط دوراني ارتفاعه $12\\text{ cm}$ وطول قطر قاعدته $20\\text{ cm}$. احسب مساحة القاعدة والحجم (تحقق ص 64).',
        difficulty: 'أساسي',
        hint: 'نصف القطر $r = 10\\text{ cm}$.',
        solution: 'مساحة القاعدة $\\mathcal{S} = 100\\pi\\text{ cm}^2$، والحجم $\\mathcal{V} = \\frac{1}{3}(100\\pi)(12) = 400\\pi\\text{ cm}^3$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-4-1-a',
        question: 'هرم منتظم ارتفاعه $12\\text{ cm}$ وقاعدته مربع طول ضلعه $8\\text{ cm}$، حجم هذا الهرم يساوي (ص 60):',
        options: ['$256\\text{ cm}^3$', '$220\\text{ cm}^3$', '$1232\\text{ cm}^3$', '$768\\text{ cm}^3$'],
        correctIndex: 0,
        explanation: '$\\mathcal{V} = \\frac{1}{3} \\times 8^2 \\times 12 = 64 \\times 4 = 256\\text{ cm}^3$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-4-2',
    unitId: 'u-g9-geo-4',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 2,
    title: 'الكرة (السطح الكروي والمجسم الكروي)',
    pageStart: 66,
    pageEnd: 69,
    durationMinutes: 35,
    objectives: [
      'التمييز بين السطح الكروي ($OM = R$) والمجسم الكروي ($OM \\le R$).',
      'تعرف الدائرة الكبرى والنقطتين المتقابلتين قطرياً على كرة.',
      'حساب مساحة سطح الكرة وحجم الكرة بدلالة نصف القطر $R$ أو القطر $d$.',
    ],
    theory:
      '- **السطح الكروي** ذو المركز $O$ ونصف القطر $R$ هو مجموعة نقاط الفراغ $M$ التي تحقق $OM = R$.\n- **المجسم الكروي** هو مجموعة نقاط الفراغ التي تحقق $OM \\le R$.\n- **الدائرة الكبرى** هي دائرة واقعة على الكرة وقطرها يساوي قطر الكرة $2R$ (مركزها $O$).',
    formulas: [
      {
        id: 'f-g9-geo-4-2-a',
        title: 'مساحة سطح الكرة وحجمها',
        expression: '\\mathcal{S} = 4\\pi R^2, \\qquad \\mathcal{V} = \\frac{4}{3}\\pi R^3 = \\frac{1}{6}\\pi d^3',
        description: 'حيث $R$ نصف قطر الكرة و $d = 2R$ قطرها.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-4-2-a',
        title: 'حساب مساحة سطح كرة (ص 67)',
        problem: 'كرة قطرها $60\\text{ cm}$. احسب مساحة سطحها بالسنتيمترات المربعة.',
        steps: [
          'نحسب نصف القطر أولاً: $R = \\frac{60}{2} = 30\\text{ cm}$.',
          'نعوض في دستور مساحة السطح: $\\mathcal{S} = 4\\pi \\times 30^2 = 3600\\pi\\text{ cm}^2$.',
        ],
        answer: '$\\mathcal{S} = 3600\\pi\\text{ cm}^2$',
      },
      {
        id: 'ex-g9-geo-4-2-b',
        title: 'حساب حجم الفراغ بين كرتين وعلبة (ص 68)',
        problem: 'علبة متوازي مستطيلات أبعادها $4, 4, 8\\text{ cm}$ تحوي كرتين متساويتين نصف قطر كل منهما $2\\text{ cm}$. احسب حجم الفراغ المحصور.',
        steps: [
          'حجم العلبة: $\\mathcal{V} = 4 \\times 4 \\times 8 = 128\\text{ cm}^3$.',
          'حجم الكرة الواحدة: $\\mathcal{V}\' = \\frac{4}{3}\\pi \\times 2^3 = \\frac{32}{3}\\pi\\text{ cm}^3$.',
          'حجم الفراغ: $\\mathcal{V} - 2\\mathcal{V}\' = \\left(128 - \\frac{64}{3}\\pi\\right)\\text{ cm}^3$.',
        ],
        answer: '$\\left(128 - \\frac{64}{3}\\pi\\right)\\text{ cm}^3$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-4-2-a',
        question: 'احسب مساحة سطح كروي نصف قطره $7.5\\text{ cm}$ (تحقق ص 68).',
        difficulty: 'أساسي',
        hint: 'عوض $R = 7.5$ في $\\mathcal{S} = 4\\pi R^2$.',
        solution: '$\\mathcal{S} = 4\\pi (7.5)^2 = 225\\pi\\text{ cm}^2$.',
      },
      {
        id: 'er-g9-geo-4-2-b',
        question: 'كرة نصف قطرها $R\\text{ cm}$. كم يجب أن تكون قيمة $R$ ليكون العدد الدال على حجمها مساوياً عددياً للعدد الدال على مساحة سطحها (تدرب 6 ص 69)؟',
        difficulty: 'متوسط',
        hint: 'ساوِ $\\frac{4}{3}\\pi R^3 = 4\\pi R^2$ واقسم على $4\\pi R^2$.',
        solution: '$\\frac{1}{3}R = 1 \\implies R = 3\\text{ cm}$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-4-2-a',
        question: 'كرة نصف قطرها $6\\text{ cm}$، حجمها يساوي (ص 78):',
        options: ['$12\\pi\\text{ cm}^3$', '$144\\pi\\text{ cm}^3$', '$288\\pi\\text{ cm}^3$', '$36\\pi\\text{ cm}^3$'],
        correctIndex: 2,
        explanation: '$\\mathcal{V} = \\frac{4}{3}\\pi \\times 6^3 = \\frac{4}{3}\\pi \\times 216 = 288\\pi\\text{ cm}^3$.',
      },
    ],
  },
  {
    id: 'l-g9-geo-4-3',
    unitId: 'u-g9-geo-4',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 3,
    title: 'مقاطع مجسّمات',
    pageStart: 70,
    pageEnd: 77,
    durationMinutes: 45,
    objectives: [
      'تحديد طبيعة مقطع متوازي المستطيلات والأسطوانة الدورانية بمستوٍ موازٍ للقاعدة أو موازٍ للمحور/الحرف.',
      'تحديد مقطع مخروط أو هرم بمستوٍ يوازي القاعدة وحساب نسبة التصغير وحجم جذع الهرم.',
      'حساب نصف قطر مقطع كرة بمستوٍ باستعمال مبرهنة فيثاغورس.',
    ],
    theory:
      '- **متوازي المستطيلات:** مقطعه بمستوٍ يوازي أحد أوجهه هو مستطيل يطابق ذلك الوجه؛ ومقطعه بمستوٍ يوازي أحد أحرفه هو مستطيل أحد بعديه يساوي ذلك الحرف.\n- **الأسطوانة الدورانية:** مقطعها بمستوٍ يوازي قاعدتها (يعامد محورها) هو دائرة تطابق القاعدة؛ ومقطعها بمستوٍ يوازي محورها هو مستطيل أحد بعديه يساوي ارتفاع الأسطوانة.\n- **المخروط والهرم:** مقطعهما بمستوٍ يوازي القاعدة هو تصغير للقاعدة بنسبة $k = \\frac{SI}{SO}$ (دائرة في المخروط، ومضلع مشابه في الهرم)، والجزء المتبقي يسمى **جذع الهرم** أو **جذع المخروط**.\n- **الكرة:** مقطع سطح كروي بمستوٍ يبعد $OI$ عن المركز هو دائرة مركزها $I$ ونصف قطرها يحقق $IJ^2 + OI^2 = R^2$. وإذا مر المستوي بالمركز فالمقطع دائرة كبرى، وإذا مس الكرة فالمقطع نقطة.',
    formulas: [
      {
        id: 'f-g9-geo-4-3-a',
        title: 'نسبة تصغير مقطع الهرم والمخروط',
        expression: 'k = \\frac{SI}{SO} = \\frac{IJ}{OA}, \\qquad \\mathcal{S}\' = k^2\\mathcal{S}, \\qquad \\mathcal{V}\' = k^3\\mathcal{V}',
        description: 'عند قطع هرم أو مخروط بمستوٍ يوازي القاعدة.',
      },
      {
        id: 'f-g9-geo-4-3-b',
        title: 'دستور حجم جذع الهرم ومقطع الكرة',
        expression:
          '\\mathcal{V}_{\\text{جذع}} = \\mathcal{V}_1 - \\mathcal{V}_2 = \\frac{1}{3}h\\left(\\mathcal{S}+\\mathcal{S}\'+\\sqrt{\\mathcal{S}\\cdot\\mathcal{S}\'}\\right), \\qquad IJ^2 + OI^2 = R^2',
        description: 'في الكرة $IJ$ هو نصف قطر دائرة المقطع و $OI$ بعد المستوي عن المركز.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-4-3-a',
        title: 'حساب مساحة مقطع مخروط (ص 74)',
        problem:
          'مخروط دوراني رأسه $S$ وارتفاعه $SO=10\\text{ cm}$ ونصف قطر قاعدته $OM=4\\text{ cm}$. المستوي $(\\mathcal{P})$ المار بالنقطة $A$ من $[SO]$ حيث $SA=6\\text{ cm}$ موازياً القاعدة يقطع المخروط. احسب مساحة المقطع.',
        steps: [
          'نسبة التصغير: $k = \\frac{SA}{SO} = \\frac{6}{10} = 0.6$.',
          'مساحة القاعدة: $\\mathcal{S} = \\pi \\times 4^2 = 16\\pi\\text{ cm}^2$.',
          'مساحة المقطع: $\\mathcal{S}\' = k^2\\mathcal{S} = (0.6)^2 \\times 16\\pi = 5.76\\pi\\text{ cm}^2$.',
        ],
        answer: '$\\mathcal{S}\' = 5.76\\pi\\text{ cm}^2$',
      },
      {
        id: 'ex-g9-geo-4-3-b',
        title: 'حساب حجم جذع هرم (ص 75)',
        problem:
          '$SABCD$ هرم منتظم قاعدته مربع ضلعه $6\\text{ cm}$ وارتفاعه $SO=12\\text{ cm}$. قُطع بمستوٍ موازٍ للقاعدة يمر من $G$ حيث $SG=9\\text{ cm}$. احسب حجم الهرم الأصلي وحجم المصغر وحجم جذع الهرم.',
        steps: [
          'حجم الهرم الأصلي: $\\mathcal{V}_1 = \\frac{1}{3} \\times 6^2 \\times 12 = 144\\text{ cm}^3$.',
          'نسبة التصغير $k = \\frac{9}{12} = \\frac{3}{4}$، إذن $\\mathcal{V}_2 = \\left(\\frac{3}{4}\\right)^3 \\times 144 = 60.75\\text{ cm}^3$.',
          'حجم جذع الهرم: $\\mathcal{V} = 144 - 60.75 = 83.25\\text{ cm}^3$.',
        ],
        answer: '$\\mathcal{V}_1=144\\text{ cm}^3$، $\\mathcal{V}_2=60.75\\text{ cm}^3$، $\\mathcal{V}_{\\text{جذع}}=83.25\\text{ cm}^3$',
      },
      {
        id: 'ex-g9-geo-4-3-c',
        title: 'حساب نصف قطر مقطع كرة (ص 76)',
        problem: 'سطح كروي مركزه $O$ ونصف قطره $3\\text{ cm}$، قُطع بمستوٍ يبعد $OI = 2\\text{ cm}$ عن مركزه. احسب نصف قطر المقطع $IJ$.',
        steps: [
          'حسب مبرهنة فيثاغورس في المثلث $OIJ$ القائم في $I$: $IJ^2 + OI^2 = OJ^2$.',
          '$IJ^2 + 2^2 = 3^2 \\implies IJ^2 = 9 - 4 = 5 \\implies IJ = \\sqrt{5}\\text{ cm}$.',
        ],
        answer: '$IJ = \\sqrt{5}\\text{ cm}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-4-3-a',
        question:
          'مخروط دوراني رأسه $S$ وارتفاعه $20\\text{ cm}$ ونصف قطر قاعدته $16\\text{ cm}$. قُطع بمستوٍ موازٍ للقاعدة يمر بـ $I$ حيث $SI = 14\\text{ cm}$. احسب مساحة المقطع (تحقق 2 ص 76).',
        difficulty: 'متوسط',
        hint: 'نسبة التصغير $k = \\frac{14}{20} = 0.7$.',
        solution: '$\\mathcal{S} = 256\\pi\\text{ cm}^2$، ومنه $\\mathcal{S}\' = (0.7)^2 \\times 256\\pi = 125.44\\pi\\text{ cm}^2$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-4-3-base',
        question: 'مقطع أسطوانة دورانية بمستوٍ يوازي محورها هو:',
        options: ['دائرة', 'مثلث', 'مستطيل', 'قرص'],
        correctIndex: 2,
        explanation: 'القطع الموازي لمحور الأسطوانة الدورانية ينتج مستطيلاً أحد بعديه ارتفاع الأسطوانة.',
      },
    ],
  },
  {
    id: 'l-g9-geo-4-ex',
    unitId: 'u-g9-geo-4',
    bookId: 'book-g9-geo',
    gradeId: 9,
    order: 4,
    isUnitExercises: true,
    title: 'تمرينات الوحدة الرابعة: مجسّمات ومقاطع',
    pageStart: 78,
    pageEnd: 84,
    durationMinutes: 45,
    objectives: [
      'حل مسائل شاملة على حجوم ومساحات الموشور والأسطوانة والهرم والمخروط والكرة.',
      'توظيف مقاطع المجسمات وحجم جذع الهرم والمخروط في مسائل الوحدة الرابعة.',
    ],
    theory:
      'تغطي تمرينات الوحدة الرابعة حساب المساحات الجانبية والكلية والحجوم للمجسمات (الموشور، الأسطوانة، الهرم، المخروط، الكرة)، إضافة إلى حساب مقاطع الهرم والمخروط والكرة وحساب حجم جذع الهرم والمخروط.',
    formulas: [
      {
        id: 'f-g9-geo-4-ex-a',
        title: 'خلاصة حجوم الوحدة الرابعة',
        expression: '\\mathcal{V}_{\\text{هرم/مخروط}}=\\frac{1}{3}\\mathcal{S}\\cdot h, \\qquad \\mathcal{V}_{\\text{كرة}}=\\frac{4}{3}\\pi R^3, \\qquad \\mathcal{S}_{\\text{كرة}}=4\\pi R^2',
        description: 'القوانين الأساسية للمساحات والحجوم في تمرينات الوحدة الرابعة.',
      },
    ],
    examples: [
      {
        id: 'ex-g9-geo-4-ex-a',
        title: 'مثال من تمرينات الوحدة: مقطع كرة (تمرين 20 ص 83)',
        problem:
          'سطح كروي مركزه $O$ ونصف قطره $12\\text{ cm}$، قُطع بمستوٍ $(\\mathcal{P})$ فكان المقطع دائرة نصف قطرها $8\\text{ cm}$. احسب المسافة $OI$ بين المركز والمستوي.',
        steps: [
          'في المثلث القائم $OIJ$: $OI^2 + IJ^2 = OJ^2$.',
          '$OI^2 + 8^2 = 12^2 \\implies OI^2 = 144 - 64 = 80$.',
          'ومنه $OI = \\sqrt{80} = 4\\sqrt{5}\\text{ cm}$.',
        ],
        answer: '$OI = 4\\sqrt{5}\\text{ cm}$',
      },
    ],
    exercises: [
      {
        id: 'er-g9-geo-4-ex-a',
        question:
          'كرة نصف قطرها $R = 3\\text{ cm}$. احسب مساحة سطحها وحجمها بدلالة $\\pi$ (تمرينات الوحدة ص 79).',
        difficulty: 'أساسي',
        hint: 'طبّق $\\mathcal{S}=4\\pi R^2$ و $\\mathcal{V}=\\frac{4}{3}\\pi R^3$.',
        solution: '$\\mathcal{S} = 4\\pi(9) = 36\\pi\\text{ cm}^2$، و $\\mathcal{V} = \\frac{4}{3}\\pi(27) = 36\\pi\\text{ cm}^3$.',
      },
      {
        id: 'er-g9-geo-4-ex-b',
        question:
          'مخروط دوراني ارتفاعه $12\\text{ cm}$ ونصف قطر قاعدته $5\\text{ cm}$. قُطع بمستوٍ يوازي القاعدة على مسافة $6\\text{ cm}$ من الرأس. احسب حجم المخروط المصغر بدلالة $\\pi$ (تمرينات الوحدة ص 82).',
        difficulty: 'متوسط',
        hint: 'نسبة التصغير $k = \\frac{6}{12} = \\frac{1}{2}$ والحجم يضرب بـ $k^3$.',
        solution: '$\\mathcal{V} = \\frac{1}{3}\\pi(25)(12) = 100\\pi\\text{ cm}^3$، ومنه $\\mathcal{V}\' = (\\frac{1}{2})^3 \\times 100\\pi = 12.5\\pi\\text{ cm}^3$.',
      },
    ],
    quiz: [
      {
        id: 'q-g9-geo-4-3-a',
        question: 'مخروط دوراني نصف قطر قاعدته $OM=20\\text{ cm}$ وارتفاعه $OS=48\\text{ cm}$. قُطع بمستوٍ يوازي القاعدة في $J$ بحيث $SJ=36\\text{ cm}$. نصف قطر دائرة المقطع يساوي (ص 78):',
        options: ['$20\\text{ cm}$', '$15\\text{ cm}$', '$10\\text{ cm}$', '$12\\text{ cm}$'],
        correctIndex: 1,
        explanation: 'نسبة التصغير $k = \\frac{36}{48} = \\frac{3}{4}$، إذن نصف قطر المقطع $= \\frac{3}{4} \\times 20 = 15\\text{ cm}$.',
      },
      {
        id: 'q-g9-geo-4-3-b',
        question: 'كرة مركزها $O$ وقطرها $8\\text{ cm}$. مقطع هذه الكرة بمستوٍ يبعد عن $O$ بمقدار $4\\text{ cm}$ هو (ص 78):',
        options: ['دائرة نصف قطرها $3\\text{ cm}$', 'قرص دائري نصف قطره $3\\text{ cm}$', 'نقطة', 'دائرة كبرى'],
        correctIndex: 2,
        explanation: 'نصف القطر $R = 4\\text{ cm}$ يساوي بعد المستوي عن المركز $4\\text{ cm}$، إذن المستوي يمس الكرة والمقطع نقطة.',
      },
    ],
  },
];
