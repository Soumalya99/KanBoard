import React from 'react'
import Header from './Header'
import Footer from './Footer'
import Loader from './Loader'
// import { useUser } from '@clerk/clerk-react'
import useUserController  from '../../utils/User_Controller'
// import SkeletonLoader from './skeletonLoader'
// import { useNavigate } from 'react-router-dom'

function Layout({children}) {
  // const { isLoaded, isSignedIn, user } = useUser();
  // const navigate = useNavigate();
  useUserController();

  return (
    <div className=' flex w-full flex-col min-h-screen '>
      <Header />
      <Loader />
      <main className='flex-1 container mx-auto pt-14'>
        {children}
      </main>
      <Footer />
    </div>
  )
};

export default Layout