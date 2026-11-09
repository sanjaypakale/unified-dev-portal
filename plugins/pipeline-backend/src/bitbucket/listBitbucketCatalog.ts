import bitbucketCatalog from './bitbucket-catalog.json';

type BitbucketProjectRecord = {
  key: string;
  name: string;
  repositories: string[];
};

export type BitbucketProject = {
  key: string;
  name: string;
};

export type BitbucketRepository = {
  name: string;
};

const projects = bitbucketCatalog as BitbucketProjectRecord[];

/** Projects shown in the Bitbucket project dropdown. */
export const listBitbucketProjects = (): BitbucketProject[] =>
  projects.map(({ key, name }) => ({ key, name }));

/** Repositories for one project. The repository name is the module name. */
export const listBitbucketRepositories = (
  projectKey: string,
): BitbucketRepository[] => {
  const project = projects.find(
    item => item.key.toLowerCase() === projectKey.toLowerCase(),
  );
  return (project?.repositories ?? []).map(name => ({ name }));
};
