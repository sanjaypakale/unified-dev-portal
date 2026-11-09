const APP_CODE_SESSION_KEY = 'appCode';

/** Reads the app selected for the current browser session. */
export class AuthService {
  getAppCode(): string {
    if (typeof sessionStorage === 'undefined') {
      return '';
    }
    return sessionStorage.getItem(APP_CODE_SESSION_KEY)?.trim() ?? '';
  }
}
