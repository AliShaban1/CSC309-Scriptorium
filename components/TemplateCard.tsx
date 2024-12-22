import Link from "next/link";
import { TemplateCardProps } from "@/types";

const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  title,
  explanation,
  language,
  authorName,
  link,
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
        <div className="p-6  h-full">
          <div className="flex justify-between space-x-4 mb-3">
            <h3
              className="text-xl font-bold truncate"
              style={{
                color: "var(--accent-color)",
              }}
            >
              {title}
            </h3>

            <span
              className="text-xs px-2 py-1 mt-1 rounded"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                border: "1px solid var(--accent-color)",
              }}
            >
              {language}
            </span>
          </div>

          <div className="flex items-center">
            <p
              className="text-sm px-0.5 font-medium mb-1"
              style={{
                color: "var(--foreground)",
              }}
            >
              By: <strong>{authorName}</strong>
            </p>
          </div>

          <p
            className="text-sm px-0.5 line-clamp-3"
            style={{ color: "var(--foreground)" }}
          >
            {explanation}
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
          View Template →
        </div>
      </div>
    </Link>
  );
};

export default TemplateCard;
