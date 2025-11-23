import Form from "../components/Form.tsx";

function Register() {
  return <Form route={"api/users/register"} method={"register"}></Form>;
}

export default Register;
