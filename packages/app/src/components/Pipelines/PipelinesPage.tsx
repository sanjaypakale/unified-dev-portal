import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { ddpApiRef } from '../../api/DdpApi';
import { PipelinesEmptyState } from './PipelinesEmptyState';
import { PipelineForm, toPipelineForm } from './types';
import { CREATE_PIPELINE_PATH } from './create';

const columns: TableColumn<PipelineForm>[] = [
  { title: 'AppCode', field: 'appCode', highlight: true },
  { title: 'Bitbucket project name', field: 'bitbucketProjectName' },
  { title: 'Module name', field: 'moduleName' },
  { title: 'Deployment type', field: 'deploymentType' },
  {
    title: 'Action',
    sorting: false,
    searchable: false,
    render: () => (
      <Button size="small" variant="outlined" color="primary" type="button">
        Reonboard
      </Button>
    ),
  },
];

export const PipelinesPage = () => {
  const ddpApi = useApi(ddpApiRef);
  const alertApi = useApi(alertApiRef);
  const [rows, setRows] = useState<PipelineForm[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPipelines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ddpApi.getAllPipelines();
      setRows((data || []).map(toPipelineForm));
    } catch (error) {
      alertApi.post({
        message: 'Error loading pipelines',
        severity: 'error',
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [alertApi, ddpApi]);

  useEffect(() => {
    loadPipelines();
  }, [loadPipelines]);

  return (
    <Page themeId="tool">
      <Header
        title="Pipelines"
        subtitle="Deployment pipelines for application modules"
      >
        <HeaderLabel label="Owner" value="Platform" />
      </Header>
      <Content>
        <ContentHeader>
          <Button
            component={RouterLink}
            to={CREATE_PIPELINE_PATH}
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Create a Pipeline
          </Button>
        </ContentHeader>
        {loading && <Progress />}
        {!loading && rows.length === 0 && <PipelinesEmptyState />}
        {!loading && rows.length > 0 && (
          <Table
            columns={columns}
            data={rows}
            options={{
              paging: true,
              pageSize: 20,
              pageSizeOptions: [10, 20, 50],
              search: true,
              sorting: true,
              padding: 'dense',
            }}
          />
        )}
      </Content>
    </Page>
  );
};

export default PipelinesPage;
