import { ComponentType } from 'react';
import { SvgIconProps } from '@material-ui/core';
import WidgetsIcon from '@material-ui/icons/Widgets';
import ComputerIcon from '@material-ui/icons/Computer';
import MemoryIcon from '@material-ui/icons/Memory';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import CloudQueueIcon from '@material-ui/icons/CloudQueue';
import CloudIcon from '@material-ui/icons/Cloud';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import LayersIcon from '@material-ui/icons/Layers';
import AllInboxIcon from '@material-ui/icons/AllInbox';
import DescriptionIcon from '@material-ui/icons/Description';
import ExtensionIcon from '@material-ui/icons/Extension';

const ICONS: Record<string, ComponentType<SvgIconProps>> = {
  openshift: WidgetsIcon,
  vm: ComputerIcon,
  'bare-metal': MemoryIcon,
  'container-service': ViewModuleIcon,
  cloud: CloudQueueIcon,
  aws: CloudIcon,
  azure: CloudQueueIcon,
  gcp: CloudDoneIcon,
  kustomize: LayersIcon,
  helm: AllInboxIcon,
  'kubernetes-manifest': DescriptionIcon,
  other: ExtensionIcon,
};

type OptionIconProps = {
  name: string;
  className?: string;
};

export const OptionIcon = ({ name, className }: OptionIconProps) => {
  const Icon = ICONS[name] ?? CloudQueueIcon;
  return <Icon className={className} />;
};
