export class Entry {
  content: string;

  constructor(entry: string) {
    this.content = entry;
  }

  public htmlSpecialChars() {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    this.content.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  public inputLength(limit: { min: number; max: number }): boolean {
    return this.content.length > limit.min && this.content.length < limit.max;
  }
}
