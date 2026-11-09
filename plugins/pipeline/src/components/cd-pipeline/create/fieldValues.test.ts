import { applyFieldChange } from './fieldValues';
import { FieldGroup } from './schema';

const groups: FieldGroup[] = [
  {
    id: 'bitbucket',
    title: 'Bitbucket',
    fields: [
      {
        key: 'BITBUCKET_PROJECT_NAME',
        widget: 'select',
        optionsSource: 'bitbucket-projects',
      },
      {
        key: 'MODULE_NAME',
        widget: 'select',
        optionsSource: 'bitbucket-repositories',
        dependsOn: 'BITBUCKET_PROJECT_NAME',
      },
    ],
  },
];

describe('applyFieldChange', () => {
  it('clears the repository when the project changes', () => {
    expect(
      applyFieldChange(
        {
          BITBUCKET_PROJECT_NAME: 'PAY',
          MODULE_NAME: 'payments-service',
        },
        groups,
        'BITBUCKET_PROJECT_NAME',
        'IDP',
      ),
    ).toEqual({
      BITBUCKET_PROJECT_NAME: 'IDP',
      MODULE_NAME: '',
    });
  });
});
