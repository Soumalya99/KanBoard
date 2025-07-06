import { UserButton } from '@clerk/clerk-react'
import { GoOrganization } from "react-icons/go";
import { RiChatAiLine } from "react-icons/ri";
import React from 'react'

const UserMenu = () => {
  return (
    <UserButton
    appearance={{
        elements: {
            avatarBox:'w-20 h-20',
            avatarImage: 'w-20 h-20',
        }
    }}
    >
      <UserButton.MenuItems>
          <UserButton.Link 
          label='My Organizations'
          href='/onboarding'
          labelIcon={<GoOrganization size={13}/> }
          />
      </UserButton.MenuItems>
      <UserButton.MenuItems>
          <UserButton.Link 
          label='Discussions'
          href='/onboarding'
          labelIcon={<RiChatAiLine size={13}/> }
          />
      </UserButton.MenuItems>
    </UserButton>
  )
}

export default UserMenu