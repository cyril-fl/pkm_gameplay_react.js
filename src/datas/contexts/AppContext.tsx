import React, {
  createContext,
  ReactNode,
  useCallback,
  useMemo,
  useState,
  useEffect,
  FormEvent,
} from "react";
import { GameController } from "@controllers/Game";
import { GameUIModel } from "@models/GameUI";
import { useSave } from "@/hooks/useSave";
import { PkmModel } from "@models/Pkm";
import { MOCKUP_DEX_ENTRY } from "@/datas/mockup/dex_entry";
import {NotificationCard} from "@/ui/Selection/components/Notification";

export const AppContext = createContext<any>({});

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [Game, setGame] = useState<GameController | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [GameUI, setGameUI] = useState(new GameUIModel());
  const { data, loading, error } = useSave();

  const initializeGame = useCallback(() => {
    if (data !== null) {
      data.player_team = data.player_team.map((pkm: PkmModel) =>
        Object.assign(new PkmModel(), pkm),
      );
      const newGame = new GameController(data);
      setGame(newGame);
    }
  }, [data]);

  useEffect(() => {
    if (!loading && !error) {
      initializeGame();
    }
  }, [loading, error, initializeGame]);

  useEffect(() => {
    if (Game !== null) {
      setGameUI(Game.UI);
    }
  }, [Game]);

  const handleHeaderAction = async (type: string) => {
    if (Game) {
      console.log("handleHeaderAction", type);
      const updatedGame = new GameController(Game.extractData);

      switch (type) {
        case "SAVE":
          await Game.game_save();
          break;
        case "QUIT":
          await Game.game_quit();
          break;
        default:
          console.error("Unknown action type");
          break;
      }
      Object.assign(updatedGame, Game);
      setGame(updatedGame);
    } else {
      console.error("Something went wrong, Game is null");
    }
  };

  return (
    <AppContext.Provider
      value={{
        game: { data: Game, set: setGame },
        action: handleHeaderAction,
        ui: GameUI,
      }}
    >

      <NotificationCard />

      <main className="w-11/12 h-5/6 flex flex-col gap-4 justify-between font-jersey-25">
        {children}
      </main>
    </AppContext.Provider>
  );
};
