import { DialoguesCard } from "@/ui/Dialogues/Dialogues";
import { useMemo } from "react";
import { ChoiceInput } from "@/ui/Selection/components/Choices";
import { EntryInput } from "@/ui/Selection/components/Entry";
import { PressInput } from "@/ui/Selection/components/Press";
import { useAppContext } from "@/hooks/useContext";
import { UI_TYPE } from "@customs/Enum";

export const TextMenu = () => {
  const { ui } = useAppContext();

  const gameType = useMemo(() => {
    if (ui) {
      return ui.getType();
    } else {
      return [""];
    }
  }, [ui.type]);

  const renderMenu = useMemo(() => {
    switch (gameType) {
      case UI_TYPE.BATTLE:
        break;
      default:
        return <DialoguesCard />;
    }
  }, [gameType]);

  return <article className="text-2xl">{renderMenu}</article>;
};
