import { SignUp } from '@clerk/clerk-react'
import React from 'react'

const SignUpPage = () => {
  return (
    <div className='flex items-center justify-center min-h-screen py-6'>
        <SignUp path='/sign-up'
        routing='path' signInUrl='/sign-in'
        />

    </div>
  )
}

export default SignUpPage