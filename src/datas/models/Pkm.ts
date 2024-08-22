import { PkdDexEntry } from "@models/PkmDex";
import { pkmType } from "@customs/Interface";

const NEUTRAL_POKEMON = {
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
};

export class PkmModel {
  static nativId = 0;
  // inserer DexEntry
  // ATK [min, max]
  // DEF [min, max]
  // HP [min, max]
  private name: string;
  private level: number;
  private types: pkmType[];
  private isShiny: boolean;
  private experienceMeter: number;
  private experienceGiver: number;
  private atk: number;
  private dfs: number;
  private spd: number;
  private hp: number;
  private hp_max: number;
  private id: number;

  constructor(
    pkm: PkdDexEntry = new PkdDexEntry(NEUTRAL_POKEMON),
    level: number = 1,
  ) {
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
    this.id = ++PkmModel.nativId;
  }

  /* SETTERS */
  public setName(name: string) {
    this.name = name;
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

  getData() {
    return {
      name: this.name,
      level: this.level,
      types: this.types,
      isShiny: this.isShiny,
      experienceMeter: this.experienceMeter,
      experienceGiver: this.experienceGiver,
      attackRange: this.atk,
      defenseRange: this.dfs,
      maxHealthPool: this.hp_max,
      healthPool: this.hp,
      // catchPhrase: this.catchPhrase,
      id: this.id,
    };
  }

  getTypes() {
    console.log(this.types);
    return this.types.map((type) => type.name);
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
