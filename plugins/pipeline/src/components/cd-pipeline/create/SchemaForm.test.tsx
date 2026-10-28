import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { fireEvent, render, screen } from '@testing-library/react';
import { SchemaForm } from './SchemaForm';
import { FieldGroup } from './schema';

const groups: FieldGroup[] = [
  {
    id: 'openshift-urls',
    title: 'OpenShift URLs',
    fields: [
      {
        key: 'SIT_OC_URL',
        label: 'Enter SIT OC URL',
        widget: 'text',
        required: true,
        errorMessage: 'SIT oc url is required',
      },
    ],
  },
  {
    id: 'agents',
    title: 'Static agent',
    fields: [
      {
        key: 'IS_STATIC_AGENT',
        label: 'Is it static agent',
        widget: 'boolean',
        defaultValue: 'no',
        options: [
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' },
        ],
      },
      {
        key: 'SIT_NODE',
        label: 'Enter SIT Agent Name',
        widget: 'text',
        visible: { field: 'IS_STATIC_AGENT', equals: 'yes' },
        required: { field: 'IS_STATIC_AGENT', equals: 'yes' },
      },
    ],
  },
  {
    id: 'cloud-aws',
    title: 'AWS',
    when: { context: 'cloudProvider', equals: 'aws' },
    fields: [
      {
        key: 'AWS_ACCOUNT_ID',
        label: 'AWS account id',
        widget: 'text',
      },
    ],
  },
];

describe('SchemaForm', () => {
  it('shows shared fields and reveals dependent fields', async () => {
    const onChange = jest.fn();
    const { rerender } = render(
      <ThemeProvider theme={lightTheme}>
        <SchemaForm
          groups={groups}
          values={{ IS_STATIC_AGENT: 'no' }}
          context={{ platform: 'openshift' }}
          onChange={onChange}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText(/Enter SIT OC URL/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Enter SIT Agent Name/)).not.toBeInTheDocument();
    expect(screen.queryByText('AWS')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Yes'));
    expect(onChange).toHaveBeenCalledWith('IS_STATIC_AGENT', 'yes');

    rerender(
      <ThemeProvider theme={lightTheme}>
        <SchemaForm
          groups={groups}
          values={{ IS_STATIC_AGENT: 'yes' }}
          context={{ platform: 'openshift', cloudProvider: 'aws' }}
          onChange={onChange}
        />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText(/Enter SIT Agent Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/AWS account id/)).toBeInTheDocument();
  });
});
