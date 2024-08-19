import { IoMdArrowRoundUp } from "react-icons/io";

export const EntryInput = () => {
  return (
    <div className="flex grow justify-center gap-3">
      <input
        type="text"
        name="inputValue"
        className="basis-3/5 rounded-3xl bg-zinc-800 px-3 py-1 text-emerald-300 focus:outline-none"
        autoFocus
      />
      <button
        type="submit"
        className="flex h-fit w-fit items-center justify-center rounded-full bg-zinc-800 p-2 text-lg text-emerald-300 transition duration-200 ease-in-out hover:bg-zinc-200 hover:text-emerald-800 active:bg-zinc-600 active:text-emerald-100"
      >
        <IoMdArrowRoundUp />
      </button>
    </div>
  );
};
