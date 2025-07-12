import { LocalStorage } from "@raycast/api";
import { UndrawMetadata } from "./fetchUndrawPage";

// UndrawのIllustrationデータの型
export interface Illustration {
  _id: string;
  title: string;
  media: string;
  newSlug: string;
}

// Illustrationsエンドポイントのメタデータ型
interface undrawIllustrationEndpointMetadata {
  pageProps: {
    illustrations: Illustration[];
    totalPages: number;
  };
}

// Cache duration and delay settings
const CACHE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // Seven days in milliseconds
const FETCH_DELAY_MS = 300; // Delay between fetching each page (milliseconds)

/**
 * Undrawの全イラストデータを取得し、ローカルキャッシュに保存します。
 * @returns {Promise<void>}
 * @throws {Error} データ取得または保存に失敗した場合
 */
export async function fetchAndCacheAllIllustrations(UndrawMetadata: UndrawMetadata): Promise<void> {
  try {
    const { buildId, totalPages } = UndrawMetadata;

    const allIllustrations: Illustration[] = [];

    // Fetch the first page of illustrations
    const firstPageUrl = `https://undraw.co/_next/data/${buildId}/illustrations.json`;
    console.log(`Fetching first page: ${firstPageUrl}`);
    try {
      const response = await fetch(firstPageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const pageData = (await response.json()) as undrawIllustrationEndpointMetadata;
      allIllustrations.push(...pageData.pageProps.illustrations);
    } catch (pageError) {
      console.error(`Error fetching first page:`, pageError);
    }

    // All pages are fetched sequentially with a delay to avoid overwhelming the server
    for (let page = 2; page <= totalPages; page++) {
      // Delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, FETCH_DELAY_MS));

      const pageUrl = `https://undraw.co/_next/data/${buildId}/illustrations/${page}.json?page=${page}`;
      console.log(`Fetching page ${page}/${totalPages}: ${pageUrl}`);

      try {
        const response = await fetch(pageUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const pageData = (await response.json()) as undrawIllustrationEndpointMetadata;
        allIllustrations.push(...pageData.pageProps.illustrations);
      } catch (pageError) {
        console.error(`Error fetching page ${page}:`, pageError);
      }
    }

    await LocalStorage.setItem("undraw-illustrations-data", JSON.stringify(allIllustrations));
    await LocalStorage.setItem("undraw-last-updated", Date.now().toString());

    console.log(`Successfully fetched and cached ${allIllustrations.length} illustrations.`);
  } catch (error) {
    console.error("Failed to fetch and cache all illustrations:", error);
    throw new Error(`Failed to update illustration cache: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * キャッシュが有効かどうかを確認。
 * @returns {Promise<boolean>} キャッシュが有効な場合はtrue、無効な場合はfalse
 */
export async function isCacheEnabled(): Promise<boolean> {
  const lastUpdatedString = await LocalStorage.getItem("undraw-last-updated");

  if (!lastUpdatedString) {
    // キャッシュが存在しないため有効ではない
    return false;
  }
  const lastUpdated = parseInt(lastUpdatedString as string, 10);

  // 数字であるか確認
  if (isNaN(lastUpdated)) {
    // 数字でないならキャッシュの形式として判断して無効
    await LocalStorage.removeItem("undraw-illustrations-data");
    await LocalStorage.removeItem("undraw-last-updated");
    return false;
  }

  const now = Date.now();

  return now - lastUpdated < CACHE_EXPIRATION_MS;
}
