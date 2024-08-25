import {
  UI_Compiler_Choice,
  UI_Compiler_Dialogue,
  Choice,
  arena,
} from "@customs/Interface";
import { CHOICES, UI_STYLE, UI_TYPE } from "@customs/Enum";
import { PkmModel } from "@models/Pkm";

// todo deplacer
export interface update {
  newType?: string;
  newChoice?: UI_Compiler_Choice;
  newStyle?: string;
  newDialogues?: UI_Compiler_Dialogue;
}

export class GameUIModel {
  private _dialogues: string[];
  private _choices: Choice[];
  private _type: string;
  private _style: string;
  private _notification: string[];
  private _arena: arena;

  constructor() {
    this._dialogues = ["Pokemon"];
    this._choices = CHOICES.CONTINUE;
    this._type = UI_TYPE.PRESS;
    this._style = UI_STYLE.START;
    this._notification = [];
    this._arena = {
      playerPkm: new PkmModel(),
      wildPkm: new PkmModel(),
    };
  }

  /* GETTERS */
  get dialogues() {
    return this._dialogues;
  }
  get choices() {
    return this._choices;
  }
  get type() {
    return this._type;
  }
  get style() {
    return this._style;
  }
  get notification() {
    return this._notification;
  }
  get arena() {
    return this._arena;
  }
  get arenaPlayerPkm() {
    return this._arena.playerPkm;
  }
  get arenaWildPkm() {
    return this._arena.wildPkm;
  }

  /* SETTERS */
  set style(newStyle: string) {
    this._style = newStyle;
  }
  set type(type: string) {
    this._type = type;
  }
  set arena(newArena: arena) {
    this._arena = newArena;
  }

  /* TOOLS */
  public update(
    newType?: string,
    newChoice?: UI_Compiler_Choice,
    newStyle?: string,
    newDialogues?: UI_Compiler_Dialogue,
  ) {
    // Todo : refactor.
    if (newType) {
      this.type = newType;

      if (newType === "ENTRY") {
        this.updateChoices([]);
      }
    }

    if (newStyle) {
      this.style = newStyle;
    }

    if (newChoice) {
      switch (this.type) {
        case UI_TYPE.PRESS:
          this.updateChoices(newChoice.content);
          break;
        case UI_TYPE.CHOICE:
        case UI_TYPE.BATTLE:
          this.updateChoices(newChoice.content, newChoice.push);
          break;
        default:
          break;
      }
    }

    if (newDialogues) {
      this.updateDialogues(newDialogues.content, newDialogues.push);
    }
  }

  public update_V2(update: update) {
    // Todo : refactor.
    if (update.newType) {
      this.type = update.newType;

      if (update.newType === "ENTRY") {
        this.updateChoices([]);
      }
    }

    if (update.newStyle) {
      this.style = update.newStyle;
    }

    if (update.newChoice) {
      switch (this.type) {
        case UI_TYPE.PRESS:
          this.updateChoices(update.newChoice.content);
          break;
        case UI_TYPE.CHOICE:
        case UI_TYPE.BATTLE:
          this.updateChoices(update.newChoice.content, update.newChoice.push);
          break;
        default:
          break;
      }
    }

    if (update.newDialogues) {
      this.updateDialogues(
        update.newDialogues.content,
        update.newDialogues.push,
      );
    }
  }

  public updateChoices(choices: Choice[], push: boolean = false) {
    this._choices = push ? [...this._choices, ...choices] : choices;
  }

  public updateDialogues(dialogues: string[], push: boolean = false) {
    this._dialogues = push ? [...this._dialogues, ...dialogues] : dialogues;
  }

  public updateNotification(notification: string[], push: boolean = false) {
    this._notification = push
      ? [...this._notification, ...notification]
      : notification;

    setTimeout(() => {
      this._notification = [];
    }, 100);
  }

  public resetArena() {
    this.arena = {
      playerPkm: new PkmModel(),
      wildPkm: new PkmModel(),
    };
  }
}
