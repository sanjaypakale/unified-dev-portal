import { MouseEvent, useRef, useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  Popover,
  Typography,
  makeStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import ShowChartIcon from '@material-ui/icons/ShowChart';
import {
  IFRAME_NAME,
  ValueStreamMenuItem,
  hasChildren,
} from './types';

const useStyles = makeStyles(theme => ({
  bar: {
    display: 'flex',
    alignItems: 'center',
    minHeight: 56,
    padding: theme.spacing(0, 2.5),
    backgroundColor: '#0d2137',
    color: '#fff',
    boxShadow: '0 1px 0 rgba(255,255,255,0.06), 0 8px 24px rgba(13, 33, 55, 0.18)',
    zIndex: theme.zIndex.appBar,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: theme.spacing(1.25),
    marginRight: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderRight: '1px solid rgba(255,255,255,0.14)',
  },
  brandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(125, 243, 225, 0.16)',
    color: '#7df3e1',
  },
  brandTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    letterSpacing: '0.01em',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    minWidth: 0,
  },
  topButton: {
    color: 'rgba(255,255,255,0.82)',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.875rem',
    borderRadius: 8,
    padding: theme.spacing(0.75, 1.5),
    minHeight: 36,
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
  },
  topButtonOpen: {
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  topButtonActive: {
    color: '#7df3e1',
  },
  menuPaper: {
    marginTop: 6,
    minWidth: 228,
    borderRadius: 10,
    padding: theme.spacing(0.75, 0),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
  },
  nestedPaper: {
    minWidth: 200,
    borderRadius: 10,
    padding: theme.spacing(0.5, 0),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.16)',
  },
  item: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: theme.palette.text.primary,
    justifyContent: 'space-between',
    minWidth: 200,
    minHeight: 40,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1.5),
    borderRadius: 0,
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(13, 33, 55, 0.06)',
    },
  },
  itemLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemIcon: {
    fontSize: 16,
    opacity: 0.55,
    marginLeft: theme.spacing(1),
  },
  chevron: {
    fontSize: 18,
    opacity: 0.5,
    marginLeft: theme.spacing(1),
  },
}));

type MenuProps = {
  title: string;
  items: ValueStreamMenuItem[];
  activeUrl?: string;
  onIframeSelect: (url: string) => void;
};

export const ValueStreamMenu = ({
  title,
  items,
  activeUrl,
  onIframeSelect,
}: MenuProps) => {
  const classes = useStyles();

  return (
    <header className={classes.bar}>
      <div className={classes.brand}>
        <span className={classes.brandIcon}>
          <ShowChartIcon fontSize="small" />
        </span>
        <Typography className={classes.brandTitle} component="h1">
          {title}
        </Typography>
      </div>
      <nav className={classes.nav} aria-label="Value stream menu">
        {items.map((item, index) => (
          <TopLevelItem
            key={`${item.displayName}-${index}`}
            item={item}
            activeUrl={activeUrl}
            onIframeSelect={onIframeSelect}
          />
        ))}
      </nav>
    </header>
  );
};

const TopLevelItem = ({
  item,
  activeUrl,
  onIframeSelect,
}: {
  item: ValueStreamMenuItem;
  activeUrl?: string;
  onIframeSelect: (url: string) => void;
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const active = isItemActive(item, activeUrl);

  if (!hasChildren(item)) {
    return (
      <Button
        className={`${classes.topButton} ${active ? classes.topButtonActive : ''}`}
        onClick={event => handleLeafClick(event, item, onIframeSelect)}
        endIcon={
          item.url && !item.isIframeUrl ? (
            <OpenInNewIcon style={{ fontSize: 14 }} />
          ) : undefined
        }
      >
        {item.displayName}
      </Button>
    );
  }

  return (
    <>
      <Button
        className={`${classes.topButton} ${
          open ? classes.topButtonOpen : ''
        } ${active ? classes.topButtonActive : ''}`}
        endIcon={<ExpandMoreIcon style={{ fontSize: 18 }} />}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        {item.displayName}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ disablePadding: true }}
        PaperProps={{ className: classes.menuPaper, elevation: 0 }}
      >
        {item.children?.map((child, index) => (
          <NestedMenuItem
            key={`${child.displayName}-${index}`}
            item={child}
            activeUrl={activeUrl}
            onIframeSelect={url => {
              onIframeSelect(url);
              setAnchorEl(null);
            }}
          />
        ))}
      </Menu>
    </>
  );
};

const NestedMenuItem = ({
  item,
  activeUrl,
  onIframeSelect,
}: {
  item: ValueStreamMenuItem;
  activeUrl?: string;
  onIframeSelect: (url: string) => void;
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const closeTimer = useRef<number>();
  const active = item.url === activeUrl;

  const cancelClose = () => {
    window.clearTimeout(closeTimer.current);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setAnchorEl(null), 180);
  };

  if (!hasChildren(item)) {
    return (
      <MenuItem
        className={classes.item}
        selected={active}
        component="a"
        href={item.url}
        target={item.isIframeUrl ? IFRAME_NAME : '_blank'}
        rel={item.isIframeUrl ? undefined : 'noopener noreferrer'}
        onClick={event => handleLeafClick(event, item, onIframeSelect)}
      >
        <span className={classes.itemLabel}>{item.displayName}</span>
        {item.url && !item.isIframeUrl && (
          <OpenInNewIcon className={classes.itemIcon} />
        )}
      </MenuItem>
    );
  }

  return (
    <MenuItem
      className={classes.item}
      onMouseEnter={event => {
        cancelClose();
        setAnchorEl(event.currentTarget);
      }}
      onMouseLeave={scheduleClose}
    >
      <span className={classes.itemLabel}>{item.displayName}</span>
      <ChevronRightIcon className={classes.chevron} />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        disableRestoreFocus
        style={{ pointerEvents: 'none' }}
        PaperProps={{
          className: classes.nestedPaper,
          elevation: 0,
          onMouseEnter: cancelClose,
          onMouseLeave: scheduleClose,
          style: { pointerEvents: 'auto' },
        }}
      >
        <MenuList disablePadding>
          {item.children?.map((child, index) => (
            <NestedMenuItem
              key={`${child.displayName}-${index}`}
              item={child}
              activeUrl={activeUrl}
              onIframeSelect={onIframeSelect}
            />
          ))}
        </MenuList>
      </Popover>
    </MenuItem>
  );
};

function isItemActive(item: ValueStreamMenuItem, activeUrl?: string): boolean {
  if (!activeUrl) {
    return false;
  }
  if (item.url === activeUrl) {
    return true;
  }
  return Boolean(item.children?.some(child => isItemActive(child, activeUrl)));
}

function handleLeafClick(
  event: MouseEvent<HTMLElement>,
  item: ValueStreamMenuItem,
  onIframeSelect: (url: string) => void,
) {
  if (!item.url) {
    event.preventDefault();
    return;
  }
  if (item.isIframeUrl) {
    event.preventDefault();
    onIframeSelect(item.url);
    return;
  }
  event.preventDefault();
  window.open(item.url, '_blank', 'noopener,noreferrer');
}
