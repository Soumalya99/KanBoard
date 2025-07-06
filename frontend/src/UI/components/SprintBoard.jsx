import React, { useState, useEffect } from 'react';
import SprintManager from './SprintManager';
import KanbanBoard from './KanbanBoard';
import { useProjectsStore } from '../../store/zustandStore';


const SprintBoard = ({  projectId, slug }) => {
  const [currentSprint, setCurrentSprint] = useState(null);
  const { projects } = useProjectsStore();

  const project = projects?.find((p) =>
  String(p.id) === String(projectId));

  const sprints = project?.sprints || [];

  useEffect(() => {
    if (sprints.length > 0) {
      // Prefer ACTIVE sprint, then PLANNED, then fallback to first sprint
      const active = sprints.find((sp) => sp.status === 'ACTIVE');
      const planned = sprints.find((sp) => sp.status === 'PLANNED');
      setCurrentSprint(active || planned || sprints[0]);
    } else {
      setCurrentSprint(null);
    }
  }, [sprints]);

  if (!currentSprint) {
    return <div>No sprints available</div>;
  }



  console.log("Sprint from SprintBoard ", sprints)
  console.log("CurrentSprint from SprintBoard ", currentSprint)

  return (
    <div>
      {/** Sprint Manager */}
      <SprintManager
        sprint={currentSprint}
        sprints={sprints}
        projId={projectId}
        setSprint={setCurrentSprint}
      />


      {/** Actual Kanban Board */}
      <KanbanBoard 
      slug={slug}
      projId={projectId}
      sprint={currentSprint}
      />
    </div>
  );
};

export default SprintBoard;