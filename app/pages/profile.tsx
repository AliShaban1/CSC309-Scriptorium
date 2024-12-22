import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const ProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    profilePicture: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setError("Failed to fetch user data. Please log in again.");
        }
      } catch {
        setError("An error occurred while fetching user data.");
      }
    };

    fetchUserData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to update profile.");
        return;
      }

      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setError(null);
      setSuccessMessage(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required. Please log in.");
          return;
        }

        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await fetch("/api/user/upload-avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || "Failed to upload profile picture.");
          return;
        }

        const data = await response.json();
        setSuccessMessage("Profile picture updated successfully!");
        setUser((prev) => ({ ...prev, profilePicture: data.user.profilePicture }));
      } catch (err) {
        setError("An error occurred while uploading the profile picture.");
      }
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-3xl relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-500 text-white py-1 px-3 rounded-md text-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
        >
          Logout
        </button>
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Profile</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {successMessage}
          </div>
        )}
        <div className="flex items-center space-x-6 mb-8">
          <div>
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No Photo</span>
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) {
                  setImageFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="bg-indigo-500 text-white py-2 px-4 rounded-md cursor-pointer hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Upload Photo
            </label>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
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
                value={user.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="First Name"
              />
            </div>
            <div className="w-1/2">
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
                value={user.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-black"
              placeholder="Phone Number"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;