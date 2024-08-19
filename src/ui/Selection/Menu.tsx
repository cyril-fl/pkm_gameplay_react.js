import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";
import { PressInput } from "@/ui/Selection/components/Press";
import { ChoiceInput } from "@/ui/Selection/components/Choices";
import { EntryInput } from "@/ui/Selection/components/Entry";

export const SelectMenu = () => {
  const { ui } = useAppContext();

  // console.log("UI", ui);
  const gameType = useMemo(() => {
    if (ui) {
      return ui.getType();
    } else {
      return [""];
    }
  }, [ui.type]);

  const renderMenu = useMemo(() => {
    switch (gameType) {
      case "CHOICE":
        return <ChoiceInput />;
      case "ENTRY":
        return <EntryInput />;
      case "PRESS":
        return <PressInput />;
      default:
        return <p>{gameType}</p>;
    }
  }, [gameType]);

  return (
    <article className="flex gap-4 grow">
      {gameType}
      {renderMenu}
    </article>
  );
};
