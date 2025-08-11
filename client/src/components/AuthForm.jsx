import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AuthForm({ title, fields, onSubmit }) {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <form onSubmit={submit} className="space-y-4">
            {fields.map(f => (
              <Input key={f.name} name={f.name} type={f.type} placeholder={f.placeholder} onChange={handleChange} />
            ))}
            {error && <div className="text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : title}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
