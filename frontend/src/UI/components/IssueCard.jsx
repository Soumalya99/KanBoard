import React from 'react';
import { FiEdit2 } from 'react-icons/fi';

const IssueCard = ({
  issue,
  column,
  canEdit,
  handleIssueEdit,
  provided,
  snapshot
}) => {

    /** who can edit */


  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`bg-zinc-700 text-white rounded-lg p-3 shadow mb-2 
        flex flex-col border-b-6 ${issue?.priority === 'LOW' ?
          'border-yellow-300' : issue?.priority === 'MEDIUM' ?
            'border-amber-500' : issue?.priority === 'HIGH' ?
              'border-orange-600' : issue?.priority === 'URGENT' ?
                'border-red-500' : 'border-violet-500'
        }  
        ${snapshot?.isDragging ? 'opacity-80' : ''}`}
    >
      <div className='flex justify-between items-center'>
        <div className="font-semibold text-base text-blue-300 font-sans text-center italic ">
          {issue.title}
        </div>
        {(canEdit?.(issue) === 'admin' || canEdit?.(issue) === 'assignee') && (
          <button
            className='text-amber-500 hover:text-yellow-400'
            title='Edit issue'
            onClick={() => handleIssueEdit(issue, column)}
          >
            <FiEdit2 />
          </button>
        )}
      </div>
      <div className="text-sm text-center text-gray-200 font-medium font-sans mt-3">
        {issue.description}
      </div>
      <div className="flex gap-3 justify-between mt-6">
        {issue?.assignee?.imageUrl && (
          <div className='flex gap-x-3 items-center'>
            <img
              src={issue?.assignee?.imageUrl}
              alt={issue?.assignee?.name || issue.assignee.email || issue.assignee.clerkUserId}
              className="w-5 h-5 object-cover rounded-full"
            />
            <span className="text-xs font-semibold font-sans">{issue?.assignee?.name}</span>
          </div>
        )}
        <span className="text-xs font-semibold">{issue.priority}</span>
      </div>
    </div>
  );
};

export default IssueCard;