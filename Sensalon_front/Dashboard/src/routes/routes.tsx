import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "../Layout";
import { Home } from "../pages/Home";
import { Products } from "../pages/Products";
import { Companies } from "../pages/Companies";
import { Users } from "../pages/Users";
import { Categories } from "../pages/Categories";
import { ProtectedRoute } from "./ProtectedRoute"; // Importar el componente de ruta protegida
import { LoginAuth } from "../pages/Auth";

export const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginAuth />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Home />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/productos"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Products />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/empresas"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Companies />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/usuarios"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Users />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/categorias"
                    element={
                        <ProtectedRoute>
                            <Layout>
                                <Categories />
                            </Layout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};
