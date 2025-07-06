import { useAuth, useOrganization } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProjectList from '../components/ProjectList'; // adjust path as needed
import { useLoadingStore, useOrganizationStore } from '../../store/zustandStore';
import IssueAcross from '../components/IssueAcross';

const OrganizationPage = () => {
  const { slug } = useParams();
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  // const [organization, setOrganization] = useState(null);
  const { organizations: orgdata, fetchOrganization, error} = useOrganizationStore()
  const setLoading = useLoadingStore.getState().setLoading;

  const organization = orgdata[slug] || null;
 
  // console.log("orgdata in OrganizationPage :", orgdata)
  // console.log("Organization from cache :", organization);
  
  /** Fetching organization handler */
  useEffect(() => {
    if(!isLoaded || !isSignedIn)return;
    setLoading(true);

    if(organization){
      setLoading(false);
      // console.log("Organization cache :", organization)
      return;
    };


    fetchOrganization(slug, getToken)
    .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn, slug, organization]);


  return (
    <div className="container mx-auto p-4">
      {!organization ? (
        <div>{slug} : Organization not found</div>
      ) : (
        <div>
          <div className="flex mb-4 flex-col p-4 sm:flex-row justify-between items-start">
            <h3 className="text-3xl font-semibold gradient-text">
              {organization.name}&rsquo;s Project
            </h3>
            {/* Org Switcher */}
          </div>
          <div className="mt-3">
            {/* Pass token and orgId to ProjectList */}
            <ProjectList orgId={organization.id} slug={slug}/>
            {/* Show Organization's Project */}
          </div>
          <div className="mt-8">
            <IssueAcross userId={userId}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationPage;