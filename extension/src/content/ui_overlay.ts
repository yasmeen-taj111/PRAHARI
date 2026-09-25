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
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(this.overlayContainer);
    }
    return this.overlayContainer;
  }

  /**
   * Highlights the element currently being acted upon with a futuristic Emerald Sentinel Halo.
   */
  showActionHalo(target: HTMLElement | BoundingBox, actionName: string): void {
    const container = this.ensureContainer();

    if (!this.haloElement) {
      this.haloElement = document.createElement('div');
      this.haloElement.className = 'prahari-halo';
      this.haloElement.style.cssText = `
        position: absolute;
        border: 2px solid #10B981;
        box-shadow: 0 0 16px rgba(16, 185, 129, 0.7), inset 0 0 10px rgba(16, 185, 129, 0.2);
        border-radius: 8px;
        pointer-events: none;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
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
    this.haloElement.style.left = `${rect.left - 4}px`;
    this.haloElement.style.top = `${rect.top - 4}px`;
    this.haloElement.style.width = `${Math.max(20, rect.width + 8)}px`;
    this.haloElement.style.height = `${Math.max(20, rect.height + 8)}px`;

    this.showToast(`PRAHARI Executing: ${actionName.toUpperCase()}`, '#10B981');
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
        background: #0F172A;
        color: #F1F5F9;
        border: 1px solid #334155;
        border-left: 4px solid ${accentColor};
        padding: 12px 18px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2147483645;
        pointer-events: auto;
      `;
      container.appendChild(this.toastElement);
    }
    this.toastElement.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accentColor};box-shadow:0 0 8px ${accentColor};animation:pulse 1.5s infinite"></span>
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
        background: #0F172A;
        color: #F1F5F9;
        border: 1px solid #F97316;
        border-radius: 12px;
        padding: 24px;
        width: 440px;
        max-width: 90vw;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(249, 115, 22, 0.2);
        z-index: 2147483647;
        pointer-events: auto;
      `;

      modal.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div style="background:rgba(249, 115, 22, 0.15);color:#F97316;padding:8px 12px;border-radius:8px;font-size:20px;border:1px solid rgba(249,115,22,0.3);">⚠️</div>
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:700;color:#F1F5F9;">Sentinel Risk Confirmation</h3>
            <span style="font-size:12px;color:#94A3B8;">PRAHARI intercepted a critical browser action</span>
          </div>
        </div>
        <p style="font-size:13px;color:#CBD5E1;line-height:1.5;margin:12px 0;background:#1E293B;padding:12px 14px;border-radius:8px;border-left:3px solid #F97316;border:1px solid #334155;">
          <strong>Action:</strong> <span style="color:#10B981;font-weight:700;">${action.action.toUpperCase()}</span> ${action.selector ? `on <code style="color:#38BDF8;font-family:monospace;font-size:11px;">${action.selector}</code>` : ''}<br/>
          <strong>Reason:</strong> ${reason}
        </p>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
          <button id="prahari-deny-btn" style="background:#1E293B;color:#94A3B8;border:1px solid #334155;padding:9px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">
            Deny Action
          </button>
          <button id="prahari-confirm-btn" style="background:#10B981;color:#FFFFFF;border:none;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
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
