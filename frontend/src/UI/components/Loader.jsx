import { useOrganization, useUser } from '@clerk/clerk-react'
import React from 'react'
import { BarLoader } from 'react-spinners';
import { useLoadingStore } from '../../store/zustandStore'

const Loader = () => {
    const { isLoaded: isOrgLoaded } = useOrganization();
    const { isLoaded } = useUser();
    const loading = useLoadingStore((state) => state.loading)
    if(!isLoaded || !isOrgLoaded || loading){
        return (
        <div className="w-full fixed top-[56px] left-0 z-40"> 
            <BarLoader className="mb-0" width="100%" color="#59fcf0" />
        </div>
        )
    }
    return null;
}

export default Loader