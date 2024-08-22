import { PkmModel } from "@models/Pkm";
import { log } from "@customs/Interface";

export class SaveModel {
  /* Todo : Ajouter les Interface des attributs , bags */
  player_name: string;
  player_team: PkmModel[];
  player_bags: any;
  world_day: number;
  world_location: string;
  world_logs: log[];

  static DEFAULT = {
    player_name: "Red",
    player_team: JSON.stringify([]), // Liste vide d'objets PkmModel
    player_bags: JSON.stringify([]), // Liste vide d'objets ItemModel
    world_day: 1,
    world_location: "FirstTown",
    world_logs: JSON.stringify([]), // Liste vide d'objets log
  };

  constructor(data: any = SaveModel.DEFAULT) {
    this.player_name = data.player_name;
    this.player_team = JSON.parse(data.player_team);
    this.player_bags = JSON.parse(data.player_bags);
    this.world_day = data.world_day;
    this.world_location = data.world_location;
    this.world_logs = JSON.parse(data.world_logs);
  }
}
