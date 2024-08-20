import React, { useEffect, useMemo, useState } from "react";
import { useAppContext } from "@/hooks/useContext";

export const ClockCard = () => {
  const { game, action, ui } = useAppContext();

  const [isLoading, setIsLoading] = useState(null);
  const [time, setTime] = useState(new Date());

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];
  const monthName = monthNames[time.getMonth()];

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeUnit = (unit: number) => {
    return unit < 10 ? `0${unit}` : unit;
  };

  // Todo : ajouter le systeme de loading ou non

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (game.data) {
  //       console.log('Time:', game.data.isLoading.state())
  //       setIsLoading(game.data.isLoading.state())
  //     }
  //   }, 500)
  //   return () => clearInterval(interval)
  // }, [game.data])

  const handleAction = (type: string) => {
    if (action) {
      action(type);
    }
  };

  const style = useMemo(() => {
    if (ui) {
      switch (ui.getStyle()) {
        case "START":
          return {
            button: "hidden",
            p: "hidden",
          };
        case "ERROR":
          return { p: "" };
        case "INIT":
          return {
            p: "hidden",
          };
        default:
          return {
            button:
              " bg-GameBoy-black text-GameBoy-white hover:bg-GameBoy-white hover:text-GameBoy-black border-2 border-GameBoy-white hover:border-GameBoy-black active:border-zinc-700 active:bg-zinc-700 active:text-white rounded-sm px-2 py-0.5",
          };
      }
    } else {
      return { p: "" };
    }
  }, [ui.style]);

  // console.log("UI", ui);

  // Todo : decomposer le composant en plus petit composant pour que seul l'horloge clock

  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        <p>
          {time.getHours()} : {formatTimeUnit(time.getMinutes())}
        </p>
        <p>
          {time.getDate()} {monthName}
        </p>
      </div>

      <div>
        {
          // todo mettre un style pour ca
          //   mettre un style init
          game.data && (
            <p className={style.p}>
              {formatTimeUnit(game.data.world.getDay())} -{" "}
              {game.data.world.getPlayer().getName()} -{" "}
              {game.data.world.getLocation()}
            </p>
          )
        }
      </div>
      {/*<div>{isLoading && <p>Loading...</p>}</div>*/}
      <div className="flex gap-4">
        <button
          className={`${style.button}`}
          onClick={() => handleAction("SAVE")}
        >
          SAVE
        </button>
        <button className={style.button} onClick={() => handleAction("QUIT")}>
          EXIT
        </button>
      </div>
    </div>
  );
};
