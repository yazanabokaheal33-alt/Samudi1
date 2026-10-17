/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  User,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  School,
  Printer
} from 'lucide-react';
import { Student, DISTINGUISHED_TAGS, NEEDS_IMPROVEMENT_TAGS } from '../types.ts';
import { getDirection } from '../utils/textDirection.ts';
import { OfficialPrintSheetModal } from './OfficialPrintSheetModal.tsx';

export interface StudentProfileCardProps {
  student: Student;
  classNameTitle?: string;
  onClose: () => void;
  // Evaluation options if allowed
  canEvaluate?: boolean;
  evalType?: 'distinguished' | 'needs_improvement' | null;
  selectedTags?: string[];
  onSelectEvalType?: (type: 'distinguished' | 'needs_improvement') => void;
  onToggleTag?: (tag: string) => void;
  onSaveEvaluation?: () => void;
}

export function StudentProfileCard({
  student,
  classNameTitle,
  onClose,
  canEvaluate = false,
  evalType,
  selectedTags = [],
  onSelectEvalType,
  onToggleTag,
  onSaveEvaluation,
}: StudentProfileCardProps) {
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

  const studentNameDir = getDirection(student.name);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Dialog */}
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-6 z-10 text-right overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col font-arabic">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                title="طباعة استمارة الطالب"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-blue-800" />
                <span>طباعة</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <div dir={studentNameDir} className={studentNameDir === 'rtl' ? 'text-right' : 'text-left'}>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {student.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  بيانات الطالب الأساسية
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0 font-bold text-sm">
                {student.name.trim().charAt(0) || <User className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* Student Info: Name, BirthDate, Class ONLY */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
            
            {/* 1. اسم الطالب */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-800" />
                <span>اسم الطالب:</span>
              </span>
              <span className="font-bold text-slate-950 text-xs sm:text-sm">
                {student.name}
              </span>
            </div>

            {/* 2. تاريخ الميلاد */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-800" />
                <span>تاريخ الميلاد:</span>
              </span>
              <span className="font-bold text-slate-950 font-mono text-xs">
                {student.birthDate || '—'}
              </span>
            </div>

            {/* 3. الصف الدراسي */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-blue-950 text-xs font-semibold flex items-center gap-1.5">
                <School className="w-4 h-4 text-blue-800" />
                <span>الصف:</span>
              </span>
              <span className="font-bold text-blue-900 text-xs">
                {classNameTitle || 'الغرفة الصفية'}
              </span>
            </div>

            {/* Evaluation Section if teacher can evaluate */}
            {canEvaluate && onSelectEvalType && onToggleTag && onSaveEvaluation && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  تقييم السلوك والأداء الصفي:
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectEvalType('distinguished')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      evalType === 'distinguished'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>متميز</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectEvalType('needs_improvement')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      evalType === 'needs_improvement'
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>بحاجة لمتابعة</span>
                  </button>
                </div>

                {evalType && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-slate-500">اختر عبارات التقييم:</p>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                      {(evalType === 'distinguished' ? DISTINGUISHED_TAGS : NEEDS_IMPROVEMENT_TAGS).map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => onToggleTag(tag)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? evalType === 'distinguished'
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-rose-600 text-white font-bold'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onSaveEvaluation}
                  disabled={!evalType}
                  className="w-full py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>حفظ التقييم</span>
                </button>
              </div>
            )}

            {/* Read-only Evaluation if already evaluated and not in edit mode */}
            {!canEvaluate && student.evaluation && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">التقييم المسجل:</span>
                  <span className="text-xs font-bold text-slate-900">
                    {student.evaluation.type === 'distinguished' ? '⭐ متميز' : '⚠️ بحاجة لمتابعة'}
                  </span>
                </div>
                {student.evaluation.tags && student.evaluation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {student.evaluation.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer Close Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>

        </div>
      </div>

      {/* Official Print Modal */}
      {isPrintModalOpen && (
        <OfficialPrintSheetModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          mode="student"
          student={student}
          classData={
            classNameTitle
              ? {
                  id: '',
                  gradeNumber: 0,
                  gradeName: classNameTitle,
                  sectionName: '',
                  fullName: classNameTitle,
                  supervisor: 'إدارة المدرسة',
                  studentsCount: 1,
                  students: [student],
                }
              : undefined
          }
        />
      )}
    </>
  );
}
