
import { OrganizationList, useOrganization } from "@clerk/clerk-react";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const OnboardingPage = () => {
  const { organization } = useOrganization();
  // const navigate = useNavigate();

  useEffect(() => {
    if(organization ){
      // navigate(`/organization/${organization.slug}`)
      // console.log('Organization Object from clerk ', organization);
    }
  },[organization]);
  return(
    <div className="flex flex-col items-center py-6 justify-center min-h-screen">
      <h1 className="text-xl font-bold mb-4">Welcome to the Organization Selection page.</h1>
      <p className="text-sm leading-tight font-sans text-blue-300 font-medium w-96 text-center mb-5">
        This part of the application requires the user to select an organization in order to
        proceed. If you are not part of an organization, you can accept an invitation or create your
        own organization.
      </p>
      <OrganizationList hidePersonal={true}
       afterCreateOrganizationUrl={`/organization/${organization.slug}`}
        afterSelectOrganizationUrl={`/organization/${organization.slug}`}
        
      />
      {/* Add onboarding steps/components here */}
    </div>
  )
}


