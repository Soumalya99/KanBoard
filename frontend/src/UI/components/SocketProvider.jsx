/** Creating a socket context to handle
 * socket connection and event handling in this app
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only create socket once
        if (!socketRef.current) {
            socketRef.current = io(
                import.meta.env.VITE_BACKEND_URL || 'http://localhost:4114',
                {
                    transports: ['websocket'], // optional: force websocket
                    autoConnect: true,
                    reconnection: true,
                }
            );

            // Connection status listeners
            socketRef.current.on('connect', () => setIsConnected(true));
            socketRef.current.on('disconnect', () => setIsConnected(false));
            socketRef.current.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setIsConnected(false);
            });
        }

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Optionally, you can provide connection status as well
    return (
        <SocketContext.Provider value={socketRef.current}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);