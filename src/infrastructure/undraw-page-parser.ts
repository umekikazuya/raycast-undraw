import { UndrawPageParser, UndrawMetadataExtractor } from "../interfaces/repositories";
import { UndrawMetadata } from "../domain/models";

export class UndrawPageParserImpl implements UndrawPageParser {
  extractNextData(html: string): object {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

    if (!nextDataMatch || !nextDataMatch[1]) {
      throw new Error("Could not find __NEXT_DATA__ script tag in Undraw HTML");
    }

    try {
      return JSON.parse(nextDataMatch[1]);
    } catch (error) {
      throw new Error(`Failed to parse __NEXT_DATA__ JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export class UndrawMetadataExtractorImpl implements UndrawMetadataExtractor {
  extractUndrawMetadata(nextData: unknown): UndrawMetadata {
    if (!this.isValidNextData(nextData)) {
      throw new Error("Invalid __NEXT_DATA__ structure");
    }

    const buildId = nextData.buildId;
    const totalPages = nextData.props.pageProps.totalPages;

    if (!buildId || typeof buildId !== "string") {
      throw new Error("Missing or invalid buildId in __NEXT_DATA__");
    }

    if (typeof totalPages !== "number" || totalPages < 1) {
      throw new Error("Missing or invalid totalPages in __NEXT_DATA__");
    }

    return { buildId, totalPages };
  }

  private isValidNextData(data: unknown): data is {
    buildId: string;
    props: {
      pageProps: {
        totalPages: number;
      };
    };
  } {
    if (typeof data !== "object" || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;

    if (!("buildId" in obj) || !("props" in obj)) {
      return false;
    }

    const props = obj.props;
    if (typeof props !== "object" || props === null) {
      return false;
    }

    const propsObj = props as Record<string, unknown>;
    if (!("pageProps" in propsObj)) {
      return false;
    }

    const pageProps = propsObj.pageProps;
    if (typeof pageProps !== "object" || pageProps === null) {
      return false;
    }

    const pagePropsObj = pageProps as Record<string, unknown>;
    return "totalPages" in pagePropsObj;
  }
}
