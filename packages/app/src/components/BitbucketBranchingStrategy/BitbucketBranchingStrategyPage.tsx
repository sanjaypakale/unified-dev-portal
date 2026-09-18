import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Content,
  ContentHeader,
  Page,
  Header,
  HeaderLabel,
  InfoCard,
  Progress,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import { alertApiRef, useApi } from '@backstage/core-plugin-api';
import { BitbucketBranchingMetadata, ddpApiRef } from '../../api/DdpApi';

type BranchingForm = {
  id: string;
  branchingEnabled: boolean;
  domainName: string;
  uniqueAppCode: string;
  bitbucketProjectKey: string;
  repositoryName: string;
  as400: boolean;
  branchNamingRegex: string;
  enforcementDate: string;
  minimumGate: string;
  currentBranchingScore: string;
  currentBranchingGate: string;
  branchingStrategySopLink: string;
};

type BranchingRow = BranchingForm;

const EMPTY_FORM: BranchingForm = {
  id: '',
  branchingEnabled: false,
  domainName: '',
  uniqueAppCode: '',
  bitbucketProjectKey: '',
  repositoryName: '',
  as400: false,
  branchNamingRegex: '',
  enforcementDate: '',
  minimumGate: '',
  currentBranchingScore: '',
  currentBranchingGate: '',
  branchingStrategySopLink: '',
};

const hasValue = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

const toDateInput = (value?: string | number) => {
  if (!hasValue(value)) {
    return '';
  }
  return String(value).slice(0, 10);
};

const toStringValue = (value: unknown) => (hasValue(value) ? String(value) : '');

