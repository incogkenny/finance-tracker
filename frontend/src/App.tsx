// import react from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  // // Navigation
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

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
      <Routes>
        <Route
          path={"/"}
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/*<Route*/}
        {/*  path={"/transactions"}*/}
        {/*  element={*/}
        {/*    <ProtectedRoute>*/}
        {/*      <Transactions />*/}
        {/*    </ProtectedRoute>*/}
        {/*  }*/}
        {/*/>*/}
        {/*<Route path={"/analytics"} element={<Analytics />} />*/}
        {/*<Route path={"/categories"} element={<Categories />} />*/}
        <Route path={"/login"} element={<Login />} />
        <Route path={"/logout"} element={<Logout />}></Route>
        <Route path={"/register"} element={<RegisterAndLogout />} />
        <Route path={"*"} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
