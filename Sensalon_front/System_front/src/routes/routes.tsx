import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Privacy, Terms } from "../pages/index";
import { Layout } from "../Layout";
import { Auth } from "../pages/Auth";
import { ProductosView } from "../components/Productos/prductosView";
import { ProductDetail } from "../pages/ProductDetail";
import { ShoppingCar } from "../pages/ShoppingCar";
import { RegisterForm } from "../components/Auths";

export const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Rutas que usan el Layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home key={window.location.pathname} />} />
                    <Route path="/productos" element={<ProductosView key={window.location.pathname} />} />
                    <Route path="/carrito" element={<ShoppingCar key={window.location.pathname} />} />
                    <Route path="/productDetail/:id" element={<ProductDetail key={window.location.pathname} />} />
                    <Route path="/terminos" element={<Terms key={window.location.pathname} />} />
                    <Route path="/avisoprivacidad" element={<Privacy key={window.location.pathname} />} />
                </Route>
                <Route path="/login" element={<Auth key={window.location.pathname} />} />
                <Route path="/register" element={<RegisterForm key={window.location.pathname} />} />
            </Routes>
        </Router>
    );
};
