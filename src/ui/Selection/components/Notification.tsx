import React, {useEffect, useMemo} from 'react';
import {useAppContext} from '@/hooks/useContext';
import {Choice} from "@customs/Interface";

export const NotificationCard = () => {
    const {ui} = useAppContext();
    console.log('NotificationCard', ui);
    const [isNotified, setIsNotified] = React.useState<boolean>(false);

    const notification = useMemo<string[]>(
        () => ui?.getNotification(),
        [ui.notification]
    );

    useEffect(() => {
        if (notification.length > 0) {
            setIsNotified(true);
            setTimeout(() => {
                setIsNotified(false);
            }, 4000);
        }
    }, [notification]);

    return isNotified && (
        <div className='w-full absolute m-10 flex items-center justify-center'>
            <div className='bg-GameBoy-black w-fit max-w-[33%] text-center p-4 rounded-lg text-GameBoy-white  bg-opacity-60 font-jersey-10 text-xl animate-slideAndFade'>
                {notification.map((note, index) => (
                    <div key={index}>
                        {note}
                    </div>
                ))}
            </div>
        </div>
    )
}