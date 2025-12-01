import Form from "../components/Form.tsx";

function Login() {
  return <Form route={"/api/users/login/"} method={"login"} />;
}

export default Login;
