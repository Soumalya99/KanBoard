import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import statuses from '../../utils/statuses.json';
import { FaRegStickyNote } from 'react-icons/fa';
import { FiPlusCircle } from 'react-icons/fi';
import { useAuth, useOrganization } from '@clerk/clerk-react';
import { useForm } from 'react-hook-form';
import { useIssueStore, useOrganizationStore } from '../../store/zustandStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { issueSchema } from '../../utils/ZodValidator';
import toast from 'react-hot-toast';
import { FiEdit2 } from 'react-icons/fi';
import CenteredModal from './CenteredModal'
import BoardFilter from './BoardFilter';
import { shallow } from 'zustand/shallow';
import IssueCard from './IssueCard';


const reorder = (sourceList, startIdx, endIdx) => { //TC -> O(n)
  //making a shallow copy and work on this copy
  const result = [...sourceList];
  //storing the removed one 
  const [removed] = result.splice(startIdx, 1);
  //inserts the removed element at index endIdx
  result.splice(endIdx, 0, removed);
  return result;
};


const KanbanBoard = ({ slug, projId, sprint }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalColumn, setModalColumn] = useState(null);
  const [assignees, setAssignees] = useState([]);
  // const [issue , setIssue] = useState([]);
  const { membership } = useOrganization();
  const [isEditing, setIsEditing] = useState(null);
  const sprintId = sprint?.id;
  const { orgMembers, fetchOrgMembers } = useOrganizationStore();
  const { register, handleSubmit, formState: { errors }, control, reset } = useForm({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      priority: 'MEDIUM',
      description: '',
      assigneeId: ''
    }
  });
  const { getToken, userId } = useAuth();
  const sprintIssues = useIssueStore(state => state?.sprintIssues, shallow);
  const issue = sprintIssues?.[sprintId] || [];
  const updateIssue = useIssueStore(state => state.updateIssue);
  const loading = useIssueStore(state => state.loading);
  const editIssue = useIssueStore(state => state.editIssue);
  const createIssue = useIssueStore(state => state.createIssue);
  const getIssues = useIssueStore(state => state.getIssues);

  const isAdmin =
    orgMembers[slug]?.some(member =>
      member.clerkUserId === userId && membership?.role === 'org:admin'
    );


  const canEdit = useCallback((issue) => {
    if (isAdmin) return 'admin';
    const holaAmigo = orgMembers?.[slug]?.some(mem => mem.id === issue?.assigneeId && mem.clerkUserId === userId);
    if (holaAmigo) return 'assignee';
    return null;
  }, [isAdmin, orgMembers, slug, userId, issue]);

  // console.log(isAdmin);
  // console.log(userId);
  // console.log(membership);

  /** Fetching issues from store */
  useEffect(() => {
    // Only fetch if we have never fetched for this sprintId
    // i.e. is sprintIssues doesn't encountered for this sprintId
    if (sprintId && !sprintIssues[sprintId]) {
      getIssues(sprintId, getToken);
    }
  }, [sprintId, getToken]);

  const [filteredIssue, setFilteredIssue] = useState(issue);

  useEffect(() => {
    if (filteredIssue !== issue && issue.length > 0) {
      setFilteredIssue(issue);
    }
  }, [issue]);


  const handleFilterApplied = useCallback((filtered) => {
    setFilteredIssue(filtered);
  }, []);


  /** for every status key  
   * create an empty array in the issueByStatus object 
   *  so that each issues can be mapped to the status key
  */
  const issueByStatus = statuses.reduce((acc, status) => {
    acc[status.key] = [];
    return acc;
  }, {}); // Output : { TODO: [], IN_PROGRESS: [],DONE: [] }

  filteredIssue?.map(issueItem => {
    /** forEach issue checks if status exist on issueByStatus */
    if (issueByStatus[issueItem?.status]) {
      /** if exist then push the issue bro  to the
       * exact array
       */
      issueByStatus[issueItem?.status].push(issueItem);
    }
  });
  // console.log('issues from KanbanBoard ', issue);

  useEffect(() => {
    let isMounted = true;
    const fetchAssignee = async () => {
      if (!slug) return;
      try {
        const members = await fetchOrgMembers(slug, getToken);
        if (isMounted) setAssignees(members);
      } catch (error) {
        if (isMounted) setAssignees([]);
      }
    };
    fetchAssignee();
    return () => { isMounted = false; };
  }, [slug]);

  /** Kanban Board drag controller */
  const onDragEnd = async (result) => {
    /** result will provide this 2 values which is getting destructured below */
    const { source, destination } = result;

    if (sprint.status === 'PLANNED') {
      toast.error('Start the sprint, to update the board');
      return;
    } else if (sprint.status === 'COMPLETED') {
      toast.error('Sprint is completed, cannot update the board');
      return;
    }
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    /** Making a shallow copy of the issues */
    const ShallowIssueData = [...issue];

    //Source list :: status/column from which you'r start dragging from 
    const sourceList = ShallowIssueData.filter(
      (list) => list.status === source.droppableId
    );
    //Destination list :: the status/colum you drop to
    const destinationList = ShallowIssueData.filter(
      (list) => list.status === destination.droppableId
    );

    // checking and updating the order of the issue
    if (source.droppableId === destination.droppableId) {
      //If the source and destination are same i.e. in same column, then we need to reorder the list
      /** call the re-order card function to reorder the card */
      const reOrderedCard = reorder(
        sourceList,
        source.index, // 0 / 1 which card you're dragging from 
        destination.index // same for destination index where you dropped to 
      );
      //setting the card order
      reOrderedCard.forEach((card, i) => {
        card.order = i;
      });


    } else {
      //If the source and destination are different, then we need to update the order of the issue
      const [movedCard] = sourceList.splice(source.index, 1); //updating source list by removing the card
      console.log(movedCard);
      movedCard.status = destination.droppableId;
      // pushing the moved card to the destination list i.e. appending
      destinationList.splice(destination.index, 0, movedCard);

      //update the sourcelist order
      sourceList.forEach((card, i) => {
        card.order = i;
      });
      //destination list
      destinationList.forEach((card, i) => {
        card.order = i;
      });
    }
    // sorting the issues based on their order
    const sortedIssue = ShallowIssueData
      .filter(issue => issue.id && typeof issue.id === "string" && !issue.id.startsWith('optimistic-'))
      .sort((a, b) => a.order - b.order);
    // console.log("Sorted Issues: ", sortedIssue);
    // setIssue(sortedIssue);//update the local state
    updateIssue(sprintId, sortedIssue, getToken); //updating the card order in store which later trigger the backend


    // console.log(result);
  };

  /** -- CREATE Issue -- */
  const handleCreateIssueClick = (column) => {
    setModalColumn(column);
    setIsEditing(null);
    setModalOpen(true);
    reset();
  };

  /** -- EDIT ISsue */
  const handleIssueEdit = (editedItem, column) => {
    if (!isAdmin && !canEdit(issue) === 'assignee') return;
    setModalColumn(column);
    setIsEditing(editedItem);
    /** spreading the previous state of the item */
    reset({
      title: editedItem.title,
      description: editedItem.description,
      assigneeId: editedItem.assigneeId,
      priority: editedItem.priority
    });
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalColumn(null);
    setIsEditing(null);
    reset();
  };

  const handleSend = async (formData) => {
    try {
      const token = await getToken();
      if (!token) {
        toast.error('You must be logged in to create an issue.');
        return;
      }

      if (isEditing) {
        // EDIT MODE
        await editIssue(
          sprint?.id,
          isEditing?.id,
          {
            ...formData,
            status: isEditing?.status, // keep status unchanged unless you want to allow editing
          },
          getToken
        );
        toast.success('Issue updated successfully!');
      } else {
        // CREATE MODE
        const payload = {
          title: formData.title,
          description: formData.description,
          status: modalColumn?.key || "TODO",
          priority: formData.priority,
          sprintId: sprint.id || null,
          assigneeId: formData.assigneeId,
          projId: projId
        };
        await createIssue(sprint.id, getToken, payload);
        toast.success('Issue created successfully!');
      }

      setModalOpen(false);
      reset();
      setIsEditing(null);
      setModalColumn(null);

    } catch (err) {
      toast.error('Error while creating issue');
      console.error("Error creating issue:", err);
    }
  };

  return (
    <>
      {/** Kanban Board Filters */}
      <BoardFilter
        issues={issue}
        onFilterApplied={handleFilterApplied}
      />



      {/** Drag & Drop Kanban board Model  */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-4 bg-neutral-900 p-4 gap-4 rounded-2xl'>
          {statuses.map((column, colIdx) => (
            <Droppable key={column.key} droppableId={column.key}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='space-y-2 min-h-[200px] bg-neutral-800 rounded-xl p-3'
                >
                  <h3 className='text-white font-sans font-semibold mb-4 text-center flex items-center justify-center gap-2'>
                    <FaRegStickyNote className="text-lg text-blue-400" />
                    {column.name}
                  </h3>
                  {issueByStatus[column.key].map((issue, idx) => (
                    <Draggable key={issue?.id} draggableId={`issue-${issue?.id}`} index={idx}>
                      {(provided, snapshot) => (
                        <IssueCard 
                        issue={issue}
                        canEdit={canEdit}
                        column={column}
                        handleIssueEdit={handleIssueEdit}
                        provided={provided}
                        snapshot={snapshot}
                        />
                      )}
                    </Draggable>
                  ))}
                  {colIdx === 0 && (
                    <button
                      className={`w-full flex items-center justify-center 
                        gap-2 px-3 py-2 rounded-lg border border-dashed 
                        border-blue-400 bg-blue-950 text-blue-200 
                        hover:bg-blue-800 transition-colors shadow `}
                      onClick={() => handleCreateIssueClick(column)}
                      type="button"
                    >
                      <FiPlusCircle className="text-xl" />
                      <span className="font-semibold">Create Issue</span>
                    </button>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Centered Modal for Create Issue */}
      <CenteredModal
        open={modalOpen}
        onClose={handleModalClose}
        register={register}
        handleSubmit={handleSubmit}
        handleSend={handleSend}
        errors={errors}
        control={control}
        assignees={assignees}
        handleModalClose={handleModalClose}
        isEditing={isEditing}
        reset={reset}
        isAdmin={isAdmin}
        issue={issue}
      />
    </>
  );
};

export default KanbanBoard;