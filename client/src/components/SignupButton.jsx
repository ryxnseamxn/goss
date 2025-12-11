import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

const SignupButton = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if(isAuthenticated){
    return <Navigate to="/profile"/>
  }

  return (
    <button 
      onClick={() => loginWithRedirect({
        authorizationParams: {
            screen_hint: "signup"
        }
      })} 
      className="button login"
    >
      Sign up
    </button>
  );
};

export default SignupButton;
