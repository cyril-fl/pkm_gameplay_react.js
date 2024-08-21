import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";
import { useStyleUI } from "@/hooks/useStyleUI";

export const DialoguesCard = () => {
  const { ui } = useAppContext();
  const style = useStyleUI(ui);
  // console.log('UI DATA', ui)

  const dialogues = useMemo(() => {
    if (ui) {
      return ui.getDialogues();
    } else {
      return [""];
    }
  }, [ui.dialogues]);

  return (
    <article
      className={`flex flex-col gap-4 text-2xl ${style.dialogue__art}`}
      // className=""
    >
      {dialogues.map((text: string, index: number) => (
        <p key={index} className={`${style.dialogue__p} `}>
          {text}
        </p>
      ))}
    </article>
  );
};
