import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Profile = () => {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    isAuthenticated && user ? (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-amber-50 rounded-xl p-8 flex flex-col items-center gap-4 border-2">
          <img 
            src={user.picture || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`} 
            alt={user.name || 'User'} 
            className="w-28 h-28 rounded-full object-cover border-4 border-amber-900"
            onError={(e) => {
              const target = e.target;
              target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`;
            }}
          />
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900">
              {user.name}
            </div>
            <div className="text-amber-800">
              {user.email}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/rooms')}
              className="bg-amber-500 text-[#0a0d36] px-6 py-2 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              Chat Rooms
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>
    ) : null
  );
};

export default Profile;