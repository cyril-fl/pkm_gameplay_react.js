import {
  UI_Compiler_Choice,
  UI_Compiler_Dialogue,
  Choice,
} from "@customs/Interface";
import { CHOICES, UI_STYLE, UI_TYPE } from "@customs/Enum";

export class GameUIModel {
  private _dialogues: string[];
  private _choices: Choice[];
  private _type: string;
  private _style: string;
  private _notification: string[];

  constructor() {
    this._dialogues = ["Pokemon"];
    this._choices = CHOICES.CONTINUE;
    this._type = UI_TYPE.PRESS;
    this._style = UI_STYLE.START;
    this._notification = [];
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

  /* SETTERS */
  set style(newStyle: string) {
    this._style = newStyle;
  }
  set type(type: string) {
    this._type = type;
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

  public updateChoices(choices: Choice[], push: boolean = false) {
    this._choices = push ? [...this._choices, ...choices] : choices;
  }

  public updateDialogues(dialogues: string[], push: boolean = false) {
    this._dialogues = push ? [...this._dialogues, ...dialogues] : dialogues;
  }

  public updateNotification(notification: string[], push: boolean = false) {
    this._notification = push ? [...this._notification, ...notification] : notification;

    setTimeout(() => {
      this._notification = [];
    }, 100);
  }
}
