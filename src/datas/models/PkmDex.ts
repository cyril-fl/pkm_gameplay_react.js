import { type, move } from "@customs/Interface";
import {MOCKUP_DEX_ENTRY} from "@/datas/mockup/dex_entry";

export class PkdDexEntry {
  private _name: string;
  private _id: number;
  private _description: string;
  private _types: type[];
  private _evolution_id: string | null;
  private _evolution_lvl: number | null;
  private _atk_min: number;
  private _atk_max: number;
  private _def_min: number;
  private _def_max: number;
  private _hp_min: number;
  private _hp_max: number;
  private _spd_min: number;
  private _spd_max: number;
  private _moves: move[];
  private _is_starter: boolean;

  constructor(entry: any = MOCKUP_DEX_ENTRY) {
    this._name = entry.name;
    this._id = entry.id;
    this._description = entry.description;
    this._types = entry.types;
    this._evolution_id = entry.evolution_id ?? null; // Default to null if not provided
    this._evolution_lvl = entry.evolution_lvl ?? null; // Default to null if not provided
    this._atk_min = entry.atk_min;
    this._atk_max = entry.atk_max;
    this._def_min = entry.def_min;
    this._def_max = entry.def_max;
    this._hp_min = entry.hp_min;
    this._hp_max = entry.hp_max;
    this._spd_min = entry.spd_min;
    this._spd_max = entry.spd_max;
    this._moves = entry.moves;
    this._is_starter = entry.is_starter === 1; // Convert to boolean
  }

    /* GET */
    get name(): string {
      return this._name;
    }
    get id(): number {
      return this._id;
    }
    get description(): string {
      return this._description;
    }
    get types(): type[] {
      return this._types;
    }
    get evolutionId(): string | null {
      return this._evolution_id;
    }
    get evolutionLvl(): number | null {
      return this._evolution_lvl;
    }
    get atkMin(): number {
      return this._atk_min;
    }
    get atkMax(): number {
      return this._atk_max;
    }
    get defMin(): number {
      return this._def_min;
    }
    get defMax(): number {
      return this._def_max;
    }
    get hpMin(): number {
      return this._hp_min;
    }
    get hpMax(): number {
      return this._hp_max;
    }
    get spdMin(): number {
      return this._spd_min;
    }
    get spdMax(): number {
      return this._spd_max;
    }
    get moves(): move[] {
      return this._moves;
    }
    get isStarter(): boolean {
      return this._is_starter
    }

    /* SET */
    set name(data: string) {
      this._name = data;
    }
    set id(data: number) {
      this._id = data;
    }
    set description(data: string) {
      this._description = data;
    }
    set types(data: type[]) {
      this._types = data;
    }
    set evolutionId(data: string | null) {
      this._evolution_id = data;
    }
    set evolutionLvl(data: number | null) {
      this._evolution_lvl = data;
    }
    set atkMin(data: number) {
      this._atk_min = data;
    }
    set atkMax(data: number) {
      this._atk_max = data;
    }
    set defMin(data: number) {
      this._def_min = data;
    }
    set defMax(data: number) {
      this._def_max = data;
    }
    set hpMin(data: number) {
      this._hp_min = data;
    }
    set hpMax(data: number) {
      this._hp_max = data;
    }
    set spdMin(data: number) {
      this._spd_min = data;
    }
    set spdMax(data: number) {
      this._spd_max = data;
    }
    set moves(data: move[]) {
      this._moves = data;
    }
    set isStarter(data: boolean) {
      this._is_starter = data;
    }
}
