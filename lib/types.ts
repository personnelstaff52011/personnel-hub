export interface HubFile {
  id: string;
  filename: string;
  file_size: number;
  mime_type: string;
  public_url: string;
  storage_path?: string;
  created_at: string;
}

export interface HubNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export type ActiveWidget = 'all' | 'files' | 'qr' | 'notes' | 'timer';
