/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentEvaluation {
  type: 'distinguished' | 'needs_improvement' | 'regular';
  tags: string[];
  notes?: string;
  updatedAt?: string;
}

export interface Student {
  id: number;
  name: string;
  birthDate: string;
  nationalId?: string;
  age?: number;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  bloodType?: string;
  healthStatus?: string;
  evaluation?: StudentEvaluation;
}

export interface ClassSection {
  id: string;
  gradeNumber: number;
  gradeName: string;
  sectionName: string; // e.g. "أ", "ب", or "" if single section
  fullName: string;
  supervisor: string;
  studentsCount: number;
  students?: Student[];
}

export const DISTINGUISHED_TAGS = [
  'تفوق أكاديمي وتحصيل علمي ممتاز',
  'انضباط وسلوك وأخلاق مثالية',
  'مشاركة وتفاعل صفي مستمر وإيجابي',
  'التزام تام بتسليم الواجبات والمهام',
  'مبادرة ومساعدة الزملاء داخل الصف',
  'تميز في القراءة والتعبير الشفوي',
  'إتقان وتفوق في حل المسائل الحسابية',
];

export const NEEDS_IMPROVEMENT_TAGS = [
  'بحاجة إلى تقوية في مهارات القراءة والكتابة',
  'بحاجة إلى متابعة في العمليات الحسابية',
  'تشتت الانتباه وضعف التركيز داخل الحصة',
  'تأخر متكرر في إحضار الكتب وتسليم الواجبات',
  'بحاجة إلى تشجيع مستمر للمشاركة الصفية',
  'بحاجة لمتابعة منزلية مكثفة من ولي الأمر',
  'التأخر الصباحي أو الغياب المتكرر',
];

export const INITIAL_CLASS_ROOMS: ClassSection[] = [
  {
    id: 'grade-1',
    gradeNumber: 1,
    gradeName: 'الصف الأول',
    sectionName: '',
    fullName: 'الصف الأول الأساسي',
    supervisor: 'أ. محمود عبد الرحمن',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-2',
    gradeNumber: 2,
    gradeName: 'الصف الثاني',
    sectionName: '',
    fullName: 'الصف الثاني الأساسي',
    supervisor: 'أ. إبراهيم كنعان',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-3',
    gradeNumber: 3,
    gradeName: 'الصف الثالث',
    sectionName: '',
    fullName: 'الصف الثالث الأساسي',
    supervisor: 'أ. سامر خليل',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-4-a',
    gradeNumber: 4,
    gradeName: 'الصف الرابع',
    sectionName: 'أ',
    fullName: 'الصف الرابع (أ)',
    supervisor: 'أ. أحمد منصور',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-4-b',
    gradeNumber: 4,
    gradeName: 'الصف الرابع',
    sectionName: 'ب',
    fullName: 'الصف الرابع (ب)',
    supervisor: 'أ. رامي عودة',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-5',
    gradeNumber: 5,
    gradeName: 'الصف الخامس',
    sectionName: '',
    fullName: 'الصف الخامس الأساسي',
    supervisor: 'أ. خالد يوسف',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-6-a',
    gradeNumber: 6,
    gradeName: 'الصف السادس',
    sectionName: 'أ',
    fullName: 'الصف السادس (أ)',
    supervisor: 'أ. ناصر جابر',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-6-b',
    gradeNumber: 6,
    gradeName: 'الصف السادس',
    sectionName: 'ب',
    fullName: 'الصف السادس (ب)',
    supervisor: 'أ. طارق سمودي',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-7-a',
    gradeNumber: 7,
    gradeName: 'الصف السابع',
    sectionName: 'أ',
    fullName: 'الصف السابع (أ)',
    supervisor: 'أ. زياد مصطفى',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-7-b',
    gradeNumber: 7,
    gradeName: 'الصف السابع',
    sectionName: 'ب',
    fullName: 'الصف السابع (ب)',
    supervisor: 'أ. حسن داود',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-8-a',
    gradeNumber: 8,
    gradeName: 'الصف الثامن',
    sectionName: 'أ',
    fullName: 'الصف الثامن (أ)',
    supervisor: 'أ. عمر شريف',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-8-b',
    gradeNumber: 8,
    gradeName: 'الصف الثامن',
    sectionName: 'ب',
    fullName: 'الصف الثامن (ب)',
    supervisor: 'أ. فراس نجار',
    studentsCount: 0,
    students: [],
  },
  {
    id: 'grade-9',
    gradeNumber: 9,
    gradeName: 'الصف التاسع',
    sectionName: '',
    fullName: 'الصف التاسع الأساسي',
    supervisor: 'أ. وليد حسونة',
    studentsCount: 0,
    students: [],
  },
];

export const CLASS_ROOMS = INITIAL_CLASS_ROOMS;

export type AppRoute =
  | { type: 'home' }
  | { type: 'classrooms' }
  | { type: 'class-detail'; classId: string }
  | { type: 'admin' }
  | { type: 'teacher-login' };


export interface TeacherActivityLog {
  id: string;
  teacherId: string;
  teacherName: string;
  actionType: 'grade' | 'evaluation' | 'attendance' | 'note';
  title: string;
  description: string;
  studentName?: string;
  className: string;
  dateStr: string; // e.g. "الخميس، 16 تشرين الأول 2026"
  timeStr: string; // e.g. "10:30 ص"
  createdAt: string; // ISO
}

