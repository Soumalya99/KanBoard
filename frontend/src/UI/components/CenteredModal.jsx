import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import React, { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form';
import { FiMessageSquare, FiPlusCircle, FiSend } from 'react-icons/fi';
import { useCommentStore } from '../../store/zustandStore';
import { useAuth } from '@clerk/clerk-react'
import toast from 'react-hot-toast';
import ChatRoom from './ChatRoom';

const CenteredModal = ({
     open, onClose, register, handleSubmit, handleSend,
     errors, control, assignees, handleModalClose, isEditing, reset,
     isAdmin, issue
    }) => {
    // const createComment = useCommentStore(state => state.createComment);  
    // const comments = useCommentStore(state => state.issueComments[isEditing?.id] || []);
    const getComments = useCommentStore(state => state.getComments);
    const { getToken } = useAuth(); 

    // Tabs: 'issue' or 'discussion'
    const [tab, setTab] = useState('issue');

    // const handleCommentSubmit = async(e) => {
    //   e.preventDefault();
    //   try {
    //     if(commentInput.trim() === '') return;
    //     await createComment(isEditing?.id, {content: commentInput}, getToken);
    //     setcommentInput('');
    //     toast.success("Comment created successfully!");
    //   } catch (error) {
    //     console.error("Failed to create comment:", error);
    //     toast.error("Failed to create comment. Please try again.");
    //   }
    // };

    // Fetch comments when needed
    useEffect(() => {
      if (open && isEditing?.id) {
        getComments(isEditing.id, getToken);
      }
      // eslint-disable-next-line
    }, [open, isEditing?.id, getToken]);

    // Reset form fields when modal opens or issue changes
    useEffect(() => {
      if (open && isEditing) {
        reset({
          title: isEditing.title,
          description: isEditing.description,
          assigneeId: isEditing.assigneeId,
          priority: isEditing.priority
        });
      } else if (open) {
        reset({
          title: '',
          description: '',
          assigneeId: '',
          priority: 'MEDIUM'
        });
      }
      // eslint-disable-next-line
    }, [open, isEditing?.id]);

    // When modal opens for editing, default to Issue tab
    useEffect(() => {
      if (open) setTab('issue');
    }, [open, isEditing?.id]);

    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-neutral-900 text-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative
        flex flex-col max-h-[90vh] sm:max-h-[95vh] overflow-y-auto scrollbar-hide
        ">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200 text-2xl"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex flex-col h-full">
            <Tabs.Root value={tab} onValueChange={setTab} className="w-full">
              <Tabs.List className="flex border-b border-neutral-700 mb-4">
                <Tabs.Trigger
                  value="issue"
                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                    tab === 'issue'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-blue-300'
                  }`}
                >
                  <FiPlusCircle className="inline mr-1" />
                  Issue
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="discussion"
                  className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${
                    tab === 'discussion'
                      ? 'border-blue-400 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-blue-300'
                  }`}
                >
                  <FiMessageSquare className="inline mr-1" />
                  Discussion
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="issue" className="w-full">
                <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit(handleSend)}>
                  <label className="font-semibold text-gray-200">
                    Issue Title
                    <input
                      id='title'
                      type="text"
                      className="mt-1 block w-full border border-gray-300 bg-white text-gray-900 rounded px-2 py-1"
                      placeholder="Enter issue title"
                      readOnly={!isAdmin}
                      style={!isAdmin ? { backgroundColor: '#e5e7eb', color: '#6b7280', cursor: 'not-allowed' } : {}}
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className='text-red-500 text-sm mt-1'>{errors.title.message}</p>
                    )}
                  </label>
                  <label className="font-semibold text-gray-200">
                    Description
                    <textarea
                      id='description'
                      className="mt-1 block w-full border bg-white border-gray-300 text-gray-900 rounded px-2 py-1"
                      placeholder="Describe the issue"
                      rows={4}
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className='text-red-500 mt-1 text-sm'>{errors.description.message}</p>
                    )}
                  </label>
                  {/* Assignee Select Dropdown */}
                  <label className="font-semibold text-gray-200">
                    Assignee
                    {isAdmin ? (
                      <Controller
                        name="assigneeId"
                        control={control}
                        render={({ field }) => (
                          <Select.Root
                            value={field.value || ''}
                            onValueChange={(val) => field.onChange(val)}
                          >
                            <Select.Trigger
                              className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white text-left gap-2 items-center "
                              aria-label="Assignee"
                            >
                              <Select.Value placeholder="Select assignee" />
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="bg-white border border-gray-300 rounded shadow-lg z-[12000]">
                                <Select.Viewport>
                                  {!assignees.length ? (
                                    <Select.Item disabled>
                                      <span className="text-neutral-900">No members found</span>
                                    </Select.Item>
                                  ) : (
                                    assignees.map((member) => (
                                      <Select.Item
                                        key={member.id}
                                        value={member.id}
                                        className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-100 cursor-pointer"
                                      >
                                        <span className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-neutral-200">
                                          {member.imageUrl && (
                                            <img
                                              src={member.imageUrl}
                                              alt={member.name || member.email || member.clerkUserId}
                                              className="w-7 h-7 object-cover rounded-full"
                                            />
                                          )}
                                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white bg-black/30 pointer-events-none">
                                            {member.name ? member.name[0].toUpperCase() : "?"}
                                          </span>
                                        </span>
                                        <Select.ItemText>
                                          <span className=" text-neutral-900 font-medium">
                                            @ {member.name || member.email || member.clerkUserId}
                                          </span>
                                        </Select.ItemText>
                                      </Select.Item>
                                    ))
                                  )}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        )}
                      />
                    ) : (
                      <div className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 bg-gray-100 text-gray-500 cursor-not-allowed">
                        {assignees.find(a => a.id === isEditing?.assigneeId)?.name || "Unassigned"}
                      </div>
                    )}
                    {errors.assigneeId && (
                      <p className='text-red-500 mt-1 text-sm'>{errors.assigneeId.message}</p>
                    )}
                  </label>
                  <label className="font-semibold text-gray-200">
                    Priority
                    <Controller
                      control={control}
                      name="priority"
                      render={({ field }) => (
                        <Select.Root
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger
                            className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white text-left flex items-center gap-2"
                            aria-label="Priority"
                          >
                            <Select.Value placeholder="Select priority" />
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="bg-white border border-gray-300 rounded shadow-lg z-[12000]">
                              <Select.Viewport>
                                <Select.Item
                                  value="LOW"
                                  className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-100 cursor-pointer"
                                >
                                  <Select.ItemText>
                                    <span className="text-neutral-900 font-medium">LOW</span>
                                  </Select.ItemText>
                                </Select.Item>
                                <Select.Item
                                  value="MEDIUM"
                                  className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-100 cursor-pointer"
                                >
                                  <Select.ItemText>
                                    <span className="text-neutral-900 font-medium">MEDIUM</span>
                                  </Select.ItemText>
                                </Select.Item>
                                <Select.Item
                                  value="HIGH"
                                  className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-100 cursor-pointer"
                                >
                                  <Select.ItemText>
                                    <span className="text-neutral-900 font-medium">HIGH</span>
                                  </Select.ItemText>
                                </Select.Item>
                                <Select.Item
                                  value="URGENT"
                                  className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-blue-100 cursor-pointer"
                                >
                                  <Select.ItemText>
                                    <span className="text-neutral-900 font-medium">URGENT</span>
                                  </Select.ItemText>
                                </Select.Item>
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                      )}
                    />
                    {errors.priority && (
                      <p className='text-red-500 mt-1 text-sm'>{errors.priority.message}</p>
                    )}
                  </label>
                  <button
                    type="submit"
                    className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
                </form>
              </Tabs.Content>
              <Tabs.Content value="discussion" className="w-full">
                <ChatRoom 
                  getToken={getToken}
                  isEditing={isEditing}
                  issue={issue}
                />
              </Tabs.Content>
            </Tabs.Root>
          </div>
        </div>
      </div>
    );
}

export default CenteredModal;