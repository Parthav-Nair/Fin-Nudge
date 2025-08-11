import React from "react";
import AuthForm from "@/components/AuthForm";
import { loginUser } from "@/api/api";
import { useAuth } from "@/auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();

  const handle = async ({ email, password }) => {
    const res = await loginUser(email, password);
    const { user, token } = res.data;
    login(user, token);
  };

  return <AuthForm title="Log in" fields={[
    { name: "email", type: "email", placeholder: "Email" },
    { name: "password", type: "password", placeholder: "Password" }
  ]} onSubmit={handle} />;
}
