import { AgentAction, BoundingBox } from '../../../shared/types';

class UIOverlayManager {
  private overlayContainer: HTMLElement | null = null;
  private haloElement: HTMLElement | null = null;
  private toastElement: HTMLElement | null = null;

  private ensureContainer(): HTMLElement {
    if (!this.overlayContainer || !document.body.contains(this.overlayContainer)) {
      this.overlayContainer = document.createElement('div');
      this.overlayContainer.className = 'prahari-injected-overlay';
      this.overlayContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2147483640;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(this.overlayContainer);
    }
    return this.overlayContainer;
  }

  /**
   * Highlights the element currently being acted upon with a sleek precision Sentinel Halo.
   */
  showActionHalo(target: HTMLElement | BoundingBox, actionName: string): void {
    const container = this.ensureContainer();

    if (!this.haloElement) {
      this.haloElement = document.createElement('div');
      this.haloElement.className = 'prahari-halo';
      this.haloElement.style.cssText = `
        position: absolute;
        border: 1.5px solid #10B981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.45), inset 0 0 6px rgba(16, 185, 129, 0.15);
        border-radius: 6px;
        pointer-events: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 2147483641;
      `;
      container.appendChild(this.haloElement);
    }

    let rect: { left: number; top: number; width: number; height: number };
    if (target instanceof HTMLElement) {
      const clientRect = target.getBoundingClientRect();
      rect = {
        left: clientRect.left,
        top: clientRect.top,
        width: clientRect.width,
        height: clientRect.height,
      };
    } else {
      rect = {
        left: target.x,
        top: target.y,
        width: target.width,
        height: target.height,
      };
    }

    this.haloElement.style.display = 'block';
    this.haloElement.style.left = `${rect.left - 3}px`;
    this.haloElement.style.top = `${rect.top - 3}px`;
    this.haloElement.style.width = `${Math.max(20, rect.width + 6)}px`;
    this.haloElement.style.height = `${Math.max(20, rect.height + 6)}px`;

    this.showToast(`PRAHARI Action: ${actionName.toUpperCase()}`, '#10B981');
  }

  hideActionHalo(): void {
    if (this.haloElement) {
      this.haloElement.style.display = 'none';
    }
  }

  /**
   * Displays a status badge toast in the corner.
   */
  showToast(message: string, accentColor: string = '#10B981'): void {
    const container = this.ensureContainer();
    if (!this.toastElement) {
      this.toastElement = document.createElement('div');
      this.toastElement.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #11141A;
        color: #F4F4F5;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 3px solid ${accentColor};
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 12.5px;
        font-weight: 500;
        box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 2147483645;
        pointer-events: auto;
      `;
      container.appendChild(this.toastElement);
    }
    this.toastElement.innerHTML = `
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${accentColor}"></span>
      <span>${message}</span>
    `;
    this.toastElement.style.display = 'flex';
  }

  /**
   * Prompts user for approval before performing a high-risk action (form submit / payment / redacted access).
   */
  async requestRiskyActionConfirmation(action: AgentAction, reason: string): Promise<boolean> {
    const container = this.ensureContainer();

    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #11141A;
        color: #F4F4F5;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        padding: 22px;
        width: 420px;
        max-width: 90vw;
        box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.9);
        z-index: 2147483647;
        pointer-events: auto;
      `;

      modal.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
          <div style="background:rgba(245, 158, 11, 0.12);color:#FBBF24;padding:6px 10px;border-radius:6px;font-size:16px;border:1px solid rgba(245,158,11,0.25);">⚠️</div>
          <div>
            <h3 style="margin:0;font-size:15px;font-weight:600;color:#F4F4F5;">Sentinel Action Authorization</h3>
            <span style="font-size:11.5px;color:#A1A1AA;">Critical browser event intercepted</span>
          </div>
        </div>
        <p style="font-size:12.5px;color:#D4D4D8;line-height:1.5;margin:12px 0;background:#090B0E;padding:10px 12px;border-radius:6px;border:1px solid rgba(255, 255, 255, 0.06);">
          <strong>Action:</strong> <span style="color:#10B981;font-weight:600;">${action.action.toUpperCase()}</span> ${action.selector ? `on <code style="color:#38BDF8;font-size:11px;background:rgba(255,255,255,0.04);padding:1px 5px;border-radius:3px;">${action.selector}</code>` : ''}<br/>
          <strong>Reason:</strong> ${reason}
        </p>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px;">
          <button id="prahari-deny-btn" style="background:#171B22;color:#A1A1AA;border:1px solid rgba(255,255,255,0.08);padding:8px 14px;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;">
            Deny
          </button>
          <button id="prahari-confirm-btn" style="background:#10B981;color:#090B0E;border:none;padding:8px 16px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">
            Allow Execution
          </button>
        </div>
      `;

      container.appendChild(modal);

      modal.querySelector('#prahari-confirm-btn')?.addEventListener('click', () => {
        container.removeChild(modal);
        resolve(true);
      });

      modal.querySelector('#prahari-deny-btn')?.addEventListener('click', () => {
        container.removeChild(modal);
        resolve(false);
      });
    });
  }
}

export const uiOverlay = new UIOverlayManager();
