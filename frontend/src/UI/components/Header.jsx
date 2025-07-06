import React, { useState } from 'react'
import { PiKanbanFill } from "react-icons/pi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { RiArrowDropUpLine } from "react-icons/ri";
import { 
    SignedIn, 
    SignedOut, 
    SignInButton, 
    UserButton 
} from '@clerk/clerk-react';
import {Link, useNavigate} from 'react-router-dom'
import UserMenu from './UserMenu';
import Loader from './Loader';

function Header() {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const navigate = useNavigate();
  return (
    <div className='p-3 fixed left-0 right-0 bg-zinc-400 text-black z-50 '>
        <header className='flex items-center justify-between'>
            {/* Left Side */}
            <div className='flex items-center space-x-2 md:space-x-3'>
                <PiKanbanFill className='h-8 w-8 items-center' />
                <h3 className='truncate max-w-[170px] ml-1 text-black font-bold font-sans'>KanBoard</h3>
                <span onClick={() => setIsOpenDropdown(prev => !prev)} className='cursor-pointer'>
                    {!!isOpenDropdown ? 
                    <RiArrowDropUpLine 
                        className='w-6 h-6 ml-1'
                        id='dropdown'
                    /> : 
                    <RiArrowDropDownLine 
                        className='w-6 h-6 ml-1' 
                        id='dropdown'
                    />} 
                </span>
            </div>

            {/* Right Side */}
            <div className='flex items-center space-x-2 md:space-x-4 mr-4'>
                <Link to='/project'>
                    <button className='px-3 py-1 shadow-md rounded-lg bg-red-700 text-white text-sm font-sans cursor-pointer'>
                    <span>Create Project</span>
                    </button>
                    
                </Link>
                <SignedOut>
                    <button className='text-sm font-sans ml-1 px-4 py-1 rounded-lg bg-linear-to-r from-cyan-700 via-blue-500 to-indigo-700 text-white  transition'
                        onClick={() => navigate('/sign-in')}
                    > Sign In </button>                  
                </SignedOut>
                <SignedIn>
                    <UserMenu />
                </SignedIn>
            </div>
        </header>
    </div>
  )
}

export default Header