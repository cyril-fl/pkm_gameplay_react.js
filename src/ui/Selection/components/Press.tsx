import { useCallback, useEffect } from "react";
import { useAppContext, useFormContext } from "@/hooks/useContext";
import { ChoiceInput } from "@/ui/Selection/components/Choices";

export const PressInput = () => {
  const { ui } = useAppContext();
  const { submit } = useFormContext();

  const handleKeyDown = useCallback(
    (e: any) => {
      // e.preventDefault();
      submit(e);
    },
    [submit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submit]);

  if (!ui) return null;

  const choices = ui.getChoices();

  return (
    <>
      {choices.map((text: string, index: number) => (
        <p key={index}>press {text}</p>
      ))}
    </>
  );
};
