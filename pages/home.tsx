import { useRouter } from "next/router";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Clear the token from local storage
        localStorage.removeItem("token");
        alert("You have successfully logged out!");

        // Redirect to the login page
        router.push("/login");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to logout.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  // Redirect to login if no token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-md">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Welcome to Scriptorium
        </h1>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            Logout
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
