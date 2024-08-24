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

  /* Getters && Setters */
  // Getters
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

  // Setters
  public set(
    type?: string,
    choice?: UI_Compiler_Choice,
    style?: string,
    dialogues?: UI_Compiler_Dialogue,
  ) {
    // Set Types
    // Set Choices
    // Todo : refactor.

    if (type) {
      this._type = type;

      if (type === UI_TYPE.PRESS && choice) {
        this.setChoices(choice.content);
      }
      if (type === UI_TYPE.CHOICE && choice) {
        this.setChoices(choice.content, choice.push);
      }
      if (type === UI_TYPE.BATTLE && choice) {
        this.setChoices(choice.content, choice.push);
      }
      if (type === "ENTRY") {
        this.setChoices([]);
      }
    }

    // Set Style
    if (style) {
      this.setStyle(style);
    }

    // Set Dialogues
    if (dialogues) {
      this.setDialogues(dialogues.content, dialogues.push);
    }
  }

  public setType(type: string) {
    this._type = type;
  }

  public setChoices(choices: Choice[], push: boolean = false) {
    if (push) {
      this._choices.push(...choices);
    } else {
      this._choices = choices;
    }
  }

  public setStyle(style: string) {
    this._style = style;
  }

  public setDialogues(dialogues: string[], push: boolean = false) {
    if (push) {
      this._dialogues.push(...dialogues);
    } else {
      this._dialogues = dialogues;
    }
  }

  public setNotification(notification: string[], push: boolean = false) {
    if (push) {
      this._notification.push(...notification);
    } else {
      this._notification = notification;
    }

    setTimeout(() => {
      this._notification = [];
    }, 100);
  }
}
