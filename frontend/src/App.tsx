import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import MainLayout from "@/components/MainLayout.tsx";
import { Transactions } from "@/pages/Transactions.tsx";
import { Analytics } from "@/pages/Analytics.tsx";
import { Categories } from "@/pages/Categories.tsx";

function Logout() {
  localStorage.clear();
  return <Navigate to={"/login"} />;
}
// Removes lingering access tokens
function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="bottom-right" />
      <Routes>
        <Route
          path={"/"}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Home />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={"/transactions"}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Transactions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={"/analytics"}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={"/categories"}
          element={
            <ProtectedRoute>
              <MainLayout>
                <Categories />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/logout"} element={<Logout />}></Route>
        <Route path={"/register"} element={<RegisterAndLogout />} />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
