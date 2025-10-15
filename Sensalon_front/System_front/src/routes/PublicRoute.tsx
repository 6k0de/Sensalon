import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};
