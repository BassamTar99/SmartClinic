// React + Tailwind: Sign In and Sign Up Page UI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!isSignIn && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isSignIn) {
        console.log("Attempting login...");
        const result = await login(formData.email, formData.password);
        console.log("Login result:", result);
        
        if (result.success) {
          console.log("Login successful, navigating to dashboard...");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("Login failed:", result.error);
          setError(result.error.message || "Login failed");
        }
      } else {
        // Handle sign up
        console.log("Attempting registration...");
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: "patient" // Default role for new users
        });
        console.log("Registration response:", response.data);
        
        if (response.data.token) {
          console.log("Registration successful, attempting login...");
          const loginResult = await login(formData.email, formData.password);
          console.log("Post-registration login result:", loginResult);
          
          if (loginResult.success) {
            console.log("Post-registration login successful, navigating to dashboard...");
            navigate("/dashboard", { replace: true });
          } else {
            console.log("Post-registration login failed:", loginResult.error);
            setError(loginResult.error.message || "Registration successful but login failed");
          }
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err.response?.data?.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 mb-4">
          <button className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50">
            Continue with Google
          </button>
          <button className="w-full border border-gray-300 py-2 rounded hover:bg-gray-50">
            Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <hr className="flex-1 border-gray-300" />
          <span className="text-sm text-gray-400">OR</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isSignIn && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded p-2"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="w-full border border-gray-300 rounded p-2"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded p-2"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {!isSignIn && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full border border-gray-300 rounded p-2"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          {isSignIn && (
            <div className="flex justify-between text-sm mb-2">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="form-checkbox" />
                Remember me
              </label>
              <a href="#" className="text-blue-500 hover:underline">
                Forgot your password?
              </a>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : (isSignIn ? "Sign In" : "Create Account")}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsSignIn(!isSignIn);
              setError("");
              setFormData({
                email: "",
                password: "",
                name: "",
                confirmPassword: ""
              });
            }}
            className="text-blue-500 ml-1 hover:underline"
          >
            {isSignIn ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
