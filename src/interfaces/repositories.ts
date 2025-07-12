import { UndrawMetadata, Illustration } from "../domain/models";

// Repository interfaces
export interface LocalStorageRepository {
  getLastUpdated(): Promise<number | null>;
  setLastUpdated(timestamp: number): Promise<void>;
  getIllustrations(): Promise<Illustration[] | null>;
  setIllustrations(illustrations: Illustration[]): Promise<void>;
  clearStorage(): Promise<void>;
}

// External service interfaces
export interface HttpClient {
  fetchText(url: string): Promise<string>;
  fetchJson<T>(url: string): Promise<T>;
}

// Parser interfaces
export interface UndrawPageParser {
  extractNextData(html: string): object;
}

export interface UndrawMetadataExtractor {
  extractUndrawMetadata(nextData: object): UndrawMetadata;
}

// Application service interfaces
export interface UndrawPageService {
  fetchMetadata(): Promise<UndrawMetadata>;
}

export interface IllustrationService {
  isStoredDataValid(): Promise<boolean>;
  getStoredIllustrations(): Promise<Illustration[] | null>;
  storeIllustrations(metadata: UndrawMetadata): Promise<void>;
}
