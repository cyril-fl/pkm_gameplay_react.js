import { IoMdArrowRoundUp, IoMdExit } from "react-icons/io";
import { useAppContext, useFormContext } from "@/hooks/useContext";
import { useStyleUI } from "@/hooks/useStyleUI";

export const EntryInput = () => {
  const { ui } = useAppContext();
  const style = useStyleUI(ui);
  const { submit } = useFormContext();

  const handleAbortAction = () => {
    ui.type = "ABORT";
    submit();
  };

  return (
    <div className="fixed top-0 z-10 w-full h-full flex grow flex-col items-center bg-zinc-500 bg-opacity-80 backdrop-filter backdrop-blur-sm">
      <div className="flex flex-row gap-1 grow justify-self-center items-center">
        <input
          type="text"
          name="inputValue"
          className="basis-1/5 max-h-32 rounded-md bg-zinc-800 px-3 py-1 text-GameBoy-white focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          className="flex max-h-32 w-fit items-center justify-center rounded-md bg-zinc-800 p-2 text-lg text-GameBoy-white transition duration-200 ease-in-out hover:bg-zinc-200 hover:text-GameBoy-white active:bg-zinc-600 active:text-GameBoy-white"
        >
          <IoMdArrowRoundUp />
        </button>
        <button
          // type="submit"
          onClick={handleAbortAction}
          className={`${style.close_button} absolute top-5 right-5 flex max-h-32 w-fit items-center justify-center rounded-md bg-zinc-800 p-2 text-lg text-GameBoy-white transition duration-200 ease-in-out hover:bg-zinc-200 hover:text-GameBoy-white active:bg-zinc-600 active:text-GameBoy-white`}
        >
          <IoMdExit />
        </button>
      </div>
    </div>
  );
};
