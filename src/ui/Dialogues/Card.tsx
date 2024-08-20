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

  const style = useMemo(() => {
    if (ui) {
      switch (ui.getStyle()) {
        case "DEFAULT":
          return { article: "", p: "" };
        case "START":
          return {
            article: "justify-center items-center",
            p: "text-9xl font-jacquard-24",
          };
        case "ERROR":
          return { article: "bg-red-400", p: "text-5xl" };
        default:
          return { article: "bg-red-400 ", p: "text-5xl" };
      }
    } else {
      return { article: "bg-red-400 justify-center items-center", p: "text-5" };
    }
  }, [ui.style]);

  return (
    <article className={`flex grow flex-col gap-4 text-2xl ${style.article}`}>
      {dialogues.map((text: string, index: number) => (
        <p key={index} className={`${style.p}`}>
          {text}
        </p>
      ))}
    </article>
  );
};