export interface TeacherAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  subject: string;
  assignedClass: string;
  status: 'active' | 'inactive';
  createdAt: string;
  taughtClasses?: string[]; // IDs of classes taught by this teacher
}

export const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    id: 't-1',
    name: 'أ. محمود عبد الرحمن',
    username: 'm.abdulrahman',
    email: 'm.abdulrahman@samoudi.edu',
    phone: '0599110011',
    subject: 'اللغة العربية والتربية الإسلامية',
    assignedClass: 'الصف الأول الأساسي',
    status: 'active',
    createdAt: '2026/09/01',
    taughtClasses: ['grade-1', 'grade-2', 'grade-3'],
  },
  {
    id: 't-2',
    name: 'أ. إبراهيم كنعان',
    username: 'i.kanaan',
    email: 'i.kanaan@samoudi.edu',
    phone: '0599220022',
    subject: 'العلوم العامة والرياضيات',
    assignedClass: 'الصف الثاني الأساسي',
    status: 'active',
    createdAt: '2026/09/01',
    taughtClasses: ['grade-2', 'grade-4-a', 'grade-4-b'],
  },
  {
    id: 't-3',
    name: 'أ. سامر خليل',
    username: 's.khalil',
    email: 's.khalil@samoudi.edu',
    phone: '0599330033',
    subject: 'الرياضيات والتنشئة الوطنية',
    assignedClass: 'الصف الثالث الأساسي',
    status: 'active',
    createdAt: '2026/09/01',
    taughtClasses: ['grade-3', 'grade-5', 'grade-6-a'],
  },
  {
    id: 't-4',
    name: 'أ. أحمد منصور',
    username: 'a.mansour',
    email: 'a.mansour@samoudi.edu',
    phone: '0599440044',
    subject: 'اللغة الإنجليزية',
    assignedClass: 'الصف الرابع (أ)',
    status: 'active',
    createdAt: '2026/09/01',
    taughtClasses: ['grade-4-a', 'grade-4-b', 'grade-7-a'],
  },
];

export const INITIAL_TEACHER_ACTIVITIES: TeacherActivityLog[] = [
  {
    id: 'act-1',
    teacherId: 't-1',
    teacherName: 'أ. محمود عبد الرحمن',
    actionType: 'grade',
    title: 'رصد علامة اختبار شهري',
    description: 'رصد علامة اختبار مادة اللغة العربية (20/20) - إتقان مهارات القراءة والكتابة',
    studentName: 'إبراهيم أحمد عبد الوهاب السمودي',
    className: 'الصف الأول الأساسي',
    dateStr: 'الخميس، 16 تشرين الأول 2026',
    timeStr: '10:45 ص',
    createdAt: '2026-10-16T10:45:00',
  },
  {
    id: 'act-2',
    teacherId: 't-1',
    teacherName: 'أ. محمود عبد الرحمن',
    actionType: 'evaluation',
    title: 'إضافة تقييم سلوكي وأكاديمي متميز',
    description: 'إضافة تصنيف (متميز): تفوق أكاديمي وتحصيل علمي ممتاز مع انضباط ومشاركة صفية',
    studentName: 'محمد طارق زياد سمودي',
    className: 'الصف الأول الأساسي',
    dateStr: 'الخميس، 16 تشرين الأول 2026',
    timeStr: '09:20 ص',
    createdAt: '2026-10-16T09:20:00',
  },
  {
    id: 'act-3',
    teacherId: 't-1',
    teacherName: 'أ. محمود عبد الرحمن',
    actionType: 'attendance',
    title: 'تسجيل الحضور والغياب الصباحي',
    description: 'تسجيل الحضور الصباحي والتأكد من حضور جميع طلاب الصف الأول بدون غياب',
    className: 'الصف الأول الأساسي',
    dateStr: 'الأربعاء، 15 تشرين الأول 2026',
    timeStr: '08:15 ص',
    createdAt: '2026-10-15T08:15:00',
  },
  {
    id: 'act-4',
    teacherId: 't-1',
    teacherName: 'أ. محمود عبد الرحمن',
    actionType: 'grade',
    title: 'رصد درجات تسميع القرآن الكريم',
    description: 'رصد علامة 10/10 في تسميع سورة الفلق والالتزام بالترتيل الصحيح',
    studentName: 'أنس كمال أحمد سمودي',
    className: 'الصف الثاني الأساسي',
    dateStr: 'الأربعاء، 15 تشرين الأول 2026',
    timeStr: '11:30 ص',
    createdAt: '2026-10-15T11:30:00',
  },
  {
    id: 'act-5',
    teacherId: 't-1',
    teacherName: 'أ. محمود عبد الرحمن',
    actionType: 'note',
    title: 'ملاحظة تربوية ومتابعة الواجبات',
    description: 'متابعة الدفاتر المدرسية وتقديم تغذية راجعة لخط النسخ للطلاب',
    className: 'الصف الثالث الأساسي',
    dateStr: 'الثلاثاء، 14 تشرين الأول 2026',
    timeStr: '12:10 م',
    createdAt: '2026-10-14T12:10:00',
  },
];

