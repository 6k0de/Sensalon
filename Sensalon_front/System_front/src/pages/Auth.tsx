import { useState } from 'react';
import { LoginForm, RegisterForm } from '../components/Auths';
export const Auth = () => {
    const [isLogin] = useState(true);

    return (
        <div className="flex items-center justify-center bg-gradient-to-br">

            <div className="w-full md:w-full">
                {isLogin ? <LoginForm /> : <RegisterForm />}
            </div>
        </div>
    );
};
