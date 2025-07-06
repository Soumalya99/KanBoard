import { useAuth } from '@clerk/clerk-react';
import React from 'react'
import SkeletonLoader from './skeletonLoader';
import { Navigate } from 'react-router-dom';

export default function Protected({children, redirectsTo = '/sign-in/*'}){
    const { isLoaded, isSignedIn } = useAuth();

    if(!isLoaded){
        return <div className="flex flex-col items-center justify-center min-h-screen">
            <SkeletonLoader width="full" height="full" className="mb-4" />
            <SkeletonLoader width="full" height="full" />
        </div>
    }

    return isSignedIn ? children : <Navigate to={redirectsTo} replace/>
}