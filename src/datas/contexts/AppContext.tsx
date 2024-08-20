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
      // Type asign
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

  return (
    <AppContext.Provider
      value={{
        game: { data: Game, set: setGame },
        ui: GameUI,
      }}
    >
      <main className="w-full h-full flex flex-col gap-4 justify-between font-jersey-25">
        {children}
      </main>
    </AppContext.Provider>
  );
};
