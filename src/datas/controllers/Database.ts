import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export class DatabaseController {
  static instance: DatabaseController;
  static db: Database | null; // Typage correct pour l'instance de la base de données

  private constructor() {}

  public static getInstance(): DatabaseController {
    if (!DatabaseController.instance) {
      DatabaseController.instance = new DatabaseController();
    }
    return DatabaseController.instance;
  }

  public static async connect(): Promise<Database> {
    // Typage correct du retour de la méthode
    if (!DatabaseController.db) {
      DatabaseController.db = await open({
        filename: "./pkm_data.sqlite",
        driver: sqlite3.Database,
      });
    }
    return DatabaseController.db;
  }
}
