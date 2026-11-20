import { CurriculumBook, GradeInfo, Lesson, Unit } from '../src/types';
import {
  GRADE7_MATH_BOOK,
  GRADE7_MATH_LESSONS,
  GRADE7_MATH_UNITS,
} from './curriculum/grade7Math';
import {
  GRADE8_ALGEBRA_BOOK,
  GRADE8_ALGEBRA_LESSONS,
  GRADE8_ALGEBRA_UNITS,
} from './curriculum/grade8Algebra';
import {
  GRADE8_GEOMETRY_BOOK,
  GRADE8_GEOMETRY_LESSONS,
  GRADE8_GEOMETRY_UNITS,
} from './curriculum/grade8Geometry';
import {
  GRADE9_ALGEBRA_BOOK,
  GRADE9_ALGEBRA_LESSONS,
  GRADE9_ALGEBRA_UNITS,
} from './curriculum/grade9Algebra';
import {
  GRADE9_GEOMETRY_BOOK,
  GRADE9_GEOMETRY_LESSONS,
  GRADE9_GEOMETRY_UNITS,
} from './curriculum/grade9Geometry';

export const SYRIAN_GRADES: GradeInfo[] = [
  { id: 1, name: 'الصف الأول الأساسي', shortName: 'الأول', stage: 'الابتدائية', description: 'مبادئ الأعداد، الجمع والطرح حتى 99، والأشكال الهندسية البسيطة.' },
  { id: 2, name: 'الصف الثاني الأساسي', shortName: 'الثاني', stage: 'الابتدائية', description: 'الأعداد حتى 999، جداول الضرب، والقياس الهندسي.' },
  { id: 3, name: 'الصف الثالث الأساسي', shortName: 'الثالث', stage: 'الابتدائية', description: 'الأعداد حتى 9999، القسمة، الكسور البسيطة، والمحيط.' },
  { id: 4, name: 'الصف الرابع الأساسي', shortName: 'الرابع', stage: 'الابتدائية', description: 'الأعداد الكبيرة، الكسور العشرية، الزوايا والمستقيمات.' },
  { id: 5, name: 'الصف الخامس الأساسي', shortName: 'الخامس', stage: 'الابتدائية', description: 'القواسم والمضاعفات، النسبة والتناسب، ومساحات المضلعات.' },
  { id: 6, name: 'الصف السادس الأساسي', shortName: 'السادس', stage: 'الابتدائية', description: 'الأعداد الصحيحة، النسبة المئوية، الدائرة وحجم المجسمات.' },
  { id: 7, name: 'الصف السابع الأساسي', shortName: 'السابع', stage: 'الإعدادية', description: 'الأعداد النسبية، المعادلات من الدرجة الأولى، والتناظر.' },
  { id: 8, name: 'الصف الثامن الأساسي', shortName: 'الثامن', stage: 'الإعدادية', description: 'النشر والتحليل، القوى الصحيحة، ومبرهنة فيثاغورس.' },
  { id: 9, name: 'الصف التاسع الأساسي (الشهادة)', shortName: 'التاسع', stage: 'الإعدادية', description: 'الجذور التربيعية، جمل المعادلات، مبرهنة تالس، والنسب المثلثية.' },
  { id: 10, name: 'الصف الأول الثانوي', shortName: 'الأول الثانوي', stage: 'الثانوية', description: 'المجموعات والفترات، التوابع المرجعية، والهندسة التحليلية.' },
  { id: 11, name: 'الصف الثاني الثانوي العلمي', shortName: 'الثاني الثانوي', stage: 'الثانوية', description: 'النهايات والاشتقاق، المتتاليات، والجداء السلمي في المستوي.' },
  { id: 12, name: 'الصف الثالث الثانوي العلمي (البكالوريا)', shortName: 'البكالوريا', stage: 'الثانوية', description: 'التحليل الرياضي، الأعداد العقدية، المصفوفات، والهندسة الفراغية.' },
];

