import { DexEntry } from "@models/Dex";
import { Choice, move, type } from "@customs/Interface";

export class PkmModel {
  static ID = 0;
  private readonly _dex_entry: number;
  private _name: string;
  private _level: number;
  private readonly _types: type[];
  private readonly _isShiny: boolean;
  private _experience_current: number;
  private _experience_nextLvL: number;
  private readonly _experienceGiver: number;
  private _atk: number;
  private _dfs: number;
  private _spd: number;
  private _hp: number;
  private _hp_max: number;
  private readonly _moves: move[];
  protected declare _id: string; // format : 0000 (dex entry) - 0000 (type1 type2 ) - 0000 (static ID) // readonly todo

  constructor(pkm: DexEntry = new DexEntry(), level: number = 1) {
    this._dex_entry = pkm.id;
    this._name = pkm.name;
    this._level = level;
    this._types = pkm.types;
    this._isShiny = Math.random() < 0.001;
    this._experience_current = 0;
    this._experience_nextLvL = 20 * level;
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
    if (hp < 0) {
      this._hp = 0;
    } else if (hp > this.hpMax) {
      this._hp = this.hpMax;
    } else {
      this._hp = Math.ceil(hp);
    }
  }
  set lvl(lvl: number) {
    this._level = lvl;
    this.setNextLevel();
  }

  /*  GETTERS*/
  get dexEntry() {
    return this._dex_entry;
  }
  get name() {
    return this._name;
  }
  get lvl() {
    return this._level;
  }
  get types() {
    return this._types.map((type) => type);
  }
  get typesName() {
    return this._types.map((type) => type.name);
  }
  get isShiny() {
    return this._isShiny;
  }
  get currentXP() {
    return this._experience_current;
  }
  get nextLvlXP() {
    return this._experience_nextLvL;
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
  get hpMax() {
    return this._hp_max;
  }
  get moves() {
    return this._moves;
  }
  get movesPoolChoices() {
    return this._moves.map((move): Choice => {
      return {
        label: move.name,
        value: move.name,
      };
    });
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
      `${this.name} LVL : ${this.lvl} \n` +
      `( PV : ${this.hp} / ${this.hpMax} | ATK : ${this.atk}` +
      ` | DEF : ${this.dfs} ) | SPD : ${this.spd}`
    );
  }

  private setNextLevel() {
    this._experience_nextLvL = 20 * this.lvl;
  }

  public calculator_atk(movesName: string) {
    const pkmMove = this.moves.find((move: move) => move.name === movesName);
    if (pkmMove) {
      const random = Math.round(Math.random() * 100) / 100;
      if (random > 1 - pkmMove.crit.success) {
        return (Number(pkmMove.damage) * 1) / 5;
      } else if (random < pkmMove.crit.fail) {
        return Number(pkmMove.damage) / 1.5;
      } else {
        return Number(pkmMove.damage);
      }
    } else {
      return null;
    }
  }

  public gainXP(xp: number) {
    this._experience_current += xp;

    while (this._experience_current >= this._experience_nextLvL) {
      this._level++;
      this._experience_current -= this._experience_nextLvL;
      this.riseStats();
      this.setNextLevel();
    }
  }
  private riseStats() {
    this._atk += this.getRandomNumber({ min: 1, max: 3 });
    this._dfs += this.getRandomNumber({ min: 1, max: 3 });
    this._spd += this.getRandomNumber({ min: 1, max: 3 });
    this._hp_max += this.getRandomNumber({ min: 5, max: 10 });
    this._hp = this._hp + 3;
  }
}
