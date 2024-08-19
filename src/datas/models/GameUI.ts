export class GameUIModel {
  private dialogues: string[];
  private choices: string[];
  private type: string;
  private notification: string;

  constructor() {
    this.dialogues = ["POKEMON"];
    this.choices = ["Press any key to start"];
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
  public setDialogues(dialogues: string[]) {
    this.dialogues = dialogues;
  }
  public pushDialogues(dialogues: string[]) {
    this.dialogues.push(...dialogues);
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
