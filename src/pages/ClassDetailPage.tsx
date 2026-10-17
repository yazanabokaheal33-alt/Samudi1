/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  Users,
  Search,
  ClipboardList,
  Sparkles,
  User,
  Phone,
  MapPin,
  Calendar,
  HeartPulse,
  Award,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  ChevronLeft,
  Printer
} from 'lucide-react';
import {
  Student,
  DISTINGUISHED_TAGS,
  NEEDS_IMPROVEMENT_TAGS,
  ClassSection
} from '../types.ts';
import { StudentProfileCard } from '../components/StudentProfileCard.tsx';
import { OfficialPrintSheetModal } from '../components/OfficialPrintSheetModal.tsx';
import { LTRValue, getDirection } from '../utils/textDirection.ts';

interface ClassDetailPageProps {
  classData: ClassSection;
  onBack: () => void;
  onUpdateStudent: (classId: string, updatedStudent: Student) => void;
}

export default function ClassDetailPage({
  classData,
  onBack,
  onUpdateStudent,
}: ClassDetailPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Evaluation modal/selector state
  const [evalType, setEvalType] = useState<'distinguished' | 'needs_improvement' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const isGradeTwo = classData.id === 'grade-2';
  const hasStudents = Boolean(classData.students && classData.students.length > 0);

  const filteredStudents = (classData.students || []).filter((s) =>
    s.name.includes(searchTerm) || (s.birthDate && s.birthDate.includes(searchTerm))
  );

  const handleOpenStudent = (student: Student) => {
    setSelectedStudent(student);
    if (student.evaluation && student.evaluation.type !== 'regular') {
      setEvalType(student.evaluation.type);
      setSelectedTags(student.evaluation.tags || []);
    } else {
      setEvalType(null);
      setSelectedTags([]);
    }
  };

  const handleSelectEvalType = (type: 'distinguished' | 'needs_improvement') => {
    if (evalType === type) {
      // Keep or toggle
      return;
    }
    setEvalType(type);
    // Pre-populate with existing tags if matching type, else clean
    if (selectedStudent?.evaluation?.type === type) {
      setSelectedTags(selectedStudent.evaluation.tags || []);
    } else {
      setSelectedTags([]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSaveEvaluation = () => {
    if (!selectedStudent || !evalType) return;

    const updated: Student = {
      ...selectedStudent,
      evaluation: {
        type: evalType,
        tags: selectedTags,
        updatedAt: new Date().toLocaleDateString('ar-EG'),
      },
    };

    onUpdateStudent(classData.id, updated);
    setSelectedStudent(updated);

    // Show confirmation toast
    setToastMessage(`تم حفظ تقييم الطالب (${updated.name}) بنجاح`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div
      className={`flex-1 flex flex-col w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6 font-arabic animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isGradeTwo ? 'select-none' : ''
      }`}
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-900 text-xs font-semibold border border-slate-200 shadow-2xs active:scale-95 transition-all cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للغرف الصفية</span>
        </button>

        <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/80">
          العام الدراسي 2025 - 2026
        </span>
      </div>

      {/* Classroom Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs mb-4 text-right relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0a2540] to-[#144272] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
            {classData.gradeNumber}
            {classData.sectionName ? ` ${classData.sectionName}` : ''}
          </div>

          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              {classData.fullName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              مدرسة المرحوم أحمد عبد الوهاب السمودي الأساسية للبنين
            </p>
          </div>
        </div>

        {/* Supervisor info & Print Button */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-800" />
            <span>مربي الصف:</span>
            <span className="font-semibold text-slate-900">{classData.supervisor}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasStudents && (
              <div className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                {classData.students?.length} طلاب
              </div>
            )}
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              title="طباعة كشف الغرفة الصفية مع ترويسة الوزارة واللوجو"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>طباعة كشف الصف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Students List or Empty State */}
      {hasStudents ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 text-right">
          
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-800" />
              <span>قائمة طلبة {classData.gradeName}</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              انقر على أي طالب لعرض ملفه وتقييمه
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث باسم الطالب أو تاريخ الميلاد..."
              className="w-full pr-8 pl-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Students List */}
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
            {filteredStudents.map((student, idx) => {
              const evalType = student.evaluation?.type;

              return (
                <button
                  key={student.id}
                  onClick={() => handleOpenStudent(student)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50/90 active:bg-slate-100 transition-colors text-xs text-right cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-900 group-hover:border-blue-200 transition-colors">
                      {idx + 1}
                    </span>
                    <div>
                      <div dir={getDirection(student.name)} className={getDirection(student.name) === 'rtl' ? 'text-right' : 'text-left'}>
                        <span className="font-bold text-slate-900 block leading-tight text-xs sm:text-sm">
                          {student.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                        <span>الميلاد:</span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {student.birthDate || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Evaluation Badge */}
                    {evalType === 'distinguished' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>متميز</span>
                      </span>
                    )}

                    {evalType === 'needs_improvement' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md shadow-2xs">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>بحاجة لتحسين</span>
                      </span>
                    )}

                    {(!evalType || evalType === 'regular') && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        منتظم
                      </span>
                    )}

                    <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-800 group-hover:-translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })}

            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                لا توجد نتائج مطابقة لاسم البحث
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Empty Classrooms (3, 4a, 4b, 5, 6, 7, 8, 9) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
            <GraduationCap className="w-6 h-6 text-blue-900/40" />
          </div>
          
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            غرفة {classData.fullName}
          </h3>
          
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            الغرفة الصفية جاهزة. لم يتم إدراج أسماء الطلبة لهذا الصف بعد.
          </p>

          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-[11px] text-slate-500 border border-slate-200/80">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>شعبة مفتوحة بإشراف {classData.supervisor}</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDENT FULL PROFILE & EVALUATION MODAL (STRICT RTL/LTR DISCIPLINE)
          ========================================================================= */}
      {selectedStudent && (
        <StudentProfileCard
          student={selectedStudent}
          classNameTitle={classData.fullName}
          onClose={() => setSelectedStudent(null)}
          canEvaluate={true}
          evalType={evalType}
          selectedTags={selectedTags}
          onSelectEvalType={handleSelectEvalType}
          onToggleTag={toggleTag}
          onSaveEvaluation={handleSaveEvaluation}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-1/2 transform translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Classroom Printable Sheet Modal */}
      <OfficialPrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        mode="classroom"
        classData={classData}
      />

    </div>
  );
}
