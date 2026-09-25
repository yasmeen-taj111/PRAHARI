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
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      document.body.appendChild(this.overlayContainer);
    }
    return this.overlayContainer;
  }

  /**
   * Highlights the element currently being acted upon with a futuristic Sentinel Halo.
   */
  showActionHalo(target: HTMLElement | BoundingBox, actionName: string): void {
    const container = this.ensureContainer();

    if (!this.haloElement) {
      this.haloElement = document.createElement('div');
      this.haloElement.className = 'prahari-halo';
      this.haloElement.style.cssText = `
        position: absolute;
        border: 2px solid #06B6D4;
        box-shadow: 0 0 15px rgba(6, 182, 212, 0.6), inset 0 0 10px rgba(6, 182, 212, 0.2);
        border-radius: 6px;
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

    this.showToast(`PRAHARI Action: ${actionName.toUpperCase()}`, '#06B6D4');
  }

  hideActionHalo(): void {
    if (this.haloElement) {
      this.haloElement.style.display = 'none';
    }
  }

  /**
   * Displays a status badge toast in the corner.
   */
  showToast(message: string, accentColor: string = '#F59E0B'): void {
    const container = this.ensureContainer();
    if (!this.toastElement) {
      this.toastElement = document.createElement('div');
      this.toastElement.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #090D16;
        color: #F8FAFC;
        border: 1px solid #1E293B;
        border-left: 4px solid ${accentColor};
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 2147483645;
        pointer-events: auto;
      `;
      container.appendChild(this.toastElement);
    }
    this.toastElement.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accentColor};animation:pulse 1.5s infinite"></span>
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
        background: #0B0F17;
        color: #F8FAFC;
        border: 1px solid #F59E0B;
        border-radius: 12px;
        padding: 24px;
        width: 420px;
        max-width: 90vw;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(245, 158, 11, 0.2);
        z-index: 2147483647;
        pointer-events: auto;
      `;

      modal.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="background:rgba(245, 158, 11, 0.15);color:#F59E0B;padding:8px;border-radius:8px;font-size:18px;">⚠️</div>
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:700;color:#F8FAFC;">Sentinel Risk Confirmation</h3>
            <span style="font-size:12px;color:#94A3B8;">PRAHARI intercepted a critical browser action</span>
          </div>
        </div>
        <p style="font-size:13px;color:#CBD5E1;line-height:1.5;margin:12px 0;background:#131B2E;padding:10px 12px;border-radius:6px;border-left:3px solid #F59E0B;">
          <strong>Action:</strong> ${action.action.toUpperCase()} ${action.selector ? `on <code>${action.selector}</code>` : ''}<br/>
          <strong>Reason:</strong> ${reason}
        </p>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;">
          <button id="prahari-deny-btn" style="background:#1E293B;color:#94A3B8;border:1px solid #334155;padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
            Deny Action
          </button>
          <button id="prahari-confirm-btn" style="background:#F59E0B;color:#0B0F17;border:none;padding:8px 18px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;">
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
