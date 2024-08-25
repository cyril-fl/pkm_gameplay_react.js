import { useMemo } from "react";
import { GameUIModel } from "@models/GameUI";
import { UI_STYLE } from "@customs/Enum";

export const useStyleUI = (ref: GameUIModel | null) => {
  const DEFAULT_STYLE = {
    dialogue__art: "grow",
    dialogue__p: "",
    header__button:
      "bg-GameBoy-black text-GameBoy-white hover:bg-GameBoy-white hover:text-GameBoy-black border-2 border-GameBoy-white hover:border-GameBoy-black active:border-zinc-700 active:bg-zinc-700 active:text-white rounded-sm px-2 py-0.5",
    header__p: "",
    close_button: "",
    notif: "w-full absolute m-10 flex items-center justify-center bg-zinc-600",
  };

  const memorized_style = useMemo(() => {
    if (!ref) return DEFAULT_STYLE;

    let style = { ...DEFAULT_STYLE };

    switch (ref.style) {
      case UI_STYLE.START:
        style = {
          ...style,
          dialogue__art: "justify-center items-center grow",
          dialogue__p: "text-9xl font-jacquard-24",
          header__button: "hidden",
          header__p: "hidden",
          close_button: "hidden",
        };
        break;
      case UI_STYLE.SHOW_LAST_SAVE:
        style = {
          ...style,
          dialogue__art:
            "border-4 border-GameBoy-white bg-GameBoy-black p-4 text-GameBoy-white rounded-md outline outline-GameBoy-black",
          header__button: "hidden",
          header__p: "hidden",
        };
        break;
      case UI_STYLE.PROF_GREETINGS:
        style = {
          ...style,
          header__button: "hidden",
          header__p: "hidden",
          close_button: "hidden",
        };
        break;
      case UI_STYLE.BATTLE_CHOICE:
        style = {
          ...style,
          dialogue__art: "bg-GameBoy-black",
          dialogue__p: "text-5xl",
        };
        break;
      case UI_STYLE.ERROR:
        style = {
          ...style,
          notif: "text-5xl",
        };
        break;
      default:
        break;
    }

    return style;
  }, [ref, ref?.style]);

  return memorized_style;
};
