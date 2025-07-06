const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const PORT = process.env.PORT || 4114;
const userRouter = require('./routes/userRoute.js');
const { createComments } = require('./controller/services/comments.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as needed for security
    }
});

app.use(cors());
app.use(express.json());

console.log('🙏 Welcome to the Kanban backend API')


/** User Routes  */
app.use('/api/users', userRouter);
app.use((req, res) => res.status(404).send('Not found'));

/** Setting up socket connection at the top level */
io.on('connection', (socket) => {
    console.log('New user connected');
    /** Event handling : subscribe */
    socket.on('createComments', async(data) => {
        try {
            console.log('########  -- Client data received via socket connection -- $$$$$', data);            
            const { issueId, userId, content } = data;
            if (!issueId || !userId || !content) {
                throw new Error('Invalid data: issueId, userId, and content are required');
            }
            const comment = await createComments({issueId, userId, content});
            /** Emit the newComment to all the connected clients */
            io.emit('newComment', comment);
            console.log(`New comment created: ${comment.content}`);
        } catch (error) {
            console.error(`Failed to create comment: ${error.message}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});