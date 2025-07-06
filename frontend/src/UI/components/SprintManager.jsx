import React, { useState, useEffect } from 'react';
import * as Select from '@radix-ui/react-select';
import { format, formatDistanceToNow, formatDistanceToNowStrict, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { useLoadingStore, useSprintStore } from '../../store/zustandStore';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react'


const SprintManager = ({ sprint, sprints = [], projId, setSprint}) => {
    // Defensive: handle undefined sprint
    const [status, setStatus] = useState(sprint?.status || '');
    const updatedSprint = useSprintStore(state => state.updatedSprint);
    const loading = useSprintStore(state => state.loading);
      const setLoading = useLoadingStore(state => state.setLoading);
    const { getToken } = useAuth();


    useEffect(() => {
        setStatus(sprint?.status || '');
    }, [sprint]);

    // Defensive: handle empty sprints
    if (!sprints.length) return <div className="text-gray-500">No sprints available</div>;

    const now = new Date();

    const canStart = sprint &&
        isBefore(now, sprint.endDate) && isAfter(now, sprint.startDate) &&
        sprint.status === 'PLANNED';

    const canEnd = sprint &&
        sprint.status === 'ACTIVE';

    const getSprintStatus = () => {
        if(status === 'COMPLETED'){
            return {
                type: 'completed',
                message: (
                    <>
                        Sprint Ended on <FaRegCalendarAlt className="inline mb-1 mr-1" />{new Date(sprint.endDate).toLocaleDateString()}
                    </>
                )
            };
        }else if(status === "ACTIVE" && isAfter(now, new Date(sprint.endDate))){
            return {
                type: 'overdue',
                message: (
                    <>
                        Overdue by {formatDistanceToNow(new Date(sprint.endDate))}
                    </>
                ),
            };
        }else if(status === 'PLANNED' && isBefore(now, new Date(sprint.startDate))){
            return {
                type: 'planned',
                message: (
                    <>
                        <AiOutlineInfoCircle className="inline mb-1 mr-1" />
                        Starts in {formatDistanceToNow(sprint.startDate)}{' '}
                        <FaRegCalendarAlt className="inline mb-1 mr-1" />
                        {new Date(sprint.startDate).toLocaleDateString()}
                    </>
                ),
            };
        }else if(status === 'PLANNED' && isWithinInterval(now, {start: new Date(sprint.startDate), end: new Date(sprint.endDate)})){
           return {
            type: 'planned',
            message: (
            <>
                <AiOutlineInfoCircle className="inline mb-1 mr-1 " />
                Sprint yet to start . Click the button to start sprint
            </>
            )
           }
        }else if(status === "ACTIVE" && isBefore(now, new Date(sprint.endDate))){
            return {
                type : 'active',
                message: (
                <>
                <AiOutlineInfoCircle className="inline mb-1 mr-1 " />
                    Sprint already started on <FaRegCalendarAlt className="inline mb-1 mr-1" />
                {new Date(sprint.startDate).toLocaleDateString()} &mdash; Time left for submission : {formatDistanceToNow(new Date(sprint.endDate))}
                </>
                )
            }
        }
        return null;
    }

    const handleSprintChange = (value) => {
        const selectedSprint =  sprints.find(spr => String(spr.id) === value);
        if (selectedSprint) {
            setSprint(selectedSprint);
            setStatus(selectedSprint.status);
        }
    };

    const handleUpdateSprint = async (newStatus) => {
        try {
            console.log("newStatus of sprint ", newStatus);
            console.log("sprint id ", sprint.id);
            const updatedStatus = await updatedSprint(sprint.id, getToken, newStatus);
            setSprint(updatedStatus);
            setStatus(updatedStatus.status);
            toast.success(newStatus === "COMPLETED" ? "Sprint ended!" : "Sprint started!")
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update sprint');
        }
    }

    const sprintStatus = getSprintStatus();

    let statusBg = "bg-neutral-800";
    if (sprintStatus?.type === "active") statusBg = "bg-gradient-to-r from-green-900 via-teal-900 to-green-600";
    if (sprintStatus?.type === "started") statusBg = "bg-gradient-to-r from-green-700 via-yellow-200 to-red-600";
    if (sprintStatus?.type === "planned") statusBg = "bg-blue-700";
    if (sprintStatus?.type === "overdue") statusBg = "bg-red-700";
    if (sprintStatus?.type === "completed") statusBg = "bg-teal-800";


    return (
        <div>
            <div className="w-full flex flex-row justify-between items-center gap-6">
                {/* Select Trigger */}
                <Select.Root value={sprint ? String(sprint.id) : ""} onValueChange={handleSprintChange}>
                    <Select.Trigger 
                        className="w-full flex justify-between bg-slate-950 text-white px-4 py-2 rounded data-[placeholder]:text-gray-400"
                    >
                        <Select.Value
                            placeholder="Select Sprint"
                            className='text-white'
                        />
                        <Select.Icon>
                            <svg width="24" height="24" fill="none" viewBox="0 0 20 20">
                                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                        <Select.Content
                            side="bottom"
                            align="start"
                            sideOffset={8}
                            className="bg-neutral-950  text-white border border-gray-200 rounded shadow-lg z-50 min-w-[200px] mt-2"
                        >
                            <Select.Viewport>
                            {sprints.map((spr) => (
                                <Select.Item
                                    key={spr.id}
                                    value={String(spr.id)}
                                    className="px-4 py-2 hover:bg-blue-950 cursor-pointer text-left"
                                >
                                <Select.ItemText>
                                {spr.name} ({format(spr.startDate, 'yyyy-MM-dd')} - {format(spr.endDate, 'yyyy-MM-dd')})
                                </Select.ItemText>
                                </Select.Item>
                            ))} 

                            </Select.Viewport>
                        </Select.Content>
                    </Select.Portal>
                </Select.Root>
                {/**Can start button */}
                {canStart && (
                <button className='px-4 py-2 whitespace-nowrap text-sm leading-tight bg-green-700 hover:bg-green-600 text-white rounded-2xl'
                    disabled={loading}
                    onClick={() => handleUpdateSprint("ACTIVE")}>
                    {loading ? (
                    <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : null}
                    Start sprint
                </button>
                )}
                {/**Can end button */}
                {canEnd && (
                    <button className='px-4 py-1 text-sm rounded-2xl whitespace-nowrap bg-red-700 hover:bg-red-600 text-white'
                        disabled={loading}
                        onClick={() => handleUpdateSprint("COMPLETED")} >
                        {loading ? (
                            <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : null}
                        End Sprint
                    </button>
                )}
            {/** Sprint status */}
            {sprintStatus && (
                <div className={`
                mt-4 text-white rounded items-center gap-6 px-4 py-1 italic ${statusBg}`}>
                {sprintStatus.message}
                </div>
            )}
            </div>

            {loading && setLoading(true)}

        </div>
    );
};

export default SprintManager;