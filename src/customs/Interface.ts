import React, { FormEvent } from "react";
import { GameUIModel } from "@models/GameUI";
import { GameController } from "@controllers/Game";
import { submitEvent } from "@customs/Types";
import { PkmModel } from "@models/Pkm";

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
export interface RAM {
  lastSave?: any;
  starterChoices?: PkmModel[];
  pkmName_old?: string;
  pkmName_new?: string;
  pkmName?: string;
}
// World
export interface log {
  day: number;
  message: string;
}
//Pkm
export interface pkmType {
  id: number;
  name: string;
}
// Game UI
export interface Choice {
    label: string;
    value: PkmModel | string;
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
