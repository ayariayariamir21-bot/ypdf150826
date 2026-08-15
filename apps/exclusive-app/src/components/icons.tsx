import * as React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

function BaseIcon({
  size = 16,
  className,
  children,
  ...rest
}: IconProps & { children?: React.ReactNode }): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconLayoutDashboard(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </BaseIcon>
  );
}

export function IconFolder(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </BaseIcon>
  );
}

export function IconGitBranch(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </BaseIcon>
  );
}

export function IconCpu(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
    </BaseIcon>
  );
}

export function IconScrollText(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4" />
      <path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3" />
    </BaseIcon>
  );
}

export function IconSettings(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function IconSearch(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </BaseIcon>
  );
}

export function IconBell(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </BaseIcon>
  );
}

export function IconCommand(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </BaseIcon>
  );
}

export function IconBuilding2(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v11M10 6h4M10 10h4M10 14h4M10 18h4" />
    </BaseIcon>
  );
}

export function IconCornerDownLeft(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <polyline points="9 10 4 15 9 20" />
      <path d="M20 4v7a4 4 0 0 1-4 4H4" />
    </BaseIcon>
  );
}

export function IconChevronDown(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </BaseIcon>
  );
}

export function IconChevronUp(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m18 15-6-6-6 6" />
    </BaseIcon>
  );
}

export function IconChevronLeft(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m15 18-6-6 6-6" />
    </BaseIcon>
  );
}

export function IconChevronRight(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m9 18 6-6-6-6" />
    </BaseIcon>
  );
}

export function IconChevronsUpDown(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </BaseIcon>
  );
}

export function IconMoon(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </BaseIcon>
  );
}

export function IconSun(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </BaseIcon>
  );
}

export function IconLogOut(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </BaseIcon>
  );
}

export function IconMenu(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </BaseIcon>
  );
}

export function IconX(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </BaseIcon>
  );
}

export function IconCheck(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </BaseIcon>
  );
}

export function IconPlus(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14M12 5v14" />
    </BaseIcon>
  );
}

export function IconCopy(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </BaseIcon>
  );
}

export function IconFileText(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8M16 13H8M16 17H8" />
    </BaseIcon>
  );
}

export function IconPlay(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </BaseIcon>
  );
}

export function IconPause(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="4" height="16" x="6" y="4" rx="1" />
      <rect width="4" height="16" x="14" y="4" rx="1" />
    </BaseIcon>
  );
}

export function IconSquare(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </BaseIcon>
  );
}

export function IconSave(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </BaseIcon>
  );
}

export function IconCheckCircle(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </BaseIcon>
  );
}

export function IconTerminal(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </BaseIcon>
  );
}

export function IconTestTube(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2" />
      <path d="M8.5 2h7" />
      <path d="M14.5 16h-5" />
      <path d="M4 3h16" />
    </BaseIcon>
  );
}

export function IconTrash(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </BaseIcon>
  );
}

export function IconMinus(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M5 12h14" />
    </BaseIcon>
  );
}

export function IconZoomIn(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
    </BaseIcon>
  );
}

export function IconZoomOut(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35M8 11h6" />
    </BaseIcon>
  );
}

export function IconMoreVertical(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </BaseIcon>
  );
}

export function IconFilter(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </BaseIcon>
  );
}

export function IconArrowUp(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </BaseIcon>
  );
}

export function IconArrowDown(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </BaseIcon>
  );
}

export function IconArrowUpDown(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m21 16-4 4-4-4" />
      <path d="M17 20V4" />
      <path d="m3 8 4-4 4 4" />
      <path d="M7 4v16" />
    </BaseIcon>
  );
}

export function IconEye(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.42 8.1 7.34 5 12 5s8.58 3.1 9.94 6.65a1 1 0 0 1 0 .7C20.58 15.9 16.66 19 12 19s-8.58-3.1-9.94-6.65" />
      <circle cx="12" cy="12" r="3" />
    </BaseIcon>
  );
}

export function IconDownload(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </BaseIcon>
  );
}

export function IconRefreshCw(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </BaseIcon>
  );
}

export function IconAlertTriangle(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4M12 17h.01" />
    </BaseIcon>
  );
}

export function IconUploadCloud(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </BaseIcon>
  );
}

export function IconMail(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </BaseIcon>
  );
}

export function IconCalendar(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M8 2v4M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </BaseIcon>
  );
}

export function IconZap(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </BaseIcon>
  );
}

export function IconScan(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </BaseIcon>
  );
}

export function IconTag(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </BaseIcon>
  );
}

export function IconFileOutput(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M4 7V4a2 2 0 0 1 2-2 2 2 0 0 0-2 2" />
      <path d="M4.063 20.999a2 2 0 0 0 2 1" />
      <path d="M2 13v4" />
      <path d="M6 13v4" />
      <path d="M4 15H2" />
      <path d="M20 7v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3" />
    </BaseIcon>
  );
}

export function IconShield(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </BaseIcon>
  );
}

export function IconLanguages(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </BaseIcon>
  );
}

export function IconSparkles(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4M22 5h-4" />
    </BaseIcon>
  );
}

export function IconUser(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </BaseIcon>
  );
}

export function IconUserCheck(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </BaseIcon>
  );
}

export function IconClock(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </BaseIcon>
  );
}

export function IconArchive(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </BaseIcon>
  );
}

export function IconPlug(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M12 22v-5" />
      <path d="M9 8V2M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </BaseIcon>
  );
}

export function IconLoader(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </BaseIcon>
  );
}

export function IconActivity(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </BaseIcon>
  );
}

export function IconGrid(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </BaseIcon>
  );
}

export function IconUsers(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </BaseIcon>
  );
}

export function IconKey(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </BaseIcon>
  );
}

export function IconWallet(props: IconProps): React.ReactElement {
  return (
    <BaseIcon {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </BaseIcon>
  );
}
