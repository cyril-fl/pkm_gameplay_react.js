import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@services//Entry";
import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";
import { Loading } from "@services/Loading";
import {
  CHOICES,
  UI_BUTTON,
  UI_CHARACTER,
  UI_MENU,
  UI_STYLE,
  UI_TYPE,
} from "@customs/Enum";
import { Choice, move, RAM_interface } from "@customs/Interface";
import { PkdDexEntry } from "@models/PkmDex";
import { RAM } from "@services/RAM";

// Todo: regarder la list des todo et voir ce qui peu être fait
// Todo : instancier le player et vérifier les impermanence de type sur son content
// Todo : ajouter un PKDEX P e faire une vue special.

export class GameController {
  private RAM: RAM_interface;
  private RAM_2: RAM;
  public UI: GameUIModel;
  public world: WorldModel;
  public nextAction: (...args: any) => void;
  private isLoading: Loading;

  constructor(data: SaveModel) {
    this.RAM = {};
    this.RAM_2 = new RAM();
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.start;
    this.isLoading = new Loading();
  }

  /* INIT PHASE*/
  private async start() {
    this.RAM_2.lastSave = this.extractData;

    console.log("Game started");
    console.log("ram2", this.RAM_2.lastSave);
    console.log("team", this.world.player.team);
    const isPlayerTeamZero = this.world.player.team.length === 0;

    if (isPlayerTeamZero) {
      this.updateUI_NewGame();
      this.nextAction = this.playerInit;
      this.RAM_2.tuto_CG = true;
    } else {
      this.updateUI_LastSave();
      this.RAM_2.tuto_CG = false;
      this.nextAction = this.game_launch;
    }

    await this.perform_dexInit();
  }

