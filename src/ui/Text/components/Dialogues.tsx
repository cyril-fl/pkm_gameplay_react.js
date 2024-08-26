import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";
import { useStyleUI } from "@/hooks/useStyleUI";
import { NotificationCard } from "@/ui/Selection/components/Notification";

export const DialoguesCard = () => {
  const { ui } = useAppContext();
  const style = useStyleUI(ui);
  // console.log('UI DATA', ui)

  const dialogues = useMemo(() => {
    if (ui) {
      return ui.dialogues;
    } else {
      return [""];
    }
  }, [ui.dialogues]);

  return (
    <div
      className={`flex flex-col gap-4 ${style.dialogue__art}  grow `} //overflow-scroll
    >

      <div className={`${style.dialogue__art_bis}` }>
        {dialogues.map((text: string, index: number) => (
            <p key={index} className={`${style.dialogue__p} `}>
              {text}
            </p>
        ))}
      </div>

    </div>
  );
};
