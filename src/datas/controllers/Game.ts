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
import { Choice, move, RAM } from "@customs/Interface";
import { PkdDexEntry } from "@models/PkmDex";

// Todo: regarder la list des todo et voir ce qui peu être fait
// Todo : instancier le player et vérifier les impermanence de type sur son content
// Todo : ajouter un PKDEX qui sera composer de dex entry = is_Catch : Bool qui définira si on le voit ou non dans le dex. P e faire une vue special.

export class GameController {
  private RAM: RAM;
  public UI: GameUIModel;
  public world: WorldModel;
  public nextAction: (...args: any) => void;
  private isLoading: Loading;

  constructor(data: SaveModel) {
    this.RAM = {};
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.start;
    this.isLoading = new Loading();
  }

  /* INIT PHASE*/
  private async start() {
    this.RAM.lastSave = JSON.stringify(this.extractData);
    const isPlayerTeamZero = this.world.player.team.length === 0;

    if (isPlayerTeamZero) {
      this.UI.set(
        UI_TYPE.CHOICE,
        { content: CHOICES.BOOLEANS },
        UI_STYLE.PROF_GREETINGS,
        {
          content: [
            UI_CHARACTER.PROF,
            "You seem to be a new face around here !",
            "Welcome to the fantastic world of pkm,",
            "You are about to embark on a journey of a life time !",
            "You will face many challenges and make many choices !",
            "Are you ready ?",
          ],
        },
      );
      this.nextAction = this.playerInit;
      this.RAM.continueGame_tuto = true;
    } else {
      this.UI.set(
        UI_TYPE.CHOICE,
        { content: CHOICES.ACTION_LAST_SAVE },
        UI_STYLE.SHOW_LAST_SAVE,
        {
          content: [
            `Day : ${this.world.day} , Location : ${this.world.location}`,
            `Player : ${this.var_playerName()}`,
            `Team : ${this.var_team((pkm: PkmModel) => pkm.name).join(", ")}`,
          ],
        },
      );
      this.RAM.continueGame_tuto = false;
      this.nextAction = this.launchGame;
    }

    await this.perform_dexInit();
  }

