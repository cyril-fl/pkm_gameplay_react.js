// noinspection ExceptionCaughtLocallyJS

import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@services//Entry";
import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";
import { Loading } from "@services/Loading";
// Todo: regarder la list des todo et voir ce qui peu etre fait
// - refactoriser un max le code
// todo: changer de dossier
export interface RAM {
  lastSave?: any;
  starterChoices?: PkmModel[];
  pkmName_old?: string;
  pkmName_new?: string;
  pkmName?: string;
}

enum UI_TYPE {
  CHOICE = "CHOICE",
  PRESS = "PRESS",
  ENTRY = "ENTRY",
}
enum MENU {
  TEAM = "Team",
  PKMCENTER = "PkmCenter",
  GO_FORWARD = "Go forward",
}
const CHOICES = {
  CONTINUE: ["*"],
  BOOLEANS: ["Yes", "No"],
};
const BACK = "Back";

const PROF = "PROFESSOR:";

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
    this.nextAction = this.startGame;
    this.isLoading = new Loading();
  }

  /* INIT PHASE*/
  private async startGame() {
    this.RAM.lastSave = JSON.stringify(this.extractData());
    const isPlayerTeamZero = this.world.getPlayer().getTeam().length === 0;

    if (isPlayerTeamZero) {
      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, "INIT", {
        content: [
          PROF,
          "You seem to be a new face around here !",
          "Welcome to the fantastic world of pkm,",
          "You are about to embark on a journey of a life time !",
          "You will face many challenges and make many choices !",
          "Are you ready ?",
        ],
      });
      this.nextAction = this.playerInit;
      await this.performStarterInit(); // execute starteInit at the end, not to block the rest of the code
    } else {
      this.UI.set(
        UI_TYPE.CHOICE,
        { content: ["Continue", "New game"] },
        "START_GAME_SATE",
        {
          content: [
            `Day : ${this.world.getDay()} , Location : ${this.world.getLocation()}`,
            `Player : ${this.world.getPlayer().getName()}`,
            `Team : ${this.world
              .getPlayer()
              .getTeam()
              .map((pkm: PkmModel) => pkm.getName())
              .join(", ")}`,
          ],
        },
      );
      this.nextAction = this.launchGame;
    }
  }

  // YES/NO/DEFAULT
  private playerInit(response: string) {
    switch (response) {
      case "Yes":
        this.UI.set("ENTRY", undefined, undefined, {
          content: [
            PROF,
            "You have chosen to embark on the journey !",
            "You will be given a pkm to start your journey !",
            "But first tell me your name ?",
          ],
        });
        break;

      case "No":
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [
            PROF,
            "You have chosen not to embark on the journey !",
            "You will be returned to the main menu !",
          ],
        });
        this.nextAction = this.resetUI;
        break;

      default:
        const entry = new Entry(response);

        if (
          entry.inputLength({ min: 0, max: 10 }) &&
          !entry.HTMLSpecialChars_test()
        ) {
          this.world.getPlayer().setName(entry.content);
          this.world.addLog([
            {
              day: this.world.getDay(),
              message: `Hi ${entry.content}, you have started your journey !`,
            },
          ]);

          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [
              PROF,
              `Ok ${entry.content}, are you ready to pick your first Pkm ?`,
              "You will be given a choice of 3 pkm to choose from !",
            ],
          });

          this.nextAction = this.starterChoice;
          this.starterChoice("");
        } else {
          this.UI.setDialogues([
            PROF,
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
    }
  }

  private starterChoice(response: string) {
    const starterPkm = this.RAM.starterChoices?.map(
      (entry: any) => new PkmModel(entry, 5),
    );
    if (!starterPkm) return;

    const starterNames = starterPkm.map((pkm: PkmModel) => pkm.getData().name);
    const choice = starterPkm.find(
      (pkm: PkmModel) => pkm.getData().name === response,
    );

    if (choice) {
      this.world.getPlayer().catchPkm(choice);
      this.world.addLog([
        {
          day: this.world.getDay(),
          message: `You have chosen ${response} as your first pkm !`,
        },
      ]);

      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [PROF, `Would you like to name your ${response} ?`],
      });
      this.nextAction = this.starterRename;
      delete this.RAM.starterChoices;
    } else {
      const temp = starterPkm.map((pkm: PkmModel) => {
        const pkmTypes = pkm.getTypes().join(" / ");
        const content = ` the ${pkmTypes || ""} pkm`;
        return pkm.display() + content;
      });

      this.UI.setDialogues(temp, true);
      this.UI.set("CHOICE", { content: starterNames });
    }
  }

  // YES/NO/DEFAULT
  private starterRename(response: string) {
    const thisStarter = this.world.getPlayer().getTeam()[0];

    switch (response) {
      case "Yes":
        this.UI.set("ENTRY", undefined, undefined, {
          content: [
            PROF,
            `Ok, what would you like to name your ${thisStarter.getName()} ?`,
          ],
        });
        break;

      case "No":
        this.UI.set("PRESS", { content: CHOICES.CONTINUE }, undefined, {
          content: [
            PROF,
            "Okay, you have chosen not to name your pkm ,",
            "You could do that later !",
          ],
        });
        this.nextAction = this.setWorld;
        break;

      default:
        const entry = new Entry(response);

        if (
          entry.inputLength({ min: 0, max: 10 }) &&
          !entry.HTMLSpecialChars_test()
        ) {
          const oldName = thisStarter.getName();
          thisStarter.setName(entry.content);

          this.world.addLog([
            {
              day: this.world.getDay(),
              message: `You have chosen to rename ${oldName} as ${entry.content}.`,
            },
          ]);

          this.UI.set("PRESS", { content: CHOICES.CONTINUE }, undefined, {
            content: [
              PROF,
              `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
            ],
          });
          this.nextAction = this.setWorld;
        } else {
          this.UI.setDialogues([
            PROF,
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
        PROF,
        "You are now ready to start your journey !",
        "You will be given a pokedex to help you on your journey !",
      ],
    });

    this.nextAction = this.continueGame;
    await this.performSaveData();
  }

  /* MAIN PHASE */
  public continueGame(response: string = "") {
    this.UI.setDialogues([
      `Welcome in ${this.world.getLocation()} !`,
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild Pkm",
    ]);
    this.UI.set(
      UI_TYPE.CHOICE,
      { content: [MENU.GO_FORWARD, MENU.TEAM, MENU.PKMCENTER] },
      "DEFAULT",
    );

    switch (response) {
      case MENU.TEAM:
        const team = this.world.getPlayer().getTeam();

        if (team.length > 0) {
          this.UI.setDialogues([
            PROF,
            `Here is your team :`,
            ...team.map((pkm: PkmModel) => pkm.display()),
          ]);
        } else {
          this.UI.setDialogues(["You have no pkm in your team!"], true);
        }

        this.UI.setChoices(["Heal", "Rename", "Release", BACK]);

        this.nextAction = this.menu_team;
        break;

      case MENU.PKMCENTER:
        this.UI.setDialogues([
          PROF,
          `Welcome to the PkmCenter !`,
          "Sorry for the mess, we are still under construction ...",
          "Here you can Revive your team ! ",
          "Consult your log !",
          "And soon many more to come ",
        ]);
        this.UI.setChoices(["Revive", "Consult log", BACK]);
        this.nextAction = this.menu_pkmCenter;
        break;

      case MENU.GO_FORWARD:
        this.UI.setDialogues([PROF, `You have chosen to go forward !`]);
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
        this.nextAction = this.menu_goForward;
        break;
      default:
        break;
    }
  }

  public menu_pkmCenter(response: string) {
    console.log("pokeCenterMenu", response);
    this.UI.setChoices(CHOICES.CONTINUE);
    this.nextAction = this.menu_pkmCenter;
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });

    switch (response) {
      case "Revive":
        this.UI.setDialogues([
          PROF,
          `You have chosen to revive your team !`,
        ]);

        break;
      case "Consult log":
        // Todo: Add a way to paginate the logs
        this.UI.setDialogues([
          `Your log :`,
          ...this.world
            .getLogs()
            .map((log) => `Day ${log.day} : ${log.message}`),
        ]);

        break;
      case BACK:
        this.continueGame();
        this.nextAction = this.continueGame;
        break;
      default:
        this.continueGame(MENU.PKMCENTER);
        break;
    }
  }

  public menu_team(response: string) {
    const team = this.world.getPlayer().getTeam();

    switch (response) {
      case "Heal":
        this.UI.setDialogues([PROF, `You have chosen to heal your team !`]);
        // todo: add a way to heal the team with items de type "potion" , potion extend item, ...
        break;

      case "Rename":
        this.UI.set(
          UI_TYPE.CHOICE,
          { content: [...team.map((pkm: PkmModel) => pkm.getName()), BACK] },
          undefined,
          { content: ["Which pkm would you like to rename ?"], push: true },
        );
        this.nextAction = this.RenamePkm_A;
        break;

      case "Release":
        if (team.length <= 1) {
          this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
            content: [`You can't release your last pkm !`],
          });
          this.nextAction = this.menu_team;
        } else {
          this.UI.set(
            UI_TYPE.CHOICE,
            { content: [...team.map((pkm: PkmModel) => pkm.getName()), BACK] },
            undefined,
            { content: ["Which pkm would you like to release ?"], push: true },
          );
          this.nextAction = this.ReleasePkm_A;
        }
        break;

      case BACK:
        this.nextAction = this.continueGame;
        this.continueGame();
        break;
      default:
        this.continueGame(MENU.TEAM);
        break;
    }
  }

  public menu_goForward(response: string) {
    this.world.oneDayPasses();
    this.nextAction = this.continueGame;
    this.continueGame();
  }

  // YES/NO/DEFAULT
  // Release Pkm
  public ReleasePkm_A(response: string) {
    this.RAM.pkmName = response;
    this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
      content: [`Are you sure you want to release ${this.RAM.pkmName} ?`],
    });
    this.nextAction = this.ReleasePkm_B;
  }
  public ReleasePkm_B(response: string) {
    switch (response) {
      case "Yes":
        this.world
          .getPlayer()
          .getTeam()
          .forEach((pkm: PkmModel) => {
            if (pkm.getName() === this.RAM.pkmName) {
              this.world.getPlayer().releasePkm(pkm);
            }
          });

        this.world.addLog([
          {
            day: this.world.getDay(),
            message: `You have chosen to release ${this.RAM.pkmName}!`,
          },
        ]);

        delete this.RAM.pkmName;

        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [PROF, `You have chosen to release ${this.RAM.pkmName}!`],
        });
        this.nextAction = this.menu_team;

        break;
      case "No":
        this.continueGame(MENU.TEAM);
        break;
      default:
        this.continueGame();
        break;
    }
  }

  // Rename Pkm
  public RenamePkm_A(response: string) {
    if (response === BACK) {
      this.continueGame(MENU.TEAM);
      return;
    }

    this.RAM.pkmName_old = response;

    this.UI.set(UI_TYPE.ENTRY, undefined, undefined, {
      content: [`What would you like to name ${this.RAM.pkmName_old} ?`],
    });
    this.nextAction = this.RenamePkm_B;
  }

  public RenamePkm_B(response: string) {
    const entry = new Entry(response);

    if (
      entry.inputLength({ min: 0, max: 10 }) &&
      !entry.HTMLSpecialChars_test()
    ) {
      this.RAM.pkmName_new = entry.content;

      this.UI.set(UI_TYPE.CHOICE, { content: CHOICES.BOOLEANS }, undefined, {
        content: [
          `Are you sure you want to rename ${this.RAM.pkmName_old} in ${this.RAM.pkmName_new} ?`,
        ],
      });
      this.nextAction = this.RenamePkm_C;
    } else {
      this.UI.setDialogues([
        PROF,
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }

  // YES/NO/DEFAULT
  public RenamePkm_C(response: string) {
    switch (response) {
      case "Yes":
        this.UI.setDialogues([PROF]);
        this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
          content: [PROF, `You have chosen to rename ${this.RAM.pkmName_old}!`],
        });

        this.world
          .getPlayer()
          .getTeam()
          .forEach((pkm: PkmModel) => {
            if (
              pkm.getName() === this.RAM.pkmName_old &&
              this.RAM.pkmName_new
            ) {
              pkm.setName(this.RAM.pkmName_new);
            } else {
              this.UI.set(
                UI_TYPE.PRESS,
                { content: CHOICES.CONTINUE },
                undefined,
                {
                  content: [
                    PROF,
                    "Something went wrong, we'll retry again later !",
                  ],
                },
              );
              this.nextAction = this.menu_team;
              this.continueGame(MENU.TEAM);
            }
          });

        this.world.addLog([
          {
            day: this.world.getDay(),
            message: `You have chosen to rename  ${this.RAM.pkmName_old} in ${this.RAM.pkmName_new}!`,
          },
        ]);

        this.nextAction = this.menu_team;
        delete this.RAM.pkmName_old;
        delete this.RAM.pkmName_new;

        break;
      case "No":
        this.continueGame(MENU.TEAM);
        break;
      default:
        this.continueGame();
        break;
    }
  }

  // Save & Quit
  public async saveGame() {
    await this.performSaveData();
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: ["You have saved the game !"],
    });
  }

  // YES/NO/DEFAULT
  public async quitGame(response: string = "") {
    this.UI.set(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
    switch (response) {
      case "Yes":
        this.UI.setDialogues(["You saved the game! Have a good day!"]);
        this.nextAction = this.resetUI;
        await this.performSaveData();
        break;
      case "No":
        this.UI.setDialogues(["You have chosen not to save !"]);
        this.nextAction = this.resetUI;
        break;
      case BACK:
        this.nextAction = this.continueGame;
        this.continueGame();
        break;
      default:
        this.UI.set(
          UI_TYPE.CHOICE,
          { content: [...CHOICES.BOOLEANS, BACK] },
          undefined,
          {
            content: [
              "If you quit now, your progress will be lost !",
              "Do you want to save before ?",
            ],
          },
        );
        this.nextAction = this.quitGame;
    }
  }

  //  REFACTORED - OK
  /* TOOL BOX*/
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
  public resetUI(quit: boolean = true) {
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
    this.nextAction = this.startGame;
  }
  
  public async launchGame(response: string) {
    if (["Continue", "Yes"].includes(response)) {
      this.nextAction = this.continueGame;
      this.continueGame();
    } else if (["New game", "No"].includes(response)) {
      this.resetUI(false);
      await this.performOverWriteSaveData(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
      await this.startGame(); // Recommencer le jeu après réinitialisation
    } else {
    }
  }

  private async performStarterInit() {
    const dexController = PkDexController.getInstance();

    await this.performGameOperation(
      async () =>
        (this.RAM.starterChoices = await dexController.getStarterEntries()),
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
