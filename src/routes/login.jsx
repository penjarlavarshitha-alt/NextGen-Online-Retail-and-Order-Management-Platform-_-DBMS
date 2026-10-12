import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("accessToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate({ to: "/" });
    } catch (error) {
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">

      {/* Top E-commerce Header */}
      <header className="h-16 bg-[#131921] flex items-center px-6 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ff9900] flex items-center justify-center">
            <span className="text-2xl">🛒</span>
          </div>

          <div>
            <h1 className="text-white text-xl font-bold leading-none">
              NextGen Retail
            </h1>

            <p className="text-gray-400 text-xs mt-1">
              Retail & Order Management
            </p>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-1 relative overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ff9900]/20 blur-3xl" />

          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-[#146eb4]/15 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 w-96 h-64 rounded-full bg-blue-200/30 blur-3xl" />
        </div>

        <div className="relative min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-10">

          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">

            {/* Left Information Section */}
            <div className="hidden lg:block px-8">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500" />

                <span className="text-sm font-medium text-gray-700">
                  Online Retail Management Platform
                </span>
              </div>

              <h2 className="text-5xl font-bold tracking-tight text-[#172033] leading-tight">
                Manage your
                <span className="text-[#146eb4]"> retail business </span>
                smarter.
              </h2>

              <p className="mt-5 text-lg text-gray-600 max-w-lg leading-relaxed">
                Manage customers, products, inventory, orders, payments and
                deliveries from one centralized platform.
              </p>

              {/* Feature Cards */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg">

                <Feature
                  icon="👥"
                  title="Customers"
                  text="Manage customer records"
                />

                <Feature
                  icon="📦"
                  title="Products"
                  text="Organize your catalog"
                />

                <Feature
                  icon="🛒"
                  title="Orders"
                  text="Track every order"
                />

                <Feature
                  icon="🚚"
                  title="Delivery"
                  text="Monitor shipments"
                />

              </div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md mx-auto">

              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                {/* Card Top */}
                <div className="px-8 pt-8 pb-5">

                  <div className="flex justify-center mb-5 lg:hidden">
                    <div className="w-14 h-14 rounded-xl bg-[#ff9900] flex items-center justify-center shadow-sm">
                      <span className="text-3xl">🛒</span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-[#172033] text-center">
                    Welcome back
                  </h2>

                  <p className="mt-2 text-sm text-gray-500 text-center">
                    Sign in to access your retail dashboard
                  </p>

                </div>

                {/* Form */}
                <form
                  onSubmit={handleLogin}
                  className="px-8 pb-8 space-y-5"
                >

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email address
                    </label>

                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none transition focus:border-[#146eb4] focus:ring-2 focus:ring-[#146eb4]/15"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none transition focus:border-[#146eb4] focus:ring-2 focus:ring-[#146eb4]/15"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                      <p className="text-sm text-red-600">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-lg bg-[#ff9900] hover:bg-[#e88b00] text-white font-bold text-base transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  {/* Security Text */}
                  <div className="pt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <span>🔒</span>
                    <span>Secure access to your retail dashboard</span>
                  </div>

                </form>
              </div>

              {/* Bottom Text */}
              <p className="text-center text-xs text-gray-500 mt-5">
                NextGen Retail & Order Management Platform
              </p>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center">
        <p className="text-xs text-gray-500">
          © 2026 NextGen Retail. Built for modern retail management.
        </p>
      </footer>
    </div>
  );
}

/* Small Feature Card */
function Feature({ icon, title, text }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-800">
            {title}
          </p>

          <p className="text-xs text-gray-500 mt-0.5">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}