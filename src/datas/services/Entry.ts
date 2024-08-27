export class Entry {
  content: string;

  constructor(entry: string = "Red") {
    this.content = entry.trim();
  }

  public HTMLSpecialChars_test() {
    const specialCharsRegex = /[&<>"'_]/;
    return specialCharsRegex.test(this.content);
  }

  public inputLength(limit: { min: number; max: number }): boolean {
    return this.content.length >= limit.min && this.content.length <= limit.max;
  }
}
