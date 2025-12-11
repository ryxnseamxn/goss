import { useEffect, useState, useRef } from "react";
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useForm } from "react-hook-form"
import { useAuth0 } from "@auth0/auth0-react";
import { useParams, useNavigate } from 'react-router-dom';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const backendBase = import.meta.env.VITE_LOCAL_IP;

const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3
});

const ChatRoom = () => {
    const containerRef = useRef(null);
    const { user } = useAuth0();
    const { roomId: roomIdParam } = useParams();
    const navigate = useNavigate();
    
    const [roomId, setRoomId] = useState(null);
    const [roomName, setRoomName] = useState(null);
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [connection, setConnection] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const response = await fetch(
            `${backendBase}:5248/api/chatrooms/${roomId}/message`, 
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    message: data.Sent,
                    username: randomName,
                    email: user.email
                }),
            }
        );
        reset();
    }

    const handleDeleteRoom = async () => {
        if (!confirm(`Are you sure you want to delete room "${roomId}"? This will kick all users out.`)) {
            return;
        }

        try {
            const response = await fetch(`${backendBase}:5248/api/chatrooms/${roomId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // The RoomDeleted SignalR event will handle navigation
                console.log('Room deleted successfully');
            } else {
                const text = await response.text();
                alert(`Failed to delete room: ${text}`);
            }
        } catch (error) {
            console.error('Failed to delete room:', error);
            alert('Failed to delete room');
        }
    }

    useEffect(() => {
        // Fetch user role
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

            conn.on("ReceiveMessage", message => {
                const classifiedMessage = {
                    ...message, 
                    isMine: message.email === user.email
                }
                setMessages(prev => [...prev, classifiedMessage])
            });

            // Listen for room deletion - redirect all users back to rooms page
            conn.on("RoomDeleted", (deletedRoomId) => {
                if (deletedRoomId === roomIdParam) {
                    navigate('/rooms');
                }
            });

            try {
                await conn.start();
                console.log("Connected");
                setConnection(conn);
                
                if (!roomIdParam) {
                    setError("No room ID provided");
                    return;
                }
                
                setRoomId(roomIdParam);

                const success = await conn.invoke("JoinRoom", roomIdParam);
                if(!success){
                    setError("Room does not exist");
                    console.log("room does not exist");
                    return; 
                }
                console.log(`Joined room ${roomIdParam}`);
                
                // Fetch room name and message history
                try {
                    const roomsResponse = await fetch(`${backendBase}:5248/api/chatrooms`);
                    if (roomsResponse.ok) {
                        const allRooms = await roomsResponse.json();
                        const currentRoom = allRooms.find(r => r.roomId === roomIdParam);
                        if (currentRoom) {
                            setRoomName(currentRoom.roomName);
                        }
                    }

                    const response = await fetch(`${backendBase}:5248/api/chatrooms/${roomIdParam}/messages`);
                    if (response.ok) {
                        const history = await response.json();
                        const classifiedHistory = history.map(msg => ({
                            username: msg.username,
                            message: msg.content,
                            email: msg.email,
                            isMine: msg.email === user.email
                        }));
                        setMessages(classifiedHistory);
                    }
                } catch (err) {
                    console.error("Failed to fetch message history:", err);
                }      
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        connect();

        return () => {
            if (connection && roomIdParam) {
                connection.invoke("LeaveRoom", roomIdParam)
                    .then(() => console.log(`Left room ${roomIdParam}`))
                    .catch(err => console.error("Error leaving room:", err))
                    .finally(() => connection.stop());
            }
        };
    }, [roomIdParam]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]); 

    if (error) {
        return (
            <div className="min-h-screen bg-[#0a0d36] flex items-center justify-center">
                <div className="bg-[#1a1e47] border border-amber-500/20 rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                    <p className="text-amber-300 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="bg-amber-500 text-[#0a0d36] px-6 py-2 rounded-lg font-semibold hover:bg-amber-400"
                    >
                        Back to Rooms
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0d36] flex flex-col items-center p-4">
            <div className="w-full max-w-5xl mb-4 flex justify-between items-center">
                <button
                    onClick={() => navigate('/rooms')}
                    className="bg-[#1a1e47] border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg font-semibold hover:bg-[#252a5a] hover:border-amber-400"
                >
                    Back to Rooms
                </button>
                <h1 className="text-2xl font-bold text-amber-400">
                    {roomName || roomId}
                </h1>
                {userRole === 0 ? (
                    <button
                        onClick={handleDeleteRoom}
                        className="bg-red-500 border border-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                        🗑️ Delete Room
                    </button>
                ) : (
                    <div className="w-32"></div>
                )}
            </div>

            <div className="w-full max-w-5xl flex flex-col h-[85vh] bg-[#1a1e47] border border-amber-500/20 rounded-xl shadow-lg">
                <div 
                    className="flex flex-col flex-1 overflow-y-auto p-4 space-y-2"
                    ref={containerRef}
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[70%] p-3 rounded-lg ${
                            msg.isMine 
                                ? "bg-amber-500 text-[#0a0d36] self-end ml-auto" 
                                : "bg-[#252a5a] text-amber-50 border border-amber-500/30 self-start mr-auto"
                            }`}
                        >
                            <strong className="text-sm">{msg.username}</strong>
                            <p className="mt-1">{msg.message}</p>
                        </div>
                    ))}
                </div>
                <div className="border-t-2 border-amber-500/30 p-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
                        <input 
                            {...register("Sent", { required: true })} 
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-[#0a0d36] border-2 border-amber-500 text-amber-50 placeholder-amber-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" 
                        />
                        {errors.Sent && <span className="text-red-400">Invalid Message</span>}
                        <button 
                            type="submit"
                            className="bg-amber-500 text-[#0a0d36] px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    ); 
}

export default ChatRoom;