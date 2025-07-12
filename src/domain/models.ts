// Domain models for Undraw illustrations

export interface UndrawMetadata {
  buildId: string;
  totalPages: number;
}

export interface Illustration {
  _id: string;
  title: string;
  media: string;
  newSlug: string;
}

// Value objects
export class CacheExpiration {
  private static readonly SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(private readonly lastUpdated: number) {}

  isExpired(): boolean {
    return Date.now() - this.lastUpdated >= CacheExpiration.SEVEN_DAYS_MS;
  }

  static fromTimestamp(timestamp: number): CacheExpiration {
    return new CacheExpiration(timestamp);
  }
}
