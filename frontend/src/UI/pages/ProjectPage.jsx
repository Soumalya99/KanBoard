import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLoadingStore, useProjectsStore , useOrganizationStore } from '../../store/zustandStore';
import { useAuth } from '@clerk/clerk-react'
import SprintCreationForm from '../components/SprintCreationForm';
import SprintBoard from '../components/SprintBoard';

const ProjectPage = () => {
  const { projId, slug } = useParams();
  const { projects, fetchProjects } = useProjectsStore();
  const { organizations, fetchOrganization, loading: orgLoading } = useOrganizationStore();
  const { getToken } = useAuth();
  const setLoading = useLoadingStore(state => state.setLoading);
  const organization = organizations[slug];


  // Find the project in the cache
  const project = useMemo(
    () => projects.find((p) => String(p.id) === String(projId)),
    [projects, projId]
  );

  console.log("Project from cache : ", projects);

  //Fetch organization if not cache
    useEffect(() => {
    if ((!organization) && slug) {
      fetchOrganization(slug, getToken);
    }
  }, [organization, slug, getToken, fetchOrganization]);

  //Fetch projects if not cache
  useEffect(() => {
    if (organization?.id || !project || projId) {
      fetchProjects(organization?.id, getToken);
    }
    if (!project || orgLoading) {
      setLoading(true);
    }else{
      setLoading(false);
    }
  }, [organization, project, projId, getToken, fetchProjects]);


  return (
    <div className='container mx-auto py-10 px-6'>
      {/* Sprint Creation */}
      <SprintCreationForm 
        projectTitle={project?.name}
        projectKey={project?.key}
        projectId={project?.id}
        sprintKey={((project?.sprints?.length) ?? 0) + 1}
        project={project}
        slug={slug}
      />
      {/* Sprint Board */}
      {project?.sprints && project?.sprints.length > 0 ? (
      <SprintBoard 
        // sprints = {project.sprints}
        projectId = {project?.id}
        slug = {slug}
      />
      ) : (
          <div className="text-gray-500">Create project list</div>
      )}
      {/* Add more project details or sprint UI here */}
    </div>
  );
};

export default ProjectPage;