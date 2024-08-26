import { Choice } from "@customs/Interface";

export enum UI_TYPE {
  CHOICE = "CHOICE",
  PRESS = "PRESS",
  ENTRY = "ENTRY",
  BATTLE = "BATTLE",
  ABORT = "ABORT",
  SCROLL = "SCROLL",
}
export enum UI_MENU {
  // MENU
  TEAM = "Team",
  PKMCENTER = "PkmCenter",
  TRAVEL = "Go forward",
  HEAL = "Heal",
  RENAME = "Rename",
  RELEASE = "Release",
  REVIVE = "Revive",
  CONSULT_LOG = "Consult log",
  RUN = "Run",
  ATTACK = "Attack",
  CATCH = "Catch",
  DEX = "Dex",
}
export enum UI_BUTTON {
  BACK = "Back",
  YES = "Yes",
  NO = "No",
  CONTINUE = "Continue",
  NEW_GAME = "New game",
  ABORT = "_ABORT",
}
export enum UI_STYLE {
  START = "START",
  PROF_GREETINGS = "PROF_GREETINGS",
  DEFAULT = "DEFAULT",
  SHOW_LAST_SAVE = "SHOW_LAST_SAVE",
  ERROR = "ERROR",
  BATTLE_CHOICE = "BATTLE_CHOICE",
}
export enum UI_CHARACTER {
  PROF = "PROFESSOR:",
  NURSE = "NURSE JOY:",
}

export const CHOICES = {
  ACTION_LAST_SAVE: [
    { label: UI_BUTTON.CONTINUE, value: UI_BUTTON.CONTINUE },
    { label: UI_BUTTON.NEW_GAME, value: UI_BUTTON.NEW_GAME },
  ],
  ACTION_MAIN_MENU: [
    { label: UI_MENU.TRAVEL, value: UI_MENU.TRAVEL },
    { label: UI_MENU.PKMCENTER, value: UI_MENU.PKMCENTER },
    { label: UI_MENU.TEAM, value: UI_MENU.TEAM },
  ],
  ACTION_TEAM_MENU: [
    { label: UI_MENU.HEAL, value: UI_MENU.HEAL },
    { label: UI_MENU.RENAME, value: UI_MENU.RENAME },
    { label: UI_MENU.RELEASE, value: UI_MENU.RELEASE },
    { label: UI_MENU.DEX, value: UI_MENU.DEX },
  ],
  ACTION_PKMCENTER_MENU: [
    { label: UI_MENU.REVIVE, value: UI_MENU.REVIVE },
    { label: UI_MENU.CONSULT_LOG, value: UI_MENU.CONSULT_LOG },
  ],
  ACTION_BACK: [{ label: UI_BUTTON.BACK, value: UI_BUTTON.BACK }],

  ACTION_BATTLE: [
    { label: UI_MENU.ATTACK, value: UI_MENU.ATTACK },
    { label: UI_MENU.RUN, value: UI_MENU.RUN },
    { label: UI_MENU.CATCH, value: UI_MENU.CATCH },
    { label: UI_MENU.HEAL, value: UI_MENU.HEAL },
  ],
  BOOLEANS: [
    { label: UI_BUTTON.YES, value: UI_BUTTON.YES },
    { label: UI_BUTTON.NO, value: UI_BUTTON.NO },
  ],
  CONTINUE: [{ label: "*", value: "any" }],
  DEFAULT_CHOICE: [{ label: "Invalid", value: "null" }],
};
