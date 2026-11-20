export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeId: number;
  createdAt: string;
}

export interface GradeInfo {
  id: number;
  name: string;
  shortName: string;
  stage: 'الابتدائية' | 'الإعدادية' | 'الثانوية';
  description: string;
}

export interface FormulaItem {
  id: string;
  title: string;
  expression: string; // LaTeX string
  description: string;
}

export interface ExampleItem {
  id: string;
  title: string;
  problem: string;
  steps: string[];
  answer: string;
}

export interface ExerciseItem {
  id: string;
  question: string;
  difficulty: 'أساسي' | 'متوسط' | 'تحدي';
  hint: string;
  solution: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  bookId: string;
  gradeId: number;
  order: number;
  title: string;
  pageStart: number;
  pageEnd: number;
  durationMinutes: number;
  objectives: string[];
  theory: string;
  formulas: FormulaItem[];
  examples: ExampleItem[];
  exercises: ExerciseItem[];
  quiz: QuizQuestion[];
  isUnitExercises?: boolean;
  videoUrl?: string;
  videoTitle?: string;
}

export interface Unit {
  id: string;
  bookId: string;
  gradeId: number;
  order: number;
  title: string;
  chapterLabel: string;
  description: string;
  pageStart: number;
  pageEnd: number;
}

export interface CurriculumBook {
  id: string;
  gradeId: number;
  title: string;
  part: string;
  author: string;
  year: string;
  pageCount: number;
  coverUrl?: string;
  pdfFileName?: string;
  isIndexed: boolean;
  indexedAt?: string;
  summary: string;
}

export interface PdfProcessingJob {
  id: string;
  bookId: string;
  fileName: string;
  gradeId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  extractedUnitsCount: number;
  extractedLessonsCount: number;
  extractedFormulasCount: number;
  extractedExercisesCount: number;
  rawSummary?: string;
  errorMessage?: string;
}

export interface StudentLessonProgress {
  lessonId: string;
  gradeId: number;
  completed: boolean;
  quizScore?: number;
  quizTotal?: number;
  lastVisitedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'lesson_view' | 'quiz_submit' | 'tutor_question' | 'book_upload';
  title: string;
  subtitle: string;
  gradeId: number;
  lessonId?: string;
  createdAt: string;
}

export type TutorExplainStyle = 'detailed' | 'quick';
export type TutorLanguage = 'ar' | 'en' | 'tr';

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachmentName?: string;
  attachmentType?: 'image' | 'pdf' | 'text';
  attachmentPreviewUrl?: string;
  rating?: 'up' | 'down';
  createdAt: string;
}

export type TutorMode =
  | 'solve'
  | 'explain'
  | 'grade_answer'
  | 'generate_practice'
  | 'graph'
  | 'deep_explain';

export interface SavedTutorChat {
  id: string;
  title: string;
  gradeId: number;
  bookId?: string;
  lessonId?: string;
  explainStyle: TutorExplainStyle;
  language: TutorLanguage;
  messages: TutorMessage[];
  updatedAt: string;
}

export interface SolvedFavoriteItem {
  id: string;
  question: string;
  answer: string;
  gradeId: number;
  isFavorite: boolean;
  createdAt: string;
}

export interface SearchLessonHit {
  lessonId: string;
  title: string;
  gradeId: number;
  bookId: string;
  bookTitle: string;
  unitTitle: string;
  pageStart: number;
  pageEnd: number;
  snippet: string;
}

export interface SearchFormulaHit {
  id: string;
  lessonId: string;
  lessonTitle: string;
  gradeId: number;
  title: string;
  expression: string;
  description: string;
  pageStart: number;
}

export interface SearchExerciseHit {
  id: string;
  lessonId: string;
  lessonTitle: string;
  gradeId: number;
  question: string;
  difficulty: 'أساسي' | 'متوسط' | 'تحدي';
  pageStart: number;
}

export interface GlobalSearchResponse {
  lessons: SearchLessonHit[];
  formulas: SearchFormulaHit[];
  exercises: SearchExerciseHit[];
}

