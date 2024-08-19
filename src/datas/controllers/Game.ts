import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@models/Entry";
import { PkmModel } from "@models/Pkm";
import { PkDexController } from "@controllers/PkmDex";
import { SaveController } from "@controllers/Save";


// todo: changer de dossier
export interface RAM {
  starterChoices?: PkmModel[];
}

const BOOLEANS_CHOICE = ["Yes", "No"];
const CONTINUE_CHOICE = ["*"];
const PROF = "PROFESSOR:";

export class GameController {
  private RAM: RAM;
  public UI: GameUIModel;
  public world: WorldModel;
  public nextAction: (...args: any) => void;

  constructor(data: SaveModel) {
    this.RAM = {};
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.startGame;
  }

  private reset() {
    const newSave = new SaveModel();
    this.RAM = {};
    this.UI = new GameUIModel();
    this.world = new WorldModel(newSave);
    this.nextAction = this.startGame;
  }

  private async startGame() {
    const player_team = this.world.getPlayer().getTeam();

    console.log("startGame --");
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
        'PROFESSOR:',
        'Welcome back !',
        'You have been gone for a while !',
        'Are you ready to continue your journey ?',
        '( If you want to start a new game, chose "No", your previous save will be erased )'
      ])
      this.nextAction = this.gameInit
    }
  }

  public async gameInit(response: string) {
    switch (response) {
      case 'Yes':
        this.continueGame(); // Assurez-vous que `continueGame` est une fonction asynchrone si elle utilise des promesses
        break;
      case 'No':
        await this.eraseGame(); // Assurez-vous que `eraseGame` est terminé avant de réinitialiser
        this.reset();
        await this.startGame(); // Recommencer le jeu après réinitialisation
        break;
      default:
        // Gérer d'autres cas si nécessaire
        break;
    }
  }


  private async starterInit() {
    const dexController = PkDexController.getInstance();
    try {
      const starterEntries = await dexController.getStarterEntries(); // Attendre que les données soient prêtes
      this.RAM.starterChoices = starterEntries;
      console.log(this.RAM);
    } catch (error) {
      console.error("Error initializing:", error);
    }
  }

  private playerInit(response: string) {
    console.log("playerInit", response);
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

        if (entry.inputLength({min: 0, max: 10})) {
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
        if (entry.inputLength({min: 0, max: 10})) {
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

    this.saveGame()
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
    console.log("continueGame response", response);
    this.nextAction = this.continueGame;

    switch (response) {
      case "Team":
        // this.UI.setDialogues([
        //   'PROFESSOR:',
        //   `Here is your team :`,
        // ])
        //
        // const player = this.world.getPlayer();
        // if (player) {
        //   player.getTeam().forEach((pkm: PkmModel) => {
        //     console.log('pkm', pkm)
        //     this.UI.pushDialogues([pkm.display()]);
        //   });
        // } else {
        //   this.UI.pushDialogues(['You have no pkm in your team!']);
        // }
        //
        // this.UI.setChoices(['Heal', 'Rename', 'Release'])
        // this.nextAction = this.teamMenu
        break;

      case "PkmCenter":
        //   this.UI.setDialogues([
        //     'PROFESSOR:',
        //     `Welcome to the PkmCenter !`,
        //     'Sorry for the mess, we are still under construction ...',
        //     'Here you can Revive your team ! ',
        //     'Consult your log !',
        //     'And soon many more to come ',
        //   ])
        //   this.UI.setChoices(['Revive', 'Consult log'])
        //   this.nextAction = this.pokeCenterMenu
        //   break;
        //
        //
        // case 'Go forward':
        //   this.UI.setDialogues([
        //     'PROFESSOR:',
        //     `You have chosen to go forward !`,
        //   ])
        //   this.UI.setChoices(CONTINUE_CHOICE)
        //   this.nextAction = this.foForward
        break;
      default:
        break;
    }
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

  private saveGame() {
    const fetchedData = async () => {
      try {
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
      }

    }
    fetchedData().catch((error) => {
      console.error("Error during fetchData execution:", error);
    });
  }

  private eraseGame() {
    // Effectuer la requête pour effacer le jeu
    fetch("/api/save/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
        .then((response) => {
          // Vérifier si la réponse est correcte
          if (!response.ok) {
            throw new Error(`Failed to erase game: ${response.statusText}`);
          }
          // Convertir la réponse en JSON
          return response.json();
        })
        .then((data) => {
          console.log("Game erased successfully:", data);
        })
        .catch((error) => {
          console.error("Error erasing game:", error.message);
        })
        .finally(() => {
          console.log("Game erased operation finished.");
        });
  }

}
