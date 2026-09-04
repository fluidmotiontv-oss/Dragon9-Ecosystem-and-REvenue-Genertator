export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  source?: 'drive' | 'local';
}

export interface ReportResponse {
  report: string;
}
