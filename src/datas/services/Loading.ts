/*
 * Todo : A voir s'il sert vraiment sinon le supprimer
 */

export class Loading {
  private loading: boolean = false;

  public constructor() {}

  public state(): boolean {
    return this.loading;
  }

  public start(): void {
    this.loading = true;
  }

  public stop(): void {
    this.loading = false;
  }

  public log(): void {
    console.log("Loading:", this.loading);
  }

  public whileLoading(
    retry: boolean = false,
    fn: (...args: any[]) => void = () => {},
    args: any[] = [],
  ) {
    const intervalId = setInterval(() => {
      if (!this.state()) {
        clearInterval(intervalId); // Arrête l'intervalle dès que isLoading est false
        fn(...args); // Exécute la fonction passée en argument
      } else if (retry) {
        this.log(); // Affiche le statut de chargement si nécessaire
      }
    }, 500);
  }
}
