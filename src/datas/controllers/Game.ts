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

const BOOLEANS_CHOICE = ["Yes", "No"];
const CONTINUE_CHOICE = ["*"];
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
    const player_team = this.world.getPlayer().getTeam();
    this.RAM.lastSave = JSON.stringify(this.extractData());

    this.UI.setStyle("DEFAULT");
    this.UI.setChoices(BOOLEANS_CHOICE);
    this.UI.setType("CHOICE");
    this.UI.setStyle("INIT");
    if (player_team.length === 0) {
      this.UI.setDialogues([
        `${PROF}`,
        "You seem to be a new face around here !",
        "Welcome to the fantastic world of pkm,",
        "You are about to embark on a journey of a life time !",
        "You will face many challenges and make many choices !",
        "Are you ready ?",
      ]);
      this.nextAction = this.playerInit;
      await this.starterInit(); // execute starteInit at the end, not to block the rest of the code
    } else {
      this.UI.setStyle("START_GAME_SATE");
      this.UI.setChoices(["Continue", "New game"]);
      this.UI.setDialogues([
        `Day : ${this.world.getDay()} , Location : ${this.world.getLocation()}`,
        `Player : ${this.world.getPlayer().getName()}`,
        `Team : ${player_team.map((pkm: PkmModel) => pkm.getName()).join(", ")}`,
      ]);
      this.nextAction = this.gameInit;
    }
  }

  public async gameInit(response: string) {
    switch (response) {
      case "Continue":
      case "Yes":
        this.UI.setStyle("DEFAULT"); //to delete
        this.nextAction = this.continueGame;
        this.continueGame(); // Assurez-vous que `continueGame` est une fonction asynchrone si elle utilise des promesses
        break;
      case "New game":
      case "No":
        this.reset(false);
        await this.eraseGame(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
        await this.startGame(); // Recommencer le jeu après réinitialisation
        break;
      default:
        break;
    }
  }

  private async starterInit() {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(true, this.starterInit.bind(this));
      return;
    }

    try {
      this.isLoading.start();

      const dexController = PkDexController.getInstance();
      this.RAM.starterChoices = await dexController.getStarterEntries();
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      this.isLoading.stop();
    }
  }

  private playerInit(response: string) {
    switch (response) {
      case "Yes":
        this.UI.setDialogues([
          `${PROF}`,
          "You have chosen to embark on the journey !",
          "You will be given a pkm to start your journey !",
          "But first tell me your name ?",
        ]);
        this.UI.setChoices([]);
        this.UI.setType("ENTRY");
        break;

      case "No":
        this.UI.setDialogues([
          `${PROF}`,
          "You have chosen not to embark on the journey !",
          "You will be returned to the main menu !",
        ]);
        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.reset;
        break;

      default:
        const entry = new Entry(response);

        if (
          entry.inputLength({ min: 0, max: 10 }) &&
          !entry.HTMLSpecialChars_test()
        ) {
          this.world.getPlayer().setName(entry.content);
          this.UI.setDialogues([
            `${PROF}`,
            `Ok ${entry.content}, are you ready to pick your first Pkm ?`,
            "You will be given a choice of 3 pkm to choose from !",
          ]);

          this.world.addLog([
            {
              day: this.world.getDay(),
              message: `Hi ${entry.content}, you have started your journey !`,
            },
          ]);

          this.UI.setChoices(CONTINUE_CHOICE);
          this.UI.setType("PRESS");

          this.nextAction = this.starterChoice;
          this.starterChoice("");
        } else {
          this.UI.setDialogues([
            `${PROF}`,
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
      (pkm: any) => pkm.getData().name === response,
    );

    if (choice) {
      this.world.getPlayer().catchPkm(choice);
      delete this.RAM.starterChoices;

      this.world.addLog([
        {
          day: this.world.getDay(),
          message: `You have chosen ${response} as your first pkm !`,
        },
      ]);

      this.UI.setDialogues([
        `${PROF}`,
        `Would you like to name your ${response} ?`,
      ]);
      this.UI.setChoices(BOOLEANS_CHOICE);
      this.nextAction = this.starterRename;
    } else {
      starterPkm.forEach((pkm: any) => {
        const typeName = pkm.getTypes().join(" / ");
        const content = ` the ${typeName || ""} pkm`;
        this.UI.setDialogues([pkm.display() + content], true);
      });

      this.UI.setChoices(starterNames);
      this.UI.setType("CHOICE");
    }
  }

  private starterRename(response: string) {
    const thisStarter = this.world.getPlayer().getTeam()[0];

    switch (response) {
      case "Yes":
        this.UI.setDialogues([
          `${PROF}`,
          `Ok, what would you like to name your ${thisStarter.getName()} ?`,
        ]);
        this.UI.setChoices([]);
        this.UI.setType("ENTRY");
        break;

      case "No":
        this.UI.setDialogues([
          `${PROF}`,
          "Okay, you have chosen not to name your pkm ,",
          "You could do that later !",
        ]);
        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
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

          this.UI.setDialogues([
            `${PROF}`,
            `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
          ]);
          this.UI.setChoices(CONTINUE_CHOICE);
          this.UI.setType("PRESS");

          this.nextAction = this.setWorld;
        } else {
          this.UI.setDialogues([
            `${PROF}`,
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
        break;
    }
  }

  private async setWorld() {
    this.UI.setDialogues([
      `${PROF}`,
      "You are now ready to start your journey !",
      "You will be given a pokedex to help you on your journey !",
    ]);
    this.UI.setChoices(CONTINUE_CHOICE);
    this.UI.setType("PRESS");

    this.nextAction = this.continueGame;
    await this.inner_saveGame();
  }

  /* MAIN PHASE */
  public continueGame(response: string = "") {
    console.log("continueGame", response);
    this.UI.setStyle("DEFAULT");
    this.UI.setDialogues([
      `Welcome in ${this.world.getLocation()} !`,
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild Pkm",
    ]);
    this.UI.setChoices(["Go forward", "Team", "PkmCenter"]);
    // this.UI.setChoices(["Team"]); // -- Todo: to delete

    this.UI.setType("CHOICE");

    switch (response) {
      case "Team":
        this.UI.setDialogues(["PROFESSOR:", `Here is your team :`]);

        const team = this.world.getPlayer().getTeam();
        if (team.length > 0) {
          team.forEach((pkm: PkmModel) => {
            this.UI.setDialogues([pkm.display()], true);
          });
        } else {
          this.UI.setDialogues(["You have no pkm in your team!"], true);
        }

        this.UI.setChoices(["Heal", "Rename", "Release", "Back"]);

        // this.UI.setChoices(["Rename"]); // -- Todo: to delete

        this.nextAction = this.menu_team;
        break;

      case "PkmCenter":
        this.UI.setDialogues([
          "PROFESSOR:",
          `Welcome to the PkmCenter !`,
          "Sorry for the mess, we are still under construction ...",
          "Here you can Revive your team ! ",
          "Consult your log !",
          "And soon many more to come ",
        ]);
        this.UI.setChoices(["Revive", "Consult log", "Back"]);
        this.nextAction = this.menu_pkmCenter;
        break;

      case "Go forward":
        this.UI.setDialogues(["PROFESSOR:", `You have chosen to go forward !`]);
        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.menu_goForward;
        break;
      default:
        break;
    }
  }

  public menu_pkmCenter(response: string) {
    console.log("pokeCenterMenu", response);
    this.UI.setChoices(CONTINUE_CHOICE);
    this.nextAction = this.continueGame;

    switch (response) {
      case "Revive":
        this.UI.setDialogues([
          "PROFESSOR:",
          `You have chosen to revive your team !`,
        ]);

        break;
      case "Consult log":
        // Todo: Add a way to paginate the logs
        this.UI.setDialogues([`Your log :`]);
        this.world.getLogs().forEach((log) => {
          this.UI.setDialogues([`Day ${log.day} : ${log.message}`], true);
        });

        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        break;
      case "Back":
        this.continueGame();
        this.nextAction = this.continueGame;
        break;
      default:
        break;
    }
  }

  public menu_team(response: string) {
    const team = this.world.getPlayer().getTeam();

    switch (response) {
      case "Heal":
        this.UI.setDialogues([
          "PROFESSOR:",
          `You have chosen to heal your team !`,
        ]);
        // todo: add a way to heal the team with items de type "potion" , potion extend item, ...
        break;

      case "Rename":
        this.UI.setDialogues(["Which pkm would you like to rename ?"], true);
        this.UI.setChoices(team.map((pkm: PkmModel) => pkm.getName()));
        this.UI.setChoices(["Back"], true);

        this.UI.setType("CHOICE");
        this.nextAction = this.RenamePkm_A;
        break;

      case "Release":
        if (team.length <= 1) {
          this.UI.setDialogues([`You can't release your last pkm !`]);
          this.UI.setChoices(CONTINUE_CHOICE);
          this.UI.setType("PRESS");
          this.nextAction = this.menu_team;
        } else {
          this.UI.setDialogues(["Which pkm would you like to release ?"], true);
          this.UI.setChoices(team.map((pkm: PkmModel) => pkm.getName()));
          this.UI.setType("CHOICE");
          this.nextAction = this.ReleasePkm_A;
        }
        break;

      case "Back":
        this.continueGame("");
        this.nextAction = this.continueGame;
        break;
      default:
        this.continueGame("Team");
        break;
    }
  }

  public menu_goForward(response: string) {
    this.world.oneDayPasses();
    this.nextAction = this.continueGame;
    this.continueGame();
  }

  // Release Pkm
  public ReleasePkm_A(response: string) {
    this.RAM.pkmName = response;
    this.UI.setDialogues([
      `Are you sure you want to release ${this.RAM.pkmName} ?`,
    ]);
    this.UI.setChoices(BOOLEANS_CHOICE);
    this.UI.setType("CHOICE");
    this.nextAction = this.ReleasePkm_B;
  }
  public ReleasePkm_B(response: string) {
    switch (response) {
      case "Yes":
        this.UI.setDialogues([
          "PROFESSOR:",
          `You have chosen to release ${this.RAM.pkmName}!`,
        ]);

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

        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.menu_team;

        break;
      case "No":
        this.continueGame("Team");
        break;
      default:
        this.continueGame();
        break;
    }
  }

  // Rename Pkm
  public RenamePkm_A(response: string) {
    if (response === "Back") {
      this.continueGame("Team");
      return;
    }

    this.RAM.pkmName_old = response;
    this.UI.setDialogues([
      `What would you like to name ${this.RAM.pkmName_old} ?`,
    ]);
    this.UI.setChoices([]);
    this.UI.setType("ENTRY");
    this.nextAction = this.RenamePkm_B;
  }

  public RenamePkm_B(response: string) {
    const entry = new Entry(response);

    if (
      entry.inputLength({ min: 0, max: 10 }) &&
      !entry.HTMLSpecialChars_test()
    ) {
      this.RAM.pkmName_new = entry.content;
      this.UI.setDialogues([
        `Are you sure you want to rename ${this.RAM.pkmName_old} in ${this.RAM.pkmName_new} ?`,
      ]);
      this.UI.setChoices(BOOLEANS_CHOICE);
      this.UI.setType("CHOICE");
      this.nextAction = this.RenamePkm_C;
    } else {
      this.UI.setDialogues([
        "PROFESSOR:",
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }

  public RenamePkm_C(response: string) {
    switch (response) {
      case "Yes":
        this.UI.setDialogues([
          "PROFESSOR:",
          `You have chosen to rename ${this.RAM.pkmName_old}!`,
        ]);

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
              this.UI.setDialogues([
                "PROFESSOR:",
                "Something went wrong, we'll retry again later !",
              ]);
              this.UI.setChoices(CONTINUE_CHOICE);
              this.UI.setType("PRESS");
              this.nextAction = this.menu_team;
            }
          });

        this.world.addLog([
          {
            day: this.world.getDay(),
            message: `You have chosen to rename  ${this.RAM.pkmName_old} in ${this.RAM.pkmName_new}!`,
          },
        ]);

        delete this.RAM.pkmName_old;
        delete this.RAM.pkmName_new;

        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.menu_team;

        break;
      case "No":
        this.continueGame("Team");
        break;
      default:
        this.continueGame();
        break;
    }
  }

  // Tools
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

  // Save & Quit
  public async saveGame() {
    await this.inner_saveGame();
    this.UI.setDialogues(["You have saved the game !"]);
    this.UI.setChoices(CONTINUE_CHOICE);
    this.UI.setType("PRESS");
  }

  public async quitGame(response: string = "") {
    console.log("quitGame", response);
    this.UI.setChoices(CONTINUE_CHOICE);
    this.UI.setType("PRESS");
    switch (response) {
      case "Yes":
        this.UI.setDialogues(["You saved the game! Have a good day!"]);
        this.nextAction = this.reset;
        await this.inner_saveGame();
        break;
      case "No":
        this.UI.setDialogues(["You have chosen not to save !"]);
        this.nextAction = this.reset;
        break;
      case "Back":
        this.nextAction = this.continueGame;
        this.continueGame();
        break;
      default:
        this.UI.setDialogues([
          "If you quit now, your progress will be lost !",
          "Do you want to save before ?",
        ]);
        this.UI.setChoices(["Yes", "No", "Back"]);
        this.UI.setType("CHOICE");
        this.nextAction = this.quitGame;
    }
  }

  /* TOOL BOX*/
  public reset(exit: boolean = true) {
    let data;
    if (exit && this.RAM.lastSave) {
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

  private inner_saveGame_2() {}

  private async inner_saveGame() {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(true, this.inner_saveGame.bind(this));
      return;
    }

    try {
      this.isLoading.start();
      console.log("SAVE GAME BEFORZ", this.RAM);
      this.RAM.lastSave = JSON.stringify(this.extractData());
      console.log("SAVE GAME AFTER", this.RAM);

      const response = await fetch("/api/save/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.extractData()),
      });

      if (!response.ok) {
        throw new Error(`Failed to save game: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Game saved successfully:", data);
    } catch (error: any) {
      console.error("Error saving game:", error.message);
    } finally {
      this.isLoading.stop();
      console.log("Game save operation finished.");
    }
  }

  private async eraseGame() {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(true, this.eraseGame.bind(this));
      return;
    }

    try {
      this.isLoading.start();

      const response = await fetch("/api/save/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(new SaveModel()),
      });

      if (!response.ok) {
        throw new Error(`Failed to erase game: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Game erased successfully:", data);
    } catch (error: any) {
      console.error("Error erasing game:", error.message);
    } finally {
      this.isLoading.stop();
      console.log("Game erased operation finished.");
    }
  }
}
