export class Entry {
  content: string;

  constructor(entry: string = "Red") {
    this.content = entry.trim();
  }

  public HTMLSpecialChars_encode() {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    this.content = this.content.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  public HTMLSpecialChars_test() {
    const specialCharsRegex = /[&<>"']/;
    return specialCharsRegex.test(this.content);
  }

  public inputLength(limit: { min: number; max: number }): boolean {
    return this.content.length > limit.min && this.content.length < limit.max;
  }
}
