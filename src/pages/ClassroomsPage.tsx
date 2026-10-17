/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, GraduationCap, Users, ChevronLeft } from 'lucide-react';
import { ClassSection } from '../types.ts';

interface ClassroomsPageProps {
  classList: ClassSection[];
  onBack: () => void;
  onEnterClass: (classId: string) => void;
}

export default function ClassroomsPage({ classList, onBack, onEnterClass }: ClassroomsPageProps) {
  return (
    <div className="flex-1 flex flex-col font-arabic animate-in fade-in slide-in-from-bottom-2 duration-150 relative min-h-[70vh]">
      
      {/* Top Bar for Classrooms Page */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-12 z-20">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 text-xs font-semibold transition-all border border-slate-200/80 active:scale-95 cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>الرئيسية</span>
        </button>

        <div className="text-center">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 justify-center">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>الغرف الصفية</span>
          </h2>
          <p className="text-[10px] text-slate-500">
            الصف الأول حتى الصف التاسع
          </p>
        </div>

        <div className="text-[11px] font-medium text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
          {classList.length} شعبة
        </div>
      </div>

      {/* Main Grid: Fast & Snappy Entrance */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
          {classList.map((cls, index) => {
            const hasSectionLetter = Boolean(cls.sectionName);

            return (
              <button
                key={cls.id}
                onClick={() => onEnterClass(cls.id)}
                style={{ animationDelay: `${Math.min(index * 25, 200)}ms` }}
                className="group relative bg-white hover:bg-blue-50/50 active:scale-95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 hover:border-blue-500 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col items-center text-center cursor-pointer text-slate-800 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* Small Class Badge Icon */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-100 flex items-center justify-center text-blue-900 mb-2.5 group-hover:scale-105 group-hover:bg-blue-900 group-hover:text-white transition-all shadow-2xs">
                  <span className="font-extrabold text-base sm:text-lg font-arabic">
                    {cls.gradeNumber}
                  </span>
                </div>

                {/* Class Title */}
                <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug font-arabic">
                  {cls.gradeName}
                </span>

                {/* Section Badge (أ / ب) or Single Section */}
                <div className="mt-1.5 flex items-center gap-1">
                  {hasSectionLetter ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-900 text-white shadow-2xs">
                      شعبة ({cls.sectionName})
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      شعبة واحدة
                    </span>
                  )}
                </div>

                {/* Supervisor info */}
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-blue-900 transition-colors">
                  <Users className="w-3 h-3" />
                  <span className="truncate max-w-[110px]">{cls.supervisor}</span>
                </div>

                {/* Fast Action Arrow */}
                <div className="mt-2 flex items-center justify-center text-blue-600 text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>دخول الصف</span>
                  <ChevronLeft className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
