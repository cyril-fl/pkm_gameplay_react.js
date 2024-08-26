import { DialoguesCard } from "@/ui/Text/components/Dialogues";
import { useMemo } from "react";
import { ChoiceInput } from "@/ui/Selection/components/Choices";
import { EntryInput } from "@/ui/Selection/components/Entry";
import { PressInput } from "@/ui/Selection/components/Press";
import { useAppContext } from "@/hooks/useContext";
import { UI_TYPE } from "@customs/Enum";
import { Arena } from "@/ui/Text/components/Arena";
import {Dex} from "@/ui/Text/components/Dex";

export const TextMenu = () => {
  const { ui } = useAppContext();

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

  return <article className="text-2xl grow">{renderMenu}</article>;
};
