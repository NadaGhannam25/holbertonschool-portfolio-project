import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useNavigate,
    useParams,
} from "react-router-dom";

import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Subscriptions from "./pages/Subscriptions";
import AddSubscription from "./pages/AddSubscription";
import SubscriptionDetails from "./pages/SubscriptionDetails";
import TopLogo from "./components/TopLogo";
import DierhaLanding from "./pages/DierhaLanding/DierhaLanding";

import { loginUser, logoutUser, registerUser } from "./services/authService";

function AppContent() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const [authMessage, setAuthMessage] = useState("");
    const [authMessageType, setAuthMessageType] =
        useState<"success" | "error" | "info">("info");

    const resetToken =
        new URLSearchParams(window.location.search).get("token") ?? "";

    const showAuthMessage = (
        message: string,
        type: "success" | "error" | "info" = "error",
    ) => {
        setAuthMessageType(type);
        setAuthMessage(message);

        window.setTimeout(() => {
            setAuthMessage("");
        }, 4000);
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            setAuthMessage("");

            await loginUser(email, password);

            navigate("/home");
        } catch (error) {
            showAuthMessage(
                error instanceof Error
                    ? error.message
                    : "حدث خطأ أثناء تسجيل الدخول",
                "error",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (
        name: string,
        email: string,
        password: string,
    ) => {
        try {
            setIsLoading(true);
            setAuthMessage("");

            await registerUser(name, email, password);

            navigate("/home");
        } catch (error) {
            showAuthMessage(
                error instanceof Error
                    ? error.message
                    : "حدث خطأ أثناء إنشاء الحساب",
                "error",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logoutUser();
        navigate("/login");
    };

    const SubscriptionDetailsWrapper = () => {
        const { id } = useParams();

        return (
            <SubscriptionDetails
                onLogout={handleLogout}
                goToHome={() => navigate("/home")}
                goToSubscriptions={() => navigate("/subscriptions")}
                subscriptionId={id || "1"}
            />
        );
    };

    return (
        <Routes>
            <Route
                path="/"
                element={<DierhaLanding />}
            />
            <Route
                path="/home"
                element={
                    <Home
                        onLogout={handleLogout}
                        goToHome={() => navigate("/home")}
                        goToSubscriptions={() =>
                            navigate("/subscriptions")
                        }
                        goToAddSubscription={() =>
                            navigate("/subscriptions/add")
                        }
                    />
                }
            />

            <Route
                path="/subscriptions"
                element={
                    <Subscriptions
                        onLogout={handleLogout}
                        goToHome={() => navigate("/home")}
                        goToSubscriptions={() =>
                            navigate("/subscriptions")
                        }
                        goToAddSubscription={() =>
                            navigate("/subscriptions/add")
                        }
                        goToSubscriptionDetails={(id) =>
                            navigate(`/subscriptions/${id}`)
                        }
                    />
                }
            />

            <Route
                path="/subscriptions/add"
                element={
                    <AddSubscription
                        onLogout={handleLogout}
                        goToHome={() => navigate("/home")}
                        goToSubscriptions={() =>
                            navigate("/subscriptions")
                        }
                    />
                }
            />

            <Route
                path="/subscriptions/:id"
                element={<SubscriptionDetailsWrapper />}
            />

            <Route
                path="/forgot-password"
                element={
                    <>
                        <TopLogo />

                        <ForgotPassword
                            goToLogin={() => {
                                setAuthMessage("");
                                navigate("/login");
                            }}
                        />
                    </>
                }
            />

            <Route
                path="/reset-password"
                element={
                    <>
                        <TopLogo />

                        <ResetPassword token={resetToken} />
                    </>
                }
            />

            <Route
                path="/login"
                element={
                    <>
                        <TopLogo />

                        <Login
                            onLogin={handleLogin}
                            goToRegister={() => {
                                setAuthMessage("");
                                navigate("/register");
                            }}
                            goToForgotPassword={() => {
                                setAuthMessage("");
                                navigate("/forgot-password");
                            }}
                            isLoading={isLoading}
                            externalMessage={authMessage}
                            externalMessageType={authMessageType}
                        />
                    </>
                }
            />

            <Route
                path="/register"
                element={
                    <>
                        <TopLogo />

                        <Register
                            onRegister={handleRegister}
                            goToLogin={() => {
                                setAuthMessage("");
                                navigate("/login");
                            }}
                            isLoading={isLoading}
                            externalMessage={authMessage}
                            externalMessageType={authMessageType}
                        />
                    </>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