  private playerInit(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
          content: [
            UI_CHARACTER.PROF,
            "You have chosen to embark on the journey !",
            "You will be given a pkm to start your journey !",
            "But first tell me your name ?",
          ],
        });
        break;

      case UI_BUTTON.NO:
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            "You have chosen not to embark on the journey !",
            "You will be returned to the main menu !",
          ],
        });
        this.nextAction = this.resetUI;
        break;

      default:
        const entry = new Entry(response);

        if (this.isValidInput(entry)) {
          this.world.player.name = entry.content;
          this.world.addLog([`Hi ${entry.content}, you have started your journey !`]);

          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              UI_CHARACTER.PROF,
              `Ok ${entry.content}, are you ready to pick your first Pkm ?`,
              "You will be given a choice of 3 pkm to choose from !",
            ],
          });

          this.nextAction = this.starterSelect;
          this.starterSelect();
        } else {
          this.UI.setDialogues([
            UI_CHARACTER.PROF,
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
    }
  }

  // // DONNER UN ELPTE DEX AU PLAUER, ET QUAND IL CAPTURER ON COPIER L'ENTRE DU WILD VER LE DEX.
  // await this.perform_dexInit()
  // this.dexInit()

  private starterSelect(response: string = "") {
    const starterList = this.RAM.starterChoices;

    if (!starterList) return;

    const starterChoices = starterList.map((pkm: PkmModel) => {
      return { label: pkm.name, value: pkm.id.toString() };
    });

    const playerChoice = starterList.find((starter: PkmModel) => {
      if (starter.id === response) {
        return starter;
      }
    });

    if (playerChoice) {
      this.catchPkm(playerChoice);
      this.world.addLog([`You have chosen ${playerChoice.name} as your first pkm !`]);
      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          UI_CHARACTER.PROF,
          `Would you like to name your ${playerChoice.name} ?`,
        ],
      });
      this.nextAction = this.starterRename_A;
      delete this.RAM.starterChoices;
    } else {
      const new_dialogues = starterList.map((pkm: PkmModel) => {
        const pkmTypes = pkm.types.join(" / ");
        return pkm.display() + ` the ${pkmTypes} pkm`;
      });

      this.UI.set(UI_TYPE.CHOICE, { content: starterChoices }, undefined, {
        content: new_dialogues,
        push: true,
      });
    }
  }

  private starterRename_A(response: string) {
    const thisStarter = this.world.player.team[0];

    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `Ok, what would you like to name your ${thisStarter.name} ?`,
          ],
        });
        break;

      case UI_BUTTON.NO:
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            "Okay, you have chosen not to name your pkm ,",
            "You could do that later !",
          ],
        });
        this.nextAction = this.starterRename_B;
        break;

      default:
        const entry = new Entry(response);

        if (this.isValidInput(entry)) {
          const oldName = thisStarter.name;
          thisStarter.name = entry.content;
          this.world.addLog(
            [`You have chosen to name ${oldName} as ${entry.content}.`],
          );

          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              UI_CHARACTER.PROF,
              `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
            ],
          });
          this.nextAction = this.starterRename_B;
        } else {
          this.UI.setNotification([
            'Entry should be between 1 and 10 characters long with no special chars ( &, <, >, ", !, _ )',
          ]);

          this.UI.setDialogues([
            UI_CHARACTER.PROF,
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", !, _ )',
          ]);
        }
        break;
    }
  }

  private async starterRename_B() {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: [
        UI_CHARACTER.PROF,
        "You are now ready to start your journey !",
        "You will be given a PKDEX to help you on your journey !",
      ],
    });

    this.nextAction = this.menu_main;
    await this.perform_saveData();
  }

  /* MENU */
  private menu_main(response: string = "") {
    // this.upToSix();

    const temps_d = [`Welcome in ${this.world.location} !`];
    const temp_p = [
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild SQL",
    ];
    const dialogues = this.tuto(temps_d, temp_p, "continueGame_tuto");

    this.UI.set(
      UI_TYPE.CHOICE,
      { content: CHOICES.ACTION_MAIN_MENU },
      UI_STYLE.DEFAULT,
      {
        content: dialogues,
      },
    );



    switch (response) {
      case UI_MENU.TEAM:
        const team = this.var_team((pkm: PkmModel) => pkm);

        if (team.length > 0) {
          this.UI.setDialogues([
            UI_CHARACTER.PROF,
            `Here is your team :`,
            ...this.var_team<string>((pkm: PkmModel) => pkm.display()),
          ]);
        } else {
          this.UI.setDialogues(["You have no pkm in your team!"], true);
        }

        this.UI.setChoices([
          ...CHOICES.ACTION_TEAM_MENU,
          ...CHOICES.ACTION_BACK,
        ]);

        this.nextAction = this.menu_team;
        break;

      case UI_MENU.PKMCENTER:
        this.UI.set(
          UI_TYPE.CHOICE,
          {
            content: [...CHOICES.ACTION_PKMCENTER_MENU, ...CHOICES.ACTION_BACK],
          },
          undefined,
          {
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
        );

        this.nextAction = this.menu_pkmCenter;
        break;

      case UI_MENU.TRAVEL:
        if (this.isRandomEvent(1, 2)) {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [`You have encountered a wild Pokémon!`],
          });

          this.nextAction = this.travel_event;

          // TODO : Je ne peux pas le mettre ici sinon tout le jeux est en async juste pour ça !
          // Set le dex quelques par dans le world ?
          // Ou le faire come javais prévu pour le pokédex.
          // await this.perform_wildPkmInit()
        } else {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              `Nothing happened today, you can continue your journey !`,
            ],
          });
          this.nextAction = this.travel_nothing;
        }
        break;
      default:
        break;
    }
  }

  private menu_pkmCenter(response: string) {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
    this.nextAction = this.menu_pkmCenter;

    switch (response) {
      case UI_MENU.REVIVE:
        this.UI.setDialogues([
          UI_CHARACTER.PROF,
          `You have chosen to revive your team !`,
        ]);

        break;
      case UI_MENU.CONSULT_LOG:
        // Todo: Add a way to paginate the logs
        this.UI.setDialogues([
          `Your log :`,
          ...this.world.logs.map((log) => `Day ${log.day} : ${log.message}`),
        ]);

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
    const team = this.world.player.team;
    switch (response) {
      case UI_MENU.HEAL:
        this.UI.setDialogues([
          UI_CHARACTER.PROF,
          `You have chosen to heal your team !`,
        ]);
        // todo: add a way to heal the team with items de type "potion" , potion extend item, ...
        break;

      case UI_MENU.RENAME:
        this.UI.set(
          UI_TYPE.CHOICE,
          {
            content: [...this.var_teamChoices(), ...CHOICES.ACTION_BACK],
          },
          undefined,
          { content: ["Which pkm would you like to rename ?"], push: true },
        );
        this.nextAction = this.renamePkm_A;
        break;

      case UI_MENU.RELEASE:
        if (team.length <= 1) {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [`You can't release your last pkm !`],
          });
          this.nextAction = this.menu_team;
        } else {
          this.UI.set(
            UI_TYPE.CHOICE,
            {
              content: [...this.var_teamChoices(), ...CHOICES.ACTION_BACK],
            },
            undefined,
            { content: ["Which pkm would you like to release ?"], push: true },
          );
          this.nextAction = this.releasePkm_A;
        }
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

    this.RAM.pkm = temp_pkm;
    this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
      content: [`Are you sure you want to release ${this.RAM.pkm.name} ?`],
    });
    this.nextAction = this.releasePkm_B;
  }

  private releasePkm_B(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.world.player.team.forEach((pkm: PkmModel) => {
          if (pkm === this.RAM.pkm) {
            this.world.player.release(pkm);
          }
        });
        this.world.addLog([`You have chosen to release ${this.RAM.pkm?.name} !`]);
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `You have chosen to release ${this.RAM.pkm?.name}!`,
          ],
        });
        this.nextAction = this.menu_team;
        delete this.RAM.pkm;
        break;
      case UI_BUTTON.NO:
        this.menu_main(UI_MENU.TEAM);
        break;
      default:
        this.menu_main();
        break;
    }
  }

  // Rename SQL
  private renamePkm_A(response: string) {
    if (response === UI_BUTTON.BACK) {
      this.menu_main(UI_MENU.TEAM);
      return;
    }

    this.RAM.pkm = this.findPkm(response);

    this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
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

      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          `Are you sure you want to rename ${this.RAM.pkm?.name} in ${this.RAM.pkmName_new} ?`,
        ],
      });
      this.nextAction = this.renamePkm_C;
    } else {
      this.UI.setNotification([
        'Entry should be between 1 and 10 characters long with no special chars ( &, <, >, ", !, _ )',
      ]);

      this.UI.setDialogues([
        UI_CHARACTER.PROF,
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }

  private renamePkm_C(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `You have chosen to rename ${this.RAM.pkm?.name}!`,
          ],
        });
        this.nextAction = this.menu_team;

        if (this.RAM.pkm && this.RAM.pkmName_new) {
          this.RAM.pkm.name = this.RAM.pkmName_new;
          this.world.addLog(
            [`You have chosen to rename ${this.RAM.pkm?.name} in ${this.RAM.pkmName_new}!`],
          );

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
        this.UI.set(
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
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [`You ran away ...`],
        });
        this.nextAction = this.menu_main;
        break;
      default:
        this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
          content: [
            `Wild ${this.RAM.pkm?.name} appears ! Do you want to battle ?`,
          ],
          push: true,
        });
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

    this.UI.set(UI_TYPE.BATTLE, { content: playerChoiceMove }, undefined, {
      content: [`You have chosen ${playerChoice.name} !`],
    });
  }


  //  REFACTORED - plus si ok

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

  /* TOOL BOX*/
  // Divers
  private tuto(
    dialogues: string[],
    pushDialogues: string[],
    ramAttribut: keyof RAM,
  ) {
    if (this.RAM[ramAttribut]) {
      this.RAM[ramAttribut] = false;
      dialogues.push(...pushDialogues);
    }

    return dialogues;
  }

  private upToSix() {
    if (this.world.dex) {
      const returnedName = this.world.player.setUpToSix(this.world.dex);
      if (returnedName.length > 0) {
        const namesString = returnedName.join(", ");
        this.world.addLog([`You find a way to summon ${namesString} ... are you a sorcerer?`]);
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

    const dexEntry = this.world.dex?.find(
      (pkm: PkdDexEntry) => pkm.id === response.dexEntry,
    );
    if (dexEntry) {
      this.world.player.addEntry(dexEntry);
      if (!dexEntry.isStarter) {
        this.world.addLog([`You have caught ${dexEntry.name} !`]);
      }
    }
  }

  private resetUI(quit: boolean = true) {
    let data;
    if (quit && this.RAM.lastSave) {
      data = JSON.parse(this.RAM.lastSave);
      data.player_team = data.player_team.map((pkm: PkmModel) =>
        Object.assign(new PkmModel(), pkm),
      );
    } else {
      data = new SaveModel();
    }

    this.RAM = {};
    this.UI = new GameUIModel();
    console.log("RESET UI", data);
    this.world = new WorldModel(data);
    this.nextAction = this.start;
  }

  private async launchGame(response: string) {
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

  private warning(action: (...args: any) => void) {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: [`Something went wrong, please try again !`],
    });
    this.nextAction = action;
  }

  // Test
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

  // Perform
  // Game action
  public async game_save() {
    await this.perform_saveData();
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: ["You have saved the game !"],
    });
  }

  public async game_quit(response: string = "") {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
    this.nextAction = this.resetUI;

    switch (response) {
      case UI_BUTTON.YES:
        this.UI.setDialogues(["You saved the game! Have a good day!"]);
        await this.perform_saveData();
        break;
      case UI_BUTTON.NO:
        this.UI.setDialogues(["You have chosen not to save !"]);
        break;
      case UI_BUTTON.BACK:
        this.nextAction = this.menu_main;
        this.menu_main();
        break;
      default:
        this.UI.set(
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

  // todo modifier ça pour utiliser un hook a la place et mettre ca direct dans le constructeur
  private async perform_dexInit() {
    const dexController = PkDexController.getInstance();

    await this.perform_operation(
      async () => {
        const temp_dex = await dexController.getDex();
        if (temp_dex) {
          this.world.dex = temp_dex;
          this.RAM.starterChoices = temp_dex
            .filter((pkm: any) => pkm.isStarter)
            .map((pkm: any) => new PkmModel(pkm, 5));

        } else {
          this.warning(this.start);
        }
      },
      "Dex pkm successfully initialized.",
      "Error initializing dex",
    );
  }

  private async perform_saveData() {
    this.RAM.lastSave = JSON.stringify(this.extractData); // peu être un souci ici 🤷 ?

    await this.perform_operation(
      () =>
        fetch("/api/save/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.extractData),
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
}
