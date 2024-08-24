import { PkdDexEntry } from "@models/PkmDex";

export class PkDexController {
  private static instance: PkDexController | null = null;
  private dex: any[] = [];
  private dataLoaded: Promise<void>;

  private constructor() {
    this.dataLoaded = this.set();
  }

  public static getInstance(): PkDexController {
    if (!PkDexController.instance) {
      PkDexController.instance = new PkDexController();
    }
    return PkDexController.instance;
  }

  public async getDex(): Promise<any[]> {
    await this.dataLoaded;
    return this.dex;
  }

  private async set(): Promise<void> {
    if (this.dex.length > 0) return;
    try {
      const data = await this.fetch();
      console.log("PkDexController set", data);
      this.dex = data.map((Pkm: any) => new PkdDexEntry(Pkm));
    } catch (error) {
      console.error("Error fetching data:", error);
      this.dex = [];
    }
  }

  private async fetch() {
    try {
      const response = await fetch("/api/pkm/data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "force-cache, max-age=31536000, immutable",
        },
        next: {
          revalidate: 365 * 24 * 60 * 60, // Revalidation annuelle
          tags: ["pokemon-data"],
        },
        cache: "force-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Pokémon data");
      }

      const result = await response.json();
      // console.log('PkDexController', result);
      return result.response;
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
      return [];
    }
  }

  public async getStarterEntries(): Promise<any[]> {
    const dex = await this.getDex();
    const starterEntries = dex.filter((pkm: any) => pkm.is_starter === true);
    return starterEntries;
  }
}
