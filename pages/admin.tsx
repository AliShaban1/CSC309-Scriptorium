import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const AdminPage = () => {
  const [reportedPosts, setReportedPosts] = useState([]);
  const [reportedComments, setReportedComments] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch the token from local storage
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if no token exists
      router.push("/login");
      return;
    }

    // Verify admin access
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      alert("Access denied: Admins only.");
      router.push("/login");
      return;
    }

    // Fetch reported posts and comments
    fetchReportedContent(token);
  }, [router]);

  const fetchReportedContent = async (token: string) => {
    try {
      const response = await fetch("/api/reports/fetchReports", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReportedPosts(data.reportedPosts);
        setReportedComments(data.reportedComments);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to fetch reported content.");
      }
    } catch (err) {
      console.error("Error fetching reported content:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  const handleHideContent = async (contentId: number, contentType: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await fetch("/api/reports/hideContent", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (response.ok) {
        alert("Content hidden successfully.");
        fetchReportedContent(token); // Refresh the reported content list
      } else {
        const data = await response.json();
        setError(data.message || "Failed to hide content.");
      }
    } catch (err) {
      console.error("Error hiding content:", err);
      setError("Something went wrong. Please try again later.");
    }
  };
  console.log(reportedComments);
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-6 max-w-2xl w-full">
          {error}
        </div>
      )}

      <div className="w-full max-w-6xl">
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Reported Blog Posts
          </h2>
          {reportedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportedPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="p-6 border rounded shadow-md bg-gray-800"
                >
                  <h3 className="text-2xl font-bold mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {post.description}
                  </p>
                  <p className="text-sm text-red-400 mb-4">
                    Reports: {post.reportCount}
                  </p>
                  {post.hidden ? (
                    <p className="text-sm text-red-400 mb-4"> Hidden </p>
                  ) : null}
                  <button
                    onClick={() => handleHideContent(post.id, "post")}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    Hide Post
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No reported blog posts found.</p>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4 border-b border-gray-700 pb-2">
            Reported Comments
          </h2>
          {reportedComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportedComments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="p-6 border rounded shadow-md bg-gray-800"
                >
                  <p className="text-lg text-gray-200 mb-4">
                    {comment.content}
                  </p>
                  <p className="text-sm text-red-400 mb-4">
                    Reports: {comment.reportCount}
                  </p>
                  {comment.hidden ? (
                    <p className="text-sm text-red-400 mb-4"> Hidden </p>
                  ) : null}

                  <button
                    onClick={() => handleHideContent(comment.id, "comment")}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                  >
                    Hide Comment
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No reported comments found.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
