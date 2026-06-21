import React, { useEffect } from 'react';
import SignupForm from '../components/auth/SignupForm';
const SignupPage = () => {
    useEffect(() => {
        document.title = 'Sign Up - TSWheels';
    }, []);
    return (<div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <SignupForm />
    </div>);
};
export default SignupPage;
