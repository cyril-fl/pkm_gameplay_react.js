import { SaveModel } from "@models/Save";
import { PlayerModel } from "@models/Player";
import { log } from "@customs/Interface";
import {PkdDexEntry} from "@models/PkmDex";

export class WorldModel {
  private day: number;
  private location: string;
  private logs: log[];
  private player: PlayerModel;
  private dex: PkdDexEntry[] | null = null;

  constructor(data: SaveModel) {
    this.player = new PlayerModel(
      data.player_name,
      data.player_team,
      data.player_bags,
    );
    this.day = data.world_day;
    this.location = data.world_location;
    this.logs = data.world_logs;
  }

  /* GET */
  public getDay(): number {
    return this.day;
  }
  public getLocation(): string {
    return this.location;
  }
  public getLogs(): log[] {
    return this.logs;
  }
  public getPlayer(): PlayerModel {
    return this.player;
  }

  /* SET */
  public setDex(data: PkdDexEntry[]) {
    this.dex = data
  }

  /* Tools */
  public oneDayPasses() {
    this.day += 1;
  }
  public addLog(message: log[]) {
    message.forEach((m) => this.logs.push(m));
  }
}