const toOptionalNumber = (value: string) => {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toOptionalString = (value: string) => value.trim() || undefined;

const isTruthy = (value: unknown) =>
  value === true || value === '1' || value === 1;

const columnsBase: TableColumn<BranchingRow>[] = [
  { title: 'Unique App Code', field: 'uniqueAppCode', highlight: true },
  { title: 'Bitbucket Project Key', field: 'bitbucketProjectKey' },
  { title: 'Bitbucket Repository Name', field: 'repositoryName' },
  {
    title: 'Is AS400 Project',
    field: 'as400',
    render: (row: BranchingRow) => (
      <Typography>{row.as400 ? 'Yes' : 'No'}</Typography>
    ),
  },
  { title: 'Enforcement Date', field: 'enforcementDate' },
  { title: 'Minimum Gate', field: 'minimumGate' },
];

const mapToRow = (
  record: BitbucketBranchingMetadata,
  index: number,
): BranchingRow => ({
  id: hasValue(record.id) ? String(record.id) : String(index + 1),
  branchingEnabled: isTruthy(record.branchingEnabled),
  domainName: record.domainName || '',
  uniqueAppCode: record.uniqueAppCode || '',
  bitbucketProjectKey: record.bitbucketProjectKey || '',
  repositoryName: record.repositoryName || '',
  as400: isTruthy(record.as400),
  branchNamingRegex: record.branchNamingRegex || '',
  enforcementDate: toDateInput(record.enforcementDate),
  minimumGate: toStringValue(record.minimumGate),
  currentBranchingScore: toStringValue(record.currentBranchingScore),
  currentBranchingGate: toStringValue(record.currentBranchingGate),
  branchingStrategySopLink: record.branchingStrategySopLink || '',
});

const saveButtonLabel = (saving: boolean, isCreateMode: boolean) => {
  if (saving) {
    return 'Saving...';
  }
  if (isCreateMode) {
    return 'Create';
  }
  return 'Update';
};

export const BitbucketBranchingStrategyPage = () => {
  const ddpApi = useApi(ddpApiRef);
  const alertApi = useApi(alertApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BranchingForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [rows, setRows] = useState<BranchingRow[]>([]);

  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    try {
      const data = await ddpApi.getAllBitbucketBranchingMetadata();
      const tableRows: BranchingRow[] = (data || []).map(mapToRow);
      setRows(tableRows);
    } catch (error) {
      alertApi.post({
        message: 'Error loading Bitbucket branching metadata',
        severity: 'warning',
      });
      setRows([]);
    } finally {
      setLoadingRecords(false);
    }
  }, [alertApi, ddpApi]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleCreate = () => {
    setFormData(EMPTY_FORM);
    setIsCreateMode(true);
    setDialogOpen(true);
  };

  const handleEdit = useCallback((row: BranchingRow) => {
    setFormData({ ...row });
    setIsCreateMode(false);
    setDialogOpen(true);
  }, []);

  const columns = useMemo<TableColumn<BranchingRow>[]>(
    () => [
      ...columnsBase,
      {
        title: 'Action',
        sorting: false,
        searchable: false,
        render: (row: BranchingRow) => (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
        ),
      },
    ],
    [handleEdit],
  );

  const handleClose = () => {
    setDialogOpen(false);
    setFormData(EMPTY_FORM);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ddpApi.createOrUpdateBitbucketBranchingMetadata({
        id: formData.id || undefined,
        branchingEnabled: formData.branchingEnabled,
        domainName: toOptionalString(formData.domainName),
        uniqueAppCode: formData.uniqueAppCode,
        bitbucketProjectKey: formData.bitbucketProjectKey,
        repositoryName: formData.repositoryName,
        as400: formData.as400,
        branchNamingRegex: toOptionalString(formData.branchNamingRegex),
        enforcementDate: toOptionalString(formData.enforcementDate),
        minimumGate: toOptionalNumber(formData.minimumGate),
        currentBranchingScore: toOptionalNumber(formData.currentBranchingScore),
        currentBranchingGate: toOptionalNumber(formData.currentBranchingGate),
        branchingStrategySopLink: toOptionalString(
          formData.branchingStrategySopLink,
        ),
      });
      await loadRecords();
      handleClose();
    } catch (error) {
      alertApi.post({
        message: 'Error saving Bitbucket branching metadata',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange =
    (field: keyof BranchingForm) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
    };

  const isFormValid =
    formData.uniqueAppCode?.trim() &&
    formData.bitbucketProjectKey?.trim() &&
    formData.repositoryName?.trim();

  return (
    <Page themeId="tool">
      <Header
        title="Bitbucket Branching Strategy"
        subtitle="Create or update Bitbucket branching strategy metadata"
      >
        <HeaderLabel label="Area" value="Admin" />
      </Header>
      <Content>
        <ContentHeader>
          <Button
            component={RouterLink}
            to="/admin"
            startIcon={<ArrowBackIcon />}
            style={{ marginRight: 12 }}
          >
            Back to Admin
          </Button>
          <Button
            color="primary"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            style={{ marginLeft: 12 }}
          >
            Add Branching Strategy
          </Button>
        </ContentHeader>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard title="Existing Branching Strategies" variant="gridItem">
              {loadingRecords ? (
                <Progress />
              ) : (
                <Table
                  columns={columns}
                  data={rows}
                  options={{
                    paging: true,
                    pageSize: 20,
                    pageSizeOptions: [10, 20, 50, 100],
                    search: true,
                    sorting: true,
                    padding: 'dense',
                    emptyRowsWhenPaging: true,
                  }}
                />
              )}
            </InfoCard>
          </Grid>
        </Grid>
        <Dialog
          open={dialogOpen}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>
            {isCreateMode
              ? 'Create Bitbucket Branching Strategy'
              : 'Update Bitbucket Branching Strategy'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-domain-name"
                  label="Domain Name"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.domainName}
                  onChange={handleFieldChange('domainName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-unique-app-code"
                  label="Unique App Code"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  disabled={!isCreateMode}
                  helperText={
                    !isCreateMode
                      ? 'Unique App Code cannot be changed'
                      : undefined
                  }
                  value={formData.uniqueAppCode}
                  onChange={handleFieldChange('uniqueAppCode')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-project-key"
                  label="Bitbucket Project Key"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.bitbucketProjectKey}
                  onChange={handleFieldChange('bitbucketProjectKey')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-repository-name"
                  label="Bitbucket Repository Name"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.repositoryName}
                  onChange={handleFieldChange('repositoryName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-naming-regex"
                  label="Branch Naming Regex"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.branchNamingRegex}
                  onChange={handleFieldChange('branchNamingRegex')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-enforcement-date"
                  label="Enforcement Date"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.enforcementDate}
                  onChange={handleFieldChange('enforcementDate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-minimum-gate"
                  label="Minimum Gate"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={formData.minimumGate}
                  onChange={handleFieldChange('minimumGate')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-current-score"
                  label="Current Branching Score"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={formData.currentBranchingScore}
                  onChange={handleFieldChange('currentBranchingScore')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  id="branching-current-gate"
                  label="Current Branching Gate"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={formData.currentBranchingGate}
                  onChange={handleFieldChange('currentBranchingGate')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="branching-sop-link"
                  label="Branching Strategy SOP Link"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.branchingStrategySopLink}
                  onChange={handleFieldChange('branchingStrategySopLink')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={Boolean(formData.branchingEnabled)}
                      onChange={event =>
                        setFormData({
                          ...formData,
                          branchingEnabled: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Branching Enabled"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={Boolean(formData.as400)}
                      onChange={event =>
                        setFormData({
                          ...formData,
                          as400: event.target.checked,
                        })
                      }
                    />
                  }
                  label="AS400 Project"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSave}
              disabled={!isFormValid || saving}
            >
              {saveButtonLabel(saving, isCreateMode)}
            </Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
};

export default BitbucketBranchingStrategyPage;
