import Form from "../components/Form.tsx";

function Login() {
  return <Form route={"/api/user/login"} method={"login"} />;
}

export default Login;
