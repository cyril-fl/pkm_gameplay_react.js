import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";

export const DialoguesCard = () => {
  const { ui } = useAppContext();

  // console.log('UI DATA', ui)

  const dialogues = useMemo(() => {
    if (ui) {
      return ui.getDialogues();
    } else {
      return [""];
    }
  }, [ui.dialogues]);

  return (
    <article className="flex grow flex-col gap-4">
      {dialogues.map((text: string, index: number) => (
        <p key={index}>{text}</p>
      ))}
    </article>
  );
};
