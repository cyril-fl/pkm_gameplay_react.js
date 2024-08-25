import { SaveModel } from "@models/Save";
import { WorldModel } from "@models/World";
import { GameUIModel } from "@models/GameUI";
import { Entry } from "@services//Entry";
import { PkmModel } from "@models/Pkm";
import { DexController } from "@controllers/Dex";
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
import { DexEntry } from "@models/Dex";
import { RAM } from "@services/RAM";
import {Simulate} from "react-dom/test-utils";
import keyDown = Simulate.keyDown;

// Todo: regarder la list des todo et voir ce qui peu être fait
// Todo : ajouter un PKDEX P e faire une vue special.
// Todo : bug dans les data des PKM je dois les mofier pour qu'il y a un max et un min

export class GameController {
  private RAM_OG: RAM_interface;
  private RAM: RAM;
  public UI: GameUIModel;
  public world: WorldModel;
  public nextAction: (...args: any) => void;
  private isLoading: Loading;

  constructor(data: SaveModel) {
    this.RAM_OG = {};
    this.RAM = new RAM();
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.start;
    this.isLoading = new Loading();
  }

  /* INIT PHASE*/
  private async start() {
    this.RAM.lastSave = this.extractData;

    const isPlayerTeamZero = this.world.player.team.length === 0;

    if (isPlayerTeamZero) {
      this.updateUI_NewGame();
      this.nextAction = this.playerInit;
      this.RAM.tuto_CG = true;
    } else {
      this.updateUI_LastSave();
      this.RAM.tuto_CG = false;
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
    if (!this.RAM.starter) return;

    const starterChoice = this.RAM.starterFind(response);

    if (starterChoice) {
      this.catchPkm(starterChoice);
      this.updateUI_StarterChoiceTrue(starterChoice.name);
      this.nextAction = this.starterRename;
      this.RAM.resetStarter();
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
    this.upToSix();
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
        const randomEvent = this.isRandomEvent(1, 1);
        this.updateUI_MainMenu_TravelEvent(randomEvent);
        this.nextAction = randomEvent ? this.travel_event : this.travel_nothing;
        if (!randomEvent) {
          return;
        }
        // todo Gerer le lvl autrement qu'en dure?
        this.RAM.pkm = new PkmModel(this.world.randomPkm, 5);

        break;
      default:
        break;
    }
  }

  private menu_pkmCenter(response: string) {
    this.nextAction = this.menu_pkmCenter;

    switch (response) {
      case UI_MENU.REVIVE:
        this.world.revive();
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
  // Release
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
    this.updateUI_TeamAction_Release_A();
    this.nextAction = this.releasePkm_B;
  }

  private releasePkm_B(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        const selected = this.world.player.team.find(
          (pkm: PkmModel) => pkm === this.RAM.pkm,
        );
        if (selected) {
          this.world.player.release(selected);
          this.world.addLog([
            `You have chosen to release ${this.RAM_OG.pkm?.name} !`,
          ]);
          this.updateUI_TeamAction_Release_B();
          this.nextAction = this.menu_team;
          this.RAM.pkm = new PkmModel();
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

  // Rename
  private renamePkm_A(response: string) {
    const temp_pkm = this.findPkm(response);

    if (response === UI_BUTTON.BACK) {
      this.menu_main(UI_MENU.TEAM);
      return;
    } else if (!temp_pkm) {
      this.warning(this.menu_team);
      return;
    }

    this.RAM.pkm = temp_pkm;

    this.updateUI_TeamAction_Rename_A();
    this.nextAction = this.renamePkm_B;
  }

  private renamePkm_B(response: string) {
    const entry = new Entry(response);

    if (response === UI_BUTTON.ABORT) {
      this.menu_main(UI_MENU.TEAM);
      return;
    } else if (this.isValidInput(entry)) {
      this.RAM.pkmNewName = entry.content;
      this.updateUI_TeamAction_Rename_B();
      this.nextAction = this.renamePkm_C;
    } else {
      this.updateUI_InvalidEntry();
    }
  }

  private renamePkm_C(response: string) {
    switch (response) {
      case UI_BUTTON.YES:
        this.updateUI_TeamAction_Rename_C();
        this.nextAction = this.menu_team;

        if (this.RAM.pkm && this.RAM.pkmNewName) {
          this.RAM.pkm.name = this.RAM.pkmNewName;
          this.world.addLog([
            `You have chosen to rename ${this.RAM.pkm.name} in ${this.RAM.pkmNewName}!`,
          ]);

          this.RAM.pkm = new PkmModel();
          this.RAM.pkmNewName = "";
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
        this.updateUI_TravelEventYes();
        this.nextAction = this.event_battle;
        break;

      case UI_BUTTON.NO:
        this.updateUI_TravelEventNO();
        this.nextAction = this.menu_main;
        break;

      default:
        this.updateUI_TravelEvent();
        this.nextAction = this.travel_event;
        break;
    }
  }

  private travel_nothing() {
    this.world.oneDayPasses();
    this.nextAction = this.menu_main;
    this.menu_main();
  }
  //_____ REFACTORED jusqu'ici

  // Battle
  private event_battle(response: string) {
    const playerChoice = this.findPkm(response);
    if (!playerChoice || !this.RAM.pkm) {
      this.warning(this.menu_main);
      return;
    } else if (playerChoice.hp <= 0) {
      this.updateUI_BattleEvent_checkChoice(playerChoice);
      return
    }

    this.UI.arena = {
      playerPkm: playerChoice,
      wildPkm: this.RAM.pkm,
    };

    this.updateUI__battleEvent_actionPhase();
    this.nextAction = this.battleChoicePhase;
  }

  private battleChoicePhase(response: string) {
    switch (response) {
        case UI_MENU.ATTACK:
            this.updateUI_battleEvent_battlePhase();
            this.nextAction = this.battlePhase;
            break;

        case UI_MENU.RUN:
            this.updateUI_TravelEventNO(); // ajouter un random factor Todo
            this.nextAction = this.menu_main;
            break;

        case UI_MENU.HEAL:
            this.updateUI_MenuTeam_Heal();
            this.nextAction = this.menu_team;
            break

        case UI_MENU.CATCH:
          alert("catch");
            // this.updateUI_BattleEvent_Catch();
            // this.nextAction = this.catchPkm;
            break


        default:
            this.warning(this.menu_main);
            break
    }




    // this.updateUI_battleEvent_battlePhase();

  }


  private battlePhase(response: string) {
    const randomIndex = Math.ceil(Math.random() * 4) - 1;
    const p_pkm = this.UI.arena.playerPkm;
    const p_move = p_pkm.calculator_atk(response);
    const w_pkm = this.UI.arena.wildPkm;
    const w_move = w_pkm.calculator_atk(w_pkm.moves[randomIndex].name);

    if (!p_move || !w_move) {
      this.warning(this.menu_main);
      return;
    }

    this.damageStep(p_pkm, w_pkm, p_move, w_move);
    return;
  }

  private damageStep(p_pkm: PkmModel, w_pkm: PkmModel, p_move: number, w_move: number) {
    let atker = p_pkm.spd > w_pkm.spd ? p_pkm : w_pkm;
    let dfser = p_pkm.spd < w_pkm.spd ? p_pkm : w_pkm;
    let a_move = p_pkm.spd > w_pkm.spd ? p_move : w_move;
    let d_move = p_pkm.spd < w_pkm.spd ? p_move : w_move;
/*
    this.damageStep_calculator(atker, dfser, a_move);
    this.damageStep_outcome(atker, dfser);

    this.damageStep_calculator(dfser, atker, d_move);
    this.damageStep_outcome(atker, dfser);
    */

    // Debug one way battle
    this.damageStep_calculator(p_pkm, w_pkm, p_move);
    this.damageStep_outcome(p_pkm, w_pkm);

  }

  private damageStep_calculator(
    attacker: PkmModel,
    defender: PkmModel,
    movePower: number,
  ) {
    const atkRation = attacker.atk / defender.dfs;
    const multiplier = 0.5;
    const baseDamage = movePower * atkRation * multiplier;
    console.log(baseDamage);
    defender.hp -= baseDamage;
  }

  private damageStep_outcome(attacker: PkmModel, defender: PkmModel) {
    if (attacker.hp <= 0 || defender.hp <= 0) {
      const KO = attacker.hp <= 0 ? attacker : defender;
      const isPlayerKO = this.UI.arena.playerPkm.hp <= 0;
      const log = isPlayerKO ? `${attacker.name} has been knocked out !` : `Congrats you win against wild ${defender.name} !`;
      this.world.addLog([log]);

      if (!isPlayerKO) {
        const prevLvl = attacker.lvl;
        attacker.gainXP(defender.experienceGiver);
        const newLvl = attacker.lvl;
        if (newLvl > prevLvl) {
          this.world.addLog([`${attacker.name} has leveled up to lvl ${newLvl} !`]);
        }
      }

      this.world.oneDayPasses();
      this.UI.resetArena();
      this.nextAction = this.menu_main;
      this.updateUI_BattleEvent_damageStepCCL(KO);
    }
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
    return
  }

  private findPkm(id: string): PkmModel | undefined {
    return this.world.player.team.find(
      (pkm: PkmModel) => pkm.id.toString() === id,
    );
  }

  private catchPkm(response: PkmModel) {
    this.world.player.catch(response);

    const dexEntry = this.world.dex.find(
      (pkm: DexEntry) => pkm.id === response.dexEntry,
    );

    if (dexEntry) {
      const log = dexEntry.isStarter
        ? `You have chosen ${dexEntry.name} as your first pkm !`
        : `You have caught ${dexEntry.name} !`;

      this.world.player.addEntry(dexEntry);
      this.world.addLog([log]);
    }
    return
  }

  private resetUI(quit: boolean = true) {
    let data;
    if (quit && this.RAM.lastSave) {
      data = this.RAM.lastSave;
      data.player_team = data.player_team.map((pkm: PkmModel) =>
        Object.assign(new PkmModel(), pkm),
      );
    } else {
      data = new SaveModel();
    }

    this.RAM = new RAM();
    this.UI = new GameUIModel();
    this.world = new WorldModel(data);
    this.nextAction = this.start;
    return
  }

  private warning(action: (...args: any) => void) {
    // todo refactor ui.update

    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: [`Something went wrong, please try again !`],
    });
    this.nextAction = action;
    return
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
    // todo refactor ui.update

    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE }, undefined, {
      content: ["You have saved the game !"],
    });
    return
  }

  public async game_quit(response: string = "") {
    // todo refactor ui.update
    this.UI.update(UI_TYPE.PRESS, { content: CHOICES.CONTINUE });
    this.nextAction = this.resetUI;

    // todo refactor ui.update
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
    return
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
    return
  }

  /* PERFORM*/
  private async perform_dexInit() {
    const dexController = DexController.getInstance();

    await this.perform_operation(
      async () => {
        const temp_dex = await dexController.getDex();
        if (temp_dex) {
          this.world.dex = temp_dex;
          this.RAM.starter = temp_dex;
        } else {
          this.warning(this.start);
        }
      },
      "Dex pkm successfully initialized.",
      "Error initializing dex",
    );
    return
  }

  private async perform_saveData() {
    this.RAM.lastSave = this.extractData; // peu être un souci ici 🤷 ?

    await this.perform_operation(
      () =>
        fetch("/api/save/update", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: this.RAM.lastSaveJSON,
        }),
      "Game saved successfully:",
      "Error saving game",
    );
    return
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
    return
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
      return
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

  /* TUTO */
  public tuto(
    dialogues: string[],
    pushDialogues: string[],
    ramAttribut: keyof RAM,
  ) {
    if (ramAttribut.includes("tuto") && this.RAM[ramAttribut]) {
      // @ts-ignore
      this.RAM[ramAttribut] = false;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
  }

  private updateUI_StarterChoiceFalse() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: this.RAM.starterChoices },
      newStyle: undefined,
      newDialogues: {
        content: this.RAM.starterDisplay,
        push: true,
      },
    };

