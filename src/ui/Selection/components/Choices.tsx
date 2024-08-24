import { RiArrowLeftSFill } from "react-icons/ri";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppContext, useFormContext } from "@/hooks/useContext";
import { Choice } from "@/customs/Interface";

const DEFAULT_CHOICE: Choice = { label: "Invalid", value: "null" };

export const ChoiceInput = () => {
  const { ui } = useAppContext();
  const { submit } = useFormContext();
  const [selected, setSelected] = useState<Choice>(DEFAULT_CHOICE);

  const choices = useMemo<Choice[]>(
    () => ui?.choices || [DEFAULT_CHOICE],
    [ui.choices],
  );

  useEffect(() => {
    if (choices.length > 0) {
      setSelected(choices[0]);
    }
  }, [choices]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>, choice: Choice) => {
      setSelected(choice);
      submit(e);
    },
    [submit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = choices.findIndex((choice) => choice === selected);
      let newIndex = currentIndex;

      switch (e.key) {
        case "ArrowRight":
          newIndex = currentIndex === choices.length - 1 ? 0 : currentIndex + 1;
          break;
        case "ArrowLeft":
          newIndex = currentIndex === 0 ? choices.length - 1 : currentIndex - 1;
          break;
        case "ArrowUp":
          newIndex =
            currentIndex <= 1
              ? choices.length - (choices.length % 2 === 0 ? 2 : 1)
              : currentIndex - 2;
          break;
        case "ArrowDown":
          newIndex = currentIndex >= choices.length - 2 ? 0 : currentIndex + 2;
          break;
        case "Enter":
          e.preventDefault();
          submit();
          return;
        default:
          return;
      }
      setSelected(choices[newIndex]);
    },
    [choices, selected, submit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown as any);
    return () => {
      window.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [handleKeyDown]);

  // Dynamic CCS class
  const choiceClass = useMemo(() => {
    switch (choices.length) {
      case 2:
      case 4:
        return "w-1/3";
      case 3:
      case 6:
        return "w-[24%]";
      case 5:
        return "w-1/2 last:w-full";
      default:
        return "basis-full";
    }
  }, [choices.length]);

  const selectedChoiceClass =
    "bg-GameBoy-black text-GameBoy-white hover:bg-zinc-700";
  const unselectedChoiceClass =
    "bg-GameBoy-white text-GameBoy-black hover:bg-zinc-100";

  return (
    <ul className="flex grow gap-4">
      {choices.map((choice: Choice, index: number) => (
        <li
          key={index}
          className={`${
            selected === choice ? selectedChoiceClass : unselectedChoiceClass
          } flex grow cursor-pointer items-center justify-between rounded-sm border-2 border-GameBoy-black px-4 py-2 transition duration-200 ease-in-out ${choiceClass} ${
            index === choices.length - 1 && choices.length === 5
              ? "basis-full"
              : ""
          }`}
          onClick={(e) => handleClick(e, choice)}
          onMouseEnter={() => setSelected(choice)}
        >
          {choice.label}
          <span className={`${selected === choice ? "" : "opacity-0"} text-xl`}>
            <RiArrowLeftSFill />
          </span>
        </li>
      ))}
      <input type="hidden" name="selected" value={selected.value} />
    </ul>
  );
};
