import React from 'react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { sprintSchema } from '../../utils/ZodValidator';
import { addDays, format } from 'date-fns'
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import { FiCalendar } from 'react-icons/fi';
import { DayPicker } from 'react-day-picker'
import { useFetch } from '../../hooks/use-fetch';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom';
import { useSprintStore } from '../../store/zustandStore';
import "react-day-picker/style.css";

const SprintCreationForm = ({
    projectTitle,
    projectKey,
    projectId,
    sprintKey,
    project,
    slug
}) => {
    const [showSprintForm, setShowSprintForm] = useState(null);
    const { getToken } = useAuth();
    const navigate = useNavigate()
    const [sprintDateRange, setSprintDateRange] = useState({
        from: new Date(),
        to: addDays(new Date(), 10), // default 10 days selected
    });

    const loading = useSprintStore(state => state.loading);
    const createSprint = useSprintStore(state => state.createSprint);
    
    const {
        register,
        handleSubmit,
        formState: {errors},
        control
    } = useForm({
        resolver: zodResolver(sprintSchema),
        defaultValues:{
            name:`${projectKey}-${sprintKey}`,
            startDate: sprintDateRange.from,
            endDate: sprintDateRange.to
        }
    
    });
    

    /** onSubmit handler for sprint creation */
    const onSubmit = async(formData) => {
        const sprintData = {
            ...formData,
            projectId,
            startDate: sprintDateRange.from,
            endDate: sprintDateRange.to
        };
        if(sprintData){
            try {
                await createSprint(projectId, getToken, sprintData);
                setShowSprintForm(false);
                toast.success(`Sprint for ${projectKey} created successfully`);
                navigate(`/${slug}/project/${projectId}`);
            } catch (error) {
                toast.error(`Error creating sprint for ${projectKey}: ${error.message}`);
            }
        }
        return;
    };




  return (
    <div className="w-full px-6">
      {/* Header: Project Title & Toggle Button */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-x-3">
            <span className="inline-block  bg-gradient-to-r from-blue-300 to-green-300 transition duration-100 text-blue-900 text-sm font-bold px-2 py-1 rounded-2xl shadow">
                {projectKey}
            </span>
            <h1 className="text-3xl font-bold gradient-text">
                {projectTitle}
            </h1>
        </div>
        <button
          onClick={() => setShowSprintForm((prev) => !prev)}
          className={`transition-colors px-4 py-1 rounded-lg font-semibold shadow 
            ${showSprintForm
              ? "bg-red-800 text-white hover:bg-red-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          {showSprintForm ? "Cancel" : "Create Sprint"}
        </button>
        
      </div>
      {/* Sprint Creation Form */}
        {showSprintForm && (
            <form className="w-full bg-neutral-940 border bg-neutral-900 border-gray-500 rounded-xl shadow-lg px-4 py-3 flex flex-col mb-4 gap-6"
            onSubmit={handleSubmit(onSubmit)}
            >
                {/* Sprint Name and Dates Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Sprint Name */}
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-sm text-gray-200 mb-3">
                            Sprint Name
                        </label>
                        <input
                            readOnly
                            id='name'
                            className="w-full px-4 py-2 pointer-events-none rounded-lg bg-neutral-950 text-white border-b border-zinc-400 focus:outline-none focus:border-b focus:border-blue-400"
                            {...register('name')}
                        />
                        {errors.name && (
                            <p className="text-red-500 mt-1 text-xs">{errors.name?.message}</p>
                        )}
                    </div>
                    {/* Sprint Dates */}
                    <div className="flex flex-col flex-1">
                        <label className="block text-gray-200 text-sm mb-3 ">
                            Sprint Duration
                        </label>
                        {/* Day Picker */}
                        <Controller
                            control={control}
                            name='dateRange'
                            render={({ field }) => {
                                return(

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-900 transition-colors border border-zinc-600 text-white shadow"
                                        >
                                            <FiCalendar className="w-5 h-5 text-blue-400" />
                                            {sprintDateRange.from && sprintDateRange.to ? (
                                                <span className="font-mono text-sm">
                                                    {`${format(sprintDateRange.from, 'yyyy-MM-dd')} - ${format(sprintDateRange.to, 'yyyy-MM-dd')}`}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 font-mono text-sm">Schedule Sprint</span>
                                            )}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                    className='w-auto bg-neutral-900 p-2 shadow-md rounded-md mt-1'
                                    align='start'>
                                        {/* REact Day Picker */}
                                        <div className='scale-90'>
                                        <DayPicker mode='range' 
                                            selected={sprintDateRange}
                                            animate
                                            onSelect={(range) => {
                                                if(range?.from && range?.to){
                                                    setSprintDateRange(range)
                                                    field.onChange(range)
                                                }
                                            }}
                                            classNames={{
                                                chevron: 'fill-blue-500',
                                                range_start: 'bg-green-700 rounded-l-full rounded-r-none',
                                                range_middle: 'bg-blue-600 rounded-none',
                                                range_end: 'bg-red-600 rounded-r-full rounded-l-none',
                                                day_button: 'border-none',
                                                today: ' border-2 border-l-rounded border-yellow-600'
                                            }}
                                        />
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                )
                            }}
                        />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-secondary hover:bg-neutral-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            {loading ? "Creating..." : "Create Sprint"}
                        </button>
                    </div>
            </form>
        )}

      {/** Show description of the project */}
        {project?.description && (
            <ul className='list-disc list-inside text-base bg-zinc-900 p-6 rounded-2xl text-gray-200 mt-2 ml-2 mb-6'>
                {project?.description.split('.')
                .filter(line => line.trim() !== '')
                .map((point, idx) => (
                    <li key={idx}>
                        {point.trim()}
                    </li>
                ))
                }
            </ul>
        )}
    </div>
  )
}

export default SprintCreationForm