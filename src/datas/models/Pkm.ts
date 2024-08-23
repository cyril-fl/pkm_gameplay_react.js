import { PkdDexEntry } from "@models/PkmDex";
import { move, type } from "@customs/Interface";

// todo : mettre getter et setter pour les variables privées
export class PkmModel {
  static ID = 0;
  private _dex_entry: number; // readonly todo
  private _name: string;
  private _level: number;
  private _types: type[]; // readonly todo
  private _isShiny: boolean; // readonly todo
  private _experienceMeter: number;
  private _experienceGiver: number;
  private _atk: number;
  private _dfs: number;
  private _spd: number;
  private _hp: number;
  private _hp_max: number;
  private _moves: move[];
  private _id: string = ""; // format : 0000 (dex entry) - 0000 (type1 type2 ) - 0000 (static ID) // readonly todo

  constructor(
    pkm: PkdDexEntry = new PkdDexEntry(),
    level: number = 1,
  ) {
    this._dex_entry = pkm.id;
    this._name = pkm.name;
    this._level = level;
    this._types = pkm.types;
    this._isShiny = Math.random() < 0.001;
    this._experienceMeter = 0;
    this._experienceGiver = this.getRandomNumber({ min: 10, max: 20 }) * level;
    this._atk = this.getRandomNumber({
      min: pkm.atkMin,
      max: pkm.atkMax,
    });
    this._dfs = this.getRandomNumber({
      min: pkm.defMin,
      max: pkm.defMax,
    });
    this._hp_max = this.getRandomNumber({
      min: pkm.hpMin,
      max: pkm.hpMax,
    });
    this._hp = this._hp_max;
    this._spd = this.getRandomNumber({
      min: pkm.spdMin,
      max: pkm.spdMax,
    });
    this._moves = pkm.moves;
    this.setID(12);
  }

  /* SETTERS */
  set name(name: string) {
    this._name = name;
  }
  set level(level: number) {
    this._level = level;
  }



  /*  GETTERS*/
  get id() {
    return this._id;
  }
  public get name() {
    return this._name;
  }
  get types() {
    return this._types.map((type) => type.name);
  }
  get moves() {
    return this._moves;
  }

  /* TOOLS */
  public getRandomNumber(limit: { min: number; max: number }) {
    return Math.floor(Math.random() * (limit.max - limit.min + 1)) + limit.min;
  }

  private setID(wishedLength: number) {
    if (this._id == "") {
      const tempID = ++PkmModel.ID;
      const oneThird = Math.ceil(wishedLength / 3);
      const oneSixth = Math.ceil(oneThird / 2);

      let A = this._dex_entry.toString().padStart(oneThird, "0");

      let B = this._types
          .map((t) => t.id.toString().padStart(oneSixth, "0"))
          .join("");
      B = B.length < oneThird ? B.padEnd(oneThird, "0") : B;

      let C = tempID.toString().padStart(oneThird, "0");

      this._id = `${A}-${B}-${C}`;
    }
  }

  public display(): string {
    if (this._hp < 0) {
      this._hp = 0;
    }
    return (
        `${this._name} LVL : ${this._level} \n` +
        `( PV : ${this._hp} / ${this._hp_max} | ATK : ${this._atk}` +
        ` | DEF : ${this._dfs} )`
    );
  }
}
