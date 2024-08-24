"use client";
import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  FormEvent,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useAppContext } from "@/hooks/useContext";
import { GameController } from "@controllers/Game";
import { FormContextType } from "@customs/Interface";
import { UI_BUTTON, UI_MENU } from "@customs/Enum";

export const FormContext = createContext<FormContextType | null>(null);

export const FormProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { game, ui } = useAppContext();

  const formRef = useRef<HTMLFormElement | null>(null);

  const saveData = useMemo(() => {
    if (game.data) {
      return game.data.extractData;
    }
    return null;
  }, [game.data]);

  const nextAction = useCallback(
    (...args: any) => {
      if (game.data) {
        // console.log('BEFORE ACTION', game.data.nextAction, args)
        game.data.nextAction(...args);
        // console.log('AFTER ACTION', game.data.nextAction)
        return game.data;
      }
    },
    [game.data],
  );

  const handleSubmit = (e: any) => {
    e?.preventDefault();
    const updatedGame = new GameController(saveData);
    // console.log(formRef.current);
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      formRef.current.reset();

      let temp;

      switch (ui.getType()) {
        case "CHOICE":
          const selectedChoice = formData.get("selected");
          temp = nextAction(selectedChoice);
          break;
        case "ENTRY":
          const entryValue = formData.get("inputValue");
          temp = nextAction(entryValue);
          break;
        case "PRESS":
          temp = nextAction();
          break;
        case "ABORT":
          temp = nextAction(UI_BUTTON.ABORT);
          break;
        default:
          break;
      }
      Object.assign(updatedGame, temp);
      game.set(updatedGame);
    }
  };

  return (
    <FormContext.Provider
      value={{
        ref: formRef,
        submit: handleSubmit,
      }}
    >
      <form
        className=" flex w-full h-fit gap-5 justify-center items-center"
        ref={formRef}
        onSubmit={handleSubmit}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};
