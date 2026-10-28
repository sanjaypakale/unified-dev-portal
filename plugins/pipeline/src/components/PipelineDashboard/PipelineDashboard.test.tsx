import { renderInTestApp } from '@backstage/test-utils';
import { PipelineDashboard } from './PipelineDashboard';

describe('PipelineDashboard', () => {
  it('renders the self-service tools', async () => {
    const { getByText } = await renderInTestApp(<PipelineDashboard />);

    expect(getByText('Pipeline Self-Service')).toBeInTheDocument();
    expect(getByText('Devops Onboarding')).toBeInTheDocument();
    expect(getByText('Create Jenkins Agent')).toBeInTheDocument();
    expect(getByText('Continuous Delivery Workflow')).toBeInTheDocument();
    expect(getByText('Create Pipeline')).toBeInTheDocument();
  });
});
