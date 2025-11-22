import Form from "../components/Form.tsx";

function Register() {
  return <Form route={"api/user/register"} method={"register"}></Form>;
}

export default Register;
