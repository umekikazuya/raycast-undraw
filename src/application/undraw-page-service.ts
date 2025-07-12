import { UndrawPageService } from "../interfaces/repositories";
import { UndrawMetadata } from "../domain/models";
import type { HttpClient, UndrawPageParser, UndrawMetadataExtractor } from "../interfaces/repositories";

export class UndrawPageServiceImpl implements UndrawPageService {
  private static readonly UNDRAW_ILLUSTRATIONS_URL = "https://undraw.co/illustrations";

  constructor(
    private readonly httpClient: HttpClient,
    private readonly pageParser: UndrawPageParser,
    private readonly metadataExtractor: UndrawMetadataExtractor
  ) {}

  async fetchMetadata(): Promise<UndrawMetadata> {
    try {
      const html = await this.httpClient.fetchText(UndrawPageServiceImpl.UNDRAW_ILLUSTRATIONS_URL);
      const nextData = this.pageParser.extractNextData(html);
      return this.metadataExtractor.extractUndrawMetadata(nextData);
    } catch (error) {
      throw new Error(
        `Failed to fetch Undraw metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
