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

export const AppContext = createContext<any>({});

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [Game, setGame] = useState<GameController | null>(null);
  const [GameUI, setGameUI] = useState(new GameUIModel());
  const { data, loading, error } = useSave();

  const initializeGame = useCallback(() => {
    if (data !== null) {
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
      <main className="w-full h-full border-2 border-black rounded-md flex flex-col gap-4 p-6 justify-between font-jersey-25">
        {children}
      </main>
    </AppContext.Provider>
  );
};
