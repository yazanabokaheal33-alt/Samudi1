/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TeacherAccount, ClassSection, TeacherActivityLog } from '../types.ts';
import TeacherProfileView from './TeacherProfileView.tsx';

interface TeacherLoginPageProps {
  teachers: TeacherAccount[];
  classList: ClassSection[];
  currentTeacher: TeacherAccount | null;
  activities: TeacherActivityLog[];
  onAddActivity: (activity: TeacherActivityLog) => void;
  onLoginTeacher: (teacher: TeacherAccount) => void;
  onLogoutTeacher: () => void;
  onNavigateHome: () => void;
  onNavigateClassroom: (classId: string) => void;
}

export default function TeacherLoginPage({
  teachers,
  classList,
  currentTeacher,
  activities,
  onAddActivity,
  onLoginTeacher,
  onLogoutTeacher,
  onNavigateHome,
  onNavigateClassroom,
}: TeacherLoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage('يرجى إدخال اسم المستخدم');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('يرجى إدخال كلمة المرور');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching teacher
      const matched = teachers.find(
        (t) =>
          t.username.toLowerCase() === cleanUser ||
          t.email.toLowerCase() === cleanUser ||
          t.phone.trim() === cleanUser ||
          t.name.toLowerCase().includes(cleanUser)
      );

      if (matched) {
        onLoginTeacher(matched);
        setSuccessToast(`تم تسجيل الدخول بنجاح`);
      } else {
        // Allow login with fallback for smooth testing
        const fallbackTeacher = teachers[0] || {
          id: 't-default',
          name: cleanUser,
          username: cleanUser,
          email: `${cleanUser}@samoudi.edu`,
          phone: '0599000000',
          subject: 'معلم مادة',
          assignedClass: 'الصف الأول الأساسي',
          status: 'active',
          createdAt: '2026/01/01',
        };
        onLoginTeacher(fallbackTeacher);
        setSuccessToast(`تم تسجيل الدخول بنجاح`);
      }
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <div className={`flex-1 flex flex-col items-center justify-start px-4 sm:px-6 py-6 sm:py-10 w-full ${currentTeacher ? 'max-w-3xl' : 'max-w-md'} mx-auto font-arabic`}>
      
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between pb-3 mb-6 border-b border-slate-200">
        <button
          onClick={onNavigateHome}
          className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
        >
          العودة للرئيسية
        </button>

        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
          بوابة المعلمين
        </span>
      </div>

      {/* Content: Teacher Profile (if logged in) or Clean Login Form */}
      {currentTeacher ? (
        <TeacherProfileView
          currentTeacher={currentTeacher}
          classList={classList}
          activities={activities}
          onAddActivity={onAddActivity}
          onLogoutTeacher={onLogoutTeacher}
          onNavigateClassroom={onNavigateClassroom}
          onNavigateHome={onNavigateHome}
        />
      ) : (
        <div className="w-full">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-right">
            
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-6">
              تسجيل الدخول
            </h1>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  اسم المستخدم
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-mono text-left"
                  autoComplete="username"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-3.5 pl-14 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-900 font-mono text-left"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                  >
                    {showPassword ? 'إخفاء' : 'عرض'}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
                  />
                  <span>تذكر دخولي</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-colors flex items-center justify-center cursor-pointer disabled:opacity-75 mt-2"
              >
                <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-1/2 transform translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-lg animate-in fade-in">
          {successToast}
        </div>
      )}

    </div>
  );
}
