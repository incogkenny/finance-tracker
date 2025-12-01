import React, { useState } from "react";
import api from "../api.ts";
import { Link, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.ts";
import "../styles/Form.css";
import LoadingIndicator from "./LoadingIndicator.tsx";

interface FormProps {
  route: string;
  method: string;
}
// Used for both Login and Register pages
function Form({ route, method }: FormProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Login" : "Register";
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault(); // prevents reloading page when submitting form

    try {
      const res = await api.post(route, { username, password });
      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={"form-container"}>
      <h1>{name}</h1>
      <input
        className={"form-input"}
        type={"text"}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={"Enter Username"}
      />
      <input
        className={"form-input"}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={"Enter Password"}
      />
      <button className={"form-button"} type={"submit"}>
        {name}
      </button>
      {method === "register" ? (
        <Link to={"/login"}>Or Log In </Link>
      ) : (
        <Link to={"/register"}>Or Sign Up</Link>
      )}
      {loading && <LoadingIndicator />}
    </form>
  );
}
export default Form;
