import type { AgentAction, RedactionSettings } from '../../../shared/types';
import { uiOverlay } from './ui_overlay';

/**
 * Finds element in document using selector, xpath, or coordinates.
 */
export function resolveElement(action: AgentAction): HTMLElement | null {
  if (action.selector) {
    try {
      const el = document.querySelector(action.selector);
      if (el) return el as HTMLElement;
    } catch (e) {
      console.warn('[PRAHARI] Selector query failed, falling back:', action.selector);
    }
  }

  if (action.bbox) {
    const centerX = action.bbox.x + action.bbox.width / 2;
    const centerY = action.bbox.y + action.bbox.height / 2;
    const el = document.elementFromPoint(centerX, centerY);
    if (el) return el as HTMLElement;
  }

  return null;
}

/**
 * Assesses whether an action poses risk (e.g. form submission, financial transaction, sensitive deletion).
 */
export function evaluateActionRisk(element: HTMLElement | null, action: AgentAction): { isRisky: boolean; reason: string } {
  if (!element) return { isRisky: false, reason: '' };

  const tagName = element.tagName.toLowerCase();
  const text = (element.innerText || (element as HTMLInputElement).value || '').toLowerCase();
  const inputType = (element.getAttribute('type') || '').toLowerCase();

  if (tagName === 'button' || inputType === 'submit' || element.getAttribute('role') === 'button') {
    if (/submit|pay|proceed|checkout|confirm|delete|transfer|send\s*money|apply/i.test(text)) {
      return {
        isRisky: true,
        reason: `Action will submit data or trigger critical operation ("${text.trim()}")`,
      };
    }
  }

  if (inputType === 'password') {
    return {
      isRisky: true,
      reason: 'Action interacts directly with a password credential field',
    };
  }

  return { isRisky: false, reason: '' };
}

/**
 * Dispatches realistic input events to update React/Vue controlled form inputs.
 */
function simulateInput(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  element.focus();
  element.value = value;
  
  // Trigger modern framework event listeners
  const inputEvent = new Event('input', { bubbles: true, cancelable: true });
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  
  // React 16+ value tracker hack for controlled inputs
  const tracker = (element as any)._valueTracker;
  if (tracker) {
    tracker.setValue(value);
  }

  element.dispatchEvent(inputEvent);
  element.dispatchEvent(changeEvent);
}

/**
 * Safe Execution Engine for Agent Action Plans.
 */
export async function executeAgentAction(
  action: AgentAction,
  settings: RedactionSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const targetElement = resolveElement(action);

    // 1. Check for Risky Actions
    if (settings.requireConfirmForRiskyActions) {
      const risk = evaluateActionRisk(targetElement, action);
      if (risk.isRisky) {
        const confirmed = await uiOverlay.requestRiskyActionConfirmation(action, risk.reason);
        if (!confirmed) {
          uiOverlay.showToast('Action cancelled by user', '#EF4444');
          return { success: false, message: 'Action rejected by user security gate' };
        }
      }
    }

    // 2. Perform requested action
    switch (action.action) {
      case 'click': {
        if (!targetElement) {
          return { success: false, message: `Could not find click target: ${action.selector}` };
        }
        uiOverlay.showActionHalo(targetElement, 'Clicking');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 200));

        targetElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        targetElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        targetElement.click();
        await new Promise(r => setTimeout(r, 300));
        uiOverlay.hideActionHalo();
        return { success: true, message: `Clicked ${action.selector || targetElement.tagName}` };
      }

      case 'type': {
        if (!targetElement) {
          return { success: false, message: `Could not find input target: ${action.selector}` };
        }
        uiOverlay.showActionHalo(targetElement, 'Typing');
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await new Promise(r => setTimeout(r, 150));

        if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) {
          simulateInput(targetElement, action.value || '');
        } else if (targetElement.isContentEditable) {
          targetElement.innerText = action.value || '';
        }
        await new Promise(r => setTimeout(r, 250));
        uiOverlay.hideActionHalo();
        return { success: true, message: `Typed into ${action.selector || targetElement.tagName}` };
      }

      case 'scroll': {
        const amount = action.scrollAmount || 400;
        const direction = action.scrollDirection || 'down';
        if (direction === 'down') {
          window.scrollBy({ top: amount, behavior: 'smooth' });
        } else if (direction === 'up') {
          window.scrollBy({ top: -amount, behavior: 'smooth' });
        } else if (direction === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (direction === 'bottom') {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
        await new Promise(r => setTimeout(r, 300));
        return { success: true, message: `Scrolled ${direction}` };
      }

      case 'wait': {
        await new Promise(r => setTimeout(r, 1000));
        return { success: true, message: 'Waited 1000ms' };
      }

      case 'done': {
        uiOverlay.showToast('PRAHARI Task Complete', '#10B981');
        return { success: true, message: 'Task completed successfully' };
      }

      default:
        return { success: false, message: `Unknown action: ${action.action}` };
    }
  } catch (error: any) {
    return { success: false, message: `Execution error: ${error.message}` };
  }
}
