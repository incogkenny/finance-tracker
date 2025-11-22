import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants.ts";
import { useState, useEffect } from "react";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Custom Frontend Protection for route authorisation
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const refreshToken = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      try {
        const response = await api.post("/api/token/refresh/", {
          refresh: refreshToken,
        });
        if (!mounted) return;
        if (response.status === 200) {
          localStorage.setItem(ACCESS_TOKEN, response.data.access);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.log(error);
        if (mounted) setIsAuthorized(false);
      }
    };

    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        if (mounted) setIsAuthorized(false);
        return;
      }
      const decoded = jwtDecode<{ exp?: number }>(token);
      const tokenExpiration = decoded.exp;
      const now = Date.now() / 1000;

      if (!tokenExpiration || tokenExpiration < now) {
        await refreshToken();
      } else {
        if (mounted) setIsAuthorized(true);
      }
    };

    (async () => {
      try {
        await auth();
      } catch {
        if (mounted) setIsAuthorized(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to={"/login"} />;
}

export default ProtectedRoute;
