import { fieldError } from './fieldValidation';
import { buildOnboardSteps } from './onboardSteps';
import { DeploymentField } from './schema';

const email: DeploymentField = {
  key: 'NOTIFICATION_EMAIL',
  label: 'Notification email',
  widget: 'text',
  required: true,
  pattern: '^[^\\s@]+@uobgroup\\.com$',
  errorMessage: 'Notification email is required',
  patternMessage: 'Email must end with uobgroup.com',
};

describe('onboard steps', () => {
  it('omits the cloud step unless a cloud provider was selected', () => {
    expect(buildOnboardSteps({ deploymentLabel: 'Kustomize' }).map(step => step.id)).toEqual([
      'repository',
      'deployment',
      'review',
    ]);
    expect(
      buildOnboardSteps({ deploymentLabel: 'Deployment', cloudLabel: 'AWS' }).map(
        step => step.label,
      ),
    ).toEqual(['Repository', 'Deployment', 'AWS', 'Review']);
  });

  it('requires a notification email at uobgroup.com', () => {
    expect(fieldError(email, '', {}, {})).toBe('Notification email is required');
    expect(fieldError(email, 'person@example.com', {}, {})).toBe(
      'Email must end with uobgroup.com',
    );
    expect(fieldError(email, 'person@uobgroup.com', {}, {})).toBeUndefined();
  });
});
