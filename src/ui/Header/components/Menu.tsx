import React from "react";
import { useAppContext } from "@/hooks/useContext";
import { useStyleUI } from "@/hooks/useStyleUI";

export const HeaderMenu = () => {
  const { action, ui } = useAppContext();
  const style = useStyleUI(ui);

  const handleAction = (type: string) => {
    if (action) {
      action(type);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={() => handleAction("SAVE")}
        className={style.header__button}
      >
        SAVE
      </button>
      <button
        className={style.header__button}
        onClick={() => handleAction("QUIT")}
      >
        EXIT
      </button>
    </div>
  );
};
