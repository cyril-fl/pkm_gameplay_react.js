import {number} from "prop-types";

export class PkdDexEntry {
    public name: string;
    public id: number;
    public description: string;
    // Todo gerer le type de Type justement
    public types: any[];
    public evolution_id: string | null;
    public evolution_lvl: number | null;
    public atk_min: number;
    public atk_max: number;
    public def_min: number;
    public def_max: number;
    public hp_min: number;
    public hp_max: number;
    public spd_min : number;
    public spd_max : number;
    public is_starter: boolean;

    constructor(entry: any) {
        this.name = entry.name;
        this.id = entry.id;
        this.description = entry.description;
        this.types = entry.types;
        this.evolution_id = entry.evolution_id ?? null; // Default to null if not provided
        this.evolution_lvl = entry.evolution_lvl ?? null; // Default to null if not provided
        this.atk_min = entry.atk_min;
        this.atk_max = entry.atk_max;
        this.def_min = entry.def_min;
        this.def_max = entry.def_max;
        this.hp_min = entry.hp_min;
        this.hp_max = entry.hp_max;
        this.spd_min = entry.spd_min;
        this.spd_max = entry.spd_max;
        this.is_starter = entry.is_starter === 1 ? true : false; // Convert to boolean
    }
}

