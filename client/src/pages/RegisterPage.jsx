import React from "react";
import AuthForm from "@/components/AuthForm";
import { registerUser } from "@/api/api";
import { useNavigate } from "react-router-dom";

export default function RegisterPage(){
  const navigate = useNavigate();
  const handle = async ({ name, email, password }) => {
    await registerUser(name, email, password);
    navigate("/login");
  };
  return <AuthForm title="Register" fields={[
    { name: "name", type: "text", placeholder: "Full name" },
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" }
  ]} onSubmit={handle} />;
}
