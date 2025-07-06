
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import axios from 'axios'
import { useRef } from "react";
import { useCallback } from "react";
import { useUserStore } from "../store/zustandStore";

export const useUserController = () => {
    const {isLoaded, isSignedIn, user} = useUser();
    const setUser = useUserStore(state => state.setUser);
    const clearUser = useUserStore(state => state.clearUser);
    const zustandUser = useUserStore(state => state.user);
    const { getToken } = useAuth();
    const hasSynced = useRef(false);

    console.log('User object from Clerk:', user);

    const syncUser = useCallback(async() => {
        if(!isLoaded || !isSignedIn || !user || hasSynced.current){
            // do nothing just return and handle redirection to login in frontend
            if(!isSignedIn || !user){
                clearUser();
            }
            return;
        };

        //if user present skip sync
        if(zustandUser && zustandUser.id === user.id){
            return;
        };

        try {
            const token = await getToken();
            if(!token){
                console.warn('No clerk token found, abort sync');
                return;
            }
            // else sync user to backend
            const res = await axios.post(
                `http://localhost:4114/api/users/sync`,
                {
                    clerkUserId: user.id,
                    name: `${user.fullName}`,
                    email: user.primaryEmailAddress?.emailAddress,
                    imageUrl: user.imageUrl,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            //Updating the zustand user object
            if(res.data && res.data.user){
                console.log('User synced successfully:', res.data.user);
                setUser(res.data.user);
                hasSynced.current = true;
            }
        } catch (error) {
            console.error('Error syncing user :'. error);
        }
    }, [isLoaded, isSignedIn, user, zustandUser, getToken, setUser, clearUser]);
    

    useEffect(() => {
        syncUser();
    },[syncUser])
}