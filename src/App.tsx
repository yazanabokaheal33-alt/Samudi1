/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  School,
  LayoutGrid,
  Info,
  Phone,
  ChevronLeft,
  ShieldCheck,
  KeyRound,
  LogOut
} from 'lucide-react';
import HomePage from './pages/HomePage.tsx';
import ClassroomsPage from './pages/ClassroomsPage.tsx';
import ClassDetailPage from './pages/ClassDetailPage.tsx';
import AdminDashboardPage from './pages/AdminDashboardPage.tsx';
import TeacherLoginPage from './pages/TeacherLoginPage.tsx';
import {
  INITIAL_CLASS_ROOMS,
  INITIAL_TEACHERS,
  INITIAL_TEACHER_ACTIVITIES,
  ClassSection,
  Student,
  TeacherAccount,
  TeacherActivityLog,
  AppRoute
} from './types.ts';
import { PWAInstallButton } from './components/PWAInstallButton.tsx';
import BottomNavBar from './components/BottomNavBar.tsx';
import { LTRValue } from './utils/textDirection.ts';

function parseHash(hash: string): AppRoute {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean || clean === 'home') {
    return { type: 'home' };
  }
  if (clean === 'classrooms') {
    return { type: 'classrooms' };
  }
  if (clean === 'admin') {
    return { type: 'admin' };
  }
  if (clean === 'teacher-login' || clean === 'login') {
    return { type: 'teacher-login' };
  }
  if (clean.startsWith('classrooms/')) {
    const classId = clean.replace('classrooms/', '');
    return { type: 'class-detail', classId };
  }
  return { type: 'home' };
}

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    parseHash(window.location.hash)
  );

  const [classList, setClassList] = useState<ClassSection[]>(() => {
    try {
      localStorage.removeItem('samoudi_school_classes_v1');
      const saved = localStorage.getItem('samoudi_school_classes_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CLASS_ROOMS;
  });

  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => {
    try {
      const saved = localStorage.getItem('samoudi_school_teachers_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TEACHERS;
  });

  const [currentTeacher, setCurrentTeacher] = useState<TeacherAccount | null>(() => {
    try {
      const saved = localStorage.getItem('samoudi_logged_teacher_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const handleLoginTeacher = (teacher: TeacherAccount) => {
    setCurrentTeacher(teacher);
    try {
      localStorage.setItem('samoudi_logged_teacher_v1', JSON.stringify(teacher));
    } catch {
      // Storage restricted
    }
  };

  const handleLogoutTeacher = () => {
    setCurrentTeacher(null);
    try {
      localStorage.removeItem('samoudi_logged_teacher_v1');
    } catch {
      // Storage restricted
    }
  };

  const [activities, setActivities] = useState<TeacherActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem('samoudi_teacher_activities_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_TEACHER_ACTIVITIES;
  });

  const handleAddActivity = (newActivity: TeacherActivityLog) => {
    setActivities((prev) => {
      const next = [newActivity, ...prev];
      try {
        localStorage.setItem('samoudi_teacher_activities_v1', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Sync state with window hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(parseHash(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);

  // Update existing student evaluation
  const handleUpdateStudent = (classId: string, updatedStudent: Student) => {
    setClassList((prev) => {
      const next = prev.map((c) => {
        if (c.id !== classId) return c;
        const students = (c.students || []).map((s) =>
          s.id === updatedStudent.id ? updatedStudent : s
        );
        return { ...c, students };
      });
      try {
        localStorage.setItem('samoudi_school_classes_v2', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });

    // Auto-record activity if a teacher is logged in and student has evaluation
    if (currentTeacher && updatedStudent.evaluation) {
      const isDist = updatedStudent.evaluation.type === 'distinguished';
      const isNeeds = updatedStudent.evaluation.type === 'needs_improvement';
      if (isDist || isNeeds) {
        const targetClass = classList.find((c) => c.id === classId);
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
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12 || 12;

        const autoLog: TeacherActivityLog = {
          id: `act-${Date.now()}`,
          teacherId: currentTeacher.id,
          teacherName: currentTeacher.name,
          actionType: 'evaluation',
          title: isDist ? 'إضافة تقييم سلوكي وأكاديمي متميز' : 'إضافة تقييم بحاجة إلى تحسين ومتابعة',
          description: `تقييم الطالب (${updatedStudent.name}): ${(updatedStudent.evaluation.tags || []).join('، ')} ${
            updatedStudent.evaluation.notes ? ` - ملاحظات: ${updatedStudent.evaluation.notes}` : ''
          }`,
          studentName: updatedStudent.name,
          className: targetClass?.fullName || 'الغرفة الصفية',
          dateStr: `${dayName}، ${dayNum} ${monthName} ${year}`,
          timeStr: `${hours}:${minutes} ${ampm}`,
          createdAt: new Date().toISOString(),
        };
        handleAddActivity(autoLog);
      }
    }
  };

  // Add new student from Admin Dashboard
  const handleAddStudent = (classId: string, newStudent: Student) => {
    setClassList((prev) => {
      const next = prev.map((c) => {
        if (c.id !== classId) return c;
        const students = [...(c.students || []), newStudent];
        return { ...c, students, studentsCount: students.length };
      });
      try {
        localStorage.setItem('samoudi_school_classes_v2', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });
  };

  // Add new teacher from Admin Dashboard
  const handleAddTeacher = (newTeacher: TeacherAccount) => {
    setTeachers((prev) => {
      const next = [newTeacher, ...prev];
      try {
        localStorage.setItem('samoudi_school_teachers_v1', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });
  };

  // Delete student from class
  const handleDeleteStudent = (classId: string, studentId: number) => {
    setClassList((prev) => {
      const next = prev.map((c) => {
        if (c.id !== classId) return c;
        const students = (c.students || []).filter((s) => s.id !== studentId);
        return { ...c, students, studentsCount: students.length };
      });
      try {
        localStorage.setItem('samoudi_school_classes_v2', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });
  };

  // Delete teacher account
  const handleDeleteTeacher = (teacherId: string) => {
    setTeachers((prev) => {
      const next = prev.filter((t) => t.id !== teacherId);
      try {
        localStorage.setItem('samoudi_school_teachers_v1', JSON.stringify(next));
      } catch {
        // Storage restricted
      }
      return next;
    });
  };

  // Title for top header
  const getHeaderTitle = () => {
    if (currentRoute.type === 'home') return 'الصفحة الرئيسية';
    if (currentRoute.type === 'classrooms') return 'الغرف الصفية';
    if (currentRoute.type === 'admin') return 'لوحة تحكم الإدارة';
    if (currentRoute.type === 'teacher-login') return 'بوابة دخول المعلمين';
    if (currentRoute.type === 'class-detail') {
      const cls = classList.find((c) => c.id === currentRoute.classId);
      return cls ? cls.fullName : 'تفاصيل الصف';
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-white-prestige subtle-paper-grid text-slate-900 selection:bg-blue-600 selection:text-white relative overflow-x-hidden font-arabic">
      
      {/* =========================================================================
          1. COMPACT MOBILE-FIRST BLUE HEADER
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#0a2540] via-[#0d3b66] to-[#144272] text-white shadow-md shadow-blue-950/15 border-b border-blue-400/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-12 sm:h-13 flex items-center justify-between gap-2">
          
          {/* Right Group: Menu Drawer Hamburger + Quick Download */}
          <div className="flex items-center gap-2">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              aria-label="فتح القائمة الرئيسية"
              aria-expanded={isDrawerOpen}
              title="القائمة الرئيسية (المفتاح، تحميل التطبيق، التنقل)"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all duration-200 border border-white/15 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 shadow-xs"
            >
              <div className="w-4 h-3 flex flex-col justify-between">
                <span className="h-0.5 w-4 bg-white rounded-full" />
                <span className="h-0.5 w-3 bg-white rounded-full" />
                <span className="h-0.5 w-4 bg-white rounded-full" />
              </div>
            </button>

            {/* زر التحميل في الهيدر */}
            <PWAInstallButton variant="header" />
          </div>

          {/* School Logo on the Left - Clicking returns to Home Page */}
          <button
            onClick={() => navigateTo('')}
            title="العودة للصفحة الرئيسية - مدرسة السمودي"
            aria-label="العودة للصفحة الرئيسية"
            className="group flex items-center gap-1.5 sm:gap-2 h-9 px-1.5 sm:px-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all duration-200 border border-white/20 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 shadow-xs shrink-0"
          >
            <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-xs shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center overflow-hidden border border-amber-400/80">
              <img
                src="/school-logo.png"
                alt="شعار مدرسة السمودي الأساسية للبنين"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/school-logo.jpg';
                }}
              />
            </div>
            <div className="flex flex-col text-right leading-none select-none">
              <span className="text-[11px] sm:text-[12px] font-bold text-white tracking-tight font-arabic">
                مدرسة السمودي
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-amber-300 font-medium">
                الأساسية للبنين
              </span>
            </div>
          </button>

        </div>
      </header>

      {/* =========================================================================
          2. ROUTER VIEW WITH ANIMATED PAGE TRANSITIONS
          ========================================================================= */}
      <main className="flex-1 flex flex-col w-full relative pb-20 sm:pb-24">
        {currentRoute.type === 'home' && (
          <div key="route-home" className="flex-1 flex flex-col">
            <HomePage
              onOpenClassrooms={() => navigateTo('classrooms')}
              onOpenTeacherLogin={() => navigateTo('teacher-login')}
            />
          </div>
        )}

        {currentRoute.type === 'classrooms' && (
          <div key="route-classrooms" className="flex-1 flex flex-col">
            <ClassroomsPage
              classList={classList}
              onBack={() => navigateTo('')}
              onEnterClass={(classId) => navigateTo(`classrooms/${classId}`)}
            />
          </div>
        )}

        {currentRoute.type === 'class-detail' && (() => {
          const classData =
            classList.find((c) => c.id === currentRoute.classId) || classList[0];
          return (
            <div key={`route-detail-${currentRoute.classId}`} className="flex-1 flex flex-col">
              <ClassDetailPage
                classData={classData}
                onBack={() => navigateTo('classrooms')}
                onUpdateStudent={handleUpdateStudent}
              />
            </div>
          );
        })()}

        {currentRoute.type === 'admin' && (
          <div key="route-admin" className="flex-1 flex flex-col">
            <AdminDashboardPage
              classList={classList}
              teachers={teachers}
              onBack={() => navigateTo('')}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddTeacher={handleAddTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          </div>
        )}

        {currentRoute.type === 'teacher-login' && (
          <div key="route-teacher-login" className="flex-1 flex flex-col">
            <TeacherLoginPage
              teachers={teachers}
              classList={classList}
              currentTeacher={currentTeacher}
              activities={activities}
              onAddActivity={handleAddActivity}
              onLoginTeacher={handleLoginTeacher}
              onLogoutTeacher={handleLogoutTeacher}
              onNavigateHome={() => navigateTo('')}
              onNavigateClassroom={(classId) => navigateTo(`classrooms/${classId}`)}
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          3. CLEAN SLIDE-OUT DRAWER
          ========================================================================= */}
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs transition-opacity duration-300 ease-out ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 bottom-0 right-0 z-50 w-full max-w-[280px] sm:max-w-xs 
          bg-white shadow-2xl flex flex-col border-l border-slate-200 text-right
          transform transition-transform duration-300 ease-out
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-gradient-to-r from-[#0a2540] via-[#0d3b66] to-[#144272] text-white flex items-center justify-between border-b border-blue-400/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-xs shrink-0 flex items-center justify-center overflow-hidden border border-amber-400/80">
              <img
                src="/school-logo.png"
                alt="شعار مدرسة السمودي"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/school-logo.jpg';
                }}
              />
            </div>
            <div className="text-right">
              <h3 className="font-bold text-xs tracking-tight text-white font-arabic">
                مدرسة السمودي الأساسية
              </h3>
              <p className="text-[10px] text-amber-300">القائمة والخدمات المدرسية</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="إغلاق القائمة"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
          
          {/* =================================================================
              1. المفتاح - بوابة دخول المعلمين
              ================================================================= */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100/30 to-orange-50 border border-amber-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <span>المفتاح (بوابة المعلمين)</span>
              </span>
              {currentTeacher ? (
                <span className="text-[10px] text-emerald-800 bg-emerald-100/90 border border-emerald-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  مسجل
                </span>
              ) : (
                <span className="text-[10px] text-amber-900 bg-amber-200/70 font-semibold px-2 py-0.5 rounded-md">
                  تسجيل الدخول
                </span>
              )}
            </div>

            {currentTeacher ? (
              <div className="space-y-2">
                <div className="text-[11px] text-slate-800 font-medium">
                  مرحباً بك: <strong className="text-slate-950">{currentTeacher.name}</strong>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    مربّي الصف: {currentTeacher.assignedClass}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      navigateTo('teacher-login');
                      setIsDrawerOpen(false);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>لوحة المتابعة</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      handleLogoutTeacher();
                    }}
                    title="تسجيل الخروج"
                    className="py-1.5 px-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-slate-600 mb-2 leading-relaxed">
                  الدخول المخصص لمعلمي مدرسة السمودي لتقييم الطلاب وإدخال السلوك والعلامات.
                </p>
                <button
                  onClick={() => {
                    navigateTo('teacher-login');
                    setIsDrawerOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-98 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>دخول بوابة المعلمين</span>
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* =================================================================
              2. تحميل التطبيق (PWA / Download App)
              ================================================================= */}
          <div>
            <PWAInstallButton
              variant="drawer"
              onInstalled={() => setIsDrawerOpen(false)}
            />
          </div>

          {/* خط فاصل */}
          <div className="border-t border-slate-100 my-1 pt-1">
            <p className="text-[10px] font-bold text-slate-400 px-2 mb-1">الأقسام المدرسية</p>
          </div>

          {/* Main Navigation Links */}
          <button
            onClick={() => {
              navigateTo('');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentRoute.type === 'home'
                ? 'bg-blue-50 text-blue-900 border border-blue-100'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              الصفحة الرئيسية
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-blue-600" />
          </button>

          <button
            onClick={() => {
              navigateTo('classrooms');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentRoute.type === 'classrooms' || currentRoute.type === 'class-detail'
                ? 'bg-blue-50 text-blue-900 border border-blue-100'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-blue-700" />
              الغرف الصفية (1 - 9)
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-blue-600" />
          </button>

          {/* ADMIN DASHBOARD LINK */}
          <button
            onClick={() => {
              navigateTo('admin');
              setIsDrawerOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold transition-all cursor-pointer ${
              currentRoute.type === 'admin'
                ? 'bg-blue-50 text-blue-900 border border-blue-100'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-800" />
              لوحة تحكم الإدارة (الداشبورد)
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-blue-600" />
          </button>

          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setActiveModal('about');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-slate-400" />
              نبذة عن المدرسة
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setActiveModal('contact');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400" />
              التواصل والإدارة
            </span>
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          </button>

        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center">
          مدرسة المرحوم أحمد عبد الوهاب السمودي الأساسية للبنين
        </div>

      </aside>

      {/* =========================================================================
          4. MODALS
          ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setActiveModal(null)} 
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity" 
            aria-hidden="true" 
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10 text-right">
            
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-3 left-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {activeModal === 'about' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-arabic">
                  مدرسة المرحوم أحمد عبد الوهاب السمودي
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  مؤسسة تعليمية أساسية للبنين تهدف إلى غرس القيم الأخلاقية والتفوق العلمي لدى الطلاب، وتوفير بيئة تربوية رائدة.
                </p>
              </div>
            )}

            {activeModal === 'contact' && (
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 font-arabic">
                  التواصل مع المدرسة
                </h3>
                <div className="text-xs text-slate-600 space-y-2">
                  <p>📍 الإدارة المدرسية - مبنى المدرسة الأساسية</p>
                  <div className="flex items-center gap-1.5">
                    <span>📞 هاتف الإدارة:</span>
                    <LTRValue className="text-blue-900 font-bold">+970 4 000 0000</LTRValue>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          5. FIXED MODERN BOTTOM NAVIGATION BAR (البوتم بار)
          ========================================================================= */}
      <BottomNavBar
        currentRoute={currentRoute}
        currentTeacher={currentTeacher}
        onNavigate={navigateTo}
      />

    </div>
  );
}
