import { SaveModel } from "@models/Save";
import { PlayerModel } from "@models/Player";
import { log } from "@customs/Interface";
import { DexEntry } from "@models/Dex";

export class WorldModel {
  private _day: number;
  private _location: string;
  private _logs: log[];
  private _player: PlayerModel;
  private declare _dex: DexEntry[];

  constructor(data: SaveModel) {
    this._player = new PlayerModel(
      data.player_name,
      data.player_team,
      data.player_bags,
      data.player_dex,
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
  get dex(): DexEntry[] {
    return this._dex;
  }
  get randomPkm(): DexEntry {
    return this._dex[Math.floor(Math.random() * this._dex.length)];
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
  set dex(data: DexEntry[]) {
    this._dex = data;
  }

  /* Tools */
  public oneDayPasses() {
    this._day += 1;
  }
  public addLog(message: string[]) {
    message.forEach((m) => {
      this._logs.push({ day: this._day, message: m });
    });
  }
  public revive() {
    this._player.revive();
    this.addLog([`You revived your team at ${this.location} PkmCenter!`]);
  }
}