  private playerInit(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.updateUI_PlayerInitYes();
        break;

      case UI_BUTTON.NO:
        this.updateUI_PlayerInitNO();
        this.nextAction = this.resetUI;
        break;

      default:
        const entry = new Entry(response);

        if (this.isValidInput(entry)) {
          this.world.player.name = entry.content;
          this.world.addLog([
            `Hi ${entry.content}, you have started your journey !`,
          ]);

          this.updateUI_PlayerInitValidEntry(entry.content);
          this.nextAction = this.starterSelect;
          this.starterSelect();
        } else {
          this.updateUI_InvalidEntry();
        }
        break;
    }
  }

  private starterSelect(response: string = "") {
    if (!this.RAM_2.starter) return;

    const starterChoice = this.RAM_2.starterFind(response);

    if (starterChoice) {
      this.catchPkm(starterChoice);
      this.updateUI_StarterChoiceTrue(starterChoice.name);
      this.nextAction = this.starterRename;
      this.RAM_2.resetStarter();
    } else {
      this.updateUI_StarterChoiceFalse();
    }
  }

  private starterRename(response: string) {
    const thisStarter = this.world.player.team[0];

    switch (response) {
      case UI_BUTTON.YES:
        this.updateUI_StarterRenameYes(thisStarter.name);
        break;

      case UI_BUTTON.NO:
        this.updateUI_StarterRenameNo();
        this.nextAction = this.startAdventure;
        break;

      default:
        const entry = new Entry(response);

        if (this.isValidInput(entry)) {
          this.world.addLog([
            `You have chosen to name ${thisStarter.name} as ${entry.content}.`,
          ]);
          this.updateUI_StarterRenameValidEntry(
            thisStarter.name,
            entry.content,
          );
          thisStarter.name = entry.content;
          this.nextAction = this.startAdventure;
        } else {
          this.updateUI_InvalidEntry();
        }
        break;
    }
  }

  private async startAdventure() {
    this.updateUI_StartAdventure();
    this.nextAction = this.menu_main;
    await this.perform_saveData();
  }

  /* MENU */
  private menu_main(response: string = "") {
    // this.upToSix();
    this.updateUI_MainMenu();

    switch (response) {
      case UI_MENU.TEAM:
        this.updateUI_MainMenu_Team();
        this.nextAction = this.menu_team;
        break;

      case UI_MENU.PKMCENTER:
        this.updateUI_MainMenu_Pkmcenter();
        this.nextAction = this.menu_pkmCenter;
        break;

      case UI_MENU.TRAVEL:
        const randomEvent = this.isRandomEvent(1, 2);
        this.updateUI_MainMenu_TravelEvent(randomEvent);
        this.nextAction = randomEvent ? this.travel_event : this.travel_nothing;
        if (!randomEvent) {
          return;
        }

        // TODO : Je ne peux pas le mettre ici sinon tout le jeux est en async juste pour ça !
        // Set le dex quelques par dans le world ?
        // Ou le faire come javais prévu pour le pokédex.
        // await this.perform_wildPkmInit()

        break;
      default:
        break;
    }
  }

  private menu_pkmCenter(response: string) {
    this.nextAction = this.menu_pkmCenter;

    switch (response) {
      case UI_MENU.REVIVE:
        this.updateUI_MenuPkmcenter_Revive();
        break;

      case UI_MENU.CONSULT_LOG:
        // Todo: Add a way to paginate the logs
        this.updateUI_MenuPkmcenter_Log();
        break;

      case UI_BUTTON.BACK:
        this.menu_main();
        this.nextAction = this.menu_main;
        break;

      default:
        this.menu_main(UI_MENU.PKMCENTER);
        break;
    }
  }

  private menu_team(response: string) {
    switch (response) {
      case UI_MENU.HEAL:
        this.updateUI_MenuTeam_Heal();
        // todo: add a way to heal the team with items de type "potion" , potion extend item, ...
        break;

      case UI_MENU.RENAME:
        this.updateUI_MenuTeam_Rename();
        this.nextAction = this.renamePkm_A;
        break;

      case UI_MENU.RELEASE:
        const team = this.world.player.team;
        const teamLengthBool = team.length <= 1;
        this.updateUI_MenuTeam_Release(teamLengthBool);
        this.nextAction = teamLengthBool ? this.menu_team : this.releasePkm_A;
        break;

      case UI_BUTTON.BACK:
        this.nextAction = this.menu_main;
        this.menu_main();
        break;
      default:
        this.menu_main(UI_MENU.TEAM);
        break;
    }
  }

  /* MENU OPTION */
  // Release SQL
  private releasePkm_A(response: string) {
    const temp_pkm = this.findPkm(response);

    if (!temp_pkm) {
      if (response === UI_BUTTON.BACK) {
        this.menu_main(UI_MENU.TEAM);
      } else {
        this.warning(this.menu_team);
      }
      return;
    }

    this.RAM_2.pkm = temp_pkm;
    this.updateUI_TeamAction_Release_A();
    this.nextAction = this.releasePkm_B;
  }

  private releasePkm_B(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        const selected = this.world.player.team.find(
          (pkm: PkmModel) => pkm === this.RAM_2.pkm,
        );
        if (selected) {
          this.world.player.release(selected);
          this.world.addLog([
            `You have chosen to release ${this.RAM.pkm?.name} !`,
          ]);
          this.updateUI_TeamAction_Release_B();
          this.nextAction = this.menu_team;
          this.RAM_2.pkm = new PkmModel();
        } else {
          this.warning(this.menu_team);
        }
        break;
      case UI_BUTTON.NO:
        this.menu_main(UI_MENU.TEAM);
        break;
      default:
        this.menu_main();
        break;
    }
  }

  //_____ REFACTORED jusqu'ici


  // Rename SQL
  private renamePkm_A(response: string) {
    if (response === UI_BUTTON.BACK) {
      this.menu_main(UI_MENU.TEAM);
      return;
    }

    this.RAM.pkm = this.findPkm(response);

    this.UI.update(UI_TYPE.ENTRY, undefined, undefined, {
      content: [`What would you like to name ${this.RAM.pkm?.name} ?`],
    });
    this.nextAction = this.renamePkm_B;
  }

  private renamePkm_B(response: string) {
    if (response === UI_BUTTON.ABORT) {
      this.menu_main(UI_MENU.TEAM);
      return;
    }

    const entry = new Entry(response);

    if (this.isValidInput(entry)) {
      this.RAM.pkmName_new = entry.content;

      this.UI.update(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          `Are you sure you want to rename ${this.RAM.pkm?.name} in ${this.RAM.pkmName_new} ?`,
        ],
      });
      this.nextAction = this.renamePkm_C;
    } else {
      this.UI.updateNotification([
        'Entry should be between 1 and 10 characters long with no special chars ( &, <, >, ", !, _ )',
      ]);

      this.UI.updateDialogues([
        UI_CHARACTER.PROF,
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }

  private renamePkm_C(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.update(
          UI_TYPE.PRESS,
          { content: CHOICES.CONTINUE },
          undefined,
          {
            content: [
              UI_CHARACTER.PROF,
              `You have chosen to rename ${this.RAM.pkm?.name}!`,
            ],
          },
        );
        this.nextAction = this.menu_team;

        if (this.RAM.pkm && this.RAM.pkmName_new) {
          this.RAM.pkm.name = this.RAM.pkmName_new;
          this.world.addLog([
            `You have chosen to rename ${this.RAM.pkm?.name} in ${this.RAM.pkmName_new}!`,
          ]);

          delete this.RAM.pkmName_old;
          delete this.RAM.pkmName_new;
        } else {
          this.warning(this.menu_team);
          this.menu_main(UI_MENU.TEAM);
        }
        break;
      case UI_BUTTON.NO:
        this.menu_main(UI_MENU.TEAM);
        break;
      default:
        this.menu_main();
        break;
    }
  }

  // Travel
  private travel_event(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.update(
          UI_TYPE.CHOICE,
          { content: this.var_teamChoices() },
          undefined,
          {
            content: [
              `Choose one of your pkm`,
              ...this.var_team<string>((pkm: PkmModel) => pkm.display()),
            ],
          },
        );

        this.nextAction = this.event_battle;

        break;
      case UI_BUTTON.NO:
        this.UI.update(
          UI_TYPE.PRESS,
          { content: CHOICES.CONTINUE },
          undefined,
          {
            content: [`You ran away ...`],
          },
        );
        this.nextAction = this.menu_main;
        break;
      default:
        this.UI.update(
          UI_TYPE.CHOICE,
          { content: CHOICES.BOOLEANS },
          undefined,
          {
            content: [
              `Wild ${this.RAM.pkm?.name} appears ! Do you want to battle ?`,
            ],
            push: true,
          },
        );
        this.nextAction = this.travel_event;
        break;
    }
  }

  private travel_nothing() {
    this.world.oneDayPasses();
    this.nextAction = this.menu_main;
    this.menu_main();
  }

  // Battle
  private event_battle(response: string) {
    const playerChoice = this.findPkm(response);
    console.log(playerChoice);
    if (!playerChoice || !this.RAM.pkm) {
      this.warning(this.menu_main);
      return;
    }

    this.RAM.arena = {
      playerPkm: playerChoice,
      wildPkm: this.RAM.pkm,
    };

    const playerChoiceMove: Choice[] = this.var_pkmMovePool(
      playerChoice,
      (move: move): Choice => {
        return { label: move.name, value: move.name };
      },
    );

    this.UI.update(UI_TYPE.BATTLE, { content: playerChoiceMove }, undefined, {
      content: [`You have chosen ${playerChoice.name} !`],
    });
  }




  /* TOOL BOX*/
  private upToSix() {
    if (this.world.dex) {
      const returnedName = this.world.player.setUpToSix(this.world.dex);
      if (returnedName.length > 0) {
        const namesString = returnedName.join(", ");
        this.world.addLog([
          `You find a way to summon ${namesString} ... are you a sorcerer?`,
        ]);
      }
    }
  }

  private findPkm(id: string): PkmModel | undefined {
    return this.world.player.team.find(
      (pkm: PkmModel) => pkm.id.toString() === id,
    );
  }

  private catchPkm(response: PkmModel) {
    this.world.player.catch(response);

    const dexEntry = this.world.dex.find(
      (pkm: PkdDexEntry) => pkm.id === response.dexEntry,
    );

    if (dexEntry) {
      const log = dexEntry.isStarter
        ? `You have chosen ${dexEntry.name} as your first pkm !`
        : `You have caught ${dexEntry.name} !`;

      this.world.player.addEntry(dexEntry);
      this.world.addLog([log]);
    }
  }

  private resetUI(quit: boolean = true) {
    let data;
    if (quit && this.RAM_2.lastSave) {
      data = this.RAM_2.lastSave;
      data.player_team = data.player_team.map((pkm: PkmModel) =>
        Object.assign(new PkmModel(), pkm),
      );
    } else {
      data = new SaveModel();
    }

    this.RAM_2 = new RAM();
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.start;
  }

  private warning(action: (...args: any) => void) {
    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: [`Something went wrong, please try again !`],
    });
    this.nextAction = action;
  }

  /* GETTERS */
  get extractData() {
    return {
      player_name: this.world.player.name,
      player_team: this.world.player.team,
      player_bags: this.world.player.bag,
      player_dex: this.world.player.dex,
      world_day: this.world.day,
      world_location: this.world.location,
      world_logs: this.world.logs,
    };
  }

  /* TESTER */
  private isRandomEvent(
    eventTriggerChance: number,
    eventChanceRange: number,
  ): boolean {
    const eventOutcome = Math.floor(Math.random() * eventChanceRange);
    return eventOutcome < eventTriggerChance;
  }

  private isValidInput(entry: Entry, minLength = 1, maxLength = 10): boolean {
    return (
      entry.inputLength({ min: minLength, max: maxLength }) &&
      !entry.HTMLSpecialChars_test()
    );
  }

  /* GAME ACTION */
  public async game_save() {
    await this.perform_saveData();
    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: ["You have saved the game !"],
    });
  }

  public async game_quit(response: string = "") {
    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
    this.nextAction = this.resetUI;

    switch (response) {
      case UI_BUTTON.YES:
        this.UI.updateDialogues(["You saved the game! Have a good day!"]);
        await this.perform_saveData();
        break;
      case UI_BUTTON.NO:
        this.UI.updateDialogues(["You have chosen not to save !"]);
        break;
      case UI_BUTTON.BACK:
        this.nextAction = this.menu_main;
        this.menu_main();
        break;
      default:
        this.UI.update(
          UI_TYPE.CHOICE,
          { content: [...CHOICES.BOOLEANS, ...CHOICES.ACTION_BACK] },
          undefined,
          {
            content: [
              "If you quit now, your progress will be lost !",
              "Do you want to save before ?",
            ],
          },
        );
        this.nextAction = this.game_quit;
    }
  }

  private async game_launch(response: string) {
    if ([String(UI_BUTTON.CONTINUE), UI_BUTTON.YES].includes(response)) {
      this.nextAction = this.menu_main;
      this.menu_main();
    } else if ([String(UI_BUTTON.NEW_GAME), UI_BUTTON.NO].includes(response)) {
      this.resetUI(false);
      await this.perform_overWriteSaveData(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
      await this.start(); // Recommencer le jeu après réinitialisation
    } else {
    }
  }

  /* PERFORM*/
  private async perform_dexInit() {
    console.log("Dex init");
    const dexController = PkDexController.getInstance();

    await this.perform_operation(
      async () => {
        const temp_dex = await dexController.getDex();
        if (temp_dex) {
          this.world.dex = temp_dex;
          this.RAM_2.starter = temp_dex;
        } else {
          this.warning(this.start);
        }
      },
      "Dex pkm successfully initialized.",
      "Error initializing dex",
    );
  } // todo modifier ça pour utiliser un hook a la place et mettre ca direct dans le constructeur

  private async perform_saveData() {
    this.RAM_2.lastSave = this.extractData; // peu être un souci ici 🤷 ?

    await this.perform_operation(
      () =>
        fetch("/api/save/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: this.RAM_2.lastSaveJSON,
        }),
      "Game saved successfully:",
      "Error saving game",
    );
  }

  private async perform_overWriteSaveData() {
    await this.perform_operation(
      () =>
        fetch("/api/save/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(new SaveModel()),
        }),
      "Game erased successfully:",
      "Error erasing game",
    );
  }

  private async perform_operation<T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
  ) {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(
        true,
        this.perform_operation.bind(
          this,
          operation,
          successMessage,
          errorMessage,
        ),
      );
      return;
    }

    try {
      this.isLoading.start();

      const response = await operation();

      if (response instanceof Response) {
        if (!response.ok) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`${errorMessage}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(successMessage, data);
      } else {
        console.log(successMessage, response);
      }
    } catch (error: any) {
      console.error(errorMessage, error.message);
    } finally {
      this.isLoading.stop();
      console.log(`${successMessage} operation finished.`);
    }
  }

  /* VAR DATA */
  private var_team<T>(operation: (model: PkmModel) => T): T[] {
    return this.world.player.team.map(operation);
  }

  private var_teamChoices(): Choice[] {
    return this.var_team((pkm: PkmModel) => {
      return { label: pkm.name, value: pkm.id.toString() };
    });
  }

  private var_playerName(): string {
    return this.world.player.name;
  }

  private var_pkmMovePool(pkm: PkmModel, action: (move: move) => any): any[] {
    return pkm.moves.map(action);
  }

  /* TUTO */
  public tuto(
    dialogues: string[],
    pushDialogues: string[],
    ramAttribut: keyof RAM,
  ) {
    if (ramAttribut.includes("tuto") && this.RAM_2[ramAttribut]) {
      // @ts-ignore
      this.RAM_2[ramAttribut] = false;
      dialogues.push(...pushDialogues);
    }

    return dialogues;
  }

  private tuto_MainMenu() {
    const temps_d = [`Welcome in ${this.world.location} !`];
    const temp_p = [
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild SQL",
    ];

    return this.tuto(temps_d, temp_p, "tuto_CG");
  }

  /* STORYBOARD */
  private updateUI_NewGame() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: UI_STYLE.PROF_GREETINGS,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          "You seem to be a new face around here !",
          "Welcome to the fantastic world of pkm,",
          "You are about to embark on a journey of a life time !",
          "You will face many challenges and make many choices !",
          "Are you ready ?",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_LastSave() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.ACTION_LAST_SAVE },
      newStyle: UI_STYLE.SHOW_LAST_SAVE,
      newDialogues: {
        content: [
          `Day : ${this.world.day} , Location : ${this.world.location}`,
          `Player : ${this.var_playerName()}`,
          `Team : ${this.var_team((pkm: PkmModel) => pkm.name).join(", ")}`,
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_PlayerInitYes() {
    const update = {
      newType: UI_TYPE.ENTRY,
      newChoice: undefined,
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          "You have chosen to embark on the journey !",
          "You will be given a pkm to start your journey !",
          "But first tell me your name ?",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_PlayerInitNO() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          "You have chosen not to embark on the journey !",
          "You will be returned to the main menu !",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_PlayerInitValidEntry(_var: string) {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `Ok ${_var} are you ready to pick your first Pkm ?`,
          "You will be given a choice of 3 pkm to choose from !",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_InvalidEntry() {
    const update = {
      newType: undefined,
      newChoice: undefined,
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `I didn't get that, please enter a valid name !`,
          'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
        ],
      },
    };

    this.UI.updateNotification([
      'Entry should be between 1 and 10 characters long with no special chars ( &, <, >, ", !, _ )',
    ]);

    this.UI.update_V2(update);
  }

  private updateUI_StarterChoiceTrue(props: string) {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: undefined,
      newDialogues: {
        content: [UI_CHARACTER.PROF, `Would you like to name your ${props} ?`],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_StarterChoiceFalse() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: this.RAM_2.starterChoices },
      newStyle: undefined,
      newDialogues: {
        content: this.RAM_2.starterDisplay,
        push: true,
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_StarterRenameYes(props: string) {
    const update = {
      newType: UI_TYPE.ENTRY,
      newChoice: undefined,
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `Ok, what would you like to name your ${props} ?`,
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_StarterRenameNo() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          "Okay, you have chosen not to name your pkm ,",
          "You could do that later !",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_StarterRenameValidEntry(propsA: string, propsB: string) {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `Ok, you have chosen to name your ${propsA} in ${propsB} !`,
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_StartAdventure() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          "You are now ready to start your journey !",
          "You will be given a PKDEX to help you on your journey !",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MainMenu() {
    const dialogues = this.tuto_MainMenu();

    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.ACTION_MAIN_MENU },
      newStyle: UI_STYLE.DEFAULT,
      newDialogues: {
        content: dialogues,
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MainMenu_Team() {
    const team = this.var_team((pkm: PkmModel) => pkm);

    const dialogues =
      team.length > 0
        ? [
            UI_CHARACTER.PROF,
            `Here is your team :`,
            ...this.var_team<string>((pkm: PkmModel) => pkm.display()),
          ]
        : ["You have no pkm in your team!"];

    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: {
        content: [...CHOICES.ACTION_TEAM_MENU, ...CHOICES.ACTION_BACK],
      },
      newStyle: UI_STYLE.DEFAULT,
      newDialogues: {
        content: dialogues,
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MainMenu_Pkmcenter() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: {
        content: [...CHOICES.ACTION_PKMCENTER_MENU, ...CHOICES.ACTION_BACK],
      },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.NURSE,
          `Welcome to the PkmCenter !`,
          "Sorry for the mess, we are still under construction ...",
          "   - I can revive your knock out partner, you can consult your log.",
          "   - You can consult your log.",
          " ",
          "And soon many more to come !",
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MainMenu_TravelEvent(props: boolean) {
    const dialogues = props
      ? ["You have encountered a wild Pokémon!"]
      : ["Nothing happened today, you can continue your journey !"];

    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: {
        content: CHOICES.CONTINUE,
      },
      newStyle: undefined,
      newDialogues: {
        content: dialogues,
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MenuPkmcenter_Revive() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [UI_CHARACTER.NURSE, `You have chosen to revive your team !`],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MenuPkmcenter_Log() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          `Your log :`,
          ...this.world.logs.map((log) => `Day ${log.day} : ${log.message}`),
        ],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MenuTeam_Heal() {
    const update = {
      newType: undefined,
      newChoice: undefined,
      newStyle: undefined,
      newDialogues: {
        content: [UI_CHARACTER.PROF, `You have chosen to heal your team !`],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MenuTeam_Rename() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: {
        content: [...this.var_teamChoices(), ...CHOICES.ACTION_BACK],
      },
      newStyle: undefined,
      newDialogues: {
        content: ["Which pkm would you like to rename ?"],
        push: true,
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_MenuTeam_Release(props: boolean) {
    const type = props ? UI_TYPE.PRESS : UI_TYPE.CHOICE;
    const choices = props
      ? CHOICES.CONTINUE
      : [...this.var_teamChoices(), ...CHOICES.ACTION_BACK];
    const dialogues = props
      ? { content: [`You can't release your last pkm !`] }
      : { content: ["Which pkm would you like to release ?"], push: true };

    const update = {
      newType: type,
      newChoice: { content: choices },
      newStyle: undefined,
      newDialogues: dialogues,
    };

    this.UI.update_V2(update);
  }

  private updateUI_TeamAction_Release_A() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: undefined,
      newDialogues: {
        content: [`Are you sure you want to release ${this.RAM_2.pkm.name} ?`],
      },
    };

    this.UI.update_V2(update);
  }

  private updateUI_TeamAction_Release_B() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `You have chosen to release ${this.RAM_2.pkm.name}!`,
        ],
      },
    };

    this.UI.update_V2(update);
  }
}
