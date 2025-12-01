import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants.ts";
import React, { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Custom Frontend Protection for route authorisation
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const refreshToken = async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (!storedRefreshToken) {
        if (mounted) setIsAuthorized(false);
        return;
      }
      try {
        const response = await api.post("/api/token/refresh/", {
          refresh: storedRefreshToken,
        });
        if (!mounted) return;
        if (response.status === 200) {
          localStorage.setItem(ACCESS_TOKEN, response.data.access);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.log("Failed to refresh token:", error);
        if (mounted) setIsAuthorized(false);
      }
    };

    const auth = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        if (mounted) setIsAuthorized(false);
        return;
      }
      try {
        const decoded = jwtDecode<{ exp?: number }>(token);
        const now = Date.now() / 1000;
        // access expired -> try refresh

        if (!decoded.exp || decoded.exp < now) {
          await refreshToken();
        } else {
          if (mounted) setIsAuthorized(true);
        }
      } catch (err) {
        console.log("Failed to decode access token:", err);
        // invalid access token -> try refresh
        await refreshToken();
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

  return isAuthorized ? <>{children}</> : <Navigate to={"/login"} />;
}

export default ProtectedRoute;
