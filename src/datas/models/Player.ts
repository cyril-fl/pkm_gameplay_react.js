import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";

export class PlayerModel {
  private _name: string;
  private _team: PkmModel[];
  private _bag: any[];    // Todo: Gérer le type bagItem

  constructor(name: string, team: PkmModel[], bag: any[]) {
    this._name = name;
    this._team = team;
    this._bag = bag;
  }

  /* SET */

  set name(name: string) {
    this._name = name;
  }
  set team(team: PkmModel[]) {
      this._team = team;
  }
  set bag(bag: any[]) {
      this._bag = bag;
  }

  /*  GET */
  get name() {
    return this._name;
  }
  get team() {
    return this._team;
  }
  get bag() {
    return this._bag;
  }

  /* Tools */
  async setUpToSix() {
    if (this._team.length >= 6) {
      return;
    }

    const dexController = PkDexController.getInstance();
    const dex = await dexController.getDex();

    const tempDexEntry = new Set();
    const nb_pkm = 59; // 68 pkm différents dans ce jeu - 9 starters
    const totalEntries = 6 - this._team.length;

    while (tempDexEntry.size < totalEntries) {
      let random = Math.floor(Math.random() * nb_pkm + 9); // Evite d'avoir un starter
      tempDexEntry.add(random); // Ajoute le nombre au Set (aucun doublon possible)
    }

    const uniqueDexEntries = Array.from(tempDexEntry);

    for (let i = 0; i < totalEntries; i++) {
      const pkm = dex[Number(uniqueDexEntries[i])];
      this._team.push(new PkmModel(pkm, 5));
    }
  }

  catchPkm(pkm: PkmModel) {
    const temp = new PkmModel();
    Object.assign(temp, pkm);
    this._team.push(temp);
  }
  releasePkm(pkm: PkmModel) {
    this._team = this._team.filter((p) => p !== pkm);
  }
}
