import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';

const Login = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <div className="bg-amber-50 rounded-xl p-8 flex flex-col gap-4 border-2">
                <h1 className="text-3xl font-bold text-amber-900 text-center">Welcome to Goss</h1>
                <LoginButton />
                <SignupButton />
            </div>
        </div>
    );
}

export default Login;