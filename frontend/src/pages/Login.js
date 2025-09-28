import React, { useState } from "react";
import { login } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      const response = await login(email, password);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Save token and user info
      localStorage.setItem("token", response.token);
      const payload = JSON.parse(atob(response.token.split(".")[1]));
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: payload.id,
          name: payload.name,
          email: payload.email,
          role: payload.role,
        })
      );

      // Navigate based on role
      if (payload.role === "admin") navigate("/admin/dashboard");
      else if (payload.role === "owner") navigate("/owner/dashboard");
      else navigate("/stores");
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
          Welcome Back
        </h2>

        {error && (
          <p
            style={{
              color: "red",
              marginBottom: "20px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "12px",
            background: "#4f46e5",
            color: "white",
            fontSize: "16px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "15px",
            transition: "background 0.3s",
          }}
          onMouseOver={(e) => (e.target.style.background = "#4338ca")}
          onMouseOut={(e) => (e.target.style.background = "#4f46e5")}
        >
          Login
        </button>

        <p style={{ textAlign: "center", color: "#555" }}>
          Don’t have an account?{" "}
          <span
            style={{ color: "#4f46e5", cursor: "pointer", fontWeight: "bold" }}
            onClick={() => navigate("/signup")}
          >
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}
