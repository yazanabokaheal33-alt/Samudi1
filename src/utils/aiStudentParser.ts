/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClassSection } from '../types.ts';

export interface ParsedStudentCandidate {
  name: string;
  classId: string;
  className: string;
  birthDate: string;
}

// Map grade text to class IDs
export function matchClassId(text: string, classList: ClassSection[]): { id: string; name: string } {
  const normalized = text.toLowerCase();

  // Specific check for section letters
  const hasA = /[\s\(\[-_](أ|a)[\s\)\]-_]?/i.test(normalized) || normalized.includes(' أ') || normalized.includes('(أ)');
  const hasB = /[\s\(\[-_](ب|b)[\s\)\]-_]?/i.test(normalized) || normalized.includes(' ب') || normalized.includes('(ب)');

  if (normalized.includes('رابع') || normalized.includes('الرابع') || normalized.includes('4')) {
    if (hasB) return { id: 'grade-4-b', name: 'الصف الرابع (ب)' };
    return { id: 'grade-4-a', name: 'الصف الرابع (أ)' };
  }
  if (normalized.includes('سادس') || normalized.includes('السادس') || normalized.includes('6')) {
    if (hasB) return { id: 'grade-6-b', name: 'الصف السادس (ب)' };
    return { id: 'grade-6-a', name: 'الصف السادس (أ)' };
  }
  if (normalized.includes('سابع') || normalized.includes('السابع') || normalized.includes('7')) {
    if (hasB) return { id: 'grade-7-b', name: 'الصف السابع (ب)' };
    return { id: 'grade-7-a', name: 'الصف السابع (أ)' };
  }
  if (normalized.includes('ثامن') || normalized.includes('الثامن') || normalized.includes('8')) {
    if (hasB) return { id: 'grade-8-b', name: 'الصف الثامن (ب)' };
    return { id: 'grade-8-a', name: 'الصف الثامن (أ)' };
  }
  if (normalized.includes('أول') || normalized.includes('الأول') || normalized.includes('1')) {
    return { id: 'grade-1', name: 'الصف الأول الأساسي' };
  }
  if (normalized.includes('ثاني') || normalized.includes('الثاني') || normalized.includes('2')) {
    return { id: 'grade-2', name: 'الصف الثاني الأساسي' };
  }
  if (normalized.includes('ثالث') || normalized.includes('الثالث') || normalized.includes('3')) {
    return { id: 'grade-3', name: 'الصف الثالث الأساسي' };
  }
  if (normalized.includes('خامس') || normalized.includes('الخامس') || normalized.includes('5')) {
    return { id: 'grade-5', name: 'الصف الخامس الأساسي' };
  }
  if (normalized.includes('تاسع') || normalized.includes('التاسع') || normalized.includes('9')) {
    return { id: 'grade-9', name: 'الصف التاسع الأساسي' };
  }

  // Default to first class if not matched
  return { id: classList[0]?.id || 'grade-1', name: classList[0]?.fullName || 'الصف الأول الأساسي' };
}

/**
 * Intelligent Arabic Student Text Parser
 * Can parse up to 10 students from unstructured raw text
 * Extracts only: name, birthDate, class
 */
export function parseStudentsFromText(rawText: string, classList: ClassSection[]): ParsedStudentCandidate[] {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();
  const results: ParsedStudentCandidate[] = [];

  // Split into chunks by numbered lines, bullet points, or multiple line breaks
  let blocks: string[] = [];

  const numberedSplit = text.split(/(?:^|\n)(?:\d+[\.\-\)]|\-|\*|•|الطالب(?:\s+\d+)?[:\-])\s*/);
  if (numberedSplit.length > 1) {
    blocks = numberedSplit.filter((b) => b.trim().length > 0);
  } else {
    const lines = text.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      blocks = lines;
    } else {
      blocks = [text];
    }
  }

  // Cap at 10 students
  const cappedBlocks = blocks.slice(0, 10);

  for (const block of cappedBlocks) {
    const candidate = extractSingleStudent(block, classList);
    if (candidate && candidate.name) {
      results.push(candidate);
    }
  }

  if (results.length === 0) {
    const commaSplit = text.split(/[,،\n]+/).map((s) => s.trim()).filter(Boolean);
    for (const item of commaSplit.slice(0, 10)) {
      const candidate = extractSingleStudent(item, classList);
      if (candidate && candidate.name) {
        results.push(candidate);
      }
    }
  }

  return results.slice(0, 10);
}

function extractSingleStudent(text: string, classList: ClassSection[]): ParsedStudentCandidate | null {
  if (!text || text.trim().length < 2) return null;

  // Clean lines
  let remaining = text
    .replace(/^[\d\.\-\)\*\•\s]+/, '')
    .replace(/^(اسم الطالب|الطالب|طالب|اسم|الاسم)[:\s\-]*/i, '')
    .trim();

  // 1. Extract Birth Date (YYYY/MM/DD or DD/MM/YYYY)
  let birthDate = '';
  const dateMatch = remaining.match(/(?:تاريخ ميلاد|ميلاد|مواليد)?[:\s\-]*((?:19|20)\d{2}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.](?:19|20)\d{2})/i);
  if (dateMatch) {
    birthDate = dateMatch[1];
    remaining = remaining.replace(dateMatch[0], ' ');
  }

  // 2. Detect Class
  const detectedClass = matchClassId(text, classList);

  // 3. Extract Student Name
  let cleanedName = remaining
    .replace(/(صف|الصف|شعبة|أول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|تاسع)[\s\wأ-ي]*/g, '')
    .replace(/[\|\:\-\–\—\_\,\;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const arabicWords = cleanedName.match(/[\u0600-\u06FF]+/g);
  let name = '';

  if (arabicWords && arabicWords.length > 0) {
    const filteredWords = arabicWords.filter(
      (w) => !['طالب', 'الاسم', 'هوية', 'هاتف', 'ولي', 'أمر', 'مواليد', 'سكن', 'الصف', 'شعبة'].includes(w)
    );
    name = filteredWords.slice(0, 4).join(' ');
  } else {
    name = cleanedName.split(/\s+/).slice(0, 4).join(' ');
  }

  if (!name || name.trim().length < 2) {
    return null;
  }

  return {
    name: name.trim(),
    classId: detectedClass.id,
    className: detectedClass.name,
    birthDate: birthDate || '',
  };
}
