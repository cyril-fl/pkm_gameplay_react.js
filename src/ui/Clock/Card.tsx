import React, {useEffect, useMemo, useState} from "react";
import { useAppContext } from "@/hooks/useContext";

export const ClockCard = () => {
  const { game, save, ui } = useAppContext();

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

  const handleSave = () => {
    if (save) {
      save()
    }
  }

  const style = useMemo(() => {
    if (ui) {
      switch (ui.getStyle()) {
        case "DEFAULT":
          return { p: "" };
        case "START":
          return {
            button: "hidden",
          };
        case "ERROR":
          return { p: "" };
        default:
          return { p: "" };
      }
    } else {
      return { p: "" };
    }
  }, [ui.style]);

  console.log('UI',ui )

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
      {/*<div>{isLoading && <p>Loading...</p>}</div>*/}
      <button
          className={style.button}
      onClick={handleSave}
      >Save</button>
    </div>
  );
};
