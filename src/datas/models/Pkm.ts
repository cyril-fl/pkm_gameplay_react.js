import { PkdDexEntry } from "@models/PkmDex";
import { move, type } from "@customs/Interface";

export class PkmModel {
  static ID = 0;
  private readonly _dex_entry: number;
  private _name: string;
  private readonly _level: number;
  private readonly _types: type[];
  private readonly _isShiny: boolean
  private readonly _experienceMeter: number;
  private readonly _experienceGiver: number;
  private readonly _atk: number;
  private readonly _dfs: number;
  private readonly _spd: number;
  private _hp: number;
  private readonly _hp_max: number;
  private readonly _moves: move[];
  protected declare _id: string; // format : 0000 (dex entry) - 0000 (type1 type2 ) - 0000 (static ID) // readonly todo

  constructor(pkm: PkdDexEntry = new PkdDexEntry(), level: number = 1) {
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
  set hp(hp: number) {
        this._hp = hp;
    }


  /*  GETTERS*/
  get dexEntry() {
    return this._dex_entry;
  }
  get name() {
    return this._name;
  }
  get level() {
    return this._level;
  }
  get types() {
    return this._types.map((type) => type);
  }
  get isShiny() {
    return this._isShiny;
  }
  get experienceMeter() {
    return this._experienceMeter;
  }
  get experienceGiver() {
    return this._experienceGiver;
  }
  get atk() {
    return this._atk;
  }
  get dfs() {
    return this._dfs;
  }
  get spd() {
    return this._spd;
  }
  get hp() {
    return this._hp;
  }
  get hp_max() {
    return this._hp_max;
  }
  get moves() {
    return this._moves;
  }
  get id() {
    return this._id;
  }

  /* TOOLS */
  public getRandomNumber(limit: { min: number; max: number }) {
    return Math.floor(Math.random() * (limit.max - limit.min + 1)) + limit.min;
  }

  private setID(wishedLength: number) {
    if (this._id === undefined) {
      const tempID = ++PkmModel.ID;
      const oneThird = Math.ceil(wishedLength / 3);
      const oneSixth = Math.ceil(oneThird / 2);

      let A = this.dexEntry.toString().padStart(oneThird, "0");

      let B = this.types
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
      `${this.name} LVL : ${this.level} \n` +
      `( PV : ${this.hp} / ${this.hp_max} | ATK : ${this.atk}` +
      ` | DEF : ${this.dfs} )`
    );
  }
}