
export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM'
}

export interface User {
  id: string;
  name: string;
  email: string;
  tier: UserTier;
}

export interface ProcessedItem {
  id: string;
  originalUrl: string;
  processedUrl: string;
  timestamp: string;
  type: 'DOCUMENT' | 'STAGING' | 'VIDEO';
}
