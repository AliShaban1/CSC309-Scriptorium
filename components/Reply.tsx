import React from "react";
import { ReplyProps } from "@/types";

const Reply: React.FC<ReplyProps> = ({
  id,
  content,
  rating,
  onLike,
  onDislike,
  replies = [],
}) => {
  return (
    <div className="border-b border-t border-gray-300 pb-4 mb-4">
      {/* Main Comment */}
      <div className="flex items-start">
        {/* Content */}
        <div className="flex-1">
          {/* Comment Content */}
          <p className="mt-2">{content}</p>

          {/* Actions */}
          <div className="flex items-center mt-2">
            <span className="mr-3">Rating: {rating}</span>
            <button
              onClick={() => onLike(id)}
              className="text-green-500 hover:text-green-600 mr-2 flex items-center"
            >
              👍
            </button>
            <button
              onClick={() => onDislike(id)}
              className="text-red-500 hover:text-red-600 flex items-center"
            >
              👎
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-10 mt-4">
          {replies.map((reply) => (
            <Reply
              key={reply.id}
              id={reply.id}
              content={reply.content}
              rating={reply.rating}
              onLike={onLike}
              onDislike={onDislike}
              replies={reply.Replies}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reply;
