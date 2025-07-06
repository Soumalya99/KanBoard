import React from 'react'
import { SignIn } from '@clerk/clerk-react'

const SignInPage = () => {
  return (
    <div className='flex items-center justify-center min-h-screen py-6'>
        <SignIn path='/sign-in'
        routing='path' signUpUrl='/sign-up'
        />
    </div>
  )
}

export default SignInPage