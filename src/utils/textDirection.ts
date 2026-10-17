/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Checks if a string contains Arabic characters.
 */
export function isArabic(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Resolves the appropriate text direction (RTL or LTR).
 * If text contains Arabic letters, direction is 'rtl'.
 * If text is Latin/English or numeric, direction is 'ltr'.
 */
export function getDirection(
  text?: string | null,
  fallback: 'rtl' | 'ltr' = 'rtl'
): 'rtl' | 'ltr' {
  if (!text) return fallback;
  if (isArabic(text)) return 'rtl';
  // Check if it contains Latin letters
  if (/[a-zA-Z]/.test(text)) return 'ltr';
  // Pure digits or codes default to LTR for proper formatting
  if (/^[\d+\-()\s.:/#_]+$/.test(text.trim())) return 'ltr';
  return fallback;
}

/**
 * Resolves Tailwind text alignment classes based on text language.
 */
export function getTextAlign(
  text?: string | null,
  fallback: 'text-right' | 'text-left' = 'text-right'
): 'text-right' | 'text-left' {
  return getDirection(text, fallback === 'text-right' ? 'rtl' : 'ltr') === 'rtl'
    ? 'text-right'
    : 'text-left';
}

/**
 * Formats a phone number cleanly with LTR direction to prevent punctuation inversion.
 */
export function cleanPhone(phone?: string | null): string {
  if (!phone) return '';
  return phone.trim();
}

/**
 * Reusable wrapper that automatically determines RTL or LTR and sets text alignment.
 */
export interface BilingualTextProps {
  text?: string | number | null;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  fallbackDir?: 'rtl' | 'ltr';
  title?: string;
}

export function BilingualText({
  text,
  className = '',
  as = 'span',
  fallbackDir = 'rtl',
  title,
}: BilingualTextProps) {
  const str = text !== undefined && text !== null ? String(text) : '';
  const dir = getDirection(str, fallbackDir);
  const alignClass = dir === 'rtl' ? 'text-right' : 'text-left';

  return React.createElement(
    as,
    {
      dir,
      title,
      className: `${alignClass} ${className}`.trim(),
    },
    str
  );
}

/**
 * Strict LTR wrapper for numbers, national IDs, dates, phone numbers, codes, and English badges.
 */
export function LTRValue({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return React.createElement(
    'span',
    {
      dir: 'ltr',
      className: `inline-block text-left font-mono ${className}`.trim(),
    },
    children
  );
}
