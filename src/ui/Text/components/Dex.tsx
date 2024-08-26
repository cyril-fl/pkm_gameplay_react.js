import { useAppContext } from "@/hooks/useContext";
import { useStyleUI } from "@/hooks/useStyleUI";
import { useMemo } from "react";
import {DexEntry} from "@models/Dex";
import {type} from "@customs/Interface";

export const Dex = () => {
  const { data, ui } = useAppContext();
  const style = useStyleUI(ui);
  // console.log('UI DATA', ui)

  const dialogues = useMemo(() => {
    if (ui) {
      return ui.dialogues;
    } else {
      return [""];
    }
  }, [ui.dialogues]);

  const dexEntries = useMemo(() => {
    if (ui) {
      return ui.dex;
    } else {
      return [];
    }
  }, [ui.dex]);


  console.log(dexEntries)

  return (
      <>
    <div
      className={`flex flex-col gap-4 ${style.dialogue__art} mb-4`}
      // className=""
    >
      {dialogues.map((text: string, index: number) => (
        <p key={index} className={`${style.dialogue__p} `}>
          {text}
        </p>
      ))}
    </div>

    <div className='flex flex-col gap-4'>
      {
          dexEntries && dexEntries.map((entry: DexEntry, index: number) => (
              <div key={index} className='bg-GameBoy-black p-1 rounded text-GameBoy-white font-jersey-15 text-xl border-1 border-GameBoy-black bg-GameBoy-black'>
                <div className='border-4 border-GameBoy-white rounded-md p-4'>
                  <div className='flex gap-4 items-baseline justify-between'>
                    <p className='text-2xl '>{entry.name}</p>
                    <p className='flex gap-4 text-lg self-end '>
                      {entry.types.map((type: type, index: number) => (
                          <span key={index}
                                className='px-3 py-0.5 rounded-md bg-GameBoy-white text-GameBoy-black'> {type.name} </span>
                      ))}
                    </p>
                  </div>
                  <p className='italic'>
                    {entry.description}
                  </p>
                </div>
              </div>
          ))
      }
    </div>
      </>
  );
};
