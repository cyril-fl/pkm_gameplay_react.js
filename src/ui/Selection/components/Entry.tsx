import { IoMdArrowRoundUp } from "react-icons/io";

export const EntryInput = () => {
  return (
    <div className=" fixed top-0 z-20 w-full h-full flex grow justify-center items-center gap-1 bg-zinc-500 bg-opacity-80">
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
    </div>
  );
};
