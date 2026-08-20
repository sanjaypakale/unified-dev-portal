import { useEffect, useState } from 'react';
import { BitbucketRepoPermissionProps } from '../BitbucketRepoPermission/BitbucketRepoPermission';
import { useApi } from '@backstage/core-plugin-api';
import { ddpApiRef } from '../../../api/DdpApi';
import {
  CircularProgress,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import GroupIcon from '@material-ui/icons/Group';
import {
  BranchRestrictionPermission,
  getPreventLabel,
  groupByMatcher,
} from './branchRestrictionUtils';

export const BitbucketBranchRestriction = ({
  projectKey,
  repoName,
}: BitbucketRepoPermissionProps) => {
  const [loading, setLoading] = useState(false);
  const [groupedPermissions, setGroupedPermissions] = useState<
    Record<string, BranchRestrictionPermission[]>
  >({});

  const ddpApi = useApi(ddpApiRef);

  useEffect(() => {
    if (!projectKey) {
      setGroupedPermissions({});
      return;
    }

    let cancelled = false;

    const getBranchRestrictions = async () => {
      try {
        setLoading(true);
        const response = await ddpApi.getBitbucketRepoPermission(
          projectKey,
          repoName,
          'branchpermission',
        );

        console.log('Branch Response', response);

        const permissions = (response?.branchPermissions?.values ??
          []) as BranchRestrictionPermission[];

        if (!cancelled) {
          setGroupedPermissions(groupByMatcher(permissions));
        }
      } catch (error) {
        console.error('Error fetching branch restrictions', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getBranchRestrictions();

    return () => {
      cancelled = true;
    };
  }, [ddpApi, projectKey, repoName]);

  if (loading) {
    return (
      <Grid container justifyContent="center">
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Branch</strong>
            </TableCell>
            <TableCell>
              <strong>Scope</strong>
            </TableCell>
            <TableCell>
              <strong>Prevent</strong>
            </TableCell>
            <TableCell>
              <strong>Exemptions</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(groupedPermissions).map(permission =>
            groupedPermissions[permission].map((item, index) => (
              <TableRow key={item.id}>
                {index === 0 && (
                  <TableCell
                    rowSpan={groupedPermissions[permission].length}
                    style={{
                      fontWeight: 'bold',
                      verticalAlign: 'top',
                    }}
                  >
                    {item.matcher?.displayId}
                  </TableCell>
                )}
                <TableCell>{item.scope?.type}</TableCell>
                <TableCell>{getPreventLabel(item.type)}</TableCell>
                <TableCell>
                  {item.users?.map(user => (
                    <div
                      key={user.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <AccountCircleIcon style={{ marginRight: 8 }} />
                      <Typography
                        style={{
                          color: !user.active ? 'gray' : undefined,
                        }}
                      >
                        {user.displayName} ({user.name})
                      </Typography>
                    </div>
                  ))}
                  {item.groups?.map(group => (
                    <div
                      key={group}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 4,
                      }}
                    >
                      <GroupIcon style={{ marginRight: 8 }} />
                      <Typography>{group}</Typography>
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
