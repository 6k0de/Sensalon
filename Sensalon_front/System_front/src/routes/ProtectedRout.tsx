import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = localStorage.getItem("auth") === "true";

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ message: "Debes iniciar sesión para continuar" }} />;
    }

    return children;
};
