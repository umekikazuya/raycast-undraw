import { UndrawPageServiceImpl } from "../application/undraw-page-service";
import { IllustrationServiceImpl } from "../application/illustration-service";
import { RaycastLocalStorage } from "../infrastructure/raycast-local-storage";
import { FetchHttpClient } from "../infrastructure/fetch-http-client";
import { UndrawPageParserImpl, UndrawMetadataExtractorImpl } from "../infrastructure/undraw-page-parser";

export class ServiceContainer {
  private static _httpClient: FetchHttpClient;
  private static _storageRepository: RaycastLocalStorage;
  private static _pageParser: UndrawPageParserImpl;
  private static _metadataExtractor: UndrawMetadataExtractorImpl;
  private static _pageService: UndrawPageServiceImpl;
  private static _illustrationService: IllustrationServiceImpl;

  static get httpClient(): FetchHttpClient {
    if (!this._httpClient) {
      this._httpClient = new FetchHttpClient();
    }
    return this._httpClient;
  }

  static get storageRepository(): RaycastLocalStorage {
    if (!this._storageRepository) {
      this._storageRepository = new RaycastLocalStorage();
    }
    return this._storageRepository;
  }

  static get pageParser(): UndrawPageParserImpl {
    if (!this._pageParser) {
      this._pageParser = new UndrawPageParserImpl();
    }
    return this._pageParser;
  }

  static get metadataExtractor(): UndrawMetadataExtractorImpl {
    if (!this._metadataExtractor) {
      this._metadataExtractor = new UndrawMetadataExtractorImpl();
    }
    return this._metadataExtractor;
  }

  static get pageService(): UndrawPageServiceImpl {
    if (!this._pageService) {
      this._pageService = new UndrawPageServiceImpl(this.httpClient, this.pageParser, this.metadataExtractor);
    }
    return this._pageService;
  }

  static get illustrationService(): IllustrationServiceImpl {
    if (!this._illustrationService) {
      this._illustrationService = new IllustrationServiceImpl(this.storageRepository, this.httpClient);
    }
    return this._illustrationService;
  }

  // For testing: allow injection of mock dependencies
  static setHttpClient(httpClient: FetchHttpClient): void {
    this._httpClient = httpClient;
  }

  static setStorageRepository(storageRepository: RaycastLocalStorage): void {
    this._storageRepository = storageRepository;
  }

  // Reset all dependencies (useful for testing)
  static reset(): void {
    this._httpClient = undefined!;
    this._storageRepository = undefined!;
    this._pageParser = undefined!;
    this._metadataExtractor = undefined!;
    this._pageService = undefined!;
    this._illustrationService = undefined!;
  }
}
