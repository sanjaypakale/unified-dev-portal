import { AuthService } from './AuthService';

describe('AuthService', () => {
  const authService = new AuthService();

  afterEach(() => {
    sessionStorage.clear();
  });

  it('returns the selected app code from sessionStorage', () => {
    sessionStorage.setItem('appCode', ' PAY ');
    expect(authService.getAppCode()).toBe('PAY');
  });

  it('returns an empty string when no app code is selected', () => {
    expect(authService.getAppCode()).toBe('');
  });
});
