import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useApi } from '@backstage/core-plugin-api';
import { ddpApiRef } from '../../api/DdpApi';

type EarApplicationForm = {
  appCode: string;
  uniqueAppCode: string;
  appName: string;
  l2Code: string;
  appLead: string;
  appLeadLanId: string;
  l2Head: string;
  sonarInstance: string;
  jenkinsInstance: string;
  artifactoryInstance: string;
  veracodeInstance: string;
  bitbucketInstance: string;
  dastInstance: string;
  id: string;
  isActive: boolean;
};

type EarApplicationRow = {
  id: string;
  appCode: string;
  uniqueAppCode: string;
  appName: string;
  domain: string;
  l2Code: string;
  l3Name: string;
  l3Code: string;
  appLead: string;
  appLeadLanId: string;
  l2Head: string;
  sonarInstance: string;
  jenkinsInstance: string;
  artifactoryInstance: string;
  veracodeInstance: string;
  bitbucketInstance: string;
  dastInstance: string;
  isActive: boolean;
};

const columnsBase: TableColumn<EarApplicationRow>[] = [
  { title: 'UniqueAppCode', field: 'uniqueAppCode', highlight: true },
  { title: 'AppCode', field: 'appCode' },
  { title: 'AppName', field: 'appName' },
  { title: 'L2Code', field: 'l2Code' },
  { title: 'AppLead', field: 'appLead' },
  { title: 'AppLeadLanId', field: 'appLeadLanId' },
  {
    title: 'IsActive',
    field: 'isActive',
    render: (row: EarApplicationRow) => (
      <Typography>{row.isActive ? 'Yes' : 'No'}</Typography>
    ),
  },
];

