import { DatabaseController } from "./Database";
import { SaveModel } from "@models/Save";

export class SaveController {
  constructor() {}

  private async create() {
    const defaultSave = new SaveModel();
    const db = await DatabaseController.connect();
    await db.run(
      `
            INSERT INTO Save (player_name, player_team, player_bags, world_day, world_location, world_logs)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [
        defaultSave.player_name,
        defaultSave.player_team,
        defaultSave.player_bags,
        defaultSave.world_day,
        defaultSave.world_location,
        defaultSave.world_logs,
      ],
    );

    return new SaveModel(defaultSave);
  }

  public async read() {
    const db = await DatabaseController.connect();
    await db.run(`
            CREATE TABLE IF NOT EXISTS Save (
                player_name TEXT,
                player_team TEXT,     -- Stockage en JSON
                player_bags TEXT,     -- Stockage en JSON
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
                world_day = ?,
                world_location = ?,
                world_logs = ?
        `,
      [
        data.player_name,
        JSON.stringify(data.player_team),
        JSON.stringify(data.player_bags),
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
