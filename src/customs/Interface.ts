import React, { FormEvent } from "react";
import { GameUIModel } from "@models/GameUI";
import { GameController } from "@controllers/Game";
import { submitEvent } from "@customs/Types";
import { PkmModel } from "@models/Pkm";
import { DexEntry } from "@models/Dex";

/* CONTEXT */
// AppContext
export interface AppContextType {
  game: GameStateType;
  ui: GameUIModel;
}
interface GameStateType {
  data: GameController | null;
  set: React.Dispatch<React.SetStateAction<GameController | null>>;
}
// FormContext
export interface FormContextType {
  ref: React.RefObject<HTMLFormElement>;
  submit: (event?: submitEvent) => void;
}

/* GAME */
// Game Controller

// a surprimer si plus bespoin Todo
export interface RAM_interface {
  lastSave?: any;
  continueGame_tuto?: boolean;
  starterChoices?: PkmModel[];
  dex?: DexEntry[];
  pkmName_old?: string;
  pkmName_new?: string;
  pkm?: PkmModel;
  arena?: arena;
}
// ---

export interface arena {
  playerPkm: PkmModel;
  wildPkm: PkmModel;
}

// World
export interface log {
  day: number;
  message: string;
}

// PkdDexEntry
export interface type {
  id: number;
  name: string;
}
export interface crit {
  success: number;
  fail: number;
}
export interface move {
  name: string;
  damage: number;
  type: type;
  crit: crit;
}

// Game UI
export interface Choice {
  label: string;
  value: string;
}

export interface UI_Compiler {
  type: string;
  choice?: UI_Compiler_Choice;
  style?: string;
  dialogues?: UI_Compiler_Dialogue;
}

export interface UI_Compiler_Choice {
  content: Choice[];
  push?: boolean;
  reset?: boolean;
}

export interface UI_Compiler_Dialogue {
  content: string[];
  push?: boolean;
  reset?: boolean;
}
