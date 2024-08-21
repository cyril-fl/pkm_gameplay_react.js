// todo : exporter ca ailler
interface UI_Compiler_Choice {
  content: string[];
  push?: boolean;
  reset?: boolean;
}

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

  public setType(type: string) {
    this.type = type;
  }

  public set(
      type?: string,
      choice?: UI_Compiler_Choice,
      style?: string,

  ) {
    switch (type) {
      case "PRESS":
      case "INPUT":
        this.type = type;
        break;
      case "CHOICE":
        this.type = type;
        if (choice) {
          this.setChoices(choice.content, choice.push, choice.reset);
        }
        break;
      default:
        this.type = "PRESS"; // Optionnel si vous voulez gérer un type non défini
        break;
    }

    if (style) {
      this.style = style;
    }

  }


  public setStyle(style: string) {
    this.style = style;
  }
}
