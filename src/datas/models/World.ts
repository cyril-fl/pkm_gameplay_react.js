import { SaveModel } from "@models/Save";
import { PlayerModel } from "@models/Player";
import { log } from "@customs/Interface";
import { PkdDexEntry } from "@models/PkmDex";

export class WorldModel {
  private _day: number;
  private _location: string;
  private _logs: log[];
  private _player: PlayerModel;
  private _dex: PkdDexEntry[] | null = null;

  constructor(data: SaveModel) {
    this._player = new PlayerModel(
      data.player_name,
      data.player_team,
      data.player_bags,
    );
    this._day = data.world_day;
    this._location = data.world_location;
    this._logs = data.world_logs;
  }

  /* GET */
  get day(): number {
    return this._day;
  }
  get location(): string {
    return this._location;
  }
  get logs(): log[] {
    return this._logs;
  }
  get player(): PlayerModel {
    return this._player;
  }
  get dex(): PkdDexEntry[] | null {
      return this._dex;
  }

  /* SET */
  set day(data: number) {
    this._day = data;
  }
  set location(data: string) {
    this._location = data;
  }
  set logs(data: log[]) {
    this._logs = data;
  }
  set player(data: PlayerModel) {
    this._player = data;
  }
  set dex(data: PkdDexEntry[]) {
    this._dex = data;
  }

  /* Tools */
  public oneDayPasses() {
    this._day += 1;
  }
  public addLog(message: log[]) {
    message.forEach((m) => this._logs.push(m));
  }
}
