import { RedactionCategory } from '../../../shared/types';

export interface DOMSignalMatch {
  isSensitive: boolean;
  category?: RedactionCategory;
  reason: string;
  confidence: number;
}

const SENSITIVE_KEYWORDS: Array<{ category: RedactionCategory; patterns: RegExp[] }> = [
  {
    category: 'password',
    patterns: [/password/i, /passwd/i, /pwd/i, /secret/i, /passphrase/i],
  },
  {
    category: 'credit_card',
    patterns: [/card[-_]?num/i, /cc[-_]?num/i, /cvv/i, /cvc/i, /expir/i, /cardholder/i, /debit[-_]?card/i],
  },
  {
    category: 'aadhaar',
    patterns: [/aadhaar/i, /aadhar/i, /uidai/i, /uid[-_]?num/i],
  },
  {
    category: 'pan',
    patterns: [/pan[-_]?num/i, /pan[-_]?card/i, /tax[-_]?id/i],
  },
  {
    category: 'otp',
    patterns: [/otp/i, /one[-_]?time[-_]?pass/i, /auth[-_]?code/i, /verification[-_]?code/i, /2fa/i],
  },
  {
    category: 'phone',
    patterns: [/phone/i, /mobile/i, /cell/i, /telephone/i, /contact[-_]?num/i],
  },
  {
    category: 'email',
    patterns: [/email/i, /e-mail/i, /user[-_]?mail/i],
  },
];

/**
 * Checks an HTML element for DOM-level sensitive indicators (attributes, roles, labels, autocomplete).
 */
export function analyzeDOMElementSignals(element: HTMLElement): DOMSignalMatch {
  const tagName = element.tagName.toLowerCase();
  const inputType = (element.getAttribute('type') || '').toLowerCase();
  const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
  const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
  const name = (element.getAttribute('name') || '').toLowerCase();
  const id = (element.getAttribute('id') || '').toLowerCase();
  const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();
  const dataAttributes = Array.from(element.attributes)
    .filter(a => a.name.startsWith('data-'))
    .map(a => `${a.name}=${a.value}`)
    .join(' ')
    .toLowerCase();

  // 1. Password input elements
  if (tagName === 'input' && (inputType === 'password' || autocomplete === 'current-password' || autocomplete === 'new-password')) {
    return {
      isSensitive: true,
      category: 'password',
      reason: 'HTML input[type=password] or password autocomplete attribute',
      confidence: 1.0,
    };
  }

  // 2. Autocomplete attributes
  if (autocomplete.includes('cc-') || autocomplete === 'credit-card') {
    return {
      isSensitive: true,
      category: 'credit_card',
      reason: `Sensitive autocomplete attribute: ${autocomplete}`,
      confidence: 0.99,
    };
  }
  if (autocomplete === 'tel' || autocomplete === 'tel-national') {
    return {
      isSensitive: true,
      category: 'phone',
      reason: 'Telephone autocomplete attribute',
      confidence: 0.95,
    };
  }
  if (autocomplete === 'email') {
    return {
      isSensitive: true,
      category: 'email',
      reason: 'Email autocomplete attribute',
      confidence: 0.95,
    };
  }

  // 3. Keyword scan in metadata strings (id, name, aria-label, placeholder, data-attrs)
  const combinedMeta = `${name} ${id} ${ariaLabel} ${placeholder} ${dataAttributes}`;

  for (const { category, patterns } of SENSITIVE_KEYWORDS) {
    for (const pattern of patterns) {
      if (pattern.test(combinedMeta)) {
        return {
          isSensitive: true,
          category,
          reason: `Matched sensitive keyword pattern ${pattern.toString()} in element attributes`,
          confidence: 0.90,
        };
      }
    }
  }

  return {
    isSensitive: false,
    reason: 'No sensitive DOM signals detected',
    confidence: 0.0,
  };
}
