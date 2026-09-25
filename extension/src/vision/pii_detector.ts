import { RedactionCategory } from '../../../shared/types';

export interface DetectedPII {
  category: RedactionCategory;
  rawText: string;
  maskedText: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

// Verhoeff Algorithm Tables for Indian Aadhaar Verification
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates a 12-digit Indian Aadhaar number using the Verhoeff checksum algorithm.
 */
export function validateAadhaarVerhoeff(aadhaar: string): boolean {
  const clean = aadhaar.replace(/[\s-]/g, '');
  if (!/^\d{12}$/.test(clean)) return false;
  // Aadhaar numbers never start with 0 or 1
  if (clean[0] === '0' || clean[0] === '1') return false;

  let c = 0;
  const reversed = clean.split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][reversed[i]]];
  }
  return c === 0;
}

/**
 * Validates a Credit / Debit Card number using the Luhn checksum algorithm.
 */
export function validateLuhn(cardNumber: string): boolean {
  const clean = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(clean)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Validates Indian PAN format (5 uppercase letters, 4 digits, 1 uppercase letter)
 */
export function validatePAN(pan: string): boolean {
  const clean = pan.trim().toUpperCase();
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(clean);
}

/**
 * Generates masked string representations for privacy-preserving text replacement.
 */
export function maskString(text: string, category: RedactionCategory): string {
  switch (category) {
    case 'email': {
      const parts = text.split('@');
      if (parts.length === 2) {
        const name = parts[0];
        const domain = parts[1];
        const maskedName = name.length > 2 ? name[0] + '***' + name[name.length - 1] : '***';
        return `${maskedName}@***.${domain.split('.').pop() || 'com'}`;
      }
      return '***@***.***';
    }
    case 'phone': {
      const digits = text.replace(/\D/g, '');
      if (digits.length >= 10) {
        return `+91-XXXXX-${digits.slice(-4)}`;
      }
      return '+XX-XXXX-XXXX';
    }
    case 'aadhaar': {
      const clean = text.replace(/[\s-]/g, '');
      return `XXXX-XXXX-${clean.slice(-4)}`;
    }
    case 'pan': {
      const clean = text.trim();
      return `${clean.slice(0, 2)}XXXXX${clean.slice(-2)}`;
    }
    case 'credit_card': {
      const clean = text.replace(/[\s-]/g, '');
      return `XXXX-XXXX-XXXX-${clean.slice(-4)}`;
    }
    case 'otp': {
      return '***-OTP-***';
    }
    case 'password': {
      return '●●●●●●●●';
    }
    default:
      return '[REDACTED_PII]';
  }
}

/**
 * High precision PII detector combining strict regex patterns, checksums, and heuristic boundaries.
 */
export function scanTextForPII(text: string): DetectedPII[] {
  if (!text || typeof text !== 'string') return [];
  const results: DetectedPII[] = [];

  // 1. Email Regex
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let match: RegExpExecArray | null;
  while ((match = emailRegex.exec(text)) !== null) {
    results.push({
      category: 'email',
      rawText: match[0],
      maskedText: maskString(match[0], 'email'),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: 0.98,
    });
  }

  // 2. Indian PAN Card Regex: [A-Z]{5}[0-9]{4}[A-Z]{1}
  const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
  while ((match = panRegex.exec(text)) !== null) {
    const isStrictPAN = validatePAN(match[0]);
    results.push({
      category: 'pan',
      rawText: match[0],
      maskedText: maskString(match[0], 'pan'),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      confidence: isStrictPAN ? 0.99 : 0.85,
    });
  }

  // 3. Indian Aadhaar: 12 digits (often in 4-4-4 format: 1234 5678 9012 or 1234-5678-9012)
  const aadhaarRegex = /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  while ((match = aadhaarRegex.exec(text)) !== null) {
    const raw = match[0];
    const clean = raw.replace(/[\s-]/g, '');
    if (clean.length === 12) {
      const validChecksum = validateAadhaarVerhoeff(clean);
      results.push({
        category: 'aadhaar',
        rawText: raw,
        maskedText: maskString(raw, 'aadhaar'),
        startIndex: match.index,
        endIndex: match.index + raw.length,
        confidence: validChecksum ? 0.99 : 0.88,
      });
    }
  }

  // 4. Credit / Debit Cards (13-19 digits, Visa, Mastercard, RuPay, Amex)
  const cardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|(?:508[5-9]|60698|607|608|6521[5-9]|652[2-9]|6530|6531[0-4])[0-9]{12})\b|\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  while ((match = cardRegex.exec(text)) !== null) {
    const raw = match[0];
    const clean = raw.replace(/[\s-]/g, '');
    if (clean.length >= 13 && clean.length <= 19) {
      const isValidLuhn = validateLuhn(clean);
      results.push({
        category: 'credit_card',
        rawText: raw,
        maskedText: maskString(raw, 'credit_card'),
        startIndex: match.index,
        endIndex: match.index + raw.length,
        confidence: isValidLuhn ? 0.98 : 0.80,
      });
    }
  }

  // 5. Phone Numbers (Indian +91, 10-digit mobile starting 6-9, standard formatted)
  const phoneRegex = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const raw = match[0];
    const isOverlap = results.some(r => match!.index >= r.startIndex && match!.index < r.endIndex);
    if (!isOverlap) {
      results.push({
        category: 'phone',
        rawText: raw,
        maskedText: maskString(raw, 'phone'),
        startIndex: match.index,
        endIndex: match.index + raw.length,
        confidence: 0.92,
      });
    }
  }

  // 6. OTP / Verification Codes (4-6 digits near keywords like otp, pin, code, verification)
  const otpContextRegex = /(?:otp|pin|passcode|verification code|security code|2fa)[\s:=#-]+([0-9]{4,6})\b/gi;
  while ((match = otpContextRegex.exec(text)) !== null) {
    if (match[1]) {
      const otpVal = match[1];
      const matchIndex = match.index + match[0].lastIndexOf(otpVal);
      results.push({
        category: 'otp',
        rawText: otpVal,
        maskedText: maskString(otpVal, 'otp'),
        startIndex: matchIndex,
        endIndex: matchIndex + otpVal.length,
        confidence: 0.95,
      });
    }
  }

  return results;
}
