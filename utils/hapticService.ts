// Browser Haptic Feedback (Vibration API) Utility Service
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'timer' | 'tap' | 'selection' | 'warning' | 'error';

class HapticService {
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('soft_study_haptics_enabled');
      if (saved !== null) {
        this.enabled = JSON.parse(saved);
      }
    } catch {}
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('soft_study_haptics_enabled', JSON.stringify(val));
    } catch {}
  }

  public trigger(type: HapticType = 'light') {
    if (!this.enabled) return;
    try {
      if (typeof window !== 'undefined' && navigator && typeof navigator.vibrate === 'function') {
        switch (type) {
          case 'light':
            navigator.vibrate(15);
            break;
          case 'medium':
            navigator.vibrate(35);
            break;
          case 'heavy':
            navigator.vibrate(70);
            break;
          case 'success':
            navigator.vibrate([40, 60, 40]);
            break;
          case 'timer':
            navigator.vibrate([25, 40, 25]);
            break;
          case 'tap':
            navigator.vibrate(10);
            break;
          case 'selection':
            navigator.vibrate(12);
            break;
          default:
            navigator.vibrate(20);
        }
      }
    } catch (err) {
      // Ignore vibration errors if unsupported or blocked by browser policy
    }
  }
}

export const haptic = new HapticService();
export const hapticService = haptic;
