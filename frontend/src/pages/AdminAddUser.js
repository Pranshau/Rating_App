import React, { useState } from "react";
import { adminAddUser } from "../services/api";

export default function AdminAddUser({ onUserAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (form.name.trim().length < 4 || form.name.trim().length > 60) {
      return "Name must be 4-60 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email";
    }

    // Password: 8-16 chars, at least 1 uppercase, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/;
    if (!passwordRegex.test(form.password)) {
      return "Password must be 8-16 characters, include 1 uppercase and 1 special character";
    }

    const allowedRoles = ["admin", "user", "owner"];
    if (!allowedRoles.includes(form.role)) {
      return "Invalid role";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Frontend validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      console.log("Submitting user payload:", form);
      const user = await adminAddUser(form);
      console.log("Backend response:", user);

      if (user.error) {
        setError(user.error);
      } else {
        setSuccess("User added successfully!");
        onUserAdded();
        setForm({
          name: "",
          email: "",
          address: "",
          password: "",
          role: "user",
        });
      }
    } catch (err) {
      console.error("Add User exception:", err);
      setError("Failed to add user");
    }
  };

  return (
    <div>
      <h2>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name (20-60 chars)"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address (optional)"
          value={form.address}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password (8-16 chars, 1 uppercase, 1 special char)"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="owner">Store Owner</option>
        </select>
        <button type="submit">Add User</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
