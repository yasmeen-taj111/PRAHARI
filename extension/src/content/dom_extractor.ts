import type { DOMNodeSnapshot, RedactionBox, BoundingBox, RedactionSettings, ViewportSnapshot } from '../../../shared/types';
import { analyzeDOMElementSignals } from '../vision/dom_signals';
import { scanTextForPII } from '../vision/pii_detector';

/**
 * Generates an optimal unique CSS selector for a given DOM element.
 */
export function getUniqueSelector(el: HTMLElement): string {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }
  if (el.getAttribute('name')) {
    const name = el.getAttribute('name')!;
    return `${el.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;
  }
  if (el.getAttribute('data-testid')) {
    return `[data-testid="${CSS.escape(el.getAttribute('data-testid')!)}"]`;
  }

  // Build path
  const path: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .trim()
        .split(/\s+/)
        .filter(c => c && !c.includes(':') && !c.startsWith('prahari-'));
      if (classes.length > 0) {
        selector += `.${classes.slice(0, 2).map(c => CSS.escape(c)).join('.')}`;
      }
    }
    
    // Sibling index
    let sibling = current;
    let nth = 1;
    while (sibling.previousElementSibling) {
      sibling = sibling.previousElementSibling as HTMLElement;
      if (sibling.tagName === current.tagName) nth++;
    }
    if (nth > 1) selector += `:nth-of-type(${nth})`;

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Generates XPath string for element reference.
 */
export function getXPath(element: HTMLElement): string {
  if (element.id !== '') {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return '/html/body';
  }

  let ix = 0;
  const siblings = element.parentNode ? Array.from(element.parentNode.childNodes) : [];
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i];
    if (sibling === element) {
      const parentXPath = element.parentNode ? getXPath(element.parentNode as HTMLElement) : '';
      return `${parentXPath}/${element.tagName.toLowerCase()}[${ix + 1}]`;
    }
    if (sibling.nodeType === 1 && (sibling as HTMLElement).tagName === element.tagName) {
      ix++;
    }
  }
  return '';
}

/**
 * Checks if an element is currently visible in viewport.
 */
function isElementVisible(el: HTMLElement, rect: DOMRect): boolean {
  if (rect.width === 0 || rect.height === 0) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  return true;
}

export interface ExtractedDOMResult {
  nodes: DOMNodeSnapshot[];
  redactionBoxes: RedactionBox[];
  extractionTimeMs: number;
  viewport: ViewportSnapshot;
}

/**
 * Extracts all interactive and text elements, analyzes sensitive signals,
 * tags nodes, and returns both structured DOM and visual redaction bounding boxes.
 */
export function extractInteractiveDOM(settings: RedactionSettings): ExtractedDOMResult {
  const startTime = performance.now();
  const nodes: DOMNodeSnapshot[] = [];
  const redactionBoxes: RedactionBox[] = [];

  const interactiveSelectors = [
    'button',
    'input',
    'select',
    'textarea',
    'a[href]',
    '[role="button"]',
    '[role="link"]',
    '[role="checkbox"]',
    '[role="tab"]',
    '[contenteditable="true"]',
    'label',
    'p',
    'span',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'td', 'th'
  ];

  const elements = document.querySelectorAll(interactiveSelectors.join(', '));

  let boxIdCounter = 1;

  elements.forEach((rawEl) => {
    const el = rawEl as HTMLElement;
    // Skip PRAHARI injected overlay UI
    if (el.closest('.prahari-injected-overlay')) return;

    const rect = el.getBoundingClientRect();
    const isVisible = isElementVisible(el, rect);
    if (!isVisible) return;

    const tagName = el.tagName.toLowerCase();
    const isInteractive = ['button', 'input', 'select', 'textarea', 'a'].includes(tagName) ||
      el.getAttribute('role') === 'button' ||
      el.onclick !== null;

    const selector = getUniqueSelector(el);
    const xpath = getXPath(el);

    const bbox: BoundingBox = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    // 1. Analyze DOM-level signals (password type, autocomplete, aria tags)
    const domSignal = analyzeDOMElementSignals(el);

    // 2. Scan text content and input values for PII
    const textContent = el.innerText || '';
    const inputValue = (el as HTMLInputElement).value || '';
    const hasValue = (tagName === 'input' || tagName === 'textarea') 
      ? (inputValue.trim().length > 0)
      : false;

    const textToScan = `${textContent} ${inputValue}`.trim();
    const piiMatches = scanTextForPII(textToScan);

    let isSensitive = domSignal.isSensitive || piiMatches.length > 0;
    let redactionCategory = domSignal.category || (piiMatches.length > 0 ? piiMatches[0].category : undefined);
    let redacted = false;

    // Check settings if this category is enabled for redaction
    if (isSensitive && redactionCategory) {
      if (
        (redactionCategory === 'password' && settings.redactPasswords) ||
        (redactionCategory === 'credit_card' && settings.redactCreditCards) ||
        (redactionCategory === 'aadhaar' && settings.redactAadhaar) ||
        (redactionCategory === 'pan' && settings.redactPan) ||
        (redactionCategory === 'email' && settings.redactEmails) ||
        (redactionCategory === 'phone' && settings.redactPhones) ||
        (redactionCategory === 'otp' && settings.redactOtps)
      ) {
        redacted = true;
      }
    }

    // If redacted, create bounding box for visual canvas masking
    if (redacted && redactionCategory) {
      redactionBoxes.push({
        id: `box-${boxIdCounter++}`,
        category: redactionCategory,
        method: 'black_box',
        bbox: {
          x: Math.max(0, bbox.x - 2),
          y: Math.max(0, bbox.y - 2),
          width: bbox.width + 4,
          height: bbox.height + 4,
        },
        confidence: domSignal.confidence || (piiMatches[0]?.confidence ?? 0.9),
        source: domSignal.isSensitive ? 'dom_heuristic' : 'regex_pii',
        maskedTextPreview: piiMatches[0]?.maskedText,
        domSelector: selector,
      });
    }

    // Text sanitization for structural tree
    let sanitizedText = textContent;
    if (redacted) {
      sanitizedText = `[REDACTED_${(redactionCategory || 'PII').toUpperCase()}]`;
    }

    // Only include interactive elements or nodes with meaningful text in the tree
    if (isInteractive || (textContent && textContent.length > 2 && textContent.length < 300)) {
      nodes.push({
        id: `node-${nodes.length + 1}`,
        tagName,
        role: el.getAttribute('role') || undefined,
        inputType: el.getAttribute('type') || undefined,
        name: el.getAttribute('name') || undefined,
        ariaLabel: el.getAttribute('aria-label') || undefined,
        placeholder: el.getAttribute('placeholder') || undefined,
        selector,
        xpath,
        bbox,
        isInteractive,
        isSensitive,
        redacted,
        redactionCategory,
        sanitizedText: sanitizedText.slice(0, 150),
        hasValue,
        isVisible,
      });
    }
  });

  const extractionTimeMs = Math.round(performance.now() - startTime);

  return {
    nodes,
    redactionBoxes,
    extractionTimeMs,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio || 1,
    },
  };
}
