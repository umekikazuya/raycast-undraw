// Public API for the refactored undraw illustration service

export type { Illustration, UndrawMetadata } from "./domain/models";
import { ServiceContainer } from "./infrastructure/service-container";
import type { UndrawMetadata, Illustration } from "./domain/models";

// Convenience functions that maintain the original API
export async function fetchUndrawMetadata() {
  return ServiceContainer.pageService.fetchMetadata();
}

export async function isDataFresh(): Promise<boolean> {
  return ServiceContainer.illustrationService.isStoredDataValid();
}

export async function fetchAndStoreAllIllustrations(metadata: UndrawMetadata): Promise<void> {
  return ServiceContainer.illustrationService.storeIllustrations(metadata);
}

export async function getStoredIllustrations(): Promise<Illustration[] | null> {
  return ServiceContainer.illustrationService.getStoredIllustrations();
}
