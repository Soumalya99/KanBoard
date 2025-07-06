import { OrganizationSwitcher, SignedIn } from '@clerk/clerk-react'
import React from 'react'
import { useLocation } from 'react-router-dom';

const OrgSwitcher = () => {
  const { pathname } = useLocation();
  return (
    <div>
      <SignedIn>
        <OrganizationSwitcher hidePersonal={true}
        afterCreateOrganizationUrl={'/organization/:slug'}
        afterSelectOrganizationUrl={'/organization/:slug'}
        createOrganizationMode={
            pathname === '/onboarding' ? 'navigation' : 'modal'
        }
        createOrganizationUrl = {'/onboarding'}

        />
      </SignedIn>
    </div>
  )
}

export default OrgSwitcher