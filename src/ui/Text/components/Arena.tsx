import {useAppContext} from "@/hooks/useContext";
import {useMemo} from "react";

export const Arena = () => {
    const { ui } = useAppContext();

    const arena = useMemo(() => {
        if (ui) {
            return ui.arena;
        } else {
            return [""];
        }
    }, [ui, ui.arena]);

    console.log('arena', arena)

    return (
        <ul className='h-full flex flex-col justify-between'>
            <li className='self-end w-2xl'>
                {
                    arena && (
                        <div className='text-right bg-GameBoy-black text-GameBoy-white m-4 p-6 w-2xl rounded border-4 border-GameBoy-white outline outline-GameBoy-black'>
                            <p>{arena.wildPkm.typesName.map(
                                (type: string, index: number) => (
                                    <span key={index}> {type} </span>
                                    )
                                )}

                                LVL. {arena.wildPkm.lvl} {arena.wildPkm.name}</p>
                            <p>{arena.wildPkm.hp} / {arena.wildPkm.hpMax} : HP</p>
                            <p>{arena.wildPkm.currentXP} / {arena.wildPkm.nextLvlXP} : XP</p>
                        </div>
                    )
                }
            </li>
            <li className='w-2xl'>
                {
                    arena && (
                        <div className='bg-GameBoy-black text-GameBoy-white m-4 p-6 w-2xl rounded border-4 border-GameBoy-white outline outline-GameBoy-black'>
                            <p>{arena.playerPkm.name} LVL. {arena.playerPkm.lvl}
                                {arena.playerPkm.typesName.map(
                                    (type: string, index: number) => (
                                        <span key={index}> {type} </span>
                                    )
                                )} </p>
                            <p>HP : {arena.playerPkm.hp} / {arena.playerPkm.hpMax}</p>
                            <p>XP : {arena.playerPkm.currentXP} / {arena.playerPkm.nextLvlXP}</p>


                        </div>
                    )
                }
            </li>
        </ul>
    )
}