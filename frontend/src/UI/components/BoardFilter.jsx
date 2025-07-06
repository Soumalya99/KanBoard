import React, { useEffect } from 'react'
import * as Select from '@radix-ui/react-select';
import { RxCross1 } from "react-icons/rx";

/**
 * BoardFilter component
 * 
 * NOTE: To prevent infinite loops, do NOT include `onFilterApplied` in the dependency array
 * unless you are 100% sure it is memoized and stable in the parent.
 * 
 * The parent should:
 *   - Always pass the full, unfiltered issues list as `issues`
 *   - Only use the filtered list for rendering, not as the source for filtering
 */
const BoardFilter = ({ issues, onFilterApplied }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedAssignee, setSelectedAssignee] = React.useState([]);
    const [priorityStatus, setPriorityStatus] = React.useState("");

    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    const assignees = issues
        .map((issue) => issue.assignee)
        .filter((item, index, self) => item &&
            self.findIndex(a => a.id === item.id) === index
        );

    const isFilterApplied = searchTerm !== ''
        || selectedAssignee.length > 0
        || priorityStatus !== '';

    // Only run effect when filter state or issues change
    useEffect(() => {
        const filteredIssue = issues?.filter((issue) =>
            (issue?.title?.toLowerCase().includes(searchTerm?.toLowerCase())
                || issue?.description?.toLowerCase().includes(searchTerm.toLowerCase()))
            && (selectedAssignee.length === 0 || selectedAssignee.includes(issue.assignee?.id))
            && (priorityStatus === '' || issue?.priority === priorityStatus)
        );
        // Only call onFilterApplied if the filtered result actually changed
        onFilterApplied(filteredIssue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, priorityStatus, selectedAssignee]);
    // ^^^ intentionally omit onFilterApplied to avoid infinite loop

    const toggleAssignee = (assigneeId) => {
        setSelectedAssignee((prev) =>
            prev.includes(assigneeId) ?
                prev.filter(id => id !== assigneeId)
                : [...prev, assigneeId]
        )
    };

    const clearFilter = () => {
        setSearchTerm('');
        setSelectedAssignee([]);
        setPriorityStatus('');
    };

    return (
        <div>
            <div className='flex flex-col items-center justify-center sm:flex-row gap-4 sm:gap-6 mt-4 mb-8 pr-2'>
                {/* Input field */}
                <div className=''>
                    <input
                        type="text"
                        placeholder='Search issues by title or description'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full px-4 py-2 bg-gray-800 text-white 
                        rounded-lg focus:outline-none sm:w-75'
                    />
                </div>
                {/* Assignee filter */}
                <div className='flex-shrink-0'>
                    <div className='flex gap-2 flex-wrap'>
                        {assignees?.map((assignee, i) => {
                            const selected = selectedAssignee.includes(assignee?.id);
                            return (
                                <div
                                    key={assignee?.id}
                                    className={`rounded-full ring-2 ${selected ? "ring-blue-600" : "ring-black"} ${i > 0 ? '-ml-4' : ""}`}
                                    style={{
                                        zIndex: i
                                    }}
                                    onClick={() => toggleAssignee(assignee?.id)}
                                >
                                    <img src={assignee?.imageUrl}
                                        className='w-8 h-8 rounded-full'
                                        alt={assignee?.name}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div>
                    <Select.Root value={priorityStatus}
                        onValueChange={setPriorityStatus}
                    >
                        <Select.Trigger className='w-full sm:w-30 bg-neutral-800 rounded-lg outline-gray-800' aria-label='Priority'>
                            <Select.Value placeholder='Select priority' className='outline-neutral-700 flex flex-row gap-2' />
                        </Select.Trigger>
                        <Select.Portal>
                            <Select.Content
                                className='z-[13000] relative text-center text-white text-base
                    rounded-lg shadow-lg'>
                                <Select.Viewport className='mt-8 bg-neutral-900'>
                                    {priorities.map((priority) => (
                                        <Select.Item key={priority} value={priority} className='cursor-pointer outline-none hover:bg-neutral-800'>
                                            <Select.ItemText>{priority}</Select.ItemText>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                            </Select.Content>
                        </Select.Portal>
                    </Select.Root>
                </div>

                {/* Filter clear button */}
                {isFilterApplied && (
                    <button
                        className='px-4 py-1 flex justify-between items-center 
                    gap-2 bg-neutral-900 hover:bg-red-950 outline-1 
                    outline-red-800 rounded-2xl text-sm'
                        onClick={clearFilter}>
                        <RxCross1 className='w-3 h-3' />
                        Clear
                    </button>
                )}

            </div>
        </div>
    )
}

export default BoardFilter