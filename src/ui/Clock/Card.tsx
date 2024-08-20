import React, { useEffect, useState } from "react";
import { useAppContext } from "@/hooks/useContext";

export const ClockCard = () => {
  const { game } = useAppContext();

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
      <div>{isLoading && <p>Loading...</p>}</div>
    </div>
  );
};
