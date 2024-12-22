import { GetServerSideProps } from "next";
import Link from "next/link";
import Comment from "@/components/Comment";
import TemplateCard from "@/components/TemplateCard";
import { useEffect, useState } from "react";
import { Blog } from "@/types";
import EditBlogPost from "./edit";

type BlogPageProps = {
  blogPost: Blog;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const url = new URL(`http:localhost:3000/api/blog/${id}`);
    const response = await fetch(url.toString());

    if (!response.ok) {
      return { notFound: true }; // Return a 404 page
    }

    const blogPost = await response.json();
    return {
      props: { blogPost },
    };
  } catch (error) {
    alert("failed to fetch data for post");
    console.error("Error fetching template:", error);
    return { notFound: true }; // Return a 404 page if there's an error
  }
};

const BlogPage: React.FC<BlogPageProps> = ({ blogPost }) => {
  const [replyingTo, setReplyingTo] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportExplanation, setReportExplanation] = useState("");
  const [comments, setComments] = useState(blogPost.comments);
  const [blog, setBlog] = useState<Blog>(blogPost);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCommentLike = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blog/${blog.id}/comments/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 1 }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        // update the specific comment
        setComments((prevComments) =>
          updatedComment.parentId
            ? // If the comment is a reply, find the parent and update the child
              prevComments.map((comment) =>
                comment.id === updatedComment.parentId
                  ? {
                      ...comment,
                      Replies: comment.Replies.map((reply) =>
                        reply.id === updatedComment.id
                          ? { ...reply, rating: updatedComment.rating }
                          : reply
                      ),
                    }
                  : comment
              )
            : // If it's a top-level comment, update directly
              prevComments.map((comment) =>
                comment.id === updatedComment.id
                  ? { ...comment, rating: updatedComment.rating }
                  : comment
              )
        );
      } else {
        console.error("Failed to dislike the comment");
        alert("failed to dislike, try again and make sure you're logged in");
      }
    } catch (error) {
      alert("failed to dislike, try again and make sure you're logged in");
      console.error("Error disliking the comment:", error);
    }
  };

  const handleCommentDislike = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blog/${blog.id}/comments/${id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: -1 }),
      });

      if (response.ok) {
        const updatedComment = await response.json();

        // update the specific comment
        setComments((prevComments) =>
          updatedComment.parentId
            ? // If the comment is a reply, find the parent and update the child
              prevComments.map((comment) =>
                comment.id === updatedComment.parentId
                  ? {
                      ...comment,
                      Replies: comment.Replies.map((reply) =>
                        reply.id === updatedComment.id
                          ? { ...reply, rating: updatedComment.rating }
                          : reply
                      ),
                    }
                  : comment
              )
            : // If it's a top-level comment, update directly
              prevComments.map((comment) =>
                comment.id === updatedComment.id
                  ? { ...comment, rating: updatedComment.rating }
                  : comment
              )
        );
      } else {
        console.error("Failed to dislike the comment");
        alert("failed to dislike, try again and make sure you're logged in");
      }
    } catch (error) {
      alert("failed to dislike, try again and make sure you're logged in");
      console.error("Error disliking the comment:", error);
    }
  };

  const handleBlogPostLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blog/${blog.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 1 }),
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlog((prevBlog) => ({
          ...prevBlog,
          rating: updatedBlog.rating, // update the blog
        }));
      } else {
        console.error("Failed to like the blog post");
        alert("failed to like, try again and make sure you're logged in");
      }
    } catch (error) {
      alert("failed to like, try again and make sure you're logged in");
      console.error("Error liking the blog post:", error);
    }
  };

  const handleBlogPostDislike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blog/${blog.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: -1 }),
      });

      if (response.ok) {
        const updatedBlog = await response.json();
        setBlog((prevBlog) => ({
          ...prevBlog,
          rating: updatedBlog.rating, // update the blog
        }));
      } else {
        console.error("Failed to dislike the blog post");
      }
    } catch (error) {
      alert("failed to dislike, try again and make sure you're logged in");
      console.error("Error disliking the blog post:", error);
    }
  };
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/blog/${blog.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment,
          parentId: replyingTo, // If replying, set the parent comment ID
        }),
      });

      if (response.ok) {
        const newCommentResponse = await response.json();
        setComments((prevComments) => {
          if (replyingTo) {
            // if replying, append to an exisiting comment
            return prevComments.map((comment) =>
              comment.id === replyingTo
                ? {
                    ...comment,
                    Replies: [...(comment.Replies || []), newCommentResponse],
                  }
                : comment
            );
          }

          return [...prevComments, newCommentResponse];
        });
        setNewComment("");
        setReplyingTo("");
      } else {
        console.error("Failed to submit comment");
        alert("failed to comment, try again and make sure you're logged in");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("failed to comment, try again and make sure you're logged in");
    }
  };
  const handleReportToggle = () => {
    setIsReporting(!isReporting);
    setReportExplanation("");
  };
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentId: blog.id,
          contentType: "post",
          explanation: reportExplanation,
        }),
      });

      if (response.ok) {
        alert("Report submitted successfully.");
        setReportExplanation("");
        setIsReporting(false); // close the pop up
      } else {
        console.error("Failed to submit the report");
        alert("failed to report, try again and make sure you're logged in");
      }
    } catch (error) {
      console.error("Error submitting the report:", error);
      alert("failed to report, try again and make sure you're logged in");
    }
  };

  return (
    <div
      className="min-h-screen py-10 px-10"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="container mx-auto max-w-6xl">
        {isEditing ? (
          // Show editing component only when editing
          <EditBlogPost setIsEditing={setIsEditing} blogId={blog.id} />
        ) : (
          <div>
            <div className="mb-8">
              <h1
                className="text-4xl font-bold mb-4"
                style={{
                  color: "var(--accent-color)",
                }}
              >
                {blog.id}: {blog.title}
              </h1>
              <div className="flex items-center text-sm text-gray-400">
                <span>By: {blog.author.firstName}</span>
                <span className="ml-4">Rating: {blog.rating}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-4 py-2 bg-[var(--header)] text-white rounded hover:bg-[var(--accent-color)] transition"
                  onClick={handleBlogPostLike}
                >
                  👍 Like
                </button>
                <button
                  className="px-4 py-2 bg-[var(--header)] text-white rounded hover:bg-[var(--accent-color)] transition"
                  onClick={handleBlogPostDislike}
                >
                  👎 Dislike
                </button>
                <button
                  className="px-4 py-2 bg-[var(--header)] text-white rounded hover:bg-[var(--accent-color)] transition"
                  onClick={handleReportToggle}
                >
                  Report
                </button>
                <button
                  className="px-4 py-2 bg-[var(--header)] text-white rounded hover:bg-gray-400 hover:text-black transition"
                  onClick={handleEditToggle}
                >
                  Edit Post
                </button>
              </div>
            </div>

            {/* Reporting */}
            {isReporting && (
              <form
                className="mt-6 p-6 border border-red-600 mb-8 rounded-lg"
                onSubmit={handleSubmitReport}
                style={{
                  backgroundColor: "var(--header)",
                }}
              >
                <h3 className="text-lg font-bold text-red-600 mb-4">
                  Report this Post
                </h3>
                <textarea
                  className="w-full p-3 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Explain why you are reporting this post..."
                  rows={4}
                  value={reportExplanation}
                  onChange={(e) => setReportExplanation(e.target.value)}
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                  }}
                />
                <div className="flex gap-4 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition"
                    onClick={handleReportToggle}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div
              className="p-6 rounded-lg shadow-lg mb-8"
              style={{
                backgroundColor: "var(--header)",
              }}
            >
              <p className="text-sm whitespace-pre-wrap">{blog.description}</p>
            </div>

            <div className="mb-8">
              <p className="font-semibold mb-2">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded-md bg-gray-200 text-gray-800"
                    style={{
                      border: "1px solid var(--accent-color)",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Templates Section */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4">Associated Templates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blog.templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    id={template.id}
                    title={template.title}
                    explanation={template.explanation}
                    language={template.language}
                    authorName={template.author.firstName}
                    authorProfilePic={template.author.profilePicture}
                    tags={template.tags}
                    link={`/templates/${template.id}`}
                  />
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <h2 className="text-xl font-bold mb-4">Comments</h2>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    id={comment.id}
                    authorName={comment.author?.firstName}
                    authorProfilePic={comment.author.profilePicture}
                    content={comment.content}
                    rating={comment.rating}
                    replies={comment.Replies}
                    onLike={handleCommentLike}
                    onDislike={handleCommentDislike}
                    onReply={setReplyingTo}
                    depth={0}
                  />
                ))}
              </div>
            </div>

            <form
              className="mt-8 p-6 rounded-lg shadow-md"
              style={{
                backgroundColor: "var(--header)",
              }}
              onSubmit={handleCommentSubmit}
            >
              {replyingTo && (
                <div className="mb-4 text-sm text-gray-400">
                  Replying to: <strong>{replyingTo}</strong>
                  <button
                    type="button"
                    className="ml-4 text-red-500 underline"
                    onClick={() => setReplyingTo("")}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <textarea
                className="w-full p-3 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  replyingTo
                    ? "Write your reply..."
                    : "Write a top-level comment..."
                }
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
              <button
                type="submit"
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {replyingTo ? "Post Reply" : "Post Comment"}
              </button>
            </form>

            <Link href="/blogs">
              <button className="px-4 py-2 mt-6 bg-gray-700 text-white rounded hover:bg-gray-800 transition">
                Back to Blogs
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
