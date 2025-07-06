import React from 'react'

function Footer() {
  return (
    <div className='container mx-auto py-4 px-4 bg-gray-800 text-white text-center'>
        <p className='text-sm mb-2'>
            Made with ❤️ by Soumalya
        </p>
        <p className='text-xs '>
            &copy; {new Date().getFullYear()} KanBoard. All rights reserved.
        </p>
    </div>
  )
}

export default Footer