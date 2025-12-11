import { useNavigate } from "react-router-dom";

const ChatRoomButton = () => {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate("/chatroom")} 
      className="bg-amber-900 p-3 rounded-xl text-amber-50 hover:bg-amber-950 cursor-pointer"
    >
      Join Chat Room
    </button>
  );
};

export default ChatRoomButton;
