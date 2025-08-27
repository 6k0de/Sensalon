import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: {children: any}) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    return isLoggedIn ? children : <Navigate to="/login" />;
};