export const SEED_BOOKS: CurriculumBook[] = [
  {
    id: 'book-g1',
    gradeId: 1,
    title: 'الرياضيات - الصف الأول الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 148,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'يتناول مفاهيم العد والجمع والطرح ضمن منزلتين ومبادئ القياس والأشكال الهندسية.',
  },
  {
    id: 'book-g2',
    gradeId: 2,
    title: 'الرياضيات - الصف الثاني الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 162,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'يركز على الأعداد ضمن ثلاث منازل، مفهوم الضرب، وجداول الضرب الأساسية.',
  },
  {
    id: 'book-g3',
    gradeId: 3,
    title: 'الرياضيات - الصف الثالث الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 176,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'يشمل القسمة الإقليدية البسيطة، الكسور الأساسية، وحساب المحيط.',
  },
  {
    id: 'book-g4',
    gradeId: 4,
    title: 'الرياضيات - الصف الرابع الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 184,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'الأعداد الطبيعية الكبيرة، الكسور العشرية، والزوايا الهندسية.',
  },
  {
    id: 'book-g5',
    gradeId: 5,
    title: 'الرياضيات - الصف الخامس الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 192,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'قابلية القسمة، القاسم المشترك الأكبر، النسبة والتناسب، ومساحات الأشكال.',
  },
  {
    id: 'book-g6',
    gradeId: 6,
    title: 'الرياضيات - الصف السادس الأساسي',
    part: 'كتاب التلميذ',
    author: 'المركز الوطني لتطوير المناهج التربوية - سوريا',
    year: '2025 - 2026',
    pageCount: 204,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'مجموعة الأعداد الصحيحة، النسبة المئوية، محيط الدائرة ومساحتها، والحجوم.',
  },
  GRADE7_MATH_BOOK,
  GRADE8_ALGEBRA_BOOK,
  GRADE8_GEOMETRY_BOOK,
  GRADE9_ALGEBRA_BOOK,
  GRADE9_GEOMETRY_BOOK,
  {
    id: 'book-g10',
    gradeId: 10,
    title: 'الرياضيات - الصف الأول الثانوي',
    part: 'الجزء الأول والثاني',
    author: 'وزارة التربية - الجمهورية العربية السورية',
    year: '2025 - 2026',
    pageCount: 256,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'الأعداد والفترات الحقيقية، التوابع المرجعية، معادلة المستقيم، والأشعة في المستوي.',
  },
  {
    id: 'book-g11',
    gradeId: 11,
    title: 'الرياضيات - الصف الثاني الثانوي العلمي',
    part: 'التحليل والجبر والهندسة',
    author: 'وزارة التربية - الجمهورية العربية السورية',
    year: '2025 - 2026',
    pageCount: 288,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'النهايات والاشتقاق، دراسة التغيرات، المتتاليات الحسابية والهندسية، والجداء السلمي.',
  },
  {
    id: 'book-g12-analysis',
    gradeId: 12,
    title: 'التحليل الرياضي - الثالث الثانوي العلمي',
    part: 'الجزء الأول',
    author: 'وزارة التربية - الجمهورية العربية السورية',
    year: '2025 - 2026',
    pageCount: 274,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'النهايات والاستمرار، الاشتقاق وتطبيقاته، التابع اللوغاريتمي والتابع الأسي، والتكامل.',
  },
  {
    id: 'book-g12-algebra',
    gradeId: 12,
    title: 'الجبر والهندسة التحليلية - الثالث الثانوي العلمي',
    part: 'الجزء الثاني',
    author: 'وزارة التربية - الجمهورية العربية السورية',
    year: '2025 - 2026',
    pageCount: 248,
    coverUrl: '/src/assets/images/book_cover_syrian_math_1795101193959.jpg',
    isIndexed: true,
    indexedAt: '2026-09-01T08:00:00.000Z',
    summary: 'الأعداد العقدية، المتتاليات والإثبات بالتدريج، المصفوفات وجمل المعادلات، والهندسة الفراغية.',
  },
];