export const CreateApplicationEarPage = () => {
  const ddpApi = useApi(ddpApiRef);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EarApplicationForm>({
    appCode: '',
    uniqueAppCode: '',
    appName: '',
    l2Code: '',
    appLead: '',
    appLeadLanId: '',
    l2Head: '',
    sonarInstance: '',
    jenkinsInstance: '',
    artifactoryInstance: '',
    veracodeInstance: '',
    bitbucketInstance: '',
    dastInstance: '',
    id: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [rows, setRows] = useState<EarApplicationRow[]>([]);

  const loadExistingApps = useCallback(async () => {
    setLoadingApps(true);
    try {
      const data = await ddpApi.getAllEarApps();
      // Convert to table rows
      const tableRows: EarApplicationRow[] = (data || []).map(
        (app: any, idx: number) => ({
          id: String(idx + 1),
          appCode: app.appCode || '',
          uniqueAppCode: app.uniqueAppCode || '',
          appName: app.appName || '',
          domain: app.domain || '',
          l2Code: app.l2Code || '',
          l3Name: app.l3Name || '',
          l3Code: app.l3Code || '',
          appLead: app.appLead || '',
          appLeadLanId: (app as any).appLeadLanId || '',
          l2Head: (app as any).l2Head || '',
          sonarInstance: (app as any).sonarInstance || '',
          jenkinsInstance: (app as any).jenkinsInstance || '',
          artifactoryInstance: (app as any).artifactoryInstance || '',
          veracodeInstance: (app as any).veracodeInstance || '',
          bitbucketInstance: (app as any).bitbucketInstance || '',
          dastInstance: (app as any).dastInstance || '',
          isActive: app.isActive,
        }),
      );
      setRows(tableRows);
    } catch (error) {
      console.warn('Error loading existing EAR apps:', error);
      setRows([]);
    } finally {
      setLoadingApps(false);
    }
  }, [ddpApi]);

  useEffect(() => {
    loadExistingApps();
  }, [loadExistingApps]);

  const handleCreate = () => {
    setFormData({
      appCode: '',
      uniqueAppCode: '',
      appName: '',
      l2Code: '',
      appLead: '',
      appLeadLanId: '',
      l2Head: '',
      sonarInstance: '',
      jenkinsInstance: '',
      artifactoryInstance: '',
      veracodeInstance: '',
      bitbucketInstance: '',
      dastInstance: '',
      id: '',
      isActive: true,
    });
    setIsCreateMode(true);
    setDialogOpen(true);
  };

  const handleEdit = useCallback((row: EarApplicationRow) => {
    setFormData({
      appCode: row.appCode,
      uniqueAppCode: row.uniqueAppCode,
      appName: row.appName,
      l2Code: row.l2Code,
      appLead: row.appLead,
      appLeadLanId: row.appLeadLanId,
      l2Head: row.l2Head,
      sonarInstance: row.sonarInstance,
      jenkinsInstance: row.jenkinsInstance,
      artifactoryInstance: row.artifactoryInstance,
      veracodeInstance: row.veracodeInstance,
      bitbucketInstance: row.bitbucketInstance,
      dastInstance: row.dastInstance,
      id: row.id,
      isActive: row.isActive === true || (row.isActive as any) === '1',
    });
    setIsCreateMode(false);
    setDialogOpen(true);
  }, []);

  const columns = useMemo<TableColumn<EarApplicationRow>[]>(
    () => [
      ...columnsBase,
      {
        title: 'Action',
        sorting: false,
        searchable: false,
        render: (row: EarApplicationRow) => (
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
    setFormData({
      appCode: '',
      uniqueAppCode: '',
      appName: '',
      l2Code: '',
      appLead: '',
      appLeadLanId: '',
      l2Head: '',
      sonarInstance: '',
      jenkinsInstance: '',
      artifactoryInstance: '',
      veracodeInstance: '',
      bitbucketInstance: '',
      dastInstance: '',
      id: '',
      isActive: true,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await ddpApi.createOrUpdateEarApplication({
        appCode: formData.appCode,
        uniqueAppCode: formData.uniqueAppCode || formData.appCode,
        appName: formData.appName,
        l2Code: formData.l2Code,
        appLead: formData.appLead,
        appLeadLanId: formData.appLeadLanId,
        l2Head: formData.l2Head || undefined,
        sonarInstance: formData.sonarInstance || undefined,
        jenkinsInstance: formData.jenkinsInstance || undefined,
        artifactoryInstance: formData.artifactoryInstance || undefined,
        veracodeInstance: formData.veracodeInstance || undefined,
        bitbucketInstance: formData.bitbucketInstance || undefined,
        dastInstance: formData.dastInstance || undefined,
        id: formData.id || '',
        isActive: formData.isActive === true ? '1' : '0',
      });
      await loadExistingApps();
      handleClose();
    } catch (error) {
      console.error('Error saving EAR application');
      
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange =
    (field: keyof EarApplicationForm) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
    };

  const isFormValid =
    formData.appCode?.trim() &&
    formData.uniqueAppCode?.trim() &&
    formData.appName?.trim() &&
    formData.l2Code?.trim() &&
    formData.appLead?.trim() &&
    formData.appLeadLanId?.trim() &&
    formData.l2Head?.trim();

  return (
    <Page themeId="tool">
      <Header
        title="Create Application EAR"
        subtitle="Create or update Enterprise Application Registry (EAR) application data"
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
            Create Application EAR
          </Button>
        </ContentHeader>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard title="Existing EAR Applications" variant="gridItem">
              {loadingApps ? (
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
              ? 'Create New Application EAR'
              : 'Update Application EAR'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} style={{ marginTop: 8 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="App Code"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  disabled={!isCreateMode}
                  helperText={
                    !isCreateMode ? 'App Code cannot be changed' : undefined
                  }
                  value={formData.appCode}
                  onChange={handleFieldChange('appCode')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Unique App Code"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.uniqueAppCode}
                  onChange={handleFieldChange('uniqueAppCode')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="App Name"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.appName}
                  onChange={handleFieldChange('appName')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="L2 Code"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.l2Code}
                  onChange={handleFieldChange('l2Code')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="App Lead"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.appLead}
                  onChange={handleFieldChange('appLead')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="App Lead Lan ID"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.appLeadLanId}
                  onChange={handleFieldChange('appLeadLanId')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="L2 Head"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  required
                  value={formData.l2Head}
                  onChange={handleFieldChange('l2Head')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Sonar Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.sonarInstance}
                  onChange={handleFieldChange('sonarInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Jenkins Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.jenkinsInstance}
                  onChange={handleFieldChange('jenkinsInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Artifactory Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.artifactoryInstance}
                  onChange={handleFieldChange('artifactoryInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Veracode Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.veracodeInstance}
                  onChange={handleFieldChange('veracodeInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bitbucket Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.bitbucketInstance}
                  onChange={handleFieldChange('bitbucketInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="DAST Instance"
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  value={formData.dastInstance}
                  onChange={handleFieldChange('dastInstance')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={Boolean(formData.isActive)}
                      onChange={event =>
                        setFormData({
                          ...formData,
                          isActive: event.target.checked,
                        })
                      }
                    />
                  }
                  label="Active"
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
              {saving ? 'Saving...' : isCreateMode ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
      </Content>
    </Page>
  );
};

export default CreateApplicationEarPage;
