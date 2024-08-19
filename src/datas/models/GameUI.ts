export class GameUIModel {
  private dialogues: string[];
  private choices: string[];
  private type: string;
  private notification: string;

  constructor() {
    this.dialogues = ["POKEMON"];
    this.choices = ["*"];
    this.type = "PRESS";
    this.notification = "";
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
  public getNotification() {
    return this.notification;
  }

  // Setters
  public setDialogues(dialogues: string[], push: boolean = false ,reset: boolean = false) {
    if (reset) {
      this.dialogues = [];
    } else if (push) {
        this.dialogues.push(...dialogues);
    } else {
        this.dialogues = dialogues;
    }
  }

  public setChoices(choices: string[]) {
    this.choices = choices;
  }
  public setType(type: string) {
    this.type = type;
  }
  public setNotification(notification: string) {
    this.notification = notification;
  }
}
