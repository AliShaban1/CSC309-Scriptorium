import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import { Template } from "@/types";
import { useState } from "react";
import Editor from "@/components/Editor";
import EditTemplate from "./edit";
type TemplatePageProps = {
  template: Template;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const url = new URL(`http:localhost:3000/api/templates/${id}`);
    const response = await fetch(url.toString());

    if (!response.ok) {
      return { notFound: true }; // Return a 404 page
    }

    const template = await response.json();
    return {
      props: { template },
    };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { notFound: true }; // Return a 404 page if there's an error
  }
};

const TemplatePage: React.FC<TemplatePageProps> = ({ template }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [stdin, setStdin] = useState<string>("");

  const handleRunCode = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: template.code,
          language: template.language,
          stdin: stdin,
        }),
      });

      if (response.ok) {
        const { result } = await response.json();
        setExecutionResult(result);
      } else {
        const errorMessage = await response.text();
        setExecutionResult(`Failed to execute the code: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error running the code:", error);
      setExecutionResult("An error occurred while running the code.");
      alert("error occured when running the code");
    }
  };

  const handleForkTemplate = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${template.title} (Forked)`,
          explanation: template.explanation,
          code: template.code,
          tags: template.tags,
          forkedId: template.id,
          forked: true,
          language: template.language,
        }),
      });

      if (response.ok) {
        const newTemplate = await response.json();
        router.push(`/templates/${newTemplate.id}`); // redirect to forked
      } else {
        console.error("Failed to create fork");
        alert("Failed to fork. Make sure you're logged in an try again");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fork. Make sure you're logged in an try again");
    }
  };
  return (
    <div
      className="min-h-screen flex py-10 px-10"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="container mx-auto max-w-6xl">
        {isEditing ? (
          // Show editing component only when editing
          <EditTemplate setIsEditing={setIsEditing} templateId={template.id} />
        ) : (
          <div>
            <div className="mb-5">
              <h1
                className="text-4xl font-bold mb-4"
                style={{
                  color: "var(--accent-color)",
                }}
              >
                {template.id}: {template.title}
              </h1>
              <p
                className="text-md mb-4"
                style={{ color: "var(--foreground)" }}
              >
                {template.explanation}
              </p>
              <p className="text-sm">
                Author:{" "}
                <span className="font-semibold text-[var(--accent-color)]">
                  {template.author.firstName}
                </span>
              </p>
            </div>
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleRunCode}
                className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Run Code
              </button>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Edit Template
                </button>
              )}
              <button
                onClick={handleForkTemplate}
                className="bg-[var(--accent-color)] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Fork Template
              </button>
            </div>

            <div
              className="p-6 rounded-lg shadow-lg mb-8"
              style={{
                backgroundColor: "var(--header)",
              }}
            >
              <Editor
                code={template.code}
                language={template.language}
                readOnly={true}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="stdin" className="block font-semibold mb-2">
                Standard Input (optional):
              </label>
              <textarea
                id="stdin"
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] rounded-md text-white focus:outline-none focus:ring-1 focus:border-none focus:ring-[var(--accent-color)]"
                placeholder="Provide input for the program if needed..."
              ></textarea>
            </div>
            {executionResult && (
              <div
                className="mt-6 p-4 rounded-lg mb-5"
                style={{
                  backgroundColor: "var(--header)",
                  color: "var(--foreground)",
                  border: "1px solid var(--accent-color)",
                  // handling overflow - by chatgpt
                  maxHeight: "300px",
                  overflowY: "auto",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <h3 className="font-semibold mb-2">Execution Result:</h3>
                <pre>{executionResult}</pre>
              </div>
            )}

            <div className="mb-12">
              <h2 className="text-xl font-bold mb-4">
                Mentioned By Blog Posts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {template.blogPosts.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    id={blog.id}
                    title={blog.title}
                    description={blog.description}
                    authorName={blog.author.firstName}
                    tags={blog.tags}
                    rating={blog.rating}
                    link={`/blogs/${blog.id}`}
                  />
                ))}
              </div>
            </div>
            <Link href="/templates">
              <button className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition">
                Back to Templates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePage;
