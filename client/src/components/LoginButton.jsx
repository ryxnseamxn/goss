import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

const LoginButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if(isAuthenticated){
    return <Navigate to="/profile"/>
  }

  return (
    <button 
      onClick={() => loginWithRedirect()} 
      className="button login"
    >
      Log In
    </button>
  );
};

export default LoginButton;
