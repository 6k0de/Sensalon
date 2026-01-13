import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "../Layout";
import { Home } from "../pages/Home";
import { Products } from "../pages/Products";
import { Companies } from "../pages/Companies";
import { Users } from "../pages/Users";
import { ProtectedRoute } from "./ProtectedRoute"; // Importar el componente de ruta protegida
import { LoginAuth } from "../pages/Auth";
import { Transactions } from "../pages/Transactions";
import { OrdersPending } from "../pages/OrdersPending";
import { Slider } from "../pages/Slider";
import { BankConfiguration } from "../pages/BankConfiguration";
import { Suppliers } from "../pages/Suppliers";
import { Categories } from "../pages/Categories";
import { Warehouse } from "../pages/Warehouse";
import { WareHouseForm } from "../components/WareHouseForm";
import { DiscountCodesPage } from "../pages/Discounts";

export const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginAuth />} />
        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transacciones"
          element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ordenespendientes"
          element={
            <ProtectedRoute>
              <Layout>
                <OrdersPending />
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
          path="/marcas"
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
          path="/almacen"
          element={
            <ProtectedRoute>
              <Layout>
                <Warehouse />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/entradaAlmacen"
          element={
            <ProtectedRoute>
              <Layout>
                <WareHouseForm />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/descuentos"
          element={
            <ProtectedRoute>
              <Layout>
                <DiscountCodesPage />
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
        <Route
          path="/slider"
          element={
            <ProtectedRoute>
              <Layout>
                <Slider />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracionbancaria"
          element={
            <ProtectedRoute>
              <Layout>
                <BankConfiguration />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};
