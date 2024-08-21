import React from "react";
import { useAppContext } from "@/hooks/useContext";
import { useStyleUI } from "@/hooks/useStyleUI";

export const GameInfo = () => {
  const { game, ui } = useAppContext();

  const style = useStyleUI(ui);

  return (
    <div className={`flex gap-2 ${style.header__p}`} >
      {game.data && (
        <>
          <p>
            {game.data.world.getDay() < 10
              ? "0" + game.data.world.getDay()
              : game.data.world.getDay()}
          </p>
          <p>-</p>
          <p>{game.data.world.getPlayer().getName()}</p>
          <p>-</p>
          <p>{game.data.world.getLocation()}</p>
        </>
      )}
    </div>
  );
};