export const SEED_UNITS: Unit[] = [
  { id: 'u-g1-1', bookId: 'book-g1', gradeId: 1, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الأعداد من 0 إلى 20 والجمع البسيط', description: 'التعرف على الأعداد ومقارنتها وجمعها ذهنياً.', pageStart: 8, pageEnd: 46 },
  { id: 'u-g2-1', bookId: 'book-g2', gradeId: 2, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الأعداد حتى 999 وجداول الضرب', description: 'القيمة المكانية للآحاد والعشرات والمئات ومفهوم الضرب.', pageStart: 10, pageEnd: 58 },
  { id: 'u-g3-1', bookId: 'book-g3', gradeId: 3, order: 1, chapterLabel: 'الوحدة الأولى', title: 'القسمة والكسور الأساسية', description: 'ربط القسمة بالضرب وفهم الكسور كأجزاء من الواحد الصحيح.', pageStart: 12, pageEnd: 64 },
  { id: 'u-g4-1', bookId: 'book-g4', gradeId: 4, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الكسور العشرية والعمليات عليها', description: 'الفاصلة العشرية وجمع وطرح الكسور العشرية.', pageStart: 10, pageEnd: 54 },
  { id: 'u-g5-1', bookId: 'book-g5', gradeId: 5, order: 1, chapterLabel: 'الوحدة الأولى', title: 'القاسم المشترك الأكبر والنسبة والتناسب', description: 'تحليل الأعداد إلى عواملها الأولية وحل مسائل التناسب.', pageStart: 12, pageEnd: 68 },
  { id: 'u-g6-1', bookId: 'book-g6', gradeId: 6, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الأعداد الصحيحة والنسبة المئوية', description: 'العمليات على الأعداد السالبة والموجبة وتطبيقات النسبة المئوية.', pageStart: 8, pageEnd: 62 },
  // Grade 7
  ...GRADE7_MATH_UNITS,
  // Grade 8
  ...GRADE8_ALGEBRA_UNITS,
  ...GRADE8_GEOMETRY_UNITS,

  // Grade 9
  ...GRADE9_ALGEBRA_UNITS,
  ...GRADE9_GEOMETRY_UNITS,

  // Grade 10
  { id: 'u-g10-1', bookId: 'book-g10', gradeId: 10, order: 1, chapterLabel: 'الوحدة الأولى', title: 'التوابع المرجعية والمعادلات من الدرجة الثانية', description: 'دراسة المميز دلتا وإشارة ثلاثي الحدود والقطع المكافئ.', pageStart: 12, pageEnd: 78 },

  // Grade 11
  { id: 'u-g11-1', bookId: 'book-g11', gradeId: 11, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الاشتقاق وتطبيقاته الهندسية', description: 'العدد المشتق، معادلة المماس، ودراسة اطراد التوابع.', pageStart: 16, pageEnd: 84 },
  { id: 'u-g11-2', bookId: 'book-g11', gradeId: 11, order: 2, chapterLabel: 'الوحدة الثانية', title: 'المتتاليات العددية والجداء السلمي', description: 'المتتالية الحسابية والهندسية وحساب الزوايا والأطوال بالجداء السلمي.', pageStart: 85, pageEnd: 152 },

  // Grade 12 (Baccalaureate)
  { id: 'u-g12-ana-1', bookId: 'book-g12-analysis', gradeId: 12, order: 1, chapterLabel: 'الوحدة الأولى', title: 'النهايات والاستمرار', description: 'نهايات التوابع عند اللانهاية وعند نقطة، حالات عدم التعيين، والمستقيمات المقاربة.', pageStart: 10, pageEnd: 66 },
  { id: 'u-g12-ana-2', bookId: 'book-g12-analysis', gradeId: 12, order: 2, chapterLabel: 'الوحدة الثانية', title: 'الاشتقاق والتوابع الأسية واللوغاريتمية', description: 'دراسة التابع اللوغاريتمي النيبيري والتابع الأسي وحساب التكامل.', pageStart: 67, pageEnd: 164 },
  { id: 'u-g12-alg-1', bookId: 'book-g12-algebra', gradeId: 12, order: 1, chapterLabel: 'الوحدة الأولى', title: 'الأعداد العقدية والمصفوفات', description: 'الأشكال الجبرية والمثلثية والأسية للأعداد العقدية، والمصفوفات وحل الجمل الخطية.', pageStart: 8, pageEnd: 94 },
  { id: 'u-g12-alg-2', bookId: 'book-g12-algebra', gradeId: 12, order: 2, chapterLabel: 'الوحدة الثانية', title: 'الهندسة في الفضاء', description: 'الجداء السلمي في الفضاء، معادلة المستوي، وتمثيل المستقيم في الفضاء.', pageStart: 95, pageEnd: 170 },
];

export const SEED_LESSONS: Lesson[] = [
  {
    id: 'l-g1-1',
    unitId: 'u-g1-1',
    bookId: 'book-g1',
    gradeId: 1,
    order: 1,
    title: 'الجمع ضمن العدد 20 باستخدام خط الأعداد',
    pageStart: 14,
    pageEnd: 19,
    durationMinutes: 20,
    objectives: [
      'قراءة وكتابة الأعداد من 0 إلى 20 بدقة.',
      'تمثيل عملية الجمع بالقفز للأمام على خط الأعداد.',
      'حل مسائل لفظية حياتية بسيطة على الجمع.'
    ],
    theory: 'الجمع يعني ضم مجموعتين معاً للحصول على المجموع الكلي. عند الجمع على خط الأعداد، نبدأ من العدد الأكبر ثم نقفز إلى اليمين بمقدار العدد الثاني.',
    formulas: [
      { id: 'f-g1-1', title: 'خاصية التبديل في الجمع', expression: 'a + b = b + a', description: 'تغيير ترتيب العددين المجموعين لا يغير الناتج.' }
    ],
    examples: [
      {
        id: 'ex-g1-1',
        title: 'حساب 8 + 5',
        problem: 'أوجد ناتج جمع $8 + 5$ باستخدام خط الأعداد.',
        steps: ['نقف عند العدد $8$ على خط الأعداد.', 'نقفز $5$ خطوات نحو اليمين: $9، 10، 11، 12، 13$.'],
        answer: '$8 + 5 = 13$'
      }
    ],
    exercises: [
      { id: 'er-g1-1', question: 'احسب ناتج: $9 + 7$', difficulty: 'أساسي', hint: 'أكمل العشرة: $9 + 1 = 10$ ثم أضف $6$.', solution: '$9 + 7 = 16$' },
      { id: 'er-g1-2', question: 'مع سارة $6$ أقلام وأعطاها أخوها $8$ أقلام، كم قلماً أصبح معها؟', difficulty: 'متوسط', hint: 'اجمع العددين $6 + 8$.', solution: '$6 + 8 = 14$ قلماً' }
    ],
    quiz: [
      { id: 'q-g1-1', question: 'ما ناتج $7 + 8$؟', options: ['14', '15', '16', '13'], correctIndex: 1, explanation: '$7 + 3 = 10$ ويتبقى $5$ ليصبح الناتج $15$.' }
    ]
  },
  {
    id: 'l-g2-1',
    unitId: 'u-g2-1',
    bookId: 'book-g2',
    gradeId: 2,
    order: 1,
    title: 'مفهوم الضرب كجمع متكرر',
    pageStart: 22,
    pageEnd: 29,
    durationMinutes: 25,
    objectives: ['فهم الضرب على أنه جمع متكرر لمجموعات متساوية.', 'كتابة جملة الضرب الموافقة لعملية جمع متكرر.'],
    theory: 'عندما تتكرر نفس الكمية عدة مرات، نستخدم عملية الضرب اختصاراً للجمع المتكرر.',
    formulas: [
      { id: 'f-g2-1', title: 'تعريف الضرب', expression: '3 \\times 4 = 4 + 4 + 4 = 12', description: 'ثلاث مجموعات في كل منها 4 عناصر.' }
    ],
    examples: [
      { id: 'ex-g2-1', title: 'تحويل الجمع إلى ضرب', problem: 'عبر عن $5 + 5 + 5 + 5$ بعملية ضرب.', steps: ['العدد $5$ تكرر $4$ مرات.', 'نكتب $4 \\times 5$.'], answer: '$4 \\times 5 = 20$' }
    ],
    exercises: [
      { id: 'er-g2-1', question: 'أوجد ناتج $6 \\times 3$.', difficulty: 'أساسي', hint: 'اجمع العدد 3 ست مرات أو 6 ثلاث مرات.', solution: '$6 \\times 3 = 18$' }
    ],
    quiz: [
      { id: 'q-g2-1', question: 'أي مما يلي يعادل $7 + 7 + 7$؟', options: ['$7 \\times 2$', '$3 \\times 7$', '$7 + 3$', '$4 \\times 7$'], correctIndex: 1, explanation: 'العدد 7 مكرر 3 مرات، أي $3 \\times 7 = 21$.' }
    ]
  },
  {
    id: 'l-g3-1',
    unitId: 'u-g3-1',
    bookId: 'book-g3',
    gradeId: 3,
    order: 1,
    title: 'الكسور البسيطة وتمثيلها',
    pageStart: 30,
    pageEnd: 37,
    durationMinutes: 25,
    objectives: ['تمييز البسط والمقام في الكسر.', 'قراءة الكسور البسيطة وتمثيلها بالأشكال.'],
    theory: 'الكسر يعبر عن جزء من كل مقسم إلى أجزاء متساوية. العدد العلوي يسمى البسط والعدد السفلي يسمى المقام.',
    formulas: [
      { id: 'f-g3-1', title: 'صيغة الكسر', expression: '\\frac{\\text{البسط}}{\\text{المقام}}', description: 'المقام لا يساوي الصفر أبداً.' }
    ],
    examples: [
      { id: 'ex-g3-1', title: 'قراءة كسر', problem: 'قسمت فطيرة إلى 4 أقسام متساوية وأكلنا قسماً واحداً. ما الكسر الدال على الجزء المأكول؟', steps: ['عدد الأجزاء الكلي هو 4 (المقام).', 'عدد الأجزاء المأكولة هو 1 (البسط).'], answer: '$\\frac{1}{4}$' }
    ],
    exercises: [
      { id: 'er-g3-1', question: 'ما الكسر الذي يمثل 3 أجزاء من 8 أجزاء متساوية؟', difficulty: 'أساسي', hint: 'ضع 3 في البسط و8 في المقام.', solution: '$\\frac{3}{8}$' }
    ],
    quiz: [
      { id: 'q-g3-1', question: 'في الكسر $\\frac{5}{9}$، ما هو المقام؟', options: ['5', '9', '14', '4'], correctIndex: 1, explanation: 'المقام هو العدد الموجود أسفل خط الكسر، وهو 9.' }
    ]
  },
  {
    id: 'l-g4-1',
    unitId: 'u-g4-1',
    bookId: 'book-g4',
    gradeId: 4,
    order: 1,
    title: 'جمع وطرح الأعداد العشرية',
    pageStart: 18,
    pageEnd: 25,
    durationMinutes: 30,
    objectives: ['ترتيب الفاصلة العشرية والمنازل عمودياً.', 'إجراء عمليتي الجمع والطرح على الأعداد العشرية.'],
    theory: 'لجمع أو طرح عددين عشريين عمودياً، نضع الفاصلة العشرية تحت الفاصلة العشرية، ونملأ المنازل الخالية بأصفار إذا لزم الأمر.',
    formulas: [
      { id: 'f-g4-1', title: 'توازن الأجزاء العشرية', expression: '3.5 = 3.50 = 3.500', description: 'إضافة أصفار على يمين الجزء العشري لا تغير قيمة العدد.' }
    ],
    examples: [
      { id: 'ex-g4-1', title: 'جمع عددين عشريين', problem: 'احسب $12.45 + 3.8$.', steps: ['نكتب $3.8$ على الشكل $3.80$.', 'نرتب الفواصل عمودياً ونجمع.'], answer: '$16.25$' }
    ],
    exercises: [
      { id: 'er-g4-1', question: 'احسب ناتج $9.4 - 2.15$.', difficulty: 'متوسط', hint: 'اكتب $9.4$ كـ $9.40$ ثم اطرح.', solution: '$7.25$' }
    ],
    quiz: [
      { id: 'q-g4-1', question: 'ما ناتج $4.2 + 1.35$؟', options: ['5.37', '5.55', '5.35', '4.55'], correctIndex: 1, explanation: '$4.20 + 1.35 = 5.55$.' }
    ]
  },
  {
    id: 'l-g5-1',
    unitId: 'u-g5-1',
    bookId: 'book-g5',
    gradeId: 5,
    order: 1,
    title: 'النسبة والتناسب والرابع المتناسب',
    pageStart: 36,
    pageEnd: 44,
    durationMinutes: 30,
    objectives: ['حساب الرابع المتناسب باستخدام الضرب التقاطعي.', 'تطبيق التناسب في مسائل الأسعار والمسافات.'],
    theory: 'التناسب هو تساوي نسبتين. في أي تناسب، جداء الطرفين يساوي جداء الوسطين.',
    formulas: [
      { id: 'f-g5-1', title: 'الخاصية الأساسية للتناسب', expression: '\\frac{a}{b} = \\frac{c}{d} \\iff a \\cdot d = b \\cdot c', description: 'جداء الطرفين يساوي جداء الوسطين.' }
    ],
    examples: [
      { id: 'ex-g5-1', title: 'إيجاد الرابع المتناسب', problem: 'إذا كان ثمن 3 دفاتر 6000 ليرة، فما ثمن 5 دفاتر؟', steps: ['نكون التناسب: $\\frac{3}{6000} = \\frac{5}{x}$.', 'نحسب $x = \\frac{5 \\times 6000}{3}$.'], answer: '$10000$ ليرة' }
    ],
    exercises: [
      { id: 'er-g5-1', question: 'أوجد قيمة $x$ في التناسب: $\\frac{4}{7} = \\frac{12}{x}$.', difficulty: 'أساسي', hint: 'اضرب 7 في 12 واقسم على 4.', solution: '$x = 21$' }
    ],
    quiz: [
      { id: 'q-g5-1', question: 'ما قيمة $x$ إذا كان $\\frac{2}{5} = \\frac{x}{15}$؟', options: ['5', '6', '8', '10'], correctIndex: 1, explanation: '$x = \\frac{2 \\times 15}{5} = 6$.' }
    ]
  },
  {
    id: 'l-g6-1',
    unitId: 'u-g6-1',
    bookId: 'book-g6',
    gradeId: 6,
    order: 1,
    title: 'النسبة المئوية وتطبيقاتها',
    pageStart: 28,
    pageEnd: 35,
    durationMinutes: 30,
    objectives: ['تحويل الكسور والأعداد العشرية إلى نسب مئوية.', 'حساب قيمة التخفيض والزيادة المئوية.'],
    theory: 'النسبة المئوية هي نسبة مقامها 100 ويرمز لها بالرمز (%).',
    formulas: [
      { id: 'f-g6-1', title: 'حساب قيمة نسبة مئوية', expression: '\\text{القيمة} = \\text{العدد الكلي} \\times \\frac{p}{100}', description: 'لحساب p% من مقدار معين.' }
    ],
    examples: [
      { id: 'ex-g6-1', title: 'تخفيض سعر', problem: 'حقيبة سعرها $40000$ ليرة خفض سعرها بنسبة $20\\%$. ما السعر الجديد؟', steps: ['مقدار التخفيض: $40000 \\times \\frac{20}{100} = 8000$.', 'السعر الجديد: $40000 - 8000$.'], answer: '$32000$ ليرة' }
    ],
    exercises: [
      { id: 'er-g6-1', question: 'كم يساوي $25\\%$ من العدد $160$؟', difficulty: 'أساسي', hint: '$25\\%$ تعني الربع $\\frac{1}{4}$.', solution: '$40$' }
    ],
    quiz: [
      { id: 'q-g6-1', question: 'العدد العشري $0.45$ يكتب كنسبة مئوية:', options: ['4.5%', '45%', '0.45%', '450%'], correctIndex: 1, explanation: '$0.45 = \\frac{45}{100} = 45\\%$.' }
    ]
  },
  // Grade 7 Lessons
  ...GRADE7_MATH_LESSONS,
  // Grade 8 Lessons
  ...GRADE8_ALGEBRA_LESSONS,
  ...GRADE8_GEOMETRY_LESSONS,

  // Grade 9 Lessons
  ...GRADE9_ALGEBRA_LESSONS,
  ...GRADE9_GEOMETRY_LESSONS,

  // Grade 10
  {
    id: 'l-g10-1',
    unitId: 'u-g10-1',
    bookId: 'book-g10',
    gradeId: 10,
    order: 1,
    title: 'المعادلات والمتراجحات من الدرجة الثانية',
    pageStart: 24,
    pageEnd: 42,
    durationMinutes: 45,
    objectives: ['حساب المميز دلتا ومناقشة عدد الحلول.', 'تحليل ثلاثي الحدود ودراسة إشارته على $\\mathbb{R}$.'],
    theory: 'لحل المعادلة $ax^2 + bx + c = 0$ ($a \\neq 0$) نحسب المميز $\\Delta = b^2 - 4ac$. تحدد إشارة $\\Delta$ عدد الجذور الحقيقية وموقع إشارة ثلاثي الحدود.',
    formulas: [
      { id: 'f-g10-1', title: 'المميز والجذور', expression: '\\Delta = b^2 - 4ac, \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}', description: 'عندما $\\Delta \\ge 0$.' }
    ],
    examples: [
      {
        id: 'ex-g10-1',
        title: 'حل معادلة تربيعية',
        problem: 'حل في $\\mathbb{R}$ المعادلة: $x^2 - 5x + 6 = 0$.',
        steps: ['$\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1 > 0$.', '$x_1 = \\frac{5 - 1}{2} = 2$، $x_2 = \\frac{5 + 1}{2} = 3$.'],
        answer: '$S = \\{2, 3\\}$'
      }
    ],
    exercises: [
      { id: 'er-g10-1', question: 'ادرس إشارة ثلاثي الحدود $P(x) = x^2 - 4x + 3$ وحل المتراجحة $P(x) \\le 0$.', difficulty: 'متوسط', hint: 'الجذران هما 1 و 3، وبين الجذرين الإشارة مخالفة لإشارة $a$.', solution: '$x \\in [1, 3]$' }
    ],
    quiz: [
      { id: 'q-g10-1', question: 'إذا كان $\\Delta = 0$ للمعادلة $ax^2 + bx + c = 0$ فإن للمعادلة:', options: ['جذران مختلفان', 'جذر حقيقي مضاعف', 'لا توجد جذور حقيقية', 'حلان عقديان'], correctIndex: 1, explanation: 'عندما ينعدم المميز يكون الجذر المضاعف $x_0 = -\\frac{b}{2a}$.' }
    ]
  },

  // Grade 11
  {
    id: 'l-g11-1',
    unitId: 'u-g11-1',
    bookId: 'book-g11',
    gradeId: 11,
    order: 1,
    title: 'مفهوم الاشتقاق ومعادلة المماس',
    pageStart: 22,
    pageEnd: 38,
    durationMinutes: 50,
    objectives: ['حساب العدد المشتق لتابع عند نقطة.', 'كتابة معادلة المماس للخط البياني عند فاصلة معلومة.', 'الربط بين إشارة المشتق واطراد التابع.'],
    theory: 'يمثل العدد المشتق $f\'(a)$ ميل المماس للخط البياني للتابع $f$ عند النقطة $(a, f(a))$. إذا كان $f\'(x) > 0$ على مجال كان التابع متزايداً تماماً عليه.',
    formulas: [
      { id: 'f-g11-1', title: 'معادلة المماس', expression: 'y = f\'(a)(x - a) + f(a)', description: 'معادلة المماس عند النقطة ذات الفاصلة $a$.' },
      { id: 'f-g11-2', title: 'مشتق القوة', expression: '(x^n)\' = n x^{n-1}', description: 'قاعدة اشتقاق التوابع الصحيحة.' }
    ],
    examples: [
      {
        id: 'ex-g11-1',
        title: 'إيجاد معادلة مماس',
        problem: 'ليكن $f(x) = x^2 - 3x + 2$. أوجد معادلة المماس عند $a = 2$.',
        steps: ['$f(2) = 4 - 6 + 2 = 0$.', '$f\'(x) = 2x - 3 \\implies f\'(2) = 1$.', 'نعوض: $y = 1(x - 2) + 0$.'],
        answer: '$y = x - 2$'
      }
    ],
    exercises: [
      { id: 'er-g11-1', question: 'ادرس تغيرات التابع $f(x) = x^3 - 3x$ وأوجد قيمه الحدية.', difficulty: 'تحدي', hint: 'أوجد $f\'(x) = 3x^2 - 3$ وادرس إشارته.', solution: 'قيمة كبرى محلية عند $x=-1$ وهي $2$، وصغرى محلية عند $x=1$ وهي $-2$.' }
    ],
    quiz: [
      { id: 'q-g11-1', question: 'ما ميل المماس للمنحني $f(x) = x^3$ عند النقطة ذات الفاصلة $x = 2$؟', options: ['6', '8', '12', '4'], correctIndex: 2, explanation: '$f\'(x) = 3x^2 \\implies f\'(2) = 3(4) = 12$.' }
    ]
  },
  {
    id: 'l-g11-2',
    unitId: 'u-g11-2',
    bookId: 'book-g11',
    gradeId: 11,
    order: 2,
    title: 'المتتاليات الحسابية والهندسية',
    pageStart: 88,
    pageEnd: 108,
    durationMinutes: 45,
    objectives: ['كتابة الحد العام للمتتالية الحسابية والهندسية.', 'حساب مجموع $n$ حداً متعاقباً.'],
    theory: 'في المتتالية الحسابية ينتج كل حد بإضافة أساس ثابت $r$ إلى الحد السابق، بينما في المتتالية الهندسية ينتج كل حد بضرب الحد السابق بأساس ثابت $q$.',
    formulas: [
      { id: 'f-g11-3', title: 'الحد العام للمتتالية الحسابية', expression: 'u_n = u_0 + n \\cdot r', description: 'وللمجموع: $S = \\frac{n}{2}(u_{\\text{first}} + u_{\\text{last}})$.' },
      { id: 'f-g11-4', title: 'الحد العام للمتتالية الهندسية', expression: 'v_n = v_0 \\cdot q^n', description: 'حيث $q$ أساس المتتالية الهندسية.' }
    ],
    examples: [
      {
        id: 'ex-g11-2',
        title: 'مجموع حدود حسابية',
        problem: 'متتالية حسابية حدها الأول $u_1 = 3$ وأساسها $r = 4$. احسب $u_{10}$.',
        steps: ['$u_n = u_1 + (n - 1)r$.', '$u_{10} = 3 + 9 \\times 4 = 39$.'],
        answer: '$u_{10} = 39$'
      }
    ],
    exercises: [
      { id: 'er-g11-2', question: 'أثبت أن المتتالية $v_n = 2 \\cdot 3^n$ هندسية وحدد أساسها.', difficulty: 'أساسي', hint: 'احسب النسبة $\\frac{v_{n+1}}{v_n}$.', solution: '$\\frac{v_{n+1}}{v_n} = 3$ ثابت، إذن هي هندسية أساسها $q = 3$.' }
    ],
    quiz: [
      { id: 'q-g11-2', question: 'إذا كانت $(u_n)$ متتالية هندسية حدها الأول $2$ وأساسها $3$، فما قيمة $u_2$ (بفرض البدء من $u_0$)؟', options: ['6', '12', '18', '54'], correctIndex: 2, explanation: '$u_2 = u_0 \\cdot q^2 = 2 \\times 3^2 = 18$.' }
    ]
  },

  // Grade 12 (Syrian Baccalaureate - Scientific)
  {
    id: 'l-g12-1',
    unitId: 'u-g12-ana-1',
    bookId: 'book-g12-analysis',
    gradeId: 12,
    order: 1,
    title: 'نهايات التوابع والمقاربات وحالات عدم التعيين',
    pageStart: 12,
    pageEnd: 34,
    durationMinutes: 50,
    objectives: [
      'تعيين نهايات التوابع الكسرية والجذرية عند $\\pm\\infty$ وعند أطراف مجموعة التعريف.',
      'إزالة حالات عدم التعيين ($\\frac{0}{0}$، $\\frac{\\infty}{\\infty}$، $\\infty - \\infty$) بالتحليل والمرافق والإحاطة.',
      'استنتاج معادلات المستقيمات المقاربة الأفقية والشاقولية والمائلة.'
    ],
    theory: 'تُعد دراسة النهايات حجر الأساس في التحليل الرياضي لمنهاج البكالوريا السوري. عند ظهور حالة عدم تعيين نلجأ إلى إخراج العامل المشترك الأكبر، الضرب بالمرافق، أو مبرهنات المقارنة والإحاطة.',
    formulas: [
      { id: 'f-g12-1', title: 'المقارب المائل', expression: '\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0', description: 'المستقيم $\\Delta: y = ax + b$ مقارب مائل في جوار $\\pm\\infty$.' },
      { id: 'f-g12-2', title: 'نهاية شهيرة مثلثية', expression: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', description: 'تستخدم لإزالة عدم التعيين من الشكل $\\frac{0}{0}$.' }
    ],
    examples: [
      {
        id: 'ex-g12-1',
        title: 'إزالة عدم التعيين بالمرافق (مسألة بكالوريا)',
        problem: 'احسب $\\lim_{x \\to +\\infty} (\\sqrt{x^2 + 4x} - x)$.',
        steps: [
          'بالتعويض المباشر نجد حالة عدم تعيين $\\infty - \\infty$.',
          'نضرب ونقسم بالمرافق $\\sqrt{x^2 + 4x} + x$:',
          '$\\frac{(x^2 + 4x) - x^2}{\\sqrt{x^2 + 4x} + x} = \\frac{4x}{x\\sqrt{1 + \\frac{4}{x}} + x} = \\frac{4}{\\sqrt{1 + \\frac{4}{x}} + 1}$.',
          'عندما $x \\to +\\infty$ تؤول $\\frac{4}{x} \\to 0$.'
        ],
        answer: '$\\lim_{x \\to +\\infty} f(x) = \\frac{4}{2} = 2$'
      }
    ],
    exercises: [
      { id: 'er-g12-1', question: 'احسب $\\lim_{x \\to 2} \\frac{x^2 - 4}{\\sqrt{x + 2} - 2}$.', difficulty: 'متوسط', hint: 'اضرب البسط والمقام بمرافق المقام $\\sqrt{x + 2} + 2$ وحلّل $x^2 - 4$.', solution: '$16$' },
      { id: 'er-g12-2', question: 'أثبت أن المستقيم $y = 2x - 1$ مقارب مائل للتابع $f(x) = 2x - 1 + \\frac{3}{x+1}$ عند $+\\infty$.', difficulty: 'أساسي', hint: 'احسب نهاية الفرق $f(x) - (2x - 1)$.', solution: '$\\lim_{x \\to +\\infty} \\frac{3}{x+1} = 0$ فالمستقيم مقارب مائل.' }
    ],
    quiz: [
      { id: 'q-g12-1', question: 'ما قيمة $\\lim_{x \\to +\\infty} \\frac{3x^2 - 5x}{6x^2 + 1}$؟', options: ['0', '$\\frac{1}{2}$', '3', '$+\\infty$'], correctIndex: 1, explanation: 'نأخذ نسبة أمثال الحد الأعلى درجة في البسط والمقام: $\\frac{3}{6} = \\frac{1}{2}$.' }
    ]
  },
  {
    id: 'l-g12-2',
    unitId: 'u-g12-ana-2',
    bookId: 'book-g12-analysis',
    gradeId: 12,
    order: 2,
    title: 'التابع اللوغاريتمي النيبيري والتابع الأسي والتكامل',
    pageStart: 70,
    pageEnd: 118,
    durationMinutes: 55,
    objectives: [
      'إتقان خواص $\\ln(x)$ و $e^x$ وحل المعادلات والمتراجحات الأسية واللوغاريتمية.',
      'توظيف النهايات الشهيرة للتابعين اللوغاريتمي والأسي.',
      'حساب التكاملات المحددة والمساحات المحصورة بين منحنيات.'
    ],
    theory: 'التابع اللوغاريتمي النيبيري $\\ln$ معرّف على $(0, +\\infty)$ ومشتقه $\\frac{1}{x}$. وهو التابع العكسي للتابع الأسي $e^x$ المعرف على $\\mathbb{R}$ والذي يساوي مشتقه نفسه.',
    formulas: [
      { id: 'f-g12-3', title: 'مشتق اللوغاريتم والأسي المركب', expression: '(\\ln u(x))\' = \\frac{u\'(x)}{u(x)}, \\quad (e^{u(x)})\' = u\'(x) e^{u(x)}', description: 'قواعد الاشتقاق الأساسية في البكالوريا.' },
      { id: 'f-g12-4', title: 'التكامل المحدد', expression: '\\int_a^b f(x)\\,dx = [F(x)]_a^b = F(b) - F(a)', description: 'حيث $F$ تابع أصلي لـ $f$.' }
    ],
    examples: [
      {
        id: 'ex-g12-2',
        title: 'حساب تكامل بالتجزئة / التعويض',
        problem: 'احسب قيمة التكامل $I = \\int_0^1 x e^{x^2}\\,dx$.',
        steps: [
          'نلاحظ أن مشتق الأس $x^2$ هو $2x$.',
          'نكتب $I = \\frac{1}{2} \\int_0^1 2x e^{x^2}\\,dx = \\frac{1}{2} [e^{x^2}]_0^1$.',
          'نعوض الحدين: $\\frac{1}{2}(e^1 - e^0)$.'
        ],
        answer: '$I = \\frac{e - 1}{2}$'
      }
    ],
    exercises: [
      { id: 'er-g12-3', question: 'حل في $\\mathbb{R}$ المعادلة: $e^{2x} - 5e^x + 6 = 0$.', difficulty: 'متوسط', hint: 'ضع $t = e^x > 0$ وحل المعادلة من الدرجة الثانية.', solution: '$x = \\ln 2$ أو $x = \\ln 3$' }
    ],
    quiz: [
      { id: 'q-g12-2', question: 'ما قيمة $\\lim_{x \\to +\\infty} \\frac{\\ln x}{x}$؟', options: ['1', '$+\\infty$', '0', '$e$'], correctIndex: 2, explanation: 'إحدى النهايات الشهيرة الأساسية: نمو $x$ أسرع من $\\ln x$ لذا النهاية $0$.' }
    ]
  },
  {
    id: 'l-g12-3',
    unitId: 'u-g12-alg-1',
    bookId: 'book-g12-algebra',
    gradeId: 12,
    order: 1,
    title: 'الأعداد العقدية والمصفوفات وجمل المعادلات',
    pageStart: 12,
    pageEnd: 58,
    durationMinutes: 55,
    objectives: [
      'الانتقال بين الشكل الجبري والمثلثي والأسي للعدد العقدي.',
      'حساب محدد المصفوفة ومنقولها ومعكوسها.',
      'حل جمل المعادلات الخطية باستخدام المصفوفات وقاعدة كرامر.'
    ],
    theory: 'تتيح الأعداد العقدية $z = a + bi$ تمثيل التحويلات الهندسية في المستوي بسهولة، بينما توفر المصفوفات أداة جبرية منهجية لحل جمل المعادلات الخطية وحساب المحددات.',
    formulas: [
      { id: 'f-g12-5', title: 'صيغة أويلر والشكل الأسي', expression: 'z = r e^{i\\theta} = r(\\cos \\theta + i\\sin \\theta)', description: 'حيث $r = |z| = \\sqrt{a^2 + b^2}$.' },
      { id: 'f-g12-6', title: 'معكوس مصفوفة مربعة 2×2', expression: 'A^{-1} = \\frac{1}{ad - bc} \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}', description: 'تكون قابلة للعكس إذا وفقط إذا كان $\\det(A) = ad - bc \\neq 0$.' }
    ],
    examples: [
      {
        id: 'ex-g12-3',
        title: 'حساب محدد ومعكوس مصفوفة',
        problem: 'أوجد محدد ومعكوس المصفوفة $A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$.',
        steps: [
          'نحسب المحدد: $\\det(A) = (3)(2) - (1)(5) = 6 - 5 = 1 \\neq 0$.',
          'نطبق صيغة المعكوس: $A^{-1} = \\frac{1}{1} \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$.'
        ],
        answer: '$A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$'
      }
    ],
    exercises: [
      { id: 'er-g12-4', question: 'اكتب العدد العقدي $z = 1 + i\\sqrt{3}$ بالشكل المثلثي والأسي.', difficulty: 'أساسي', hint: 'احسب الطويلة $r = 2$ ثم أوجد الزاوية $\\theta$ بحيث $\\cos \\theta = \\frac{1}{2}$.', solution: '$z = 2e^{i\\frac{\\pi}{3}}$' }
    ],
    quiz: [
      { id: 'q-g12-3', question: 'متى تكون المصفوفة المربعة $A$ غير قابلة للعكس؟', options: ['عندما $\\det(A) = 1$', 'عندما $\\det(A) = 0$', 'عندما عناصر القطر موجبة', 'عندما تكون متناظرة'], correctIndex: 1, explanation: 'تكون المصفوفة شاذة وغير قابلة للعكس إذا وفقط إذا انعدم محددها.' }
    ]
  },
  {
    id: 'l-g12-4',
    unitId: 'u-g12-alg-2',
    bookId: 'book-g12-algebra',
    gradeId: 12,
    order: 2,
    title: 'الجداء السلمي ومعادلة المستوي في الفضاء',
    pageStart: 98,
    pageEnd: 130,
    durationMinutes: 50,
    objectives: ['إثبات تعامد شعاعين بالجداء السلمي.', 'إيجاد المعادلة الديكارتية لمستوٍ علمت نقطة منه وناظمه.', 'حساب بعد نقطة عن مستوٍ.'],
    theory: 'في معلم متجانس في الفضاء، يعطى الجداء السلمي لشعاعين $\\vec{u}(x,y,z)$ و $\\vec{v}(x\',y\',z\')$ بالعلاقة $xx\' + yy\' + zz\'$. ويكون المستوي عمودياً على شعاع ناظم $\\vec{n}(a,b,c)$.',
    formulas: [
      { id: 'f-g12-7', title: 'المعادلة الديكارتية للمستوي', expression: 'ax + by + cz + d = 0', description: 'حيث $\\vec{n}(a, b, c)$ شعاع ناظم على المستوي.' },
      { id: 'f-g12-8', title: 'بعد نقطة عن مستوٍ', expression: 'd(M_0, P) = \\frac{|ax_0 + by_0 + cz_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}', description: 'لحساب البعد العمودي.' }
    ],
    examples: [
      {
        id: 'ex-g12-4',
        title: 'إيجاد معادلة مستوٍ',
        problem: 'أوجد معادلة المستوي $P$ المار بالنقطة $A(1, -2, 3)$ وناظمه $\\vec{n}(2, 1, -1)$.',
        steps: [
          'الشكل العام: $2x + y - z + d = 0$.',
          'نعوض إحداثيات $A$: $2(1) + (-2) - 3 + d = 0 \\implies d = 3$.'
        ],
        answer: '$P: 2x + y - z + 3 = 0$'
      }
    ],
    exercises: [
      { id: 'er-g12-5', question: 'احسب بعد النقطة $M(1, 2, 0)$ عن المستوي $2x - 2y + z - 5 = 0$.', difficulty: 'متوسط', hint: 'طبق قانون البعد والمقام $\\sqrt{4+4+1}=3$.', solution: '$d = \\frac{|2 - 4 + 0 - 5|}{3} = \\frac{7}{3}$' }
    ],
    quiz: [
      { id: 'q-g12-4', question: 'ما هو الشعاع الناظم للمستوي $3x - y + 4z - 7 = 0$؟', options: ['$(3, 1, 4)$', '$(3, -1, 4)$', '$(-3, -1, -7)$', '$(1, -1, 4)$'], correctIndex: 1, explanation: 'مركبات الناظم هي أمثال $x, y, z$ على الترتيب: $(3, -1, 4)$.' }
    ]
  },
];
