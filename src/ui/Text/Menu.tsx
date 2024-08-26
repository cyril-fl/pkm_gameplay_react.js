import { DialoguesCard } from "@/ui/Text/components/Dialogues";
import { useMemo } from "react";
import { useAppContext } from "@/hooks/useContext";
import { UI_TYPE } from "@customs/Enum";
import { Arena } from "@/ui/Text/components/Arena";
import {Dex} from "@/ui/Text/components/Dex";
import {useStyleUI} from "@/hooks/useStyleUI";


export const TextMenu = () => {
  const { ui } = useAppContext();
    const style = useStyleUI(ui);

  const gameType = useMemo(() => {
    if (ui) {
      return ui.type;
    } else {
      return [""];
    }
  }, [ui, ui.type]);

  const renderMenu = useMemo(() => {
    switch (gameType) {
      case UI_TYPE.BATTLE:
        return <Arena />;
      case UI_TYPE.SCROLL:
        return <Dex />;
      default:
        return <DialoguesCard />;
    }
  }, [gameType]);

  return <article className={`${style.scroll} text-2xl overflow-scroll h-max`}>{renderMenu}</article>;
};
