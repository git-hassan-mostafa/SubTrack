export interface SyncBatchItemDto {
  entityName: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: string;
}

export interface SyncBatchRequestDto {
  items: SyncBatchItemDto[];
}

export interface SyncBatchResultItemDto {
  entityId: string;
  status: 'SUCCESS' | 'CONFLICT' | 'ERROR';
  serverTimestamp?: string;
  serverData?: any;
  error?: string;
}

export interface SyncBatchResponseDto {
  results: SyncBatchResultItemDto[];
}

// Any other DTOs needed cross-platform.
export interface LoginResponseDto {
  accessToken: string;
  user: {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: string;
  };
}
