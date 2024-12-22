import Link from "next/link";
import { BlogCardProps } from "@/types";

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  title,
  description,
  tags,
  link,
  authorName,
  rating,
}) => {
  return (
    <Link href={link}>
      <div
        className="shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-xl cursor-pointer"
        style={{
          backgroundColor: "var(--header)",
          color: "var(--foreground)",
        }}
      >
        <div className="p-6 ">
          <div className="flex flex-row">
            <h3
              className="text-xl font-bold mb-3 truncate"
              style={{
                color: "var(--accent-color)",
              }}
            >
              {title}
            </h3>
            <span
              className="text-sm font-medium mt-1.5 ml-auto flex-shrink-0"
              style={{
                color: "var(--foreground)",
              }}
            >
              {rating} 🤍
            </span>
          </div>

          <div className="flex px-0.5 justify-between items-center text-sm mb-1">
            <span
              style={{
                color: "var(--foreground)",
              }}
            >
              By: <strong>{authorName}</strong>
            </span>
          </div>

          <p
            className="text-sm px-0.5 line-clamp-3"
            style={{ color: "var(--foreground)" }}
          >
            {description}
          </p>
        </div>
        <div
          className="py-4 mx-5 text-sm font-medium text-center mt-0"
          style={{
            borderTop: "1px solid var(--background)",
            backgroundColor: "var(--header)",
            color: "var(--accent-color)",
          }}
        >
          Read More →
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
