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
import { Choice, RAM } from "@customs/Interface";

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
    this.RAM.lastSave = JSON.stringify(this.extractData());
    const isPlayerTeamZero = this.world.getPlayer().getTeam().length === 0;

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
      await this.performStarterInit(); // execute starterInit at the end, not to block the rest of the code
    } else {
      this.UI.set(
        UI_TYPE.CHOICE,
        { content: CHOICES.ACTION_LAST_SAVE },
        UI_STYLE.SHOW_LAST_SAVE,
        {
          content: [
            `Day : ${this.world.getDay()} , Location : ${this.world.getLocation()}`,
            `Player : ${this.var_playerName()}`,
            `Team : ${this.var_teamNames()}`,
          ],
        },
      );
      this.RAM.continueGame_tuto = false;
      this.nextAction = this.launchGame;
    }
  }

  // YES/NO/DEFAULT
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
          this.world.getPlayer().setName(entry.content);
          this.addLog(`Hi ${entry.content}, you have started your journey !`);

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

  private starterSelect(response: string = "") {
    const starterList = this.RAM.starterChoices;

    if (!starterList) return;

    const starterChoices = starterList.map((pkm: PkmModel) => {
      return { label: pkm.getName(), value: pkm.getID().toString() };
    });

    const playerChoice = starterList.find((starter: PkmModel) => {
      if (starter.getID().toString() == response) {
        return starter;
      }
    });
    console.log(response);
    console.log(typeof response);
    console.log(starterList);
    console.log("playerChoice", playerChoice);

    if (playerChoice) {
      this.world.getPlayer().catchPkm(playerChoice);
      this.addLog(
        `You have chosen ${playerChoice.getName()} as your first pkm !`,
      );
      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          UI_CHARACTER.PROF,
          `Would you like to name your ${playerChoice.getName()} ?`,
        ],
      });
      this.nextAction = this.starterRename;
      delete this.RAM.starterChoices;
    } else {
      const new_dialogues = starterList.map((pkm: PkmModel) => {
        const pkmTypes = pkm.getTypes().join(" / ");
        return pkm.display() + ` the ${pkmTypes} pkm`;
      });

      this.UI.set(UI_TYPE.CHOICE, { content: starterChoices }, undefined, {
        content: new_dialogues,
        push: true,
      });
    }
  }

  // YES/NO/DEFAULT
  private starterRename(response: string) {
    const thisStarter = this.world.getPlayer().getTeam()[0];

    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `Ok, what would you like to name your ${thisStarter.getName()} ?`,
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
        this.nextAction = this.setWorld;
        break;

      default:
        const entry = new Entry(response);

        if (this.isValidInput(entry)) {
          const oldName = thisStarter.getName();
          thisStarter.setName(entry.content);
          this.addLog(
            `You have chosen to name ${oldName} as ${entry.content}.`,
          );

          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              UI_CHARACTER.PROF,
              `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
            ],
          });
          this.nextAction = this.setWorld;
        } else {
          this.UI.setDialogues([
            UI_CHARACTER.PROF,
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
        break;
    }
  }

  private async setWorld() {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: [
        UI_CHARACTER.PROF,
        "You are now ready to start your journey !",
        "You will be given a PKDEX to help you on your journey !",
      ],
    });

    this.nextAction = this.menu_main;
    await this.performSaveData();
  }

  /* MAIN PHASE */
  public menu_main(response: string = "") {
    const temps_d = [`Welcome in ${this.world.getLocation()} !`,]
    const temp_p = [
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild Pkm",
    ]
    const dialogues = this.tuto(temps_d, temp_p, 'continueGame_tuto')

    this.UI.set(
      UI_TYPE.CHOICE,
      { content: CHOICES.ACTION_MAIN_MENU },
      UI_STYLE.DEFAULT, {
        content: dialogues})

    switch (response) {
      case UI_MENU.TEAM:
        /*this.world.getPlayer().setUpToSix(); // UP TO SIX*/
        const team= this.var_team((pkm: PkmModel) => pkm);

        if (team.length > 0) {
          this.UI.setDialogues([
            UI_CHARACTER.PROF,
            `Here is your team :`,
            ...team.map((pkm: PkmModel) => pkm.display()),
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
        this.UI.set(UI_TYPE.CHOICE, { content: [
            ...CHOICES.ACTION_PKMCENTER_MENU,
            ...CHOICES.ACTION_BACK,
          ]}, undefined, { content:[
          UI_CHARACTER.NURSE,
          `Welcome to the PkmCenter !`,
          "Sorry for the mess, we are still under construction ...",
          "   - I can revive your knock out partner, you can consult your log.",
          "   - You can consult your log.",
          " ",
          "And soon many more to come !",
        ]});

        this.nextAction = this.menu_pkmCenter;
        break;

      case UI_MENU.TRAVEL:
        if (this.isRandomEvent(1, 2)) {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [`You have encountered a wild Pokémon!`]
          });
          this.nextAction = this.travel_event;
        } else {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              `Nothing happened today, you can continue your journey !`,
            ]
          });
          this.nextAction = this.travel_nothing;
        }
        break;
      default:
        break;
    }
  }

  public menu_pkmCenter(response: string) {
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
          ...this.world
            .getLogs()
            .map((log) => `Day ${log.day} : ${log.message}`),
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

  public menu_team(response: string) {
    const team = this.world.getPlayer().getTeam();
    console.log(team);

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

  // YES/NO/DEFAULT
  // Release Pkm
  public releasePkm_A(response: string) {
    const temp_pkm = this.findPkm(response);
    if (!temp_pkm) { // todo a refactor mais je crois que c'est bon
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [`Something went wrong, please try again !`],
        });
        this.nextAction = this.menu_team;
        return;
    }

    this.RAM.pkm = temp_pkm
    this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
      content: [`Are you sure you want to release ${this.RAM.pkm.getName()} ?`],
    });
    this.nextAction = this.releasePkm_B;
  }

  public releasePkm_B(response: string) {
    console.log(response);

    switch (response) {
      case UI_BUTTON.YES:
        this.world
          .getPlayer()
          .getTeam()
          .forEach((pkm: PkmModel) => {
            if (pkm === this.RAM.pkm) {
              this.world.getPlayer().releasePkm(pkm);
            }
          });
        this.addLog(`You have chosen to release ${this.RAM.pkm?.getName()} !`);
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `You have chosen to release ${this.RAM.pkm?.getName()}!`,
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

  // Rename Pkm
  public renamePkm_A(response: string) {
    if (response === UI_BUTTON.BACK) {
      this.menu_main(UI_MENU.TEAM);
      return;
    }

    this.RAM.pkm = this.findPkm(response);

    this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
      content: [`What would you like to name ${this.RAM.pkm?.getName()} ?`],
    });
    this.nextAction = this.renamePkm_B;
  }

  public renamePkm_B(response: string) {
    const entry = new Entry(response);

    if (this.isValidInput(entry)) {
      this.RAM.pkmName_new = entry.content;

      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          `Are you sure you want to rename ${this.RAM.pkm?.getName()} in ${this.RAM.pkmName_new} ?`,
        ],
      });
      this.nextAction = this.renamePkm_C;
    } else {
      this.UI.setDialogues([
        UI_CHARACTER.PROF,
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }

  // YES/NO/DEFAULT
  public renamePkm_C(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            UI_CHARACTER.PROF,
            `You have chosen to rename ${this.RAM.pkm?.getName()}!`,
          ],
        });
        this.nextAction = this.menu_team;

        if (this.RAM.pkm && this.RAM.pkmName_new) {
          this.RAM.pkm.setName(this.RAM.pkmName_new);
          this.addLog(
              `You have chosen to rename ${this.RAM.pkm?.getName()} in ${this.RAM.pkmName_new}!`,
          );

          delete this.RAM.pkmName_old;
          delete this.RAM.pkmName_new;

        } else {
            this.UI.set( //todo possibleto refactor enfin je crois
              UI_TYPE.PRESS,
              { content: CHOICES.CONTINUE },
              undefined,
              {
                content: [
                  UI_CHARACTER.PROF,
                  "Something went wrong, we'll retry again later !",
                ],
              },
            );
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
  public travel_event(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.UI.set(
            UI_TYPE.CHOICE,
            { content: this.var_teamChoices() },
            undefined,
            {
              content: [
                `Choose one of your pkm`,
                ...this.world
                    .getPlayer()
                    .getTeam()
                    .map((pkm: PkmModel) => pkm.display()),
              ],
            },
        );

        this.nextAction = this.menu_main; //temp

        break;
      case UI_BUTTON.NO:
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [`You ran away ...`],
        });
        this.nextAction = this.menu_main;
        break;
      default:
        this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
          content: [`Do you want to battle ?`],
          push: true,
        });
        this.nextAction = this.travel_event;
        break;
    }
  }
  public travel_nothing() {
    this.world.oneDayPasses();
    this.nextAction = this.menu_main;
    this.menu_main();
  }

  //  REFACTORED - OK
  /* VAR DATA */
  private var_team<T>(operation: (model: PkmModel) => T): T[] {
    return this.world.getPlayer().getTeam().map(operation);
  }

  private var_teamChoices(): Choice[] {
    return this.var_team((pkm: PkmModel) => {
      return { label: pkm.getName(), value: pkm.getID().toString() };
    });
  }

  private var_teamNames(): string {
    return this.var_team((pkm: PkmModel) => pkm.getName()).join(", ");
  }

  private var_playerName(): string {
    return this.world.getPlayer().getName();
  }

  /* TOOL BOX*/
  // Divers
  private tuto(dialogues: string[], pushDialogues: string[], ramAttribut: keyof RAM) {
    if (this.RAM[ramAttribut]) {
      this.RAM[ramAttribut] = false;
      dialogues.push(...pushDialogues)
    }

    return dialogues
  }

  private findPkm(id: string): PkmModel | undefined {
    return this.world
        .getPlayer()
        .getTeam()
        .find((pkm: PkmModel) => pkm.getID().toString() === id);
  }

  public extractData() {
    return {
      player_name: this.world.getPlayer().getName(),
      player_team: this.world.getPlayer().getTeam(),
      player_bags: this.world.getPlayer().getBag(),
      world_day: this.world.getDay(),
      world_location: this.world.getLocation(),
      world_logs: this.world.getLogs(),
    };
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
    this.world = new WorldModel(data);
    this.nextAction = this.start;
  }

  private addLog(message: string) {
    this.world.addLog([
      {
        day: this.world.getDay(),
        message: message,
      },
    ]);
  }

  private async launchGame(response: string) {
    if ([String(UI_BUTTON.CONTINUE), UI_BUTTON.YES].includes(response)) {
      this.nextAction = this.menu_main;
      this.menu_main();
    } else if ([String(UI_BUTTON.NEW_GAME), UI_BUTTON.NO].includes(response)) {
      this.resetUI(false);
      await this.performOverWriteSaveData(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
      await this.start(); // Recommencer le jeu après réinitialisation
    } else {
    }
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
    await this.performSaveData();
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
        await this.performSaveData();
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

  private async performStarterInit() {
    const dexController = PkDexController.getInstance();

    await this.performGameOperation(
      async () => {
        let temp = await dexController.getStarterEntries();
        this.RAM.starterChoices = temp.map((pkm: any) => new PkmModel(pkm, 5));
      },
      "Dex successfully initialized.",
      "Error initializing dex",
    );
  }

  private async performSaveData() {
    this.RAM.lastSave = JSON.stringify(this.extractData()); // peu être un souci ici 🤷 ?

    await this.performGameOperation(
      () =>
        fetch("/api/save/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.extractData()),
        }),
      "Game saved successfully:",
      "Error saving game",
    );
  }

  private async performOverWriteSaveData() {
    await this.performGameOperation(
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

  private async performGameOperation<T>(
    operation: () => Promise<T>,
    successMessage: string,
    errorMessage: string,
  ) {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(
        true,
        this.performGameOperation.bind(
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
}
