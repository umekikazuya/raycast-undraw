import { LocalStorage } from "@raycast/api";
import { LocalStorageRepository } from "../interfaces/repositories";
import { Illustration } from "../domain/models";

export class RaycastLocalStorage implements LocalStorageRepository {
  private static readonly STORAGE_KEY_ILLUSTRATIONS = "undraw-illustrations-data";
  private static readonly STORAGE_KEY_LAST_UPDATED = "undraw-last-updated";

  async getLastUpdated(): Promise<number | null> {
    const lastUpdatedString = await LocalStorage.getItem(RaycastLocalStorage.STORAGE_KEY_LAST_UPDATED);

    if (!lastUpdatedString) {
      return null;
    }

    const lastUpdated = parseInt(lastUpdatedString as string, 10);
    if (isNaN(lastUpdated)) {
      // Invalid data, clear storage
      await this.clearStorage();
      return null;
    }

    return lastUpdated;
  }

  async setLastUpdated(timestamp: number): Promise<void> {
    await LocalStorage.setItem(RaycastLocalStorage.STORAGE_KEY_LAST_UPDATED, timestamp.toString());
  }

  async getIllustrations(): Promise<Illustration[] | null> {
    const illustrationsString = await LocalStorage.getItem(RaycastLocalStorage.STORAGE_KEY_ILLUSTRATIONS);

    if (!illustrationsString) {
      await this.clearStorage();
      return null;
    }

    try {
      return JSON.parse(illustrationsString as string) as Illustration[];
    } catch (error) {
      console.error("Failed to parse stored illustrations:", error);
      await this.clearStorage();
      return null;
    }
  }

  async setIllustrations(illustrations: Illustration[]): Promise<void> {
    await LocalStorage.setItem(RaycastLocalStorage.STORAGE_KEY_ILLUSTRATIONS, JSON.stringify(illustrations));
  }

  async clearStorage(): Promise<void> {
    await Promise.all([
      LocalStorage.removeItem(RaycastLocalStorage.STORAGE_KEY_ILLUSTRATIONS),
      LocalStorage.removeItem(RaycastLocalStorage.STORAGE_KEY_LAST_UPDATED),
    ]);
  }
}
