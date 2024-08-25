import { useAppContext } from "@/hooks/useContext";
import { useMemo } from "react";

export const Arena = () => {
  const { ui } = useAppContext();

  const arena = useMemo(() => {
    if (ui) {
      return ui.arena;
    } else {
      return [""];
    }
  }, [ui, ui.arena]);

  // console.log('arena', arena)

  return (
    <ul className="h-full flex flex-col justify-between">
      <li className="arena__card text-right self-end">
        {arena && (
          <>
            <p>
              <span className="text-xl p-4">
                {arena.wildPkm.typesName.map((type: string, index: number) => (
                  <span key={index}> {type} </span>
                ))}
                LVL. {arena.wildPkm.lvl}
              </span>

              <span className="text-3xl">{arena.wildPkm.name}</span>
            </p>

            <p className="arena__card__progressBar">
              <span className=" grow bg-zinc-700 h-5 flex justify-end">
                <span
                  className="bg-zinc-200 h-full "
                  style={{
                    width: `${(arena.wildPkm.hp / arena.wildPkm.hpMax) * 100}%`,
                  }}
                ></span>
              </span>
              {arena.wildPkm.hp} / {arena.wildPkm.hpMax} : HP
            </p>
          </>
        )}
      </li>
      <li className="arena__card">
        {arena && (
          <>
            <p>
              <span className="text-3xl">{arena.playerPkm.name}</span>

              <span className="text-xl p-4">
                {" "}
                LVL. {arena.playerPkm.lvl}
                {arena.playerPkm.typesName.map(
                  (type: string, index: number) => (
                    <span key={index}> {type} </span>
                  ),
                )}
              </span>
            </p>

            <p className="arena__card__progressBar">
              HP : {arena.playerPkm.hp} / {arena.playerPkm.hpMax}
              <span className=" grow bg-zinc-700 h-5 flex">
                <span
                  className="bg-zinc-200 h-full"
                  style={{
                    width: `${(arena.playerPkm.hp / arena.playerPkm.hpMax) * 100}%`,
                  }}
                ></span>
              </span>
            </p>

            <p className="arena__card__progressBar">
              XP :
              <span className=" grow bg-zinc-700 h-2">
                <span
                  className="bg-zinc-200 h-full flex"
                  style={{
                    width: `${(arena.playerPkm.currentXP / arena.playerPkm.nextLvlXP) * 100}%`,
                  }}
                ></span>
              </span>
            </p>
          </>
        )}
      </li>
    </ul>
  );
};
