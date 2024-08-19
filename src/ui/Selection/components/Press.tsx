import { useCallback, useEffect, useMemo } from "react";
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

  const display = (text: string) => {
    switch (text) {
      case "*":
        return "any key";
      default:
        return text;
    }
  };

  const choices = useMemo(() => {
    if (ui.choices) {
      return ui
        .getChoices()
        .map((text: string, index: number) => (
          <span key={index}>{display(text)}</span>
        ));
    }
    return null;
  }, [ui.choices]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [submit]);

  return <p className=""> Press {choices} to continue</p>;
};
