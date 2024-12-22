import React, { useState } from "react";
import Reply from "./Reply";
import { CommentProps } from "@/types";
import { resolve } from "path";
import { comment } from "postcss";

const Comment: React.FC<CommentProps> = ({
  id,
  authorName,
  authorProfilePic,
  content,
  rating,
  onLike,
  onDislike,
  replies = [],
  onReply,
  depth = 0,
}) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const handleReport = async (commentId: string, reason: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contentId: commentId,
          contentType: "comment",
          explanation: reason,
        }),
      });

      if (response.ok) {
        alert("Report submitted successfully.");
        setReportReason("");
        setIsReporting(false);
      } else {
        alert("Failed to submit the report. Try again.");
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div
      className="border border-gray-700 rounded-lg p-4 mb-4"
      style={{ backgroundColor: "var(--header)", color: "var(--foreground)" }}
    >
      <div className="flex items-start">
        <img
          src={authorProfilePic}
          alt={`${authorName}'s profile`}
          className="w-12 h-12 rounded-full mr-4"
        />

        <div className="flex-1">
          <h4 className="text-lg font-semibold mb-1">{authorName}</h4>

          <p className="mt-2 text-sm">{content}</p>

          <div className="flex items-center mt-4 space-x-4">
            <span className="text-gray-400">Rating: {rating}</span>
            <button
              onClick={() => onLike(id)}
              className="flex items-center space-x-2"
            >
              👍
            </button>
            <button
              onClick={() => onDislike(id)}
              className="flex items-center space-x-2"
            >
              👎
            </button>
            <button
              className="text-blue-600 hover:text-blue-700 underline text-sm"
              onClick={() => onReply(id)}
            >
              Reply
            </button>
            <button
              className="text-red-600 hover:text-red-700 underline text-sm"
              onClick={() => setIsReporting(!isReporting)}
            >
              Report
            </button>
          </div>
        </div>
      </div>

      {isReporting && (
        <form
          className="mt-6 p-6 border border-red-600 rounded-lg"
          onSubmit={(e) => {
            e.preventDefault();
            handleReport(id, reportReason);
          }}
          style={{
            backgroundColor: "var(--header)",
          }}
        >
          <h3 className="text-lg font-bold text-red-600 mb-4">
            Report Comment
          </h3>
          <textarea
            className="w-full p-3 rounded-lg border border-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Explain why you are reporting this comment..."
            rows={4}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
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
              onClick={() => {
                setIsReporting(false);
                setReportReason("");
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {replies.length > 0 && (
        <div className="mt-6 space-y-4" style={{ marginLeft: "7%" }}>
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              id={reply.id}
              content={reply.content}
              rating={reply.rating}
              authorName={reply.author?.firstName}
              authorProfilePic={reply.author?.profilePicture}
              depth={depth + 1}
              onLike={onLike}
              onDislike={onDislike}
              onReply={onReply}
              replies={reply.Replies}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
