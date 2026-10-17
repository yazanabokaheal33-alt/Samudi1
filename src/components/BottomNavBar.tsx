/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  BookOpen,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { TeacherAccount, AppRoute } from '../types.ts';

interface BottomNavBarProps {
  currentRoute: AppRoute;
  currentTeacher: TeacherAccount | null;
  onNavigate: (hash: string) => void;
}

export default function BottomNavBar({
  currentRoute,
  currentTeacher,
  onNavigate,
}: BottomNavBarProps) {
  const isHome = currentRoute.type === 'home';
  const isClassrooms = currentRoute.type === 'classrooms' || currentRoute.type === 'class-detail';
  const isAdmin = currentRoute.type === 'admin';
  const isTeacherPage = currentRoute.type === 'teacher-login';

  return (
    <nav
      aria-label="التنقل الرئيسي السفلي"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] print:hidden font-arabic transition-all"
    >
      <div className="max-w-md sm:max-w-xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-around gap-1">
        
        {/* 1. الرئيسية (Home) */}
        <button
          type="button"
          onClick={() => onNavigate('')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isHome
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-current={isHome ? 'page' : undefined}
        >
          {isHome && (
            <span className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full animate-in fade-in zoom-in-75" />
          )}
          <div
            className={`p-1 rounded-xl transition-transform ${
              isHome ? 'bg-blue-50 text-blue-900 scale-110' : 'hover:scale-105'
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* 2. الغرف الصفية (Classrooms) */}
        <button
          type="button"
          onClick={() => onNavigate('classrooms')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isClassrooms
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-current={isClassrooms ? 'page' : undefined}
        >
          {isClassrooms && (
            <span className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full animate-in fade-in zoom-in-75" />
          )}
          <div
            className={`p-1 rounded-xl transition-transform ${
              isClassrooms ? 'bg-blue-50 text-blue-900 scale-110' : 'hover:scale-105'
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight">الغرف الصفية</span>
        </button>

        {/* 3. زر تسجيل الدخول / صفحة المعلم (Dynamic Button) */}
        <button
          type="button"
          onClick={() => onNavigate('teacher-login')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer group ${
            isTeacherPage
              ? currentTeacher
                ? 'text-amber-800 font-bold'
                : 'text-blue-900 font-bold'
              : currentTeacher
              ? 'text-slate-700 hover:text-amber-900 font-medium'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-current={isTeacherPage ? 'page' : undefined}
        >
          {isTeacherPage && (
            <span
              className={`absolute -top-1 w-8 h-1 rounded-full animate-in fade-in zoom-in-75 ${
                currentTeacher
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-blue-700 to-indigo-600'
              }`}
            />
          )}

          {currentTeacher ? (
            /* Logged-In Teacher Button */
            <>
              <div className="relative">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-transform shadow-xs ${
                    isTeacherPage
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 scale-110 ring-2 ring-amber-300'
                      : 'bg-gradient-to-br from-[#0d3b66] to-[#144272] text-amber-300 group-hover:scale-105'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                </div>
                {/* Active indicator dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight flex items-center gap-0.5">
                <span>صفحة المعلم</span>
              </span>
            </>
          ) : (
            /* Not Logged In: Login button */
            <>
              <div
                className={`p-1 rounded-xl transition-transform ${
                  isTeacherPage ? 'bg-blue-50 text-blue-900 scale-110' : 'hover:scale-105'
                }`}
              >
                <KeyRound className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight">
                تسجيل الدخول
              </span>
            </>
          )}
        </button>

        {/* 4. لوحة الإدارة (Admin Dashboard) */}
        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isAdmin
              ? 'text-blue-900 font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
          aria-current={isAdmin ? 'page' : undefined}
        >
          {isAdmin && (
            <span className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-full animate-in fade-in zoom-in-75" />
          )}
          <div
            className={`p-1 rounded-xl transition-transform ${
              isAdmin ? 'bg-blue-50 text-blue-900 scale-110' : 'hover:scale-105'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight">لوحة الإدارة</span>
        </button>

      </div>
    </nav>
  );
}
