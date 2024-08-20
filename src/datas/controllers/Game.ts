// noinspection ExceptionCaughtLocallyJS

import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@services//Entry";
import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";
import { SaveController } from "@controllers/Save";
import { Loading } from "@services/Loading";

// todo: changer de dossier
export interface RAM {
  starterChoices?: PkmModel[];
  renamePkm?: string;
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


  // Initialisation Phase
  private reset() {
    const newSave = new SaveModel();
    this.RAM = {};
    this.UI = new GameUIModel();
    this.world = new WorldModel(newSave);
    this.nextAction = this.startGame;
  }

  private async startGame() {
    const player_team = this.world.getPlayer().getTeam();
    this.UI.setStyle("DEFAULT");
    this.UI.setChoices(BOOLEANS_CHOICE);
    this.UI.setType("CHOICE");

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
      this.UI.setDialogues([
        "PROFESSOR:",
        "Welcome back !",
        "You have been gone for a while !",
        "Are you ready to continue your journey ?",
        '( If you want to start a new game, chose "No", your previous save will be erased )',
      ]);
      this.nextAction = this.gameInit;
    }
  }

  public async gameInit(response: string) {
    switch (response) {
      case "Yes":
        this.nextAction = this.continueGame;
        this.continueGame(); // Assurez-vous que `continueGame` est une fonction asynchrone si elle utilise des promesses
        break;
      case "No":
        this.reset();
        await this.eraseGame(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
        await this.startGame(); // Recommencer le jeu après réinitialisation
        break;
      default:
        // Gérer d'autres cas si nécessaire
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
      const entries = await dexController.getStarterEntries();

      this.RAM.starterChoices = entries;
    } catch (error) {
      console.error("Error initializing:", error);
    } finally {
      this.isLoading.stop();
    }
  }

  private playerInit(response: string) {
    // console.log("playerInit", response);
    switch (response) {
      case "Yes":
        this.UI.setDialogues([
          "PROFESSOR:",
          "You have chosen to embark on the journey !",
          "You will be given a pkm to start your journey !",
          "But first tell me your name ?",
        ]);
        this.UI.setChoices([]);
        this.UI.setType("ENTRY");
        break;

      case "No":
        this.UI.setDialogues([
          "PROFESSOR:",
          "You have chosen not to embark on the journey !",
          "You will be returned to the main menu !",
        ]);
        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.reset;
        break;

      default:
        const entry = new Entry(response);
        entry.htmlSpecialChars();

        if (entry.inputLength({ min: 0, max: 10 })) {
          this.world.getPlayer().setName(entry.content);
          this.UI.setDialogues([
            "PROFESSOR:",
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
            "PROFESSOR:",
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
        "PROFESSOR:",
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
          "PROFESSOR:",
          `Ok, what would you like to name your ${thisStarter.getName()} ?`,
        ]);
        this.UI.setChoices([]);
        this.UI.setType("ENTRY");
        break;

      case "No":
        this.UI.setDialogues([
          "PROFESSOR:",
          "Okay, you have chosen not to name your pkm ,",
          "You could do that later !",
        ]);
        this.UI.setChoices(CONTINUE_CHOICE);
        this.UI.setType("PRESS");
        this.nextAction = this.setWorld;
        break;

      default:
        const entry = new Entry(response);
        entry.htmlSpecialChars();
        if (entry.inputLength({ min: 0, max: 10 })) {
          const oldName = thisStarter.getName();
          thisStarter.setName(entry.content);

          this.world.addLog([
            {
              day: this.world.getDay(),
              message: `You have chosen to rename ${oldName} as ${entry.content}.`,
            },
          ]);

          this.UI.setDialogues([
            "PROFESSOR:",
            `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
          ]);
          this.UI.setChoices(CONTINUE_CHOICE);
          this.UI.setType("PRESS");

          this.nextAction = this.setWorld;
        } else {
          this.UI.setDialogues([
            "PROFESSOR:",
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
        break;
    }
  }

  private setWorld() {
    this.UI.setDialogues([
      "PROFESSOR:",
      "You are now ready to start your journey !",
      "You will be given a pokedex to help you on your journey !",
    ]);
    this.UI.setChoices(CONTINUE_CHOICE);
    this.UI.setType("PRESS");

    this.saveGame();
    this.nextAction = this.continueGame;
  }

  // Game Main Phase
  public continueGame(response: string = "") {
    this.UI.setDialogues([
      `Welcome in ${this.world.getLocation()} !`,
      "Here are some basic :",
      "1) You can monitor your team",
      "2) You can go to the PkmCenter",
      "3) You can go forward and eventually Reach the next town or encounter some Wild Pkm",
    ]);
    this.UI.setChoices(["Team", "PkmCenter", "Go forward"]);
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

        this.UI.setChoices(["Heal", "Rename", "Release"]);
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
        this.UI.setChoices(["Revive", "Consult log"]);
        this.nextAction = this.menu_pkmCenter;
        break;

      case "Go forward":
        this.UI.setDialogues(["PROFESSOR:", `You have chosen to go forward !`]);
        this.UI.setChoices(CONTINUE_CHOICE);
        // this.nextAction = this.goForward
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
      default:
        break;
    }
  }


  public menu_team(response: string) {
    switch (response) {
      case "Heal":
        this.UI.setDialogues([
          "PROFESSOR:",
          `You have chosen to heal your team !`,
        ]);
        break;
      case "Rename":
        this.UI.setDialogues([
          "PROFESSOR:",
          `Which Pkm do you want to rename `,
        ]);
        this.UI.setChoices(
            this.world
                .getPlayer()
                .getTeam()
                .map((pkm: PkmModel) => pkm.getName()),
        );
        this.UI.setType("CHOICE");
        this.nextAction = (res) => {
          this.menu_team_sideEffect("RENAME", res);
          this.nextAction = this.pokemonRename
        };


        break;
      case "Release":
        const team = this.world.getPlayer().getTeam();
        if (team.length <= 1) {
          this.UI.setDialogues([`You can't release your last pkm !`]);
          this.UI.setChoices(CONTINUE_CHOICE);
          this.UI.setType("PRESS");
          this.nextAction = this.menu_team;
        } else {
          this.UI.setDialogues(["Which pkm would you like to release ?"], true);
          this.UI.setChoices(team.map((pkm: PkmModel) => pkm.getName()));
        }
        break;
      default:
        this.continueGame("Team");
        break;
    }
  }

  public menu_team_sideEffect(type: string = "", response: string = "") {
    switch (type) {
      case "RENAME":
        this.RAM.renamePkm = response;
        this.UI.setDialogues(['How would you like to rename ' + response]);
        this.UI.setType("ENTRY");
        this.nextAction = this.pokemonRename

        break;
      default:
        break;
    }
  }

  public pokemonRename(response: string = "") {
    this.UI.setChoices(CONTINUE_CHOICE);
    this.UI.setType("PRESS")
    alert('OK')


    // const entry = new Entry(response);
    // entry.htmlSpecialChars();
    // if (entry.inputLength({ min: 0, max: 10 })) {
    //   const oldName = this.RAM.renamePkm;
    //   this.world.getPlayer().getTeam().forEach((pkm: PkmModel) => {
    //     if (pkm.getName() === oldName) {
    //       pkm.setName(entry.content);
    //     }
    //   });
    //   this.world.addLog([
    //     {
    //       day: this.world.getDay(),
    //       message: `You have chosen to rename ${oldName} as ${entry.content}.`,
    //     },
    //   ]);
    //   this.UI.setDialogues([
    //     "PROFESSOR:",
    //     `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
    //   ]);
    //
    //   this.UI.setChoices(CONTINUE_CHOICE);
    //   this.UI.setType("PRESS");
    // }
  }


  // public menu_team(response: string) {
  //   switch (response) {
  //     case "Heal":
  //       this.UI.setDialogues([
  //         "PROFESSOR:",
  //         `You have chosen to heal your team !`,
  //       ]);
  //       // Methode de PkmMatser
  //       // go ver continue game en this Next
  //
  //       break;
  //     case "Rename":
  //       this.UI.setDialogues([
  //         "PROFESSOR:",
  //         `Which Pkm do you want to rename `,
  //       ]);
  //       // Todo: Add a way to add Pkm id to be sure to rename the right one
  //       this.UI.setChoices(
  //         this.world
  //           .getPlayer()
  //           .getTeam()
  //           .map((pkm: PkmModel) => pkm.getName()),
  //       );
  //       this.UI.setType("CHOICE");
  //
  //       this.nextAction = this.pokemonRename;
  //
  //       break;
  //     case "Release":
  //       const team = this.world.getPlayer().getTeam();
  //
  //       if (team.length <= 1) {
  //         this.UI.setDialogues([`You can't release your last pkm !`]);
  //         this.UI.setChoices(CONTINUE_CHOICE);
  //         this.UI.setType("PRESS");
  //         this.nextAction = this.menu_team;
  //       } else {
  //         this.UI.setDialogues(["Which pkm would you like to release ?"], true);
  //         // Methode de PkmMatser
  //
  //         this.UI.setChoices(team.map((pkm: PkmModel) => pkm.getName()));
  //
  //         // this.gameUI.setDialogues([
  //         //     'PROFESSOR:',
  //         //     `You have chosen to release a pkm !`,
  //         // ])
  //       }
  //       break;
  //     default:
  //       // alert("default");
  //       this.continueGame("Team");
  //
  //       break;
  //   }
  // }

  // public menu_team_sideEffect(type: string = "", response: string = "") {
  //   switch (type) {
  //     case "RENAME":
  //       this.RAM.renamePkm = response;
  //       this.UI.setDialogues(['How would you like to rename ' + response]);
  //       this.UI.setType("ENTRY");
  //       break
  //       case "RELEASE":
  //           break
  //       case "HEAL":
  //           break
  //     default:
  //           break
  //
  //   }
  // }

//   public pokemonRename(response: string = "") {
//     this.menu_team_sideEffect("RENAME", response);
//
//     const team = this.world.getPlayer().getTeam();
//     const pkm = team.find((pkm: PkmModel) => pkm.getName() === response);
//
//     if (pkm) {
//
//     } else {
//       const entry = new Entry(response);
//       entry.htmlSpecialChars();
//
//       if (entry.inputLength({min: 0, max: 10})) {
//
//         const oldName = this.RAM.renamePkm
// console.log(this.RAM)
//         console.log("oldName", oldName)
//         this.world.getPlayer().getTeam().forEach((pkm: PkmModel) => {
//           if (pkm.getName() === oldName) {
//             pkm.setName(entry.content);
//           }
//         })
//
//         this.world.addLog([
//           {
//             day: this.world.getDay(),
//             message: `You have chosen to rename ${oldName} as ${entry.content}.`,
//           },
//         ]);
//
//         this.UI.setDialogues([
//           "PROFESSOR:",
//           `Ok, you have chosen to name your ${oldName} in ${entry.content} !`,
//         ]);
//
//         this.UI.setChoices(CONTINUE_CHOICE);
//         this.UI.setType("PRESS")
//
//
//       }
//     }
//   }



/*  public pokemonRename(response: string) {
    console.log("pokemonRename", response);
    const team = this.world.getPlayer().getTeam();
    const pkm = team.find((pkm: PkmModel) => pkm.getName() === response);

    if (pkm) {
      this.UI.setDialogues([
        "PROFESSOR:",
        `What would you like to rename ${pkm.getName()} ?`,
      ]);
      this.UI.setChoices([]);
      this.UI.setType("ENTRY");
      this.nextAction = this.confirmAction;
    } else {
      this.UI.setDialogues([
        "PROFESSOR:",
        `I didn't get that, please enter a valid name !`,
        'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
      ]);
    }
  }*/



  // public confirmAction(response: string) {
  //
  // }

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

  // Save
  private async saveGame() {
    if (this.isLoading.state()) {
      this.isLoading.whileLoading(true, this.saveGame.bind(this));
      return;
    }

    try {
      this.isLoading.start();

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
