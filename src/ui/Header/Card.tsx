import React from "react";
import { Clock } from "@/ui/Header/components/Clock";
import { HeaderMenu } from "@/ui/Header/components/Menu";
import { GameInfo } from "@/ui/Header/components/GameInfo";

export const Header = () => (
  <div className="flex justify-between items-center basis-[4%]">
    <Clock />
    <GameInfo />
    <HeaderMenu />
  </div>
);
