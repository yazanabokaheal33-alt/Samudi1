/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Users,
  KeyRound,
  CheckCircle2,
  Trash2,
  Search,
  Sparkles,
  Bot,
  Plus,
  ListPlus,
  Check,
  GraduationCap,
  School,
  Calendar,
  X,
  AlertCircle,
  Eye,
  Printer,
  ChevronLeft,
  ArrowUpRight
} from 'lucide-react';
import { ClassSection, Student, TeacherAccount } from '../types.ts';
import { parseStudentsFromText, ParsedStudentCandidate } from '../utils/aiStudentParser.ts';
import { StudentProfileCard } from '../components/StudentProfileCard.tsx';
import { OfficialPrintSheetModal } from '../components/OfficialPrintSheetModal.tsx';
import { LTRValue, getDirection } from '../utils/textDirection.ts';

interface AdminDashboardPageProps {
  classList: ClassSection[];
  teachers: TeacherAccount[];
  onBack: () => void;
  onAddStudent: (classId: string, student: Student) => void;
  onDeleteStudent?: (classId: string, studentId: number) => void;
  onAddTeacher: (teacher: TeacherAccount) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onPromoteStudent?: (studentId: number, fromClassId: string, toClassId: string) => void;
  onPromoteClass?: (fromClassId: string, toClassId: string, studentIds?: number[]) => void;
}

// Helper to determine the next recommended grade
function getNextGradeTarget(currentClassId: string, classList: ClassSection[]): string {
  if (currentClassId === 'grade-1') return 'grade-2';
  if (currentClassId === 'grade-2') return 'grade-3';
  if (currentClassId === 'grade-3') return 'grade-4-a';
  if (currentClassId === 'grade-4-a' || currentClassId === 'grade-4-b') return 'grade-5';
  if (currentClassId === 'grade-5') return 'grade-6-a';
  if (currentClassId === 'grade-6-a' || currentClassId === 'grade-6-b') return 'grade-7-a';
  if (currentClassId === 'grade-7-a' || currentClassId === 'grade-7-b') return 'grade-8-a';
  if (currentClassId === 'grade-8-a' || currentClassId === 'grade-8-b') return 'grade-9';
  if (currentClassId === 'grade-9') return 'graduated';
  return classList[0]?.id || 'grade-1';
}

