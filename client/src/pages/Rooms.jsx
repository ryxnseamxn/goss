import { useEffect, useState } from "react";
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const backendBase = import.meta.env.VITE_LOCAL_IP;

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [connection, setConnection] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth0();

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch(`${backendBase}:5248/api/user/${user.email}`);
                if (response.ok) {
                    const userData = await response.json();
                    setUserRole(userData.role);
                }
            } catch (error) {
                console.error("Failed to fetch user role:", error);
            }
        };

        fetchUserRole();

        const connect = async () => {
            const conn = new HubConnectionBuilder()
                .withUrl(`${backendBase}:5248/chat`, {
                    skipNegotiation: false,
                    transport: 1
                })
                .build();

            // Listen for new rooms being created
            conn.on("RoomCreated", (room) => {
                setRooms(prev => {
                    // Prevent duplicates
                    const exists = prev.some(r => r.roomId === room.roomId);
                    if (exists) return prev;
                    return [...prev, room];
                });
            });

            // Listen for rooms being deleted
            conn.on("RoomDeleted", (roomId) => {
                setRooms(prev => prev.filter(r => r.roomId !== roomId));
            });

            // Listen for room updates (user count changes)
            conn.on("RoomUpdated", (room) => {
                setRooms(prev => prev.map(r => 
                    r.roomId === room.roomId 
                        ? { ...r, roomName: room.roomName, userCount: room.userCount }
                        : r
                ));
            });

            try {
                await conn.start();
                console.log("Connected to SignalR hub");
                setConnection(conn);
                setIsConnected(true);
                
                // Fetch existing rooms
                await fetchRooms();
            } catch (err) {
                console.error("SignalR connection error:", err);
            }
        };

        connect();

        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    // Refetch rooms when component becomes visible (e.g., navigating back from chat room)
    useEffect(() => {
        if (isConnected) {
            fetchRooms();
        }
    }, [isConnected]);

    // Refetch rooms when window gains focus or user navigates back
    useEffect(() => {
        const handleFocus = () => {
            if (isConnected) {
                fetchRooms();
            }
        };

        window.addEventListener('focus', handleFocus);
        // Also fetch when this component mounts (user navigated here)
        if (isConnected) {
            fetchRooms();
        }

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [isConnected]);

    const fetchRooms = async () => {
        try {
            const response = await fetch(`${backendBase}:5248/api/chatrooms`);
            if (response.ok) {
                const data = await response.json();
                setRooms(data);
            }
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        }
    };

    const handleCreateRoom = async () => {
        const roomName = uniqueNamesGenerator({
            dictionaries: [adjectives, colors, animals]
        });

        try {
            const response = await fetch(`${backendBase}:5248/api/chatrooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomName })
            });

            if (!response.ok) {
                const text = await response.text();
                alert(text);
            }
        } catch (error) {
            console.error("Failed to create room:", error);
        }
    };

    const handleJoinRoom = (roomId) => {
        navigate(`/chatroom/${roomId}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0d36] flex flex-col items-center p-8">
            <div className="w-full max-w-4xl">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-[#1a1e47] border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg font-semibold hover:bg-[#252a5a] hover:border-amber-400 transition-colors"
                    >
                        Profile
                    </button>
                </div>
                
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-amber-400 mb-2">Chat Rooms</h1>
                    <p className="text-amber-300">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                </div>

                {userRole === 0 && (
                <div className="bg-[#1a1e47] rounded-xl p-6 mb-6 shadow-lg border border-amber-500/20">
                    <h2 className="text-2xl font-semibold text-amber-400 mb-4">Create New Room</h2>
                    <button
                        onClick={handleCreateRoom}
                        className="w-full bg-amber-500 text-[#0a0d36] px-6 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
                    >
                         Create Room
                    </button>
                </div>
                )}

                <div className="bg-[#1a1e47] rounded-xl p-6 shadow-lg border border-amber-500/20">
                    <h2 className="text-2xl font-semibold text-amber-400 mb-4">
                        Available Rooms ({rooms.length})
                    </h2>
                    
                    {rooms.length === 0 ? (
                        <div className="text-center py-12 text-amber-300">
                            <p className="text-xl">No rooms available</p>
                            <p className="text-sm mt-2">Create a new room to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {rooms.map((room) => (
                                <div
                                    key={room.roomId}
                                    className="flex items-center justify-between p-4 bg-[#0a0d36] border-2 border-amber-500/30 rounded-lg hover:border-amber-400 transition-colors"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-amber-400">
                                            {room.roomName}
                                        </h3>
                                        <p className="text-sm text-amber-300">
                                            {room.userCount} {room.userCount === 1 ? 'user' : 'users'} online
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleJoinRoom(room.roomId)}
                                        className="bg-amber-500 text-[#0a0d36] px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
                                    >
                                        Join Room
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Rooms;