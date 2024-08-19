import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@models/Entry";
import {PkmModel} from "@models/Pkm";
import {PkDexController} from "@controllers/PkmDex";

const BOOLEANS_CHOICE = ["Yes", "No"];
const CONTINUE_CHOICE = ["Continue"];
const PROF = "PROFESSOR:";

export class GameController {
  private RAM: any[];
  public UI: GameUIModel;
  public world: WorldModel;
  public nextAction: (...args: any) => void;

  constructor(data: SaveModel) {
    this.RAM = [];
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.startGame;
  }

  private reset() {
    const newSave = new SaveModel();
    this.RAM = [];
    this.UI = new GameUIModel();
    this.world = new WorldModel(newSave);
    this.nextAction = this.startGame;
  }

  public startGame() {
    const player_team = this.world.getPlayer().getTeam();

    if (player_team.length === 0) {
      this.UI.setChoices(BOOLEANS_CHOICE);
      this.UI.setType("CHOICE");
      this.UI.setDialogues([
        `${PROF}`,
        "You seem to be a new face around here !",
        "Welcome to the fantastic world of pkm,",
        "You are about to embark on a journey of a life time !",
        "You will face many challenges and make many choices !",
        "Are you ready ?",
      ]);
      this.nextAction = this.playerInit;
    }

    /*    else {
        this.UI.setDialogues([
          `${PROF}`,
          'Welcome back !',
          'You have been gone for a while !',
          'Are you ready to continue your journey ?',
          '( If you want to start a new game, chose "No", your previous save will be erased )'
        ])
    }*/
  }

  public playerInit(response: string) {
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
        this.UI.setChoices(["Any key to restart"]);
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
            `Ok ${response.trim()}, are you ready to pick your first Pkm ?`,
            "You will be given a choice of 3 pkm to choose from !",
          ]);
          this.nextAction = this.starterInit;

        } else {
          this.UI.setDialogues([
            "PROFESSOR:",
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )',
          ]);
        }
    }
  }
  public async starterInit() {
    console.log("starterInit");
    const dexController = PkDexController.getInstance();
    try {
      const dex = await dexController.getDex(); // Attendre que les données soient prêtes
      const starterEntries = dex.filter((pkm: any) => pkm.is_starter === true);
      const temp_starters = starterEntries.map((pkm: any) => new PkmModel(pkm));
      console.log(temp_starters); // log en 1
      this.RAM.push({ starterChoices: temp_starters });
      this.starterChoice("");
    } catch (error) {
      console.error('Error initializing:', error);
      // todo : remplacer par une fonction qui permet de continuer le jeu si erreur
    }
  }


  public starterChoice(response: string) {
    console.log('raaaaam',this.RAM)
    const starterPkm = this.RAM[1].starterChoices;

    switch (response) {
      case starterPkm[0].getData().name:
      case starterPkm[1].getData().name:
      case starterPkm[2].getData().name:
        const choice = starterPkm.find((pkm: any) => pkm.getData().name === response);

        this.RAM.pop()
        this.RAM.push({ chosenStarter: choice })

        this.UI.setDialogues([
          'PROFESSOR:',
          `How would you like to name your ${response} ?`,
        ])
        this.UI.setChoices(BOOLEANS_CHOICE)

        this.nextAction = this.starterRename

        break;

      default:
        starterPkm
            .forEach((pkm: any) => {
              const typeName = pkm.getData().type?.[0];
              // const content = ` the ${typeName || ''} pkm`;
              // this.UI.pushDialogues([pkm.display() + content])
              this.UI.pushDialogues([pkm.display()]);
            })

        this.UI.setChoices(starterPkm.map((pkm: PkmModel) =>  (pkm.getData().name)))
        this.UI.setType('CHOICE');
        break;
    }
  }

  public starterRename(response: string) {
    switch (response) {
      case 'Yes':
        this.gameUI.setDialogues([
          'PROFESSOR:',
          `Ok, what would you like to name your ${this.RAM[1].chosenStarter.getData().name} ?`,
        ])
        this.gameUI.setChoices([])
        this.gameUI.setType('INPUT')

        this.nextAction = this.starterRename
        break;

      case 'No':
        this.gameUI.setDialogues([
          'PROFESSOR:',
          'Okay, you have chosen not to name your pkm ,',
          'You could do that later !',
        ])
        this.gameUI.setChoices(['Continue'])
        this.gameUI.setType('CHOICE')

        // todo : remplacer par une fonction qui permet de continuer le jeu
        this.nextAction = this.setWorld

        break;

      default:
        response = this.htmlSpecialChars(response.trim());

        if (this.inputLength(response, { min: 0, max: 10 })) {
          const oldName = this.RAM[1].chosenStarter.getData().name

          this.RAM[1].chosenStarter.setName(response)
          this.gameUI.setDialogues([
            'PROFESSOR:',
            `Ok, you have chosen to name your ${oldName} in ${response} !`,
          ])
          this.gameUI.setChoices(['Continue'])
          this.gameUI.setType('CHOICE')

          // todo : remplacer par une fonction qui permet de continuer le jeu
          this.nextAction = this.setWorld

        } else {
          this.gameUI.setDialogues([
            'PROFESSOR:',
            `I didn't get that, please enter a valid name !`,
            'it should be between 1 and 10 characters long with no special chars ( &, <, >, ", ! )'
          ])
        }
        break
    }
  }


  extractData() {
    return {
      player_name: this.world.getPlayer().getName(),
      player_team: this.world.getPlayer().getTeam(),
      player_bags: this.world.getPlayer().getBag(),
      world_day: this.world.getDay(),
      world_location: this.world.getLocation(),
      world_logs: this.world.getLogs(),
    };
  }
}
