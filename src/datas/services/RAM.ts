import { PkmModel } from "@models/Pkm";
import { PkdDexEntry } from "@models/PkmDex";
import { arena } from "@customs/Interface";

export class RAM {
  private declare _last_save: any;
  private declare _tuto_continueGame: boolean;
  private declare _starter_choices?: PkmModel[];
  private declare dex: PkdDexEntry[];
  private declare pkmName_old: string;
  private declare _pkmName_new: string;
  private declare _pkm: PkmModel;

  constructor() {}

  /* GETTERS */
  get lastSave() {
    return JSON.parse(this._last_save);
  }
  get lastSaveJSON() {
    return this._last_save;
  }
  get tuto_CG() {
    return this._tuto_continueGame;
  }
  get starter() {
    return this._starter_choices ? this._starter_choices : [];
  }
  get starterChoices() {
    return (
      this._starter_choices?.map((pkm: PkmModel) => {
        return { label: pkm.name, value: pkm.id.toString() };
      }) ?? []
    );
  }
  get starterDisplay() {
    return (
      this._starter_choices?.map((pkm: PkmModel) => {
        const pkmTypes = pkm.typesName.join(" / ");
        return pkm.display() + ` the ${pkmTypes} pkm`;
      }) ?? []
    );
  }
  get pkm() {
    return this._pkm;
  }
  get pkmNewName() {
    return this._pkmName_new;
  }

  /* SETTERS */
  set tuto_CG(bool: boolean) {
    this._tuto_continueGame = bool;
  }
  set lastSave(newSave: any) {
    this._last_save = JSON.stringify(newSave);
  }
  set starter(newStarter: PkmModel[]) {
    this._starter_choices = newStarter
      .filter((pkm: any) => pkm.isStarter)
      .map((pkm: any) => new PkmModel(pkm, 5));
  }
  set pkm(pkm: PkmModel) {
    this._pkm = pkm;
  }
  set pkmNewName(name: string) {
    this._pkmName_new = name;
  }


  /* TOOLS */
  public resetStarter() {
    this._starter_choices = [];
  }
  public starterFind(searchedID: string) {
    return this._starter_choices?.find(
      (starter: PkmModel) => starter.id === searchedID,
    );
  }
}
