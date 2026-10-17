/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserCheck,
  BookOpen,
  Calendar,
  Clock,
  Award,
  Sparkles,
  ChevronLeft,
  LogOut,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Users,
  School,
  Phone,
  Mail,
  Filter,
  Check,
  X
} from 'lucide-react';
import {
  TeacherAccount,
  ClassSection,
  TeacherActivityLog
} from '../types.ts';
import { LTRValue } from '../utils/textDirection.ts';

interface TeacherProfileViewProps {
  currentTeacher: TeacherAccount;
  classList: ClassSection[];
  activities: TeacherActivityLog[];
  onAddActivity: (activity: TeacherActivityLog) => void;
  onLogoutTeacher: () => void;
  onNavigateClassroom: (classId: string) => void;
  onNavigateHome: () => void;
}

export default function TeacherProfileView({
  currentTeacher,
  classList,
  activities,
  onAddActivity,
  onLogoutTeacher,
  onNavigateClassroom,
  onNavigateHome,
}: TeacherProfileViewProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New action form state
  const [newActionType, setNewActionType] = useState<'grade' | 'evaluation' | 'attendance' | 'note'>('grade');
  const [newStudentName, setNewStudentName] = useState('');
  const [newClassName, setNewClassName] = useState(currentTeacher.assignedClass);
  const [newDescription, setNewDescription] = useState('');

  // 1. Resolve classes taught by this teacher
  const taughtClassesList = classList.filter((c) => {
    if (currentTeacher.taughtClasses && currentTeacher.taughtClasses.includes(c.id)) {
      return true;
    }
    if (c.supervisor === currentTeacher.name) {
      return true;
    }
    if (currentTeacher.assignedClass && (
      c.fullName.includes(currentTeacher.assignedClass) ||
      currentTeacher.assignedClass.includes(c.gradeName)
    )) {
      return true;
    }
    return false;
  });

  // Fallback: if no specific class matches, show at least the assigned class or first 2 classes
  const displayClasses = taughtClassesList.length > 0 ? taughtClassesList : classList.slice(0, 2);

  // 2. Filter activities for this teacher (or all school activity logged by teacher)
  const teacherActivities = activities.filter(
    (act) => !act.teacherId || act.teacherId === currentTeacher.id || act.teacherName === currentTeacher.name
  );

  const filteredActivities = teacherActivities.filter((act) => {
    if (filterType === 'all') return true;
    return act.actionType === filterType;
  });

  // Format today's Arabic date & time
  const formatCurrentArabicDate = () => {
    const now = new Date();
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ];
    const dayName = days[now.getDay()];
    const dayNum = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    return `${dayName}، ${dayNum} ${monthName} ${year}`;
  };

  const formatCurrentArabicTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  // Submit quick action
  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    let title = 'حركة جديدة';
    if (newActionType === 'grade') title = 'رصد علامة طالب';
    else if (newActionType === 'evaluation') title = 'إضافة تقييم تربوي وسلوكي';
    else if (newActionType === 'attendance') title = 'تسجيل حضور وغياب';
    else if (newActionType === 'note') title = 'ملاحظة مدرسية وواجبات';

    const newLog: TeacherActivityLog = {
      id: `act-${Date.now()}`,
      teacherId: currentTeacher.id,
      teacherName: currentTeacher.name,
      actionType: newActionType,
      title,
      description: newDescription.trim(),
      studentName: newStudentName.trim() || undefined,
      className: newClassName,
      dateStr: formatCurrentArabicDate(),
      timeStr: formatCurrentArabicTime(),
      createdAt: new Date().toISOString(),
    };

    onAddActivity(newLog);
    setIsAddModalOpen(false);
    setNewDescription('');
    setNewStudentName('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-6 text-right font-arabic animate-in fade-in duration-300">
      
      {/* =========================================================================
          1. TEACHER INFORMATION CARD (معلومات المعلم البسيطة)
          ========================================================================= */}
      <section className="bg-gradient-to-br from-[#0a2540] via-[#0d3b66] to-[#144272] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-blue-400/25 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status Strip */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>معلم معتمد ومصرح</span>
          </div>

          <span className="text-[10px] sm:text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-lg">
            العام الدراسي 2025 - 2026
          </span>
        </div>

        {/* Teacher Main Identity */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-xl sm:text-2xl shadow-lg ring-2 ring-amber-300/40 shrink-0">
              {currentTeacher.name.replace('أ. ', '').charAt(0)}
            </div>

            <div>
              <span className="text-xs text-blue-200 block">
                مرحباً بك يا صانع الأجيال
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentTeacher.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                {currentTeacher.subject}
              </p>
            </div>
          </div>

          {/* Quick Logout */}
          <button
            type="button"
            onClick={onLogoutTeacher}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer self-start sm:self-center active:scale-95 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>

        {/* Simple Teacher Info Grid */}
        <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs relative z-10">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 block mb-0.5">مربّي الصف:</span>
            <span className="font-bold text-white text-xs sm:text-sm block truncate">
              {currentTeacher.assignedClass}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 block mb-0.5">اسم المستخدم:</span>
            <LTRValue className="font-bold text-white text-xs sm:text-sm block truncate">
              {currentTeacher.username}
            </LTRValue>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 block mb-0.5">رقم التواصل:</span>
            <LTRValue className="font-bold text-white text-xs sm:text-sm block truncate">
              {currentTeacher.phone}
            </LTRValue>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10">
            <span className="text-[10px] text-blue-200 block mb-0.5">المدرسة:</span>
            <span className="font-bold text-white text-xs sm:text-sm block truncate">
              مدرسة السمودي للبنين
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CLASSES I TEACH (الصفوف التي أدرّسها)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                الصفوف التي أدرّسها
              </h2>
              <p className="text-[11px] text-slate-500">
                الشعب الدراسية المسندة إليك لإدخال العلامات ومتابعة الطلاب
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {displayClasses.length} شعب دراسية
          </span>
        </div>

        {/* Classes Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayClasses.map((cls) => {
            const isAssignedLeader = currentTeacher.assignedClass.includes(cls.fullName) || cls.supervisor === currentTeacher.name;
            const studentsTotal = cls.students?.length || cls.studentsCount || 0;

            return (
              <div
                key={cls.id}
                className="bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-blue-950 group-hover:text-blue-900">
                      {cls.fullName}
                    </span>
                    {isAssignedLeader ? (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200/70">
                        مربّي الصف
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md">
                        معلم مادة
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>عدد الطلاب: <strong className="text-slate-900 font-bold">{studentsTotal}</strong> طالب</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span>المربي: {cls.supervisor}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateClassroom(cls.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white group-hover:bg-blue-900 group-hover:text-white text-slate-800 text-xs font-bold border border-slate-200 group-hover:border-blue-900 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs active:scale-98"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>دخول الغرفة الصفية</span>
                  <ChevronLeft className="w-3.5 h-3.5 mr-auto" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          3. RECENT ACTIVITY LOG / TIMELINE (سجل آخر الحركات: بيوم وساعة)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                سجل آخر الحركات والتعديلات
              </h2>
              <p className="text-[11px] text-slate-500">
                تاريخ وتوقيت الحركات التي قمت بها (رصد علامة، تقييم سلوكي، متابعة)
              </p>
            </div>
          </div>

          {/* Add Quick Movement Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل حركة جديدة</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            جميع الحركات ({teacherActivities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('grade')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'grade'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            علامات الطلاب
          </button>
          <button
            type="button"
            onClick={() => setFilterType('evaluation')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'evaluation'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            التقييمات السلوكية
          </button>
          <button
            type="button"
            onClick={() => setFilterType('attendance')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              filterType === 'attendance'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            الحضور والملاحظات
          </button>
        </div>

        {/* Activities Timeline */}
        {filteredActivities.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">
              لا توجد حركات مسجلة بهذا التصنيف حالياً
            </p>
          </div>
        ) : (
          <div className="relative border-r-2 border-blue-200/70 mr-3 pr-4 sm:pr-6 space-y-4">
            {filteredActivities.map((act) => {
              // Icon & badge by type
              let badgeColor = 'bg-blue-50 text-blue-900 border-blue-200';
              let Icon = FileText;
              let label = 'حركة';

              if (act.actionType === 'grade') {
                badgeColor = 'bg-emerald-50 text-emerald-900 border-emerald-200';
                Icon = Award;
                label = 'رصد علامة';
              } else if (act.actionType === 'evaluation') {
                badgeColor = 'bg-amber-50 text-amber-900 border-amber-200';
                Icon = Sparkles;
                label = 'تقييم سلوكي';
              } else if (act.actionType === 'attendance') {
                badgeColor = 'bg-indigo-50 text-indigo-900 border-indigo-200';
                Icon = CheckCircle2;
                label = 'حضور وغياب';
              } else if (act.actionType === 'note') {
                badgeColor = 'bg-purple-50 text-purple-900 border-purple-200';
                Icon = FileText;
                label = 'ملاحظة تربوية';
              }

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -right-[23px] sm:-right-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-3 border-blue-900 shadow-2xs group-hover:scale-125 transition-transform" />

                  {/* Card Container */}
                  <div className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-200 hover:shadow-xs transition-all">
                    
                    {/* Timestamp Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200/60">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${badgeColor}`}>
                          <Icon className="w-3 h-3" />
                          <span>{label}</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-800">
                          {act.className}
                        </span>
                      </div>

                      {/* Exact Day, Date & Hour */}
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
                        <Calendar className="w-3.5 h-3.5 text-blue-800" />
                        <span>{act.dateStr}</span>
                        <span className="text-slate-300">|</span>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-slate-900 font-bold">{act.timeStr}</span>
                      </div>
                    </div>

                    {/* Action Title & Student Target */}
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{act.title}</span>
                      </h3>

                      {act.studentName && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-950 bg-blue-100/70 px-2.5 py-0.5 rounded-md my-1">
                          <User className="w-3 h-3 text-blue-800" />
                          <span>الطالب: {act.studentName}</span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {act.description}
                      </p>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          4. MODAL: ADD QUICK ACTION (تسجيل حركة سريعة بيوم وساعة)
          ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsAddModalOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 z-10 text-right animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تسجيل حركة جديدة للمعلم
                </h3>
                <p className="text-[11px] text-slate-500">
                  سيتم توثيقها تلقائياً بتاريخ اليوم وساعة التسجيل الحالية
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-3.5">
              
              {/* Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نوع الحركة:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewActionType('grade')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newActionType === 'grade'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    رصد علامة طالب
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewActionType('evaluation')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newActionType === 'evaluation'
                        ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    تقييم سلوكي / أكاديمي
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewActionType('attendance')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newActionType === 'attendance'
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-400 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    حضور وغياب
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewActionType('note')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      newActionType === 'note'
                        ? 'bg-purple-50 text-purple-900 border-purple-400 shadow-2xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ملاحظة واجبات
                  </button>
                </div>
              </div>

              {/* Class Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الصف الدراسي:
                </label>
                <select
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {displayClasses.map((c) => (
                    <option key={c.id} value={c.fullName}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الطالب (اختياري):
                </label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="مثال: أحمد عبد الوهاب السمودي"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تفاصيل الحركة (مثلاً: رصد علامة 20/20، أو تفوق في القراءة):
                </label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="اكتب ما قمت به بالتفصيل..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Live Preview of Date & Time */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between">
                <span>سيتم الحفظ بتاريخ: <strong>{formatCurrentArabicDate()}</strong></span>
                <span>الساعة: <strong>{formatCurrentArabicTime()}</strong></span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  حفظ وتوثيق الحركة
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
