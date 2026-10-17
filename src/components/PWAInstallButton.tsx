/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Sparkles, Share, PlusSquare, ArrowLeft } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface PWAInstallProps {
  variant?: 'button' | 'drawer' | 'card' | 'compact' | 'header' | 'home';
  onInstalled?: () => void;
}

export function PWAInstallButton({ variant = 'button', onInstalled }: PWAInstallProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running as standalone app
  if (isInstalled) {
    if (variant === 'drawer') {
      return (
        <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
          <span className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5" />
            </span>
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-950">التطبيق مثبت على جهازك</div>
              <div className="text-[10px] text-emerald-700 font-normal">يعمل مباشرة كبرنامج أصلي</div>
            </div>
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold">
            جاهز
          </span>
        </div>
      );
    }
    if (variant === 'home' || variant === 'card') {
      return (
        <div className="w-full max-w-xs sm:max-w-sm p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-emerald-950 flex items-center justify-between gap-3 shadow-xs text-right font-arabic">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950">التطبيق مثبت على جهازك</div>
              <div className="text-[10px] text-emerald-700 font-normal mt-0.5">يمكنك فتحه مباشرة من الشاشة الرئيسية</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer shrink-0"
          >
            تعليمات
          </button>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        if (onInstalled) onInstalled();
      }
    } else {
      // Show guided instructions for Chrome on Android or iOS
      setShowGuide(true);
    }
  };

  return (
    <>
      {/* 1. Drawer Option Style */}
      {variant === 'drawer' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold transition-all cursor-pointer bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-950 text-white shadow-xs hover:shadow-md border border-blue-400/30 active:scale-98 text-right"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>تحميل وتثبيت التطبيق</span>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 py-0.2 rounded">
                  PWA
                </span>
              </div>
              <div className="text-[10px] text-blue-200/80 font-normal">
                تثبيت على الشاشة الرئيسية للجوال
              </div>
            </div>
          </div>
          <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-1 rounded-lg shrink-0 shadow-xs">
            تحميل
          </span>
        </button>
      )}

      {/* 2. Header & Compact Button Style */}
      {(variant === 'header' || variant === 'compact') && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="تحميل / تثبيت التطبيق على الهاتف"
          aria-label="تحميل وتثبيت التطبيق"
          className="h-8 px-2 sm:px-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center gap-1.5 transition-all duration-200 border border-white/15 cursor-pointer text-xs font-bold shadow-xs select-none"
        >
          <Download className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="text-[11px] sm:text-xs">تحميل</span>
        </button>
      )}

      {/* 3. Home Page Dedicated Action Button */}
      {variant === 'home' && (
        <button
          type="button"
          onClick={handleInstallClick}
          title="تحميل وتثبيت تطبيق مدرسة السمودي على هاتفك"
          aria-label="تحميل وتثبيت التطبيق"
          className="group relative w-full max-w-xs sm:max-w-sm py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50/90 active:scale-98 text-slate-900 font-bold transition-all duration-200 border border-slate-200/90 shadow-md shadow-slate-900/5 hover:shadow-lg flex items-center justify-between gap-3 cursor-pointer text-right font-arabic"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>تحميل وتثبيت التطبيق</span>
                <span className="text-[9px] bg-blue-100 text-blue-900 border border-blue-200 px-1.5 py-0.5 rounded font-sans font-bold">
                  PWA
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-normal mt-0.5">
                تنزيل فوري على شاشة الهاتف مجاناً
              </div>
            </div>
          </div>

          <span className="text-xs bg-gradient-to-r from-blue-900 to-indigo-900 group-hover:from-blue-800 group-hover:to-indigo-800 text-amber-300 font-bold px-3 py-1.5 rounded-xl shadow-xs shrink-0 flex items-center gap-1 transition-all">
            <Download className="w-3.5 h-3.5" />
            <span>تحميل</span>
          </span>
        </button>
      )}

      {/* 4. Card Style */}
      {variant === 'card' && (
        <div className="w-full max-w-sm mx-auto mt-4 p-3 bg-gradient-to-r from-blue-900/90 via-blue-950 to-slate-900 text-white rounded-2xl border border-blue-400/20 shadow-md flex items-center justify-between gap-3 text-right font-arabic">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">
                تطبيق مدرسة السمودي على هاتفك
              </h4>
              <p className="text-[10px] text-blue-200/90 mt-0.5">
                تثبيت سريع وخفيف عبر متصفح كروم
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>
        </div>
      )}

      {/* 5. Default Button Style */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer font-arabic"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>تنزيل عبر كروم على الجوال</span>
        </button>
      )}

      {/* Guided Installation Modal (for Chrome / Android / iOS instructions if prompt not triggered automatically) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <div
            onClick={() => setShowGuide(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-10 text-right animate-in fade-in zoom-in-95 duration-200">
            {/* Close */}
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-3 left-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  تثبيت التطبيق على الجوال
                </h3>
                <p className="text-[11px] text-slate-500">
                  مدرسة المرحوم أحمد عبد الوهاب السمودي
                </p>
              </div>
            </div>

            {/* Steps based on browser / OS */}
            {isIOS ? (
              <div className="space-y-2.5 text-xs text-slate-700 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-xs mb-2">
                  خطوات التثبيت على أجهزة iPhone / iPad:
                </p>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>اضغط على زر المشاركة (Share <Share className="w-3.5 h-3.5 inline text-blue-600" />) في شريط المتصفح.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>مرر لأسفل واختر <strong>«إضافة إلى الشاشة الرئيسية»</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /> Add to Home Screen).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>اضغط <strong>إضافة (Add)</strong> وسيعمل التطبيق كبرنامج مستقل.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs text-slate-700 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>خطوات التثبيت عبر متصفح Google Chrome:</span>
                </p>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>اضغط على قائمة النقاط الثلاث <strong dir="ltr">⋮</strong> في الزاوية العلوية لمتصفح كروم.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>اختر <strong>«تثبيت التطبيق»</strong> أو <strong>«إضافة إلى الشاشة الرئيسية»</strong> (Install app / Add to Home screen).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>اضغط <strong>«تثبيت»</strong> وسيظهر التطبيق بأيقونته الرسمية على شاشة جوالك.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}
    </>
  );
}
