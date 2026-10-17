/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { PWAInstallButton } from '../components/PWAInstallButton.tsx';

interface HomePageProps {
  onOpenClassrooms: () => void;
  onOpenTeacherLogin?: () => void;
}

export default function HomePage({ onOpenClassrooms }: HomePageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6 sm:py-12 relative z-10 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 
        Directly under the header: 
        School Name: "مدرسة المرحوم أحمد عبد الوهاب السمودي الأساسية للبنين" 
      */}
      <div className="w-full text-center pb-6 sm:pb-10">
        
        {/* Official School Crest Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-white border-2 border-amber-400 shadow-xl shadow-blue-950/10 flex items-center justify-center hover:scale-105 transition-transform">
            <img
              src="/school-logo.png"
              alt="شعار مدرسة السمودي الأساسية للبنين"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/school-logo.jpg';
              }}
            />
          </div>
        </div>

        {/* Subtle decorative top bar */}
        <div className="flex items-center justify-center gap-2.5 w-32 sm:w-44 mx-auto mb-4 opacity-50">
          <div className="h-px bg-gradient-to-l from-transparent via-blue-900/40 to-transparent flex-1" />
          <div className="w-1.5 h-1.5 rotate-45 bg-blue-900/40" />
          <div className="h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent flex-1" />
        </div>

        {/* Large, Beautiful Arabic Typography with Modern Web Font */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-950 font-arabic leading-[1.3] text-balance">
          <span className="block text-xl sm:text-2xl font-normal text-blue-900/80 mb-1">
            مدرسة
          </span>
          <span className="bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 bg-clip-text text-transparent inline-block">
            المرحوم أحمد عبد الوهاب السمودي
          </span>
          <span className="block text-lg sm:text-2xl font-semibold text-slate-700 mt-1 sm:mt-2">
            الأساسية للبنين
          </span>
        </h1>

        {/* Subtle decorative bottom divider */}
        <div className="mt-5 flex items-center justify-center gap-3 opacity-60">
          <span className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-l from-blue-900/40 to-transparent rounded-full" />
          <div className="w-1.5 h-1.5 rotate-45 bg-blue-900/50" />
          <span className="h-[1.5px] w-12 sm:w-16 bg-gradient-to-r from-blue-900/40 to-transparent rounded-full" />
        </div>

      </div>

      {/* The Central Portal Actions */}
      <div className="w-full flex flex-col items-center justify-center gap-3.5">
        {/* 1. زر الدخول إلى الغرف الصفية */}
        <button
          onClick={onOpenClassrooms}
          className="group relative w-full max-w-xs sm:max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white font-bold text-base sm:text-lg shadow-lg shadow-blue-950/20 hover:shadow-xl hover:shadow-blue-950/25 active:scale-98 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer border border-blue-400/30 font-arabic"
        >
          {/* Subtle pulse background shimmer */}
          <span className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="p-2 rounded-xl bg-white/10 text-white transition-transform group-hover:scale-110">
            <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <span className="tracking-wide">
            الغرف الصفية
          </span>

          <Sparkles className="w-4 h-4 text-blue-200/80 mr-auto opacity-70 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* 2. زر التحميل بالصفحة الرئيسية */}
        <PWAInstallButton variant="home" />

        <p className="text-xs text-slate-400 mt-1 text-center font-arabic">
          استعراض الشعب الدراسية من الصف الأول حتى التاسع
        </p>
      </div>

    </div>
  );
}
