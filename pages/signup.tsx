import { useState } from "react";
import { useRouter } from "next/router";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    profilePicture: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role: "user" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Redirect to the login page or home page
      router.push("/home");
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side */}
      <div
        className="w-1/2 hidden lg:flex flex-col justify-center items-start bg-cover bg-center relative text-white"
        style={{ backgroundImage: "url('/images/login-background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>{" "}
        {/* Dark overlay */}
        <div className="relative z-10 p-10 space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight">
            Welcome to <span className="text-accent">Scriptorium</span>
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            Build, execute, and share your code effortlessly. Scriptorium
            empowers developers to create, collaborate, and grow with powerful
            tools and an intuitive interface.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-indigo-400 rounded-full mr-2"></span>
              Write code in multiple programming languages.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-indigo-400 rounded-full mr-2"></span>
              Save and share reusable code templates.
            </li>
            <li className="flex items-center">
              <span className="inline-block w-4 h-4 bg-indigo-400 rounded-full mr-2"></span>
              Collaborate with fellow developers seamlessly.
            </li>
          </ul>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex justify-center items-center bg-white p-6">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Create an account
          </h2>
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSignup}>
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Enter your last name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Enter your phone number (optional)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white font-medium rounded ${
                loading ? "bg-gray-400" : "bg-indigo-500 hover:bg-indigo-600"
              }`}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
