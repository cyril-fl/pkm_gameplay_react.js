export class SaveModel {
  /* Todo : Ajouter les Interface des attributs team, bags et logs */
  player_name: string;
  player_team: any;
  player_bags: any;
  world_day: number;
  world_location: string;
  world_logs: any;

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
