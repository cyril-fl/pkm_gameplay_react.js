import { PkmModel } from "@models/Pkm";
import { log } from "@customs/Interface";
import {MOCKUP_SAVE_MODEL} from "@/datas/mockup/save_model";

export class SaveModel {
  /* Todo : Ajouter les Interface des attributs , bags */
  player_name: string;
  player_team: PkmModel[];
  player_bags: any;
  player_dex: any;
  world_day: number;
  world_location: string;
  world_logs: log[];

  constructor(data: any = MOCKUP_SAVE_MODEL) {
    this.player_name = data.player_name;
    this.player_team = JSON.parse(data.player_team);
    this.player_bags = JSON.parse(data.player_bags);
    this.player_dex = JSON.parse(data.player_dex);
    this.world_day = data.world_day;
    this.world_location = data.world_location;
    this.world_logs = JSON.parse(data.world_logs);
  }
}
