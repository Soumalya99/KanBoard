const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { clerkClient } = require('@clerk/express');

async function createSprint(req, res){
    const { userId, orgId } = req.auth;
    const { projectId } = req.params;

    if(!userId || !orgId){
        return res.status(401).json({ message: 'Unauthorized' });
    };

    /** fisrtly fetch the specific project */
    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project || project.organizationId !== orgId) {
            return res.status(403).json({ message: 'Forbidden: Project does not belong to the organization.' });
        };

        /** Now sprint creation */
        const sprint = await prisma.sprint.create({
            data: {
                name: req.body.name,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                status: "PLANNED",
                projectId: projectId
            }
        });

        return res.status(201).json({ sprint });
    } catch (error) {
        console.error('Error in creating sprint', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    };  
};

async function updateSprint(req, res){
    const { userId, orgId, orgRole } = req.auth;
    const { sprintId } = req.params;
    const {  newStatus } = req.body;
    if(!userId || !orgId){
        return res.status(401).json({ message: 'Unauthorized' });
    };
    if(!sprintId){
        return res.status(400).json({ message: 'Sprint ID is required' });
    };
    try {
        const sprint = await prisma.sprint.findUnique({
            where: { id: sprintId },
            include: { project: true }
        });

        if(!sprint && !sprint.project.organizationId){
            return res.status(404).json({ message: 'Sprint not found' });
        };
        if(sprint.project.organizationId !== orgId){
            return res.status(403).json({ message: 'Forbidden: Sprint does not belong to the organization.' });
        };
        if(orgRole !== 'org:admin'){
            return res.status(403).json({ message: 'Forbidden: Only organization admin can update sprint.' });
        };

        /** Sprint date management server side */
        const now = new Date();
        const startDate = new Date(sprint.startDate);
        const enddate = new Date(sprint.endDate);

        if(newStatus === 'ACTIVE' && (now < startDate || now > enddate)){
            return res.status(403).json({message: 'Invalid: Cannot start sprint outside of its Date range.'})
        };
        if(newStatus === 'COMPLETED' && sprint.status !== 'ACTIVE'){
            return res.status(403).json({message: 'Invalid: Cannot complete sprint that is not active.'});
        };

        const updatedSprint = await prisma.sprint.update({
            where: { id: sprintId },
            data: { status: newStatus }
        });

        return res.status(200).json({ success: true, sprint: updatedSprint });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports = { createSprint, updateSprint }