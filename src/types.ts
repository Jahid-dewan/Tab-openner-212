export interface TwitterPostInfo {
  isValid: boolean;
  rawUrl: string;
  cleanedUrl: string;
  username: string | null;
  statusId: string | null;
  errorMessage?: string;
}

export type TabState = 'idle' | 'opening' | 'opened' | 'blocked' | 'error';

export interface TabItem {
  id: number;
  label: string;
  status: TabState;
  openedAt?: number;
}

export interface LaunchStats {
  total: number;
  opened: number;
  blocked: number;
  isLaunching: boolean;
  progressPercent: number;
}

export interface LaunchHistoryItem {
  id: string;
  url: string;
  cleanedUrl: string;
  username: string;
  statusId: string;
  tabCount: number;
  timestamp: number;
}
