import React, { useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
const LoginPage = () => {
    useEffect(() => {
        document.title = 'Login - TSWheels';
    }, []);
    return (<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <LoginForm />
    </div>);
};
export default LoginPage;
