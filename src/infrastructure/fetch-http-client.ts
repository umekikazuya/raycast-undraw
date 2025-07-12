import { HttpClient } from "../interfaces/repositories";

export class FetchHttpClient implements HttpClient {
  async fetchText(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }

    return response.text();
  }

  async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
    }

    return response.json() as T;
  }
}
