import { DatabaseController } from "./Database";
import { SaveModel } from "@models/Save";
import { json } from "node:stream/consumers";

export class SaveController {
  constructor() {}

  private async create() {
    console.log("Création d'une nouvelle sauvegarde, SaveController...");
    const defaultSave = new SaveModel();
    console.log("Création d'une nouvelle sauvegarde..., defaultSave");
    const db = await DatabaseController.connect();

    // Vérifier si une sauvegarde similaire existe déjà
    const existingSave = await db.get(`SELECT * FROM Save`);
    console.log("existingSave", existingSave);

    if (!existingSave) {
      // Si aucune sauvegarde existante n'est trouvée, procéder à l'insertion
      await db.run(
        `
            INSERT INTO Save (player_name, player_team, player_bags, player_dex, world_day, world_location, world_logs)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
        [
          defaultSave.player_name,
          JSON.stringify(defaultSave.player_team), // Convertir en JSON string
          JSON.stringify(defaultSave.player_bags), // Convertir en JSON string
        JSON.stringify(defaultSave.player_dex), // Convertir en JSON string
          defaultSave.world_day,
          defaultSave.world_location,
          JSON.stringify(defaultSave.world_logs), // Convertir en JSON string
        ],
      );
    }

    // Créer une nouvelle instance de SaveModel avec les mêmes valeurs par défaut
    return new SaveModel(defaultSave);
  }

  public async read() {
    const db = await DatabaseController.connect();
    await db.run(`
            CREATE TABLE IF NOT EXISTS Save (
                player_name TEXT,
                player_team TEXT,     -- Stockage en JSON
                player_bags TEXT,     -- Stockage en JSON
                player_dex TEXT,     -- Stockage en JSON
                world_day INTEGER,
                world_location TEXT,
                world_logs TEXT       -- Stockage en JSON
            )
        `);

    const save = await db.get("SELECT * FROM Save LIMIT 1");

    return !save ? this.create() : new SaveModel(save);
  }

  public async update(data: any) {
    const db = await DatabaseController.connect();
    await db.run(
      `
            UPDATE Save SET 
                player_name = ?,
                player_team = ?,
                player_bags = ?,
                player_dex = ?,
                world_day = ?,
                world_location = ?,
                world_logs = ?
        `,
      [
        data.player_name,
        JSON.stringify(data.player_team),
        JSON.stringify(data.player_bags),
        JSON.stringify(data.player_dex),
        data.world_day,
        data.world_location,
        JSON.stringify(data.world_logs),
      ],
    );
  }

  public async delete() {
    const db = await DatabaseController.connect();
    await db.run("DELETE FROM Save");

    console.log("La sauvegarde a été supprimée.");
  }
}