export default function AdminDashboardPage({
  classList,
  teachers,
  onBack,
  onAddStudent,
  onDeleteStudent,
  onAddTeacher,
  onDeleteTeacher,
  onPromoteStudent,
  onPromoteClass,
}: AdminDashboardPageProps) {
  // Main Tab: 'students' (شؤون الطلاب) | 'teachers' (الهيئة التدريسية)
  const [activeMainTab, setActiveMainTab] = useState<'students' | 'teachers'>('students');

  // Students Sub-Tab: 'directory' | 'promotion' | 'manual' | 'ai'
  const [studentSubTab, setStudentSubTab] = useState<'directory' | 'promotion' | 'manual' | 'ai'>('directory');

  // Teachers Sub-Tab: 'add' | 'list'
  const [teacherSubTab, setTeacherSubTab] = useState<'add' | 'list'>('add');

  // AI Paste Text State
  const [aiRawText, setAiRawText] = useState('');
  const [aiParsedStudents, setAiParsedStudents] = useState<ParsedStudentCandidate[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Manual Form State (strictly name, birthDate, classId)
  const [studentForm, setStudentForm] = useState({
    name: '',
    birthDate: '',
    classId: classList[0]?.id || 'grade-1',
  });

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    subject: '',
    assignedClass: classList[0]?.fullName || 'الصف الأول الأساسي',
  });

  // Directory Search & Filter
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedFilterClass, setSelectedFilterClass] = useState<string>('all');
  const [previewStudent, setPreviewStudent] = useState<(Student & { className: string; classId: string }) | null>(null);
  const [adminPrintModal, setAdminPrintModal] = useState<{ mode: 'student' | 'classroom'; student?: Student; classData?: ClassSection } | null>(null);

  // Promotion System States
  const [promotionMode, setPromotionMode] = useState<'class' | 'single'>('class');
  const [promoteSourceClass, setPromoteSourceClass] = useState<string>(classList[0]?.id || 'grade-1');
  const [promoteTargetClass, setPromoteTargetClass] = useState<string>(() =>
    getNextGradeTarget(classList[0]?.id || 'grade-1', classList)
  );
  const [selectedPromoteStudentIds, setSelectedPromoteStudentIds] = useState<number[]>([]);

  // Single Student Promotion (from Promotion tab or Modal)
  const [singleStudentSearch, setSingleStudentSearch] = useState('');
  const [singleSelectedStudent, setSingleSelectedStudent] = useState<{ student: Student; fromClassId: string } | null>(null);
  const [singleTargetClass, setSingleTargetClass] = useState<string>('');

  // Quick promote modal from Directory row
  const [quickPromoteStudent, setQuickPromoteStudent] = useState<{ student: Student; classId: string; className: string } | null>(null);
  const [quickTargetClass, setQuickTargetClass] = useState<string>('');

  // Confirmation modal for class promotion
  const [showClassPromotionConfirm, setShowClassPromotionConfirm] = useState(false);

  // Confirm delete modal state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'student' | 'teacher';
    id: string | number;
    classId?: string;
    name: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync selected student IDs when source class changes
  const sourceClassData = classList.find((c) => c.id === promoteSourceClass);
  const sourceStudents = sourceClassData?.students || [];

  const handleSourceClassChange = (newSourceId: string) => {
    setPromoteSourceClass(newSourceId);
    const nextTarget = getNextGradeTarget(newSourceId, classList);
    setPromoteTargetClass(nextTarget);
    const cls = classList.find((c) => c.id === newSourceId);
    setSelectedPromoteStudentIds((cls?.students || []).map((s) => s.id));
  };

  // Quick Paste from Clipboard
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setAiRawText(text);
          showToast('تم لصق النص من الحافظة');
          return;
        }
      }
    } catch {
      // Permission denied
    }
    showToast('الصق النص يدوياً داخل الحقل');
  };

  // AI Extraction ("تفريغ")
  const handleAIExtract = () => {
    if (!aiRawText.trim()) {
      showToast('يرجى لصق نص يحتوي على بيانات الطلاب للتفريغ');
      return;
    }

    setIsParsing(true);

    setTimeout(() => {
      const candidates = parseStudentsFromText(aiRawText, classList);

      if (candidates.length === 0) {
        showToast('لم يتم العثور على أسماء طلاب واضحة في النص');
      } else {
        setAiParsedStudents(candidates);
        showToast(`تم تفريغ (${candidates.length}) طلاب بنجاح! راجع البيانات ثم اعتمد الحفظ.`);
      }
      setIsParsing(false);
    }, 250);
  };

  // Save All AI Extracted Students
  const handleSaveAllAIExtracted = () => {
    if (aiParsedStudents.length === 0) return;

    let count = 0;
    aiParsedStudents.forEach((cand, idx) => {
      if (!cand.name.trim()) return;

      const newStudent: Student = {
        id: Date.now() + idx,
        name: cand.name.trim(),
        birthDate: cand.birthDate || '',
        evaluation: {
          type: 'regular',
          tags: [],
        },
      };

      onAddStudent(cand.classId, newStudent);
      count++;
    });

    showToast(`تم حفظ وإدراج (${count}) طلاب في صفوفهم بنجاح!`);
    setAiParsedStudents([]);
    setAiRawText('');
    setStudentSubTab('directory');
  };

  const handleUpdateCandidate = (index: number, updated: ParsedStudentCandidate) => {
    setAiParsedStudents((prev) => prev.map((item, i) => (i === index ? updated : item)));
  };

  const handleRemoveCandidate = (index: number) => {
    setAiParsedStudents((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Manual Student
  const handleSubmitManualStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim()) {
      showToast('يرجى كتابة اسم الطالب');
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      name: studentForm.name.trim(),
      birthDate: studentForm.birthDate.trim(),
      evaluation: {
        type: 'regular',
        tags: [],
      },
    };

    onAddStudent(studentForm.classId, newStudent);
    const targetClass = classList.find((c) => c.id === studentForm.classId);
    showToast(`تمت إضافة الطالب (${newStudent.name}) إلى ${targetClass?.fullName || ''} بنجاح!`);

    setStudentForm({
      name: '',
      classId: studentForm.classId,
      birthDate: '',
    });

    setStudentSubTab('directory');
  };

  // Submit Teacher
  const handleSubmitTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.username.trim()) {
      showToast('يرجى كتابة اسم المعلم واسم المستخدم');
      return;
    }

    const newTeacher: TeacherAccount = {
      id: `teacher-${Date.now()}`,
      name: teacherForm.name.trim(),
      username: teacherForm.username.trim(),
      email: teacherForm.email.trim() || `${teacherForm.username.trim()}@samoudi.edu`,
      phone: teacherForm.phone.trim(),
      subject: teacherForm.subject.trim() || 'معلم مادة',
      assignedClass: teacherForm.assignedClass,
      status: 'active',
      createdAt: new Date().toLocaleDateString('ar-EG'),
    };

    onAddTeacher(newTeacher);
    showToast(`تم إنشاء حساب المعلم (${newTeacher.name}) بنجاح!`);

    setTeacherForm({
      name: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      subject: '',
      assignedClass: classList[0]?.fullName || 'الصف الأول الأساسي',
    });

    setTeacherSubTab('list');
  };

  // Execute Batch Class Promotion
  const handleExecuteClassPromotion = () => {
    if (!onPromoteClass) {
      showToast('خاصية ترفيع الصف غير مفعلة');
      return;
    }
    if (selectedPromoteStudentIds.length === 0) {
      showToast('يرجى تحديد طالب واحد على الأقل للترفيع');
      return;
    }

    const source = classList.find((c) => c.id === promoteSourceClass);
    const target = classList.find((c) => c.id === promoteTargetClass);
    const targetLabel = promoteTargetClass === 'graduated' ? 'خريجو المدرسة' : target?.fullName || '';

    onPromoteClass(promoteSourceClass, promoteTargetClass, selectedPromoteStudentIds);
    setShowClassPromotionConfirm(false);
    showToast(`تم ترفيع (${selectedPromoteStudentIds.length}) طلاب من ${source?.fullName || ''} إلى ${targetLabel} بنجاح!`);
    setSelectedPromoteStudentIds([]);
    setStudentSubTab('directory');
  };

  // Execute Single Student Promotion
  const handleExecuteSinglePromotion = () => {
    if (!singleSelectedStudent || !singleTargetClass || !onPromoteStudent) return;

    const target = classList.find((c) => c.id === singleTargetClass);
    const targetLabel = singleTargetClass === 'graduated' ? 'خريجو المدرسة' : target?.fullName || '';

    onPromoteStudent(singleSelectedStudent.student.id, singleSelectedStudent.fromClassId, singleTargetClass);
    showToast(`تم ترفيع الطالب (${singleSelectedStudent.student.name}) إلى ${targetLabel} بنجاح!`);
    setSingleSelectedStudent(null);
    setSingleTargetClass('');
    setStudentSubTab('directory');
  };

  // Execute Quick Promote from Directory
  const handleExecuteQuickPromote = () => {
    if (!quickPromoteStudent || !quickTargetClass || !onPromoteStudent) return;

    const target = classList.find((c) => c.id === quickTargetClass);
    const targetLabel = quickTargetClass === 'graduated' ? 'خريجو المدرسة' : target?.fullName || '';

    onPromoteStudent(quickPromoteStudent.student.id, quickPromoteStudent.classId, quickTargetClass);
    showToast(`تم ترفيع الطالب (${quickPromoteStudent.student.name}) إلى ${targetLabel} بنجاح!`);
    setQuickPromoteStudent(null);
    setQuickTargetClass('');
  };

  // Stats
  const totalStudentsCount = classList.reduce(
    (acc, curr) => acc + (curr.students?.length || 0),
    0
  );

  const allStudents = classList.flatMap((c) =>
    (c.students || []).map((s) => ({ ...s, className: c.fullName, classId: c.id }))
  );

  const filteredStudents = allStudents.filter((s) => {
    const matchesSearch =
      s.name.includes(studentSearch) || (s.birthDate && s.birthDate.includes(studentSearch));
    const matchesClass =
      selectedFilterClass === 'all' || s.classId === selectedFilterClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex-1 flex flex-col font-arabic w-full max-w-lg mx-auto px-3 py-3 sm:py-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-900 text-xs font-semibold border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5 text-blue-900" />
          <span>الرئيسية</span>
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900">
              لوحة تحكم الإدارة
            </h1>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            مدرسة المرحوم أحمد عبد الوهاب السمودي
          </p>
        </div>

        <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/80">
          مسؤول النظام
        </span>
      </div>

      {/* 2. STATS STRIP */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => {
            setActiveMainTab('students');
            setStudentSubTab('directory');
          }}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all text-right cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold">إجمالي الطلبة</span>
            <Users className="w-3.5 h-3.5 text-blue-800" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
            {totalStudentsCount}
          </p>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('students');
            setStudentSubTab('promotion');
          }}
          className="p-2.5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs hover:border-emerald-400 transition-all text-right cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-800 font-semibold">نظام الترفيع</span>
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <p className="text-[11px] font-bold text-emerald-950 mt-1">
            ترفيع الصفوف
          </p>
        </button>

        <button
          onClick={() => {
            setActiveMainTab('teachers');
            setTeacherSubTab('list');
          }}
          className="p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-300 transition-all text-right cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold">المعلمون</span>
            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5 tabular-nums">
            {teachers.length}
          </p>
        </button>
      </div>

      {/* 3. MAIN TAB SWITCHER (شؤون الطلاب vs الهيئة التدريسية) */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-3 border border-slate-200/70">
        <button
          onClick={() => setActiveMainTab('students')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === 'students'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>شؤون وقيد الطلاب</span>
        </button>

        <button
          onClick={() => setActiveMainTab('teachers')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMainTab === 'teachers'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>الهيئة التدريسية ({teachers.length})</span>
        </button>
      </div>

      {/* =========================================================================
          SECTION A: شؤون الطلاب (STUDENTS MANAGEMENT & PROMOTION)
          ========================================================================= */}
      {activeMainTab === 'students' && (
        <div className="space-y-3">
          
          {/* Sub-Tabs Bar: دليل الطلبة | نظام الترفيع 🎓 | إضافة يدوية | تفريغ ذكي */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setStudentSubTab('directory')}
              className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                studentSubTab === 'directory'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3 h-3" />
              <span>دليل الطلبة</span>
            </button>

            <button
              onClick={() => setStudentSubTab('promotion')}
              className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                studentSubTab === 'promotion'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>نظام الترفيع</span>
            </button>

            <button
              onClick={() => setStudentSubTab('manual')}
              className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                studentSubTab === 'manual'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3 h-3" />
              <span>إضافة طالب</span>
            </button>

            <button
              onClick={() => setStudentSubTab('ai')}
              className={`py-1.5 px-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                studentSubTab === 'ai'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>تفريغ ذكي</span>
            </button>
          </div>

          {/* -------------------------------------------------------------
              SUB-TAB 1: STUDENT DIRECTORY (دليل وسجل الطلاب)
              ------------------------------------------------------------- */}
          {studentSubTab === 'directory' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right space-y-3 animate-in fade-in duration-150">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-900" />
                  <h3 className="text-xs font-bold text-slate-900">
                    سجل ودليل الطلاب
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {selectedFilterClass !== 'all' && (
                    <button
                      onClick={() => {
                        const cls = classList.find((c) => c.id === selectedFilterClass);
                        if (cls) {
                          setAdminPrintModal({ mode: 'classroom', classData: cls });
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-2xs active:scale-95 transition-all cursor-pointer"
                      title="طباعة كشف هذا الصف رسمياً"
                    >
                      <Printer className="w-3 h-3 text-amber-400" />
                      <span>طباعة الكشف</span>
                    </button>
                  )}
                  <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {filteredStudents.length} طلاب
                  </span>
                </div>
              </div>

              {/* Filter and Search */}
              <div className="flex gap-2">
                <select
                  value={selectedFilterClass}
                  onChange={(e) => setSelectedFilterClass(e.target.value)}
                  className="w-1/2 px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 font-semibold"
                >
                  <option value="all">كل الصفوف</option>
                  {classList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>

                <div className="relative w-1/2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="بحث بالاسم أو الميلاد..."
                    className="w-full pr-7 pl-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
                  />
                  {studentSearch && (
                    <button
                      onClick={() => setStudentSearch('')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Student Cards List */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
                {filteredStudents.map((st, i) => (
                  <div
                    key={st.id}
                    className="p-2.5 hover:bg-slate-50/90 transition-colors flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div dir={getDirection(st.name)} className={getDirection(st.name) === 'rtl' ? 'text-right' : 'text-left'}>
                            <span className="font-bold text-slate-900 text-xs">
                              {st.name}
                            </span>
                          </div>
                          {st.evaluation?.type === 'distinguished' && (
                            <span className="text-[9px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold">
                              متميز
                            </span>
                          )}
                          {st.evaluation?.type === 'needs_improvement' && (
                            <span className="text-[9px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 font-bold">
                              متابعة
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                          <span>الميلاد:</span>
                          <span>{st.birthDate || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {st.className.replace(' الأساسي', '')}
                      </span>

                      {/* Quick Promote Student Button */}
                      <button
                        onClick={() => {
                          setQuickPromoteStudent({ student: st, classId: st.classId, className: st.className });
                          setQuickTargetClass(getNextGradeTarget(st.classId, classList));
                        }}
                        className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors"
                        title="ترفيع هذا الطالب إلى الصف التالي"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setPreviewStudent(st)}
                        className="p-1 text-slate-400 hover:text-blue-900 rounded-md cursor-pointer"
                        title="عرض بيانات الطالب"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() =>
                          setAdminPrintModal({
                            mode: 'student',
                            student: st,
                            classData: {
                              id: st.classId,
                              gradeNumber: 1,
                              gradeName: st.className,
                              sectionName: '',
                              fullName: st.className,
                              supervisor: 'إدارة المدرسة',
                              studentsCount: 1,
                            },
                          })
                        }
                        className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                        title="طباعة استمارة الطالب"
                      >
                        <Printer className="w-3.5 h-3.5 text-blue-900" />
                      </button>

                      {onDeleteStudent && (
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: 'student',
                              id: st.id,
                              classId: st.classId,
                              name: st.name,
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    لا يوجد طلبة مطابقين لمعايير البحث
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              SUB-TAB 2: PROMOTION SYSTEM (نظام ترفيع صف أو طالب)
              ------------------------------------------------------------- */}
          {studentSubTab === 'promotion' && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-2xs p-3.5 text-right space-y-3.5 animate-in fade-in duration-150">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      نظام الترفيع الأكاديمي (خاص بالإدارة)
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      ترفيع صف كامل أو ترفيع طالب فردي إلى الصف التالي
                    </p>
                  </div>
                </div>
              </div>

              {/* Mode Switcher: ترفيع صف كامل vs ترفيع طالب فردي */}
              <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPromotionMode('class')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                    promotionMode === 'class'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ترفيع صف كامل
                </button>
                <button
                  type="button"
                  onClick={() => setPromotionMode('single')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                    promotionMode === 'single'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ترفيع طالب فردي
                </button>
              </div>

              {/* ================= MODE A: PROMOTE ENTIRE CLASS ================= */}
              {promotionMode === 'class' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Source Class */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        1. الصف المراد ترفيعه:
                      </label>
                      <select
                        value={promoteSourceClass}
                        onChange={(e) => handleSourceClassChange(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {classList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName} ({c.students?.length || 0} طالب)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Target Class */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-800 mb-1">
                        2. ترفيع إلى:
                      </label>
                      <select
                        value={promoteTargetClass}
                        onChange={(e) => setPromoteTargetClass(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-emerald-50/80 border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {classList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.fullName}
                          </option>
                        ))}
                        <option value="graduated">🎓 تخرج وإنهاء المرحلة الأساسية</option>
                      </select>
                    </div>
                  </div>

                  {/* Students in Source Class Roster */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-200">
                      <span className="font-bold text-slate-800">
                        طلاب الصف ({sourceStudents.length} طلاب):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPromoteStudentIds(sourceStudents.map((s) => s.id))}
                          className="text-[10px] text-blue-900 font-bold hover:underline cursor-pointer"
                        >
                          تحديد الكل
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPromoteStudentIds([])}
                          className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>

                    {sourceStudents.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                        {sourceStudents.map((st) => {
                          const isChecked = selectedPromoteStudentIds.includes(st.id);
                          return (
                            <label
                              key={st.id}
                              className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer text-xs ${
                                isChecked
                                  ? 'bg-white border-emerald-300 text-slate-900'
                                  : 'bg-slate-100/60 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedPromoteStudentIds([...selectedPromoteStudentIds, st.id]);
                                    } else {
                                      setSelectedPromoteStudentIds(selectedPromoteStudentIds.filter((id) => id !== st.id));
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded cursor-pointer"
                                />
                                <span className="font-semibold">{st.name}</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">
                                {st.birthDate || '—'}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-4">
                        لا يوجد طلاب في هذا الصف حالياً لترفيعهم
                      </p>
                    )}
                  </div>

                  {/* Summary Card & Execute Button */}
                  {sourceStudents.length > 0 && (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium">
                        سيتم نقل <strong className="font-bold">{selectedPromoteStudentIds.length}</strong> طالب من{' '}
                        <strong>{sourceClassData?.fullName}</strong> إلى{' '}
                        <strong>
                          {promoteTargetClass === 'graduated'
                            ? 'أرشيف الخريجين'
                            : classList.find((c) => c.id === promoteTargetClass)?.fullName}
                        </strong>.
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowClassPromotionConfirm(true)}
                        disabled={selectedPromoteStudentIds.length === 0}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-300" />
                        <span>تنفيذ ترفيع الصف كاملاً</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ================= MODE B: PROMOTE SINGLE STUDENT ================= */}
              {promotionMode === 'single' && (
                <div className="space-y-3">
                  {/* Search for Student */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">
                      ابحث عن الطالب المراد ترفيعه:
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={singleStudentSearch}
                        onChange={(e) => setSingleStudentSearch(e.target.value)}
                        placeholder="ابحث باسم الطالب..."
                        className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Matching Students List */}
                  {singleStudentSearch && !singleSelectedStudent && (
                    <div className="border border-slate-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white">
                      {allStudents
                        .filter((s) => s.name.includes(singleStudentSearch))
                        .map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setSingleSelectedStudent({ student: s, fromClassId: s.classId });
                              setSingleTargetClass(getNextGradeTarget(s.classId, classList));
                              setSingleStudentSearch('');
                            }}
                            className="w-full p-2 hover:bg-emerald-50 text-right flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="text-[10px] text-blue-900 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                              {s.className}
                            </span>
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Selected Student Card */}
                  {singleSelectedStudent && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {singleSelectedStudent.student.name}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            الميلاد: {singleSelectedStudent.student.birthDate || '—'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSingleSelectedStudent(null)}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          تغيير الطالب
                        </button>
                      </div>

                      {/* Select target class */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-800 mb-1">
                          الصف المستهدف للترفيع:
                        </label>
                        <select
                          value={singleTargetClass}
                          onChange={(e) => setSingleTargetClass(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-white border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                        >
                          {classList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.fullName}
                            </option>
                          ))}
                          <option value="graduated">🎓 تخرج وإنهاء المرحلة الأساسية</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecuteSinglePromotion}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <GraduationCap className="w-4 h-4 text-amber-300" />
                        <span>تأكيد ترفيع الطالب</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* -------------------------------------------------------------
              SUB-TAB 3: MANUAL STUDENT FORM (إضافة يدوية: اسم، ميلاد، صف فقط)
              ------------------------------------------------------------- */}
          {studentSubTab === 'manual' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    نموذج تسجيل طالب جديد
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    المعلومات تقتصر فقط على: الاسم، تاريخ الميلاد، والغرفة الصفية
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitManualStudent} className="space-y-3">
                {/* 1. Student Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    اسم الطالب رباعياً <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    placeholder="اسم الطالب الرباعي"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 focus:bg-white text-slate-900"
                  />
                </div>

                {/* 2. Birth Date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    تاريخ الميلاد (يوم/شهر/سنة)
                  </label>
                  <input
                    type="text"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    placeholder="مثال: 2017/04/15"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 focus:bg-white text-slate-900 font-mono text-left"
                    dir="ltr"
                  />
                </div>

                {/* 3. Class */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    الغرفة الصفية / الشعبة <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={studentForm.classId}
                    onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 focus:bg-white text-slate-900 font-bold"
                  >
                    {classList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-950/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة الطالب إلى الصف فوراً</span>
                </button>
              </form>
            </div>
          )}

          {/* -------------------------------------------------------------
              SUB-TAB 4: AI SMART EXTRACTION (تفريغ الذكاء الاصطناعي)
              ------------------------------------------------------------- */}
          {studentSubTab === 'ai' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        تفريغ بيانات الطلاب بالنص الذكي
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        الصق نصاً لأسماء الطلاب ومواليدهم وصفوفهم
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePasteFromClipboard}
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 border border-blue-200/80 text-[11px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <span>لصق من الحافظة</span>
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    placeholder="الصق هنا النص الكامل للطلاب..."
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 leading-relaxed font-arabic"
                  />
                  {aiRawText && (
                    <button
                      onClick={() => setAiRawText('')}
                      className="absolute top-2 left-2 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors"
                      title="مسح النص"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAIExtract}
                  disabled={isParsing || !aiRawText.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-98 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-950/20"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isParsing ? 'جاري التفريغ...' : 'تفريغ بالذكاء الاصطناعي'}</span>
                </button>
              </div>

              {/* Parsed Candidates Review */}
              {aiParsedStudents.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">
                        تم استخراج ({aiParsedStudents.length}) طلاب
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">راجع البيانات قبل الاعتماد</span>
                  </div>

                  <div className="space-y-2">
                    {aiParsedStudents.map((cand, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/90 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={cand.name}
                            onChange={(e) =>
                              handleUpdateCandidate(idx, { ...cand, name: e.target.value })
                            }
                            placeholder="اسم الطالب"
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                          />
                          <button
                            onClick={() => handleRemoveCandidate(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={cand.birthDate}
                            onChange={(e) =>
                              handleUpdateCandidate(idx, { ...cand, birthDate: e.target.value })
                            }
                            placeholder="تاريخ الميلاد"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                            dir="ltr"
                          />

                          <select
                            value={cand.classId}
                            onChange={(e) => {
                              const sel = classList.find((c) => c.id === e.target.value);
                              handleUpdateCandidate(idx, {
                                ...cand,
                                classId: e.target.value,
                                className: sel?.fullName || cand.className,
                              });
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                          >
                            {classList.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.fullName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveAllAIExtracted}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 hover:from-emerald-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-950/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>اعتماد وحفظ جميع الطلاب ({aiParsedStudents.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          SECTION B: الهيئة التدريسية (TEACHERS MANAGEMENT)
          ========================================================================= */}
      {activeMainTab === 'teachers' && (
        <div className="space-y-3">
          
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setTeacherSubTab('add')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                teacherSubTab === 'add'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>إضافة حساب معلم</span>
            </button>

            <button
              onClick={() => setTeacherSubTab('list')}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                teacherSubTab === 'list'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>قائمة المعلمين ({teachers.length})</span>
            </button>
          </div>

          {teacherSubTab === 'add' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-900 border border-blue-100 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    إنشاء حساب معلم جديد
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    تمكين المعلم من الدخول وتقييم الطلاب
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitTeacher} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-0.5">
                    اسم المعلم الكامل <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                    placeholder="أ. محمد أحمد سمودي"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      اسم المستخدم <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      required
                      value={teacherForm.username}
                      onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                      placeholder="username"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono text-left"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      كلمة المرور المؤقتة
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                      placeholder="samoudi2026"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono text-left"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      المادة التدريسية
                    </label>
                    <input
                      type="text"
                      value={teacherForm.subject}
                      onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                      placeholder="لغة عربية / علوم / رياضيات"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                      هاتف التواصل
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                      placeholder="059xxxxxxx"
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-900 font-mono text-left"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                    الغرفة الصفية المسندة (مربي الصف)
                  </label>
                  <select
                    value={teacherForm.assignedClass}
                    onChange={(e) => setTeacherForm({ ...teacherForm, assignedClass: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1.5 focus:ring-blue-900 text-slate-900 font-bold"
                  >
                    {classList.map((c) => (
                      <option key={c.id} value={c.fullName}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-950/20"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وإنشاء الحساب</span>
                </button>
              </form>
            </div>
          )}

          {teacherSubTab === 'list' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 text-right space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-900" />
                  <h3 className="text-xs font-bold text-slate-900">
                    قائمة الكادر التدريسي
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {teachers.length} معلمين
                </span>
              </div>

              <div className="space-y-2">
                {teachers.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-900 text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-2xs">
                        {tc.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs">{tc.name}</span>
                          <span className="text-[9px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                            نشط
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          {tc.subject} · {tc.assignedClass.replace(' الأساسي', '')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setConfirmDelete({
                          type: 'teacher',
                          id: tc.id,
                          name: tc.name,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف الحساب"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {teachers.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    لا يوجد حسابات معلمين مسجلة حالياً
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Quick Student Promote Modal from Directory Row */}
      {quickPromoteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div
            onClick={() => setQuickPromoteStudent(null)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-10 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              ترفيع الطالب: {quickPromoteStudent.student.name}
            </h3>
            <p className="text-[11px] text-slate-500 text-center mb-3">
              الصف الحالي: <strong className="text-slate-800">{quickPromoteStudent.className}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اختر الصف المستهدف للترفيع:
                </label>
                <select
                  value={quickTargetClass}
                  onChange={(e) => setQuickTargetClass(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-emerald-300 rounded-xl font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                  <option value="graduated">🎓 تخرج وإنهاء المرحلة الأساسية</option>
                </select>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleExecuteQuickPromote}
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  تأكيد الترفيع
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPromoteStudent(null)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Batch Class Promotion Confirmation Modal */}
      {showClassPromotionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div
            onClick={() => setShowClassPromotionConfirm(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-10 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              تأكيد ترفيع الصف كاملاً
            </h3>
            <p className="text-xs text-slate-600 text-center mb-3 leading-relaxed">
              هل أنت متأكد من ترفيع عدد (<strong className="font-bold text-slate-900">{selectedPromoteStudentIds.length}</strong>) طالب من{' '}
              <strong className="text-slate-900">{sourceClassData?.fullName}</strong> إلى{' '}
              <strong className="text-emerald-800">
                {promoteTargetClass === 'graduated'
                  ? 'خريجو المدرسة'
                  : classList.find((c) => c.id === promoteTargetClass)?.fullName}
              </strong>؟
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExecuteClassPromotion}
                className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                نعم، ترفيع الآن
              </button>
              <button
                type="button"
                onClick={() => setShowClassPromotionConfirm(false)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Student Quick Preview Modal (strictly name, birthDate, class) */}
      {previewStudent && (
        <StudentProfileCard
          student={previewStudent}
          classNameTitle={previewStudent.className}
          onClose={() => setPreviewStudent(null)}
        />
      )}

      {/* 4. Official Print Sheet Modal for Admin */}
      {adminPrintModal && (
        <OfficialPrintSheetModal
          isOpen={true}
          onClose={() => setAdminPrintModal(null)}
          mode={adminPrintModal.mode}
          student={adminPrintModal.student}
          classData={adminPrintModal.classData}
        />
      )}

      {/* 5. Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div
            onClick={() => setConfirmDelete(null)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-10 text-right animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2.5">
              <AlertCircle className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-slate-900 text-center mb-1">
              تأكيد عملية الحذف
            </h3>
            <p className="text-xs text-slate-500 text-center mb-3">
              هل أنت متأكد من حذف {confirmDelete.type === 'student' ? 'الطالب' : 'حساب المعلم'} ({confirmDelete.name})؟
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (confirmDelete.type === 'teacher') {
                    onDeleteTeacher(confirmDelete.id as string);
                    showToast(`تم حذف حساب (${confirmDelete.name}) بنجاح`);
                  } else if (confirmDelete.type === 'student' && onDeleteStudent && confirmDelete.classId) {
                    onDeleteStudent(confirmDelete.classId, confirmDelete.id as number);
                    showToast(`تم حذف الطالب (${confirmDelete.name}) بنجاح`);
                  }
                  setConfirmDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-1/2 transform translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
