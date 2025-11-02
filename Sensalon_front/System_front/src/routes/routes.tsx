import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Privacy, Terms } from "../pages/index";
import { Layout } from "../Layout";
import { Auth } from "../pages/Auth";
import { ProductosView } from "../components/Productos/prductosView";
import { ProductDetail } from "../pages/ProductDetail";
import { ShoppingCar } from "../pages/ShoppingCar";
import { RegisterForm } from "../components/Auths";
import { Salons } from "../pages/Salons";
import { ForgotPassword } from "../components/Auths/PasswordRecovery/forgotPassword";
import { VerifyToken } from "../components/Auths/PasswordRecovery/verifyCode";
import { ResetPassword } from "../components/Auths/PasswordRecovery/resetPassword";
import { PasswordResetSuccess } from "../components/Auths/PasswordRecovery/passwordSucces";
import { ProtectedRoute } from "./ProtectedRout";
import { PublicRoute } from "./PublicRoute";
import { MyCredit } from "../pages/MyCredit";
import { MyOrders } from "../pages/MyOrders";
import { PaymentReviewInfo } from "../pages/PendingPaymentTransfer";
import { PaymentErrorPage } from "../pages/ErrorPayment";
import { PaymentSuccessPage } from "../pages/SuccesPayment";
import { PaymentPendingPage } from "../pages/PendingPayment";

export const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Rutas que usan el Layout */}
                <Route element={<Layout />}>
                    <Route path="/" element={<Home key={window.location.pathname} />} />
                    <Route path="/productos" element={<ProductosView key={window.location.pathname} />} />
                    <Route path="/salons" element={<Salons key={window.location.pathname} />} />
                    <Route
                        path="/carrito"
                        element={
                            <ProtectedRoute>
                                <ShoppingCar key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/myCredit"
                        element={
                            <ProtectedRoute>
                                <MyCredit key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/myOrders"
                        element={
                            <ProtectedRoute>
                                <MyOrders key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/transferPending"
                        element={
                            <ProtectedRoute>
                                <PaymentReviewInfo key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/payments/failure'
                        element={
                            <ProtectedRoute>
                                <PaymentErrorPage key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/payments/success'
                        element={
                            <ProtectedRoute>
                                <PaymentSuccessPage key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/payments/pending'
                        element={
                            <ProtectedRoute>
                                <PaymentPendingPage key={window.location.pathname} />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/productDetail/:id" element={<ProductDetail key={window.location.pathname} />} />
                    <Route path="/terminos" element={<Terms key={window.location.pathname} />} />
                    <Route path="/avisoprivacidad" element={<Privacy key={window.location.pathname} />} />
                </Route>

                {/* Auth */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Auth key={window.location.pathname} />
                        </PublicRoute>
                    } />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <RegisterForm key={window.location.pathname} />
                        </PublicRoute>
                    } />

                {/* Password Recovery Flow */}
                <Route path="/forgot-password" element={<ForgotPassword key={window.location.pathname} />} />
                <Route path="/verify-token" element={<VerifyToken key={window.location.pathname} />} />
                <Route path="/reset-password" element={<ResetPassword key={window.location.pathname} />} />
                <Route path="/password-reset-success" element={<PasswordResetSuccess key={window.location.pathname} />} />

            </Routes>
        </Router>
    );
};
