import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";
import { PkdDexEntry } from "@models/PkmDex";

export class PlayerModel {
  private _name: string;
  private readonly _team: PkmModel[];
  private readonly _bag: any[]; // Todo: Gérer le type bagItem
  private readonly _pkdex: number[];

  constructor(
    name: string,
    team: PkmModel[],
    bag: any[],
    pkdex: number[],
  ) {
    this._name = name;
    this._team = team;
    this._bag = bag;
    this._pkdex = pkdex;
  }

  /* SET */
  set name(name: string) {
    this._name = name;
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
  get dex() {
      return this._pkdex;
  }

  /* Tools */
  public setUpToSix(dex: PkdDexEntry[]) {
     const teamMaxLength = 6;
     const starterNumber = 9; // 3 starters * 3 evolutions
     const addedPkmName = []

     if (this._team.length < teamMaxLength) {
       const tempEntries = new Set();
       const pkmTotalNumber = dex.length - starterNumber; // Total PKM - 9 starters
       const totalEntries = teamMaxLength - this._team.length;

       while (tempEntries.size < totalEntries) {
         let random = Math.floor(Math.random() * pkmTotalNumber + starterNumber); // évite d'avoir un starter
         tempEntries.add(random); // Ajoute le nombre au Set (aucun doublon possible)
       }

       const uniqueEntries = Array.from(tempEntries);

       for (let i = 0; i < totalEntries; i++) {
         const pkm = dex[Number(uniqueEntries[i])];
         addedPkmName.push(pkm.name);
         this._team.push(new PkmModel(pkm, 5));
       }
     }
    return addedPkmName
  }

  public catch(pkm: PkmModel) {
    this._team.push(pkm);
  }

  public release(pkm: PkmModel) {
    const index = this._team.indexOf(pkm);
    if (index > -1) {
      this._team.splice(index, 1);
    }
  }

  public addEntry(pkdex: PkdDexEntry) {
    this._pkdex.push(pkdex.id);
  }
}
