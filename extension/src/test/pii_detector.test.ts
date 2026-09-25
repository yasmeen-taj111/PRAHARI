import { describe, it, expect } from 'vitest';
import {
  validateAadhaarVerhoeff,
  validatePAN,
  validateLuhn,
  scanTextForPII,
  maskString,
} from '../vision/pii_detector';

describe('PRAHARI PII Detection Suite', () => {
  it('validates Indian Aadhaar numbers using Verhoeff checksum algorithm', () => {
    // Valid Verhoeff Aadhaar test number (234567890124)
    expect(validateAadhaarVerhoeff('2345 6789 0124')).toBe(true);
    // Invalid checksum (wrong check digit 5 instead of 4)
    expect(validateAadhaarVerhoeff('2345 6789 0125')).toBe(false);
    // Starting with 0/1
    expect(validateAadhaarVerhoeff('0123 4567 8901')).toBe(false);
  });

  it('validates Indian PAN card format and character rules', () => {
    expect(validatePAN('ABCDE1234F')).toBe(true);
    expect(validatePAN('AAAPB1234C')).toBe(true);
    expect(validatePAN('INVALID_PAN')).toBe(false);
    expect(validatePAN('12345ABCDE')).toBe(false);
  });

  it('validates Credit / Debit cards using Luhn algorithm', () => {
    // 16-digit valid Visa
    expect(validateLuhn('4532 0151 1283 0366')).toBe(true);
    // Invalid Luhn
    expect(validateLuhn('4532 0151 1283 0367')).toBe(false);
  });

  it('scans mixed text and extracts all PII categories accurately', () => {
    const text = 'User john.doe@isro.gov.in with PAN ABCDE1234F registered phone +91-9876543210 and OTP: 849201';
    const detections = scanTextForPII(text);

    expect(detections.length).toBeGreaterThanOrEqual(4);

    const categories = detections.map(d => d.category);
    expect(categories).toContain('email');
    expect(categories).toContain('pan');
    expect(categories).toContain('phone');
    expect(categories).toContain('otp');
  });

  it('generates masked string placeholders correctly', () => {
    expect(maskString('user@example.com', 'email')).toBe('u***r@***.com');
    expect(maskString('ABCDE1234F', 'pan')).toBe('ABXXXXX4F');
    expect(maskString('123456789012', 'aadhaar')).toBe('XXXX-XXXX-9012');
  });
});
