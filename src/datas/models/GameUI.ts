import {
  UI_Compiler_Choice,
  UI_Compiler_Dialogue,
  UI_Compiler,
  Choice,
} from "@customs/Interface";
import { CHOICES, UI_STYLE, UI_TYPE } from "@customs/Enum";

export class GameUIModel {
  private dialogues: string[];
  private choices: Choice[];
  private type: string;
  private style: string;
  private notification: string[];

  constructor() {
    this.dialogues = ["Pokemon"];
    this.choices = CHOICES.CONTINUE;
    this.type = UI_TYPE.PRESS;
    this.style = UI_STYLE.START;
    this.notification = [];
  }

  /* Getters && Setters */
  // Getters
  public getDialogues() {
    return this.dialogues;
  }
  public getChoices() {
    return this.choices;
  }
  public getType() {
    return this.type;
  }
  public getStyle() {
    return this.style;
  }
    public getNotification() {
      return this.notification;
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
    if (type) {
      this.type = type;

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
    this.type = type;
  }

  public setChoices(
    choices: Choice[],
    push: boolean = false,
  ) {
    if (push) {
      this.choices.push(...choices);
    } else {
      this.choices = choices;
    }
  }

  public setStyle(style: string) {
    this.style = style;
  }

  public setDialogues(
    dialogues: string[],
    push: boolean = false,
  ) {
    if (push) {
      this.dialogues.push(...dialogues);
    } else {
      this.dialogues = dialogues;
    }
  }

  public setNotification(
      notification: string[],
      push: boolean = false,
      ) {

    if (push) {
      this.notification.push(...notification);
    } else {
      this.notification = notification;
    }

    setTimeout(() => {
      this.notification = [];
    }, 100);
  }
}
