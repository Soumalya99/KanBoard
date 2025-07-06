import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useOrganization, useAuth } from "@clerk/clerk-react";
import { useOrganizationStore, useProjectsStore } from "../../store/zustandStore";

// Utility to mask slug except first 4 chars
function maskslug(slug) {
  if (!slug) return "";
  const visible = slug.slice(0, 13);
  const masked = "*".repeat(Math.max(0, slug.length - 4));
  return visible + masked;
}

export default function ProjectList({  slug }) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { membership } = useOrganization();
  const { 
    organizations, 
    fetchOrganization, 
    loading: orgLoading, 
    error: orgError 
  } = useOrganizationStore();
  const { 
    projects, 
    fetchProjects, 
    deleteProjects,
    loading: projLoading, 
    error: projError 
  } = useProjectsStore();


  const isAdmin = membership && membership.role === "org:admin";

   /** Project delete handler */
    const handleDeleteProject = async (projectId) => {
      try {
          
          await deleteProjects(projectId, getToken);
          toast.success('Project deleted successfully');
      } catch (error) {
          toast.error(
            error?.response?.data?.error || error.message || "Failed to delete project"
          );
      }
    };

  useEffect(() => {
    if(!slug || !getToken) return;
    if(!organizations[slug]){
      fetchOrganization(slug, getToken);
    }
  }, [slug, getToken]);

  useEffect(() => {
    const org = organizations[slug];
    console.log("org in useEffect:", org);
    try {
      if (org || org.id) {
        console.log("Calling fetchProjects with:", org.id);
        fetchProjects(org.id, getToken);
      }
      
    } catch (error) {
      console.error('Error in fetching projects', error);
    }
  }, [slug, organizations, getToken]);

  if (orgLoading || projLoading)
    return (
      <div className="flex justify-center items-center py-8">
        <span className="animate-pulse text-lg text-blue-400">Loading projects...</span>
      </div>
    );
  
   if (orgError || projError)
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-red-500">{orgError || projError}</span>
      </div>
    );
  
  if (!projects.length)
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-gray-400">No projects found for this organization.</span>
      </div>
    );
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      {projects.map((project) => (
        <div
          key={project.id}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 border border-blue-500 shadow-xl rounded-2xl p-4 transition-transform hover:scale-100"
        >
          {/* Masked slug at top right */}
          {isAdmin && (
            <div className="absolute top-4 right-4 flex items-center space-x-1">
              <button className=" text-red-500 text-2xl  rounded hover:scale-90"
              onClick={() => handleDeleteProject(project.id)}
              >
                <MdDelete />
              </button>
            </div>
          )}
          <h2 className="text-lg font-medium font-sans text-white mb-2 flex items-center">
            {project.name}
            <span className="ml-3 font-medium text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-mono tracking-widest shadow">
              {project.key}
            </span>
          </h2>
          <p className="text-gray-300 mb-4">{project.description}</p>
            <div className="flex items-center space-x-2 mt-2 cursor-pointer group"
                onClick={() => navigate(`/${slug}/project/${project.id}`)}
            >
              <span className="text-sm text-blue-500 underline group-hover:text-blue-600 font-semibold">
                  View Project
              </span>
              <FiArrowRight className="text-blue-400 group-hover:text-blue-600 transition" />
            </div>
          </div>
      ))}
    </div>
  );
}