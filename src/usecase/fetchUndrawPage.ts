export interface UndrawMetadata {
  buildId: string;
  totalPages: number;
}

/**
 * Undrawのイラスト一覧ページからメタデータを取得します。
 * @returns {Promise<UndrawMetadata>} メタデータオブジェクト
 * @throws {Error} 取得に失敗した場合のエラー
 */
export async function fetchUndrawMetadata(): Promise<UndrawMetadata> {
  const illustrationsUrl = "https://undraw.co/illustrations";
  try {
    const response = await fetch(illustrationsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Undraw illustrations page: ${response.statusText}`);
    }
    const html: string = await response.text();

    // ID属性`__NEXT_DATA__`を持つscriptタグからJSONデータを抽出
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);

    if (!nextDataMatch || !nextDataMatch[1]) {
      throw new Error("Could not find __NEXT_DATA__ script tag in Undraw HTML.");
    }

    const nextDataJsonString = nextDataMatch[1];
    const nextData = JSON.parse(nextDataJsonString);

    const buildId = nextData.buildId;
    const totalPages = nextData.props.pageProps.totalPages;

    if (!buildId || typeof totalPages !== "number") {
      throw new Error("Missing buildId or totalPages in __NEXT_DATA__.");
    }

    return { buildId, totalPages };
  } catch (error) {
    console.error("Error fetching Undraw metadata:", error);
    throw new Error(`Failed to get Undraw metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}
