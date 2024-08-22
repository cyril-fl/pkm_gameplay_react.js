import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";

export class PlayerModel {
  private name: string;
  private team: PkmModel[];
  /* Todo: Gerer le type bagItem*/
  private bag: any[];

  constructor(name: string, team: PkmModel[], bag: any[]) {
    this.name = name;
    this.team = team;
    this.bag = bag;
  }

  catchPkm(pkm: PkmModel) {
    const temp = new PkmModel();
    Object.assign(temp, pkm);
    this.team.push(temp);
  }
  releasePkm(pkm: PkmModel) {
    this.team = this.team.filter((p) => p !== pkm);
  }

  /* SET */
  async setUpToSix() {
    if (this.team.length >= 6) {
      return;
    }

    const dexController = PkDexController.getInstance();
    const dex = await dexController.getDex();

    const tempDexEntry = new Set();
    const nb_pkm = 59; // 68 pkm différents dans ce jeu - 9 starters
    const totalEntries = 6 - this.team.length;

    while (tempDexEntry.size < totalEntries) {
      let random = Math.floor(Math.random() * nb_pkm + 9); // Evite d'avoir un starter
      tempDexEntry.add(random); // Ajoute le nombre au Set (aucun doublon possible)
    }

    const uniqueDexEntries = Array.from(tempDexEntry);

    for (let i = 0; i < totalEntries; i++) {
      const pkm = dex[Number(uniqueDexEntries[i])];
      this.team.push(new PkmModel(pkm, 5));
    }
  }

  setName(name: string) {
    this.name = name;
  }

  /*  GET */
  getName() {
    return this.name;
  }
  getTeam() {
    return this.team;
  }
  getBag() {
    return this.bag;
  }
}
