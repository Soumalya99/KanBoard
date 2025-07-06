import { useAuth, useOrganization, useUser } from '@clerk/clerk-react'
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import OrgSwitcher from '../components/OrgniztionSwitcher';
import { GiBatMask } from "react-icons/gi";
import Input from '../components/Inputs';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema } from '../../utils/ZodValidator';
import { useFetch } from '../../hooks/use-fetch';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useProjectsStore, useLoadingStore } from '../../store/zustandStore';
// import { useAuth } from '@clerk/clerk-react';


const CreateProjectPage = () => {
  const { createProjects, loading, error } = useProjectsStore();
  const setLoading = useLoadingStore.getState().setLoading
  const { isLoaded: isUsrLoaded } = useUser();
  const { isLoaded: isOrgLoaded, membership } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { 
    register,
    handleSubmit,
    reset,
    formState: {errors}
   } = useForm({
      resolver: zodResolver(projectSchema)
    })

   useEffect(() => {
    if(isUsrLoaded && isOrgLoaded && membership.role === 'org:admin'){
      console.log("membership role state",membership);
      setIsAdmin(true);
    }else{
      setLoading(true);
      setIsAdmin(false);
    }
  }, [isOrgLoaded, isUsrLoaded, membership]);
  


  const onSubmit = async(formData) => {
    try {
      const token = await getToken();
      await createProjects(formData, token, membership.organization?.id);
      toast.success('Project created successfully.');
      navigate('/onboarding');
    } catch (error) {
      toast.error(err?.response?.data?.error || err.message || "Failed to create project");
    }
    finally{
      reset();
    }
  }

  if(!isAdmin){
    return (
      <div className='flex flex-col gap-2 items-center pt-5 '>
        <span className='text-2xl px-4 mb-4 font-semibold gradient-warn'> 
          <GiBatMask className="inline-block text-3xl text-red-600 mr-2" />
          Opps! Only organization admin can create project.
        </span>
        <OrgSwitcher />
      </div>
    )
  }

  return (
    <div className='container flex flex-col items-center mx-auto py-10'>
      <h2 className='text-4xl text-center font-semibold mb-4 gradient-text'> Create new Project </h2>
      <form
        className="flex flex-col items-center justify-center space-y-6 w-full max-w-lg mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Project Name */}
        <div className="w-full">
          <label htmlFor="name" className="block text-sm font-medium text-blue-400 mb-2">
            Project Name
          </label>
          <input
            id="name"
            placeholder="Give your project a name."
            className="w-full px-4 py-2 bg-transparent border-b border-neutral-700 text-white
             placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-red-500 mt-1 text-xs">{errors.name?.message}</p>
          )}
        </div>

        {/* Project Key */}
        <div className="w-full">
          <label htmlFor="key" className="block text-sm font-medium text-blue-400 mb-2">
            Project Key
          </label>
          <input
            id="key"
            placeholder="Key should be like P1F2 i.e. unique"
            className="w-full px-4 py-2 bg-transparent border-b border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            {...register('key')}
          />
          {errors.key && (
            <p className="text-red-500 mt-1 text-xs">{errors.key?.message}</p>
          )}
        </div>

        {/* Project Description */}
        <div className="w-full">
          <label htmlFor="description" className="block text-sm font-medium text-blue-400 mb-2">
            Project Description
          </label>
          <textarea
            id="description"
            placeholder="Write a short description about your project."
            className="w-full px-4 py-2 bg-transparent border-b border-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-500 mt-1 text-xs">{errors.description?.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-700 text-white font-semibold shadow-md hover:from-blue-600 hover:to-indigo-800 transition disabled:opacity-60"
        >
          {loading ? 'Creating ...' : 'Create Project'}
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 mt-2 text-sm w-full text-center">{error.message}</p>
        )}
      </form>
    </div>
  )
}

export default CreateProjectPage