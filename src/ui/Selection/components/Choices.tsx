import { RiArrowLeftSFill } from "react-icons/ri";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppContext, useFormContext } from "@/hooks/useContext";

const DEFAULT_CHOICE = "Invalid";

export const ChoiceInput = () => {
  const { ui } = useAppContext();
  const { submit } = useFormContext();

  const choices = useMemo(
    () => ui?.getChoices() || [DEFAULT_CHOICE],
    [ui.choices],
  );

  const [selected, setSelected] = useState<string>(DEFAULT_CHOICE);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLLIElement>, choice: string) => {
      // e.preventDefault();
      setSelected(choice);
      submit(e);
    },
    [submit],
  );

  useEffect(() => {
    if (choices.length > 0) {
      setSelected(choices[0]);
    }
  }, [choices]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const currentIndex = choices.findIndex(
        (choice: string) => choice === selected,
      );
      let newIndex = currentIndex;

      switch (event.key) {
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
          event.preventDefault();
          newIndex = 0;
          submit();
          break;
        default:
          return;
      }
      setSelected(choices[newIndex]);
    },
    [choices, selected, submit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const choiceClass = useMemo(() => {
    if ([2, 4].includes(choices.length)) return "w-1/3";
    if ([3, 6].includes(choices.length)) return "w-[24%]";
    if (choices.length === 5) return "w-1/2 last:w-full";
    return "basis-full";
  }, [choices.length]);

  console.log("selected", selected);

    const selectedChoiceClass = "bg-GameBoy-black text-GameBoy-white hover:bg-zinc-700";
    const unselectedChoiceClass = "bg-GameBoy-white text-GameBoy-black hover:bg-zinc-100";

  return (
    <ul className="flex grow gap-4">
      {choices.map((choice: string, index: number) => (
        <li
          key={index}
          className={` ${selected === choice ? selectedChoiceClass : unselectedChoiceClass} flex grow cursor-pointer items-center justify-between rounded-sm border-2 border-GameBoy-black px-4 py-2  transition duration-200 ease-in-out  ${choiceClass} ${index === choices.length - 1 && choices.length === 5 ? "basis-full" : ""}`}
          onClick={(e) => handleClick(e, choice)}
        >
          {choice}
          <span className={`${selected === choice ? "" : "opacity-0"} text-xl`}>
            <RiArrowLeftSFill />
          </span>
        </li>
      ))}
      <input type="hidden" name="selected" value={String(selected)} />
    </ul>
  );
};
