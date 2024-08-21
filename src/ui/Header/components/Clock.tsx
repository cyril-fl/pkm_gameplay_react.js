import React, { useEffect, useState } from "react";

export const Clock = () => {
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

  return (
    <div className="flex gap-4">
      <p>
        {time.getHours()} : {formatTimeUnit(time.getMinutes())}
      </p>
      <p>
        {time.getDate()} {monthName}
      </p>
    </div>
  );
};
