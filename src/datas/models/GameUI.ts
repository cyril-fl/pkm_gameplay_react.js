import {
  UI_Compiler_Choice,
  UI_Compiler_Dialogue,
  UI_Compiler,
} from "@customs/Interface";

export class GameUIModel {
  private dialogues: string[];
  private choices: string[];
  private type: string;
  private style: string;

  constructor() {
    this.dialogues = ["Pokemon"];
    this.choices = ["*"];
    this.type = "PRESS";
    this.style = "START";
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

      if (type === "PRESS" && choice) {
        this.setChoices(choice.content);
      }
      if (type === "CHOICE" && choice) {
        this.setChoices(choice.content, choice.push, choice.reset);
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
      this.setDialogues(dialogues.content, dialogues.push, dialogues.reset);
    }
  }

  public setType(type: string) {
    this.type = type;
  }

  public setChoices(
    choices: string[],
    push: boolean = false,
    reset: boolean = false,
  ) {
    if (reset) {
      this.choices = [];
    } else if (push) {
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
    reset: boolean = false,
  ) {
    if (reset) {
      this.dialogues = [];
    } else if (push) {
      this.dialogues.push(...dialogues);
    } else {
      this.dialogues = dialogues;
    }
  }
}
