import { PkdDexEntry } from "@models/PkmDex";
import {move, type} from "@customs/Interface";

const NEUTRAL_POKEMON = {
  dex_entry: 0,
  name: "Neutral",
  id: 0,
  description: "Neutral",
  types: [{ id: 1, name: "Neutral" }],
  evolution_id: null,
  evolution_level: null,
  atk_min: 0,
  atk_max: 0,
  def_min: 0,
  def_max: 0,
  hp_min: 0,
  hp_max: 0,
  spd_min: 0,
  spd_max: 0,
  moves: [
    {
      name: "Neutral",
      damage: 0,
      type: { id: 1, name: "Neutral" },
      crit: { success: 0, fail: 0 },
    },
    {
      name: "Neutral",
      damage: 0,
      type: { id: 1, name: "Neutral" },
      crit: { success: 0, fail: 0 },
    },
    {
      name: "Neutral",
      damage: 0,
      type: { id: 1, name: "Neutral" },
      crit: { success: 0, fail: 0 },
    },
    {
      name: "Neutral",
      damage: 0,
      type: { id: 1, name: "Neutral" },
      crit: { success: 0, fail: 0 },
    },

  ],
    is_starter: false,

};

export class PkmModel {

  static ID = 0;
  private dex_entry: number;
  private name: string;
  private level: number;
  private types: type[];
  private isShiny: boolean;
  private experienceMeter: number;
  private experienceGiver: number;
  private atk: number;
  private dfs: number;
  private spd: number;
  private hp: number;
  private hp_max: number;
  private moves: move[];
  private id: string = ""; // format : 0000 (dex entry) - 0000 (type1 type2 ) - 0000 (static ID)

  constructor(
    pkm: PkdDexEntry = new PkdDexEntry(NEUTRAL_POKEMON),
    level: number = 1,
  ) {
    this.dex_entry = pkm.id
    this.name = pkm.name;
    this.level = level;
    this.types = pkm.types;
    this.isShiny = Math.random() < 0.001;
    this.experienceMeter = 0;
    this.experienceGiver = this.getRandomNumber({ min: 10, max: 20 }) * level;
    this.atk = this.getRandomNumber({
      min: pkm.atk_min,
      max: pkm.atk_max,
    });
    this.dfs = this.getRandomNumber({
      min: pkm.def_min,
      max: pkm.def_max,
    });
    this.hp_max = this.getRandomNumber({
      min: pkm.hp_min,
      max: pkm.hp_max,
    });
    this.hp = this.hp_max;
    this.spd = this.getRandomNumber({
      min: pkm.spd_min,
      max: pkm.spd_max,
    });
    this.moves = pkm.moves;
    this.setID(12);
  }


  /* SETTERS */
  public setName(name: string) {
    this.name = name;
  }
  private setID(wishedLength: number) {
    if (this.id == "" ) {
      const tempID = ++PkmModel.ID
      const oneThird = Math.ceil(wishedLength/3);
      const oneSixth = Math.ceil(oneThird/2)

      let A =  this.dex_entry.toString().padStart(oneThird, '0');

      let B = this.types.map((t) => t.id.toString().padStart(oneSixth, '0')).join('')
      B = B.length < oneThird ? B.padEnd(oneThird, '0') : B;

      let C = tempID.toString().padStart(oneThird, '0');

      this.id = `${A}-${B}-${C}`;
    }
  }
  /*  GETTERS*/

  public getID() {
    return this.id;
  }

  public getRandomNumber(limit: { min: number; max: number }) {
    return Math.floor(Math.random() * (limit.max - limit.min + 1)) + limit.min;
  }

  public getName() {
    return this.name;
  }

  getTypes() {
    console.log(this.types);
    return this.types.map((type) => type.name);
  }

  getMoves() {
    return this.moves;
  }

  display() {
    if (this.hp < 0) {
      this.hp = 0;
    }
    return (
      `${this.name} LVL : ${this.level} \n` +
      `( PV : ${this.hp} / ${this.hp_max} | ATK : ${this.atk}` +
      ` | DEF : ${this.dfs} )`
    );
  }
}
