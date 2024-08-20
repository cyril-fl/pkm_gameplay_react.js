import { PkmModel } from "@models/Pkm";

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