    this.UI.update_V2(update);
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
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
    return;
  }

  private updateUI_MenuPkmcenter_Revive() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [UI_CHARACTER.NURSE, `Everyone is healed and ready to go ! Have a nice day.`,`Take care !`],
      },
    };

    this.UI.update_V2(update);
    return;
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
    return;
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
    return;
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
    return;
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
    return;
  }

  private updateUI_TeamAction_Release_A() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: undefined,
      newDialogues: {
        content: [`Are you sure you want to release ${this.RAM.pkm.name} ?`],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TeamAction_Release_B() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `You have chosen to release ${this.RAM.pkm.name}!`,
        ],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TeamAction_Rename_A() {
    const update = {
      newType: UI_TYPE.ENTRY,
      newChoice: undefined,
      newStyle: undefined,
      newDialogues: {
        content: [`What would you like to name ${this.RAM.pkm.name} ?`],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TeamAction_Rename_B() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: undefined,
      newDialogues: {
        content: [
          `Are you sure you want to rename ${this.RAM.pkm.name} in ${this.RAM.pkmNewName} ?`,
        ],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TeamAction_Rename_C() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [
          UI_CHARACTER.PROF,
          `You have chosen to rename ${this.RAM.pkm.name}!`,
        ],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TravelEvent() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: CHOICES.BOOLEANS },
      newStyle: undefined,
      newDialogues: {
        content: [
          `Wild ${this.RAM.pkm.name} appears ! Do you want to battle ?`,
        ],
        push: true,
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TravelEventYes() {
    const update = {
      newType: UI_TYPE.CHOICE,
      newChoice: { content: this.var_teamChoices() },
      newStyle: undefined,
      newDialogues: {
        content: [
          `Choose one of your pkm`,
          ...this.var_team<string>((pkm: PkmModel) => pkm.display()),
        ],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_TravelEventNO() {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [`You ran away ...`],
      },
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_BattleEvent_checkChoice(props: PkmModel) {
    this.UI.updateNotification([`${props.name} is K.O, choose another Pkm ?`,
    ]);
    return;
  }

  private updateUI__battleEvent_actionPhase() {
    const update = {
      newType: UI_TYPE.BATTLE,
      newChoice: { content: CHOICES.ACTION_BATTLE },
      newStyle: undefined,
      newDialogues:undefined,
    };

    this.UI.update_V2(update);
    return;
  }


  private updateUI_battleEvent_battlePhase() {
    const choices: Choice[] = this.UI.arena.playerPkm.movesPoolChoices;

    const update = {
      newType: undefined,
      newChoice: { content: choices },
      newStyle: undefined,
      newDialogues:undefined,
    };

    this.UI.update_V2(update);
    return;
  }

  private updateUI_BattleEvent_damageStepCCL(props: PkmModel) {
    const update = {
      newType: UI_TYPE.PRESS,
      newChoice: { content: CHOICES.CONTINUE },
      newStyle: undefined,
      newDialogues: {
        content: [`${props.name} is KO`],
      },
    };

    this.UI.update_V2(update);
    return;
  }


}
