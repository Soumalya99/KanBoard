import { useLoadingStore } from "../store/zustandStore";

import { useState } from "react";
import { useFormState } from "react-hook-form";
import { toast } from "react-hot-toast";
import { optional } from "zod";

/**
 * Accepts a cb and then set the response data to all the form fields
 * @param {*} cb 
 */
export const useFetch = (cb) => {
    console.log("CB inside useFetch", cb);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    const setGlobLoading = useLoadingStore.getState().setLoading

    //FetchData function to fetch data
    const fetchDataFn = async(...optnlArgs) => {
        console.log('Optional Args ......', optnlArgs);
        setLoading(true);
        setGlobLoading(true);
        setError(null);
        try {
            /** if optional args are provided
             * cb(...optnlArgs) is called and response is set to data
             */
           const response = await cb(...optnlArgs);
           setData(response); 
        //    toast.success("Project Created Successfully.")
           setError(null);
        } catch (error) {
            setError(error);
            console.error("useFetch error:", error);
            toast.error(error?.response?.data?.error || error.message || "Something went wrong");
        }finally{
            setLoading(false);
            setGlobLoading(false);
        }
    }

    return { data, loading, error, setData, fetchDataFn };
}