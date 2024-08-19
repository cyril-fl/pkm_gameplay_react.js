import React, { FormEvent } from "react";
import { GameUIModel } from "@models/GameUI";
import { GameController } from "@controllers/Game";
import { submitEvent } from "@customs/Types";

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
