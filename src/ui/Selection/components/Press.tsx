import { useCallback, useEffect, useMemo } from "react";
import { useAppContext, useFormContext } from "@/hooks/useContext";
import { ChoiceInput } from "@/ui/Selection/components/Choices";
import { Choice } from "@customs/Interface";

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

  const display = (text: string) => {
    switch (text) {
      case "*":
        return "any key";
      default:
        return text;
    }
  };

  const choices = useMemo(
    () =>
      ui?.choices.map((text: Choice, index: number) => (
        <span key={index}>{display(text.label)}</span>
      )),
    [ui.choices],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submit]);

  return (
    <p className="cursor-pointer" onClick={handleKeyDown}>
      {" "}
      Press {choices} to continue
    </p>
  );
};
