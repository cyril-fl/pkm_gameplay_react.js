import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";
import { PressInput } from "@/ui/Selection/components/Press";
import { ChoiceInput } from "@/ui/Selection/components/Choices";
import { EntryInput } from "@/ui/Selection/components/Entry";
import { UI_TYPE } from "@customs/Enum";

export const SelectMenu = () => {
  const { ui } = useAppContext();

  // console.log("UI", ui);
  const gameType = useMemo(() => {
    if (ui) {
      return ui.type;
    } else {
      return [""];
    }
  }, [ui.type]);

  const renderMenu = useMemo(() => {
    switch (gameType) {
      case UI_TYPE.CHOICE:
      case UI_TYPE.BATTLE:
        return <ChoiceInput />;
      case UI_TYPE.ENTRY:
        return <EntryInput />;
      case UI_TYPE.SCROLL:
      case UI_TYPE.PRESS:
        return <PressInput />;
      default:
        return <p>{gameType}</p>;
    }
  }, [gameType]);

  return (
    <article className="flex gap-4 grow justify-center items-center font-jersey-10 text-2xl">
      {renderMenu}
    </article>
  );
};
