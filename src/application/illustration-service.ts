import { IllustrationService } from "../interfaces/repositories";
import { Illustration, UndrawMetadata, CacheExpiration } from "../domain/models";
import type { LocalStorageRepository, HttpClient } from "../interfaces/repositories";

interface UndrawIllustrationEndpointMetadata {
  pageProps: {
    illustrations: Illustration[];
    totalPages: number;
  };
}

export class IllustrationServiceImpl implements IllustrationService {
  private static readonly FETCH_DELAY_MS = 300;

  constructor(
    private readonly storageRepository: LocalStorageRepository,
    private readonly httpClient: HttpClient,
  ) {}

  async isStoredDataValid(): Promise<boolean> {
    const lastUpdated = await this.storageRepository.getLastUpdated();
    if (lastUpdated === null) {
      return false;
    }

    const cacheExpiration = CacheExpiration.fromTimestamp(lastUpdated);
    return !cacheExpiration.isExpired();
  }

  async getStoredIllustrations(): Promise<Illustration[] | null> {
    return this.storageRepository.getIllustrations();
  }

  async storeIllustrations(metadata: UndrawMetadata): Promise<void> {
    try {
      const illustrations = await this.fetchAllIllustrations(metadata);

      await this.storageRepository.setIllustrations(illustrations);
      await this.storageRepository.setLastUpdated(Date.now());

      console.log(`Successfully stored ${illustrations.length} illustrations`);
    } catch (error) {
      throw new Error(`Failed to store illustrations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async fetchAllIllustrations(metadata: UndrawMetadata): Promise<Illustration[]> {
    const { buildId, totalPages } = metadata;
    const allIllustrations: Illustration[] = [];

    // Fetch the first page separately
    try {
      const firstPageData = await this.fetchIllustrationByPage(
        `https://undraw.co/_next/data/${buildId}/illustrations.json`,
        1,
        totalPages,
      );
      if (firstPageData) {
        allIllustrations.push(...firstPageData.pageProps.illustrations);
      } else {
        throw new Error("Failed to fetch first page data");
      }
    } catch (error) {
      console.error(`Error fetching first page:`, error);
      throw new Error(`Failed to fetch first page: ${error instanceof Error ? error.message : String(error)}`);
    }

    for (let page = 2; page <= totalPages; page++) {
      // Add delay between requests to avoid overwhelming the server
      await this.delay(IllustrationServiceImpl.FETCH_DELAY_MS);
      const pageData = await this.fetchIllustrationByPage(
        `https://undraw.co/_next/data/${buildId}/illustrations/${page}.json?page=${page}`,
        page,
        totalPages,
      );
      if (pageData) {
        allIllustrations.push(...pageData.pageProps.illustrations);
      }
    }

    return allIllustrations;
  }

  private async fetchIllustrationByPage(
    pageUrl: string,
    page: number,
    totalPages: number,
  ): Promise<UndrawIllustrationEndpointMetadata | null> {
    try {
      console.log(`Fetching page ${page}/${totalPages}: ${pageUrl}`);
      return await this.httpClient.fetchJson<UndrawIllustrationEndpointMetadata>(pageUrl);
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
