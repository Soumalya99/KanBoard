import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react'
import { FiMessageSquare, FiSend } from 'react-icons/fi'
import { MdGroup } from "react-icons/md";
import { useSocket } from './SocketProvider';
import { useCommentStore, useUserStore } from '../../store/zustandStore';
import { useState } from 'react';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useUser } from '@clerk/clerk-react';

const ChatRoom = ({
     isEditing, issue, getToken
}) => {
    const [commentInput, setcommentInput] = useState("");
    const socket = useSocket();
    const {user} = useUser();
    const createComment = useCommentStore(state => state.createComment); 
    const addComment = useCommentStore(state => state.addComment);
    const chatEndRef = useRef(null);
    const comments = useCommentStore(state => state.issueComments[isEditing?.id] || []);

    const selectedIssue = issue?.find(iss => iss.id === isEditing?.id);
    // console.log("Selected Issue in ChatRoom: ", selectedIssue);
    // console.log('User in ChatRoom:', user);
    // console.log("Selected Issue in comments: ", comments);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        try {
            console.log("User in ChatRoom:", user);
            if (commentInput.trim() === '') return;
            if (!user || !user.id) {
                toast.error("User not loaded. Please log in again.");
                return;
            }
            if (socket) {
                // console.log('Emitting createComments:', {
                //     issueId: isEditing?.id,
                //     userId: user?.id,
                //     content: commentInput
                // });
                socket.emit('createComments', {
                    issueId: isEditing?.id,
                    userId: user?.id,
                    content: commentInput
                })
            } else {
                toast.error("Socket not connected!");
            }
            setcommentInput('');
            toast.success("Comment added successfully!");
        } catch (error) {
            console.error("Failed to create comment:", error);
            toast.error("Failed to create comment. Please try again.");
        }
    };

    /** HandleNewComment handles the incoming
    * comment from socket */
    const handleNewComment = useCallback((comment) => {
        try {
            // console.log("New comment received via socket connection: ", comment);
            addComment(comment?.issueId, comment);
        } catch (error) {
            console.error("Failed to handle new comment:", error);
            toast.error("Failed to handle new comment. Please try again.");
        };
    }, [addComment]);

    useEffect(() => {
        if(!socket) return;
        /** Listening for new comment event */
        socket.on('newComment', handleNewComment);
        /** Cleanup the socket event listener */
        return () => {
            socket.off('newComment', handleNewComment);
        }
    },[socket, handleNewComment]);

    useEffect(() => {
        if(!chatEndRef.current) return;
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    },[comments]);

  return (
    <div>
        {/* <h3 className='font-semibold text-blue-300 mb-2 flex items-start justify-between gap-2'>
            <span className='flex gap-2 items-center'><FiMessageSquare /> Discussion</span>
        </h3> */}
        <div className='flex items-center rounded-2xl '>
            <div className='flex items-center justify-between py-2 px-4 w-full bg-gray-900 rounded-2xl '>
                <div className='flex items-center gap-2'>
                    {/* <img src={} alt="" className='w-6 h-6 rounded-full' /> */}
                    <MdGroup className='text-blue-300 text-2xl' />
                    <span className='text-sm font-semibold text-gray-200'>{selectedIssue?.title || "Issue Discussion"}</span>
                </div>
                <span className='text-xs text-gray-500'>{selectedIssue?.assignee?.name}</span>   
            </div>
        </div>
        {/** Pinned description */}
        {selectedIssue?.description && (
            <div className="bg-neutral-800 px-4 py-2 border-b text-xs text-gray-400 flex items-center">
                {/* <span className="font-semibold mr-2">Pinned:</span> */}
                <span>{selectedIssue?.description}</span>
            </div>
        )}
        {/** Chat message Discussion section */}
        <div className='w-full h-[420px] flex flex-col justify-between pb-2'>
            <div className='space-y-auto flex flex-col w-full space-y-4 flex-1 overflow-y-auto px-3 py-2'>
                {comments?.length === 0 ? (
                    <div className="text-gray-400">No comments yet. Be the first to comment!</div>
                ) : (
                    comments.map((comment) => {
                        return(
                        <div key={comment?.id}
                        className={`flex ${comment?.authorId === selectedIssue?.reporterId ? 'justify-start ' : 'justify-end '}`}>
                            {/** Chat Bubble */}
                            <div className='max-w-[85%]'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2'>
                                        <img src={comment?.author?.imageUrl} alt={comment?.author?.name}
                                            className='w-5 h-5 rounded-full border border-neutral-700'
                                        />
                                        <span className='font-semibold text-xs text-blue-300'>
                                            {comment?.author?.name}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(comment?.createdAt).toLocaleDateString('en-US')}
                                        </span>
                                    </div>
                                    <div className="text-gray-100 mt-1 text-xs whitespace-pre-line">{comment.content}</div>
                                </div>
                            </div>
                        </div>
                    )})
                )}
            </div>

            {/** Adding comment form */}
            <form
                className='flex gap-2 items-end mt-2 relative'
                onSubmit={(e) => handleCommentSubmit(e)}
            >
                <textarea value={commentInput}
                    onChange={e => setcommentInput(e.target.value)}
                    rows={4}
                    placeholder='Start a discussion ....'
                    className='flex-1 h-12 bg-neutral-800 border border-neutral-500 
            rounded px-3 py-2 text-white overflow-hidden focus:outline-none
            focus:ring-1 focus:ring-blue-400 pr-10 mb-2 text-sm
            '
                />
                {commentInput.length > 0 && (
                    <button
                        type='submit'
                        className='absolute bottom-3 right-2 bg-green-600 
                        hover:bg-green-500 text-white px-2 py-2 rounded-full 
                        flex items-center gap-1'style={{ zIndex: 10 }}
                    >
                    <FiSend />
                    </button>
                )}
            </form>
        </div>
    </div>
  )
}

export default ChatRoom