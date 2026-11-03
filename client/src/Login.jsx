import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // 1. Check Hardcoded Admin
      if (email === "sahil@gmail.com" && password === "sahil123") {
        localStorage.setItem("ayulink_active_role", "Admin");
        navigate("/dashboard");
        return;
      }

      // 2. Check Mock Database for Standard Users
      const mockDb = JSON.parse(
        localStorage.getItem("ayulink_mock_db") || "{}",
      );
      if (mockDb[email] && mockDb[email].password === password) {
        localStorage.setItem("ayulink_active_role", "Expert");
        localStorage.setItem("ayulink_active_name", mockDb[email].name);
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Please try again or create an account.");
      }
    } else {
      // Handle Registration
      if (!name.trim()) {
        setError("Full Name is required for registration.");
        return;
      }

      const mockDb = JSON.parse(
        localStorage.getItem("ayulink_mock_db") || "{}",
      );
      if (mockDb[email]) {
        setError("An account with this email already exists.");
        return;
      }

      // Save to mock database
      mockDb[email] = { name, password, role: "Expert" };
      localStorage.setItem("ayulink_mock_db", JSON.stringify(mockDb));

      // Log them in immediately
      localStorage.setItem("ayulink_active_role", "Expert");
      localStorage.setItem("ayulink_active_name", name);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex justify-center text-3xl font-extrabold tracking-tight text-slate-900 mb-6"
        >
          Ayu<span className="text-blue-600">Link</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-slate-900">
          {isLogin ? "Sign in to your account" : "Create an expert account"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isLogin
              ? "register as a new domain expert"
              : "sign in to your existing account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm font-medium border border-red-200 text-center">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-slate-900"
                >
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
              >
                {isLogin ? "Sign in" : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
