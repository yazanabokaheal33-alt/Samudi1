/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Student, ClassSection } from '../types.ts';
import { getDirection } from '../utils/textDirection.ts';

export interface OfficialPrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'student' | 'classroom';
  student?: Student;
  classData?: ClassSection;
}

export function OfficialPrintSheetModal({
  isOpen,
  onClose,
  mode,
  student,
  classData,
}: OfficialPrintSheetModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Current formatted date in Arabic
  const todayArabic = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return createPortal(
    <div id="official-print-portal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-arabic print:p-0 print:m-0 print:static print:block">
      {/* Backdrop (hidden during print) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs no-print transition-opacity"
        aria-hidden="true"
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 z-10 my-auto flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                معاينة الطباعة الرسمية - مدرسة السمودي الأساسية
              </h3>
              <p className="text-[10px] text-slate-300">
                {mode === 'student' ? 'استمارة قيد وبيانات طالب رسمية' : `كشف الغرفة الصفية (${classData?.fullName || ''})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الآن / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Canvas Wrapper */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/70 flex justify-center">
          
          {/* THE OFFICIAL PRINTABLE A4 SHEET */}
          <div
            ref={printRef}
            id="official-print-paper"
            className="w-full max-w-[210mm] min-h-[285mm] bg-white text-slate-950 p-6 sm:p-10 shadow-lg border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 flex flex-col justify-between"
            dir="rtl"
          >
            <div>
              {/* 1. OFFICIAL MINISTRY & SCHOOL HEADER */}
              <div className="relative pb-4 border-b-2 border-slate-900 mb-5">
                <div className="grid grid-cols-3 items-center gap-2">
                  
                  {/* RIGHT COLUMN */}
                  <div className="text-right text-xs leading-relaxed font-semibold text-slate-900">
                    <p className="font-bold text-sm text-slate-950">دولة فلسطين</p>
                    <p className="text-xs">وزارة التربية والتعليم العالي</p>
                    <p className="text-xs">مديرية التربية والتعليم - جنين</p>
                    <p className="text-xs font-bold text-blue-950">
                      مدرسة السمودي الأساسية للبنين
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                      الرقم الوزاري: 14120803
                    </p>
                  </div>

                  {/* CENTER COLUMN: Official Crest Logo */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-amber-600/70 shadow-xs p-1 bg-white flex items-center justify-center">
                      <img
                        src="/school-logo.png"
                        alt="شعار مدرسة السمودي الأساسية للبنين"
                        className="w-full h-full object-contain rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/school-logo.jpg';
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 mt-1 block">
                      بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
                    </span>
                  </div>

                  {/* LEFT COLUMN */}
                  <div className="text-left text-xs leading-relaxed text-slate-800" dir="ltr">
                    <div className="text-right" dir="rtl">
                      <p className="text-[11px]">
                        <span className="font-semibold text-slate-600">التاريخ: </span>
                        <span className="font-bold text-slate-900">{todayArabic}</span>
                      </p>
                      <p className="text-[11px]">
                        <span className="font-semibold text-slate-600">العام الدراسي: </span>
                        <span className="font-bold text-slate-900">2025 / 2026</span>
                      </p>
                      <p className="text-[11px]">
                        <span className="font-semibold text-slate-600">نوع الوثيقة: </span>
                        <span className="font-bold text-blue-900">
                          {mode === 'student' ? 'استمارة قيد طالب' : 'كشف الغرفة الصفية'}
                        </span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Subtitle Badge */}
                <div className="mt-3 text-center">
                  <span className="inline-block px-4 py-1 bg-slate-900 text-white rounded-full text-xs font-bold tracking-wide">
                    {mode === 'student' ? 'استمارة تسجيل وبيانات الطالب الرسمية' : `كشف طلبة ${classData?.fullName || ''}`}
                  </span>
                </div>
              </div>

              {/* CONTENT: STUDENT MODE (Name, BirthDate, Class ONLY) */}
              {mode === 'student' && student && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs font-semibold">
                    <div>
                      <span className="text-slate-600">الغرفة الصفية: </span>
                      <span className="text-slate-950 font-bold">
                        {classData?.fullName || 'مدرسة السمودي الأساسية للبنين'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">مربي الصف: </span>
                      <span className="text-slate-950 font-bold">
                        {classData?.supervisor || 'أ. محمود عبد الرحمن'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">العام الدراسي: </span>
                      <span className="text-slate-950 font-bold font-mono">
                        2025 / 2026
                      </span>
                    </div>
                  </div>

                  {/* Main Student Data Table: Name, BirthDate, Class ONLY */}
                  <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-right border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="w-1/3 bg-slate-100 p-3 font-bold text-slate-800 border-l border-slate-300">
                            اسم الطالب رباعياً:
                          </td>
                          <td className="w-2/3 p-3 font-bold text-sm text-slate-950">
                            <div dir={getDirection(student.name)} className={getDirection(student.name) === 'rtl' ? 'text-right' : 'text-left'}>
                              {student.name}
                            </div>
                          </td>
                        </tr>

                        <tr className="border-b border-slate-300">
                          <td className="w-1/3 bg-slate-100 p-3 font-bold text-slate-800 border-l border-slate-300">
                            تاريخ الميلاد:
                          </td>
                          <td className="w-2/3 p-3 font-mono font-bold text-slate-950">
                            <span dir="ltr" className="inline-block font-mono text-xs">
                              {student.birthDate || '—'}
                            </span>
                          </td>
                        </tr>

                        <tr>
                          <td className="w-1/3 bg-slate-100 p-3 font-bold text-slate-800 border-l border-slate-300">
                            الصف الدراسي المقيد به:
                          </td>
                          <td className="w-2/3 p-3 font-bold text-blue-950 text-xs">
                            {classData?.fullName || 'مدرسة السمودي الأساسية'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Student Academic & Behavioral Evaluation */}
                  <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                    <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center justify-between pb-1 border-b border-slate-200">
                      <span>التقييم الأكاديمي والملاحظات السلوكية:</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        سجل المتابعة التربوية
                      </span>
                    </h4>

                    {student.evaluation ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">مستوى الطالب:</span>
                          <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                            student.evaluation.type === 'distinguished'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {student.evaluation.type === 'distinguished'
                              ? '⭐ طالب متميز ومتفوق سلوكياً وأكاديمياً'
                              : '⚠️ بحاجة إلى متابعة ورعاية تربوية'}
                          </span>
                        </div>

                        {student.evaluation.tags && student.evaluation.tags.length > 0 && (
                          <div className="mt-2">
                            <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                              مجالات التقييم المعتمدة:
                            </span>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-800">
                              {student.evaluation.tags.map((tag, i) => (
                                <div key={i} className="flex items-center gap-1.5 p-1 bg-white rounded border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                  <span>{tag}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-600">
                        الطالب منتظم في دوامه وسير دراسته ولم تسجل عليه أي مخالفات سلوكية أو صعوبات تعلم حرجة.
                      </p>
                    )}
                  </div>

                  {/* Administrative Note */}
                  <div className="p-2.5 rounded bg-amber-50/70 border border-amber-200 text-[10px] text-amber-950 leading-relaxed">
                    <strong>تنبيه إداري رسمي:</strong> هذه الوثيقة معتمدة ومستخرجة من المنظومة الرقمية لمدرسة المرحوم أحمد عبد الوهاب السمودي الأساسية للبنين، وتستخدم للأغراض الرسمية، التحويل المدرسي، والسجلات الإدارية الصادرة للمديرية.
                  </div>
                </div>
              )}

              {/* CONTENT: CLASSROOM MODE (Index, Name, BirthDate, Class ONLY) */}
              {mode === 'classroom' && classData && (
                <div className="space-y-4">
                  {/* Classroom Details Summary Bar */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-300 text-xs font-semibold">
                    <div>
                      <span className="text-slate-600">الغرفة الصفية: </span>
                      <span className="text-slate-950 font-bold">{classData.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">مربي الصف: </span>
                      <span className="text-slate-950 font-bold">{classData.supervisor}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">إجمالي عدد الطلبة: </span>
                      <span className="text-slate-950 font-bold font-mono">
                        {classData.students?.length || 0} طالب
                      </span>
                    </div>
                  </div>

                  {/* Classroom Roster Table */}
                  <div className="border-2 border-slate-900 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[11px] font-bold">
                          <th className="p-2.5 text-center w-12 border-l border-slate-700">م</th>
                          <th className="p-2.5 border-l border-slate-700">اسم الطالب</th>
                          <th className="p-2.5 border-l border-slate-700 text-center w-36">تاريخ الميلاد</th>
                          <th className="p-2.5 border-l border-slate-700 text-center w-40">الصف المقيد به</th>
                          <th className="p-2.5 text-center w-28">ملاحظات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {classData.students && classData.students.length > 0 ? (
                          classData.students.map((st, idx) => (
                            <tr key={st.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="p-2.5 text-center font-bold text-slate-700 border-l border-slate-200">
                                {idx + 1}
                              </td>
                              <td className="p-2.5 font-bold text-slate-950 border-l border-slate-200">
                                <div dir={getDirection(st.name)} className={getDirection(st.name) === 'rtl' ? 'text-right' : 'text-left'}>
                                  {st.name}
                                </div>
                              </td>
                              <td className="p-2.5 font-mono text-xs text-center border-l border-slate-200 font-semibold text-slate-800">
                                <span dir="ltr">{st.birthDate || '—'}</span>
                              </td>
                              <td className="p-2.5 text-xs text-center border-l border-slate-200 font-bold text-blue-950">
                                {classData.fullName}
                              </td>
                              <td className="p-2.5 text-center text-[10px] text-slate-500">
                                {st.evaluation?.type === 'distinguished'
                                  ? '⭐ متميز'
                                  : st.evaluation?.type === 'needs_improvement'
                                  ? '⚠️ متابعة'
                                  : 'ـــــ'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-xs text-slate-500">
                              لا يوجد طلبة مسجلين حالياً في هذه الشعبة الصفية
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* OFFICIAL SIGNATURES & STAMP FOOTER */}
            <div className="mt-8 pt-4 border-t-2 border-slate-900">
              <div className="grid grid-cols-3 gap-4 text-center text-xs font-bold text-slate-900">
                
                {/* 1. Class Supervisor */}
                <div className="space-y-2">
                  <p className="text-slate-700">مربي الصف</p>
                  <p className="font-semibold text-slate-900">
                    {classData?.supervisor || 'أ. محمود عبد الرحمن'}
                  </p>
                  <div className="pt-6 border-b border-dashed border-slate-400 w-32 mx-auto" />
                  <p className="text-[10px] text-slate-500 font-normal">التوقيع</p>
                </div>

                {/* 2. School Official Stamp Area */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-400 p-1">
                    <span className="text-[9px] font-bold text-slate-500 leading-tight">
                      ختم المدرسة
                    </span>
                    <span className="text-[8px] text-slate-400">
                      مدرسة السمودي الأساسية
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">الختم الرسمي للمؤسسة</span>
                </div>

                {/* 3. School Principal */}
                <div className="space-y-2">
                  <p className="text-slate-700">مدير المدرسة</p>
                  <p className="font-bold text-slate-950">
                    أ. أسامة سمودي
                  </p>
                  <div className="pt-6 border-b border-dashed border-slate-400 w-32 mx-auto" />
                  <p className="text-[10px] text-slate-500 font-normal">التوقيع والاعتماد</p>
                </div>

              </div>

              {/* Bottom Copyright & Verification Line */}
              <div className="mt-6 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-arabic">
                <span>
                  مدرسة المرحوم أحمد عبد الوهاب السمودي الأساسية للبنين - جنين - اليامون
                </span>
                <span>
                  صفحة 1 من 1 | طبع بتاريخ: {todayArabic}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Controls */}
        <div className="no-print bg-white p-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>جاهز للطباعة بدقة قياسية A4 - مع ترويسة وزارة التربية والتعليم واللوجو الرسمي</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة المستند</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
