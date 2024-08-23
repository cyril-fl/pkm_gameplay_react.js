import React from "react";
import { useAppContext } from "@/hooks/useContext";
import { useStyleUI } from "@/hooks/useStyleUI";

export const GameInfo = () => {
  const { game, ui } = useAppContext();

  const style = useStyleUI(ui);

  return (
    <div className={`flex gap-2 ${style.header__p}`}>
      {game.data && (
        <>
          <p>
            {game.data.world.day < 10
              ? "0" + game.data.world.day
              : game.data.world.day}
          </p>
          <p>-</p>
          <p>{game.data.world.player.name}</p>
          <p>-</p>
          <p>{game.data.world.location}</p>
        </>
      )}
    </div>
  );
};
