import React, { useState, useEffect } from "react";
import axios from "axios";
import BlogCard from "@/components/BlogCard";
import TemplateCard from "@/components/TemplateCard";
import { Template, Blog } from "@/types";
import CreateTemplate from "./templates/create";
import Editor from "@/components/Editor";

const HomePage = () => {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<string | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const blogResponse = await axios.get("/api/blog", {
          params: { page: 1 },
        });
        setBlogPosts(blogResponse.data.results);

        const templateResponse = await axios.get("/api/templates", {
          params: { page: 1 },
        });
        setTemplates(templateResponse.data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Fetching data failed. Please try again later.");
        alert("Failed to fetch data. Make sure you're logged in and try again");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const executeCode = async () => {
    setOutput(null);
    setExecutionError(null);
    setIsLoading(true);
    try {
      console.log(stdin);
      const response = await axios.post("/api/execute", {
        code,
        language,
        stdin,
      });
      setOutput(response.data.output);
    } catch (error: any) {
      if (error.response) {
        const { data } = error.response;
        setExecutionError(`${data.output || data.error}`);
      } else {
        setExecutionError("Error: Unable to reach the server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto text-center">
          <h2
            className="text-5xl font-extrabold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Write, Execute, Share
          </h2>
          <p className="text-lg" style={{ color: "var(--foreground)" }}>
            A new way of coding with Scriptorium.
          </p>
          <div className="mt-8">
            <a
              href="#code-execution"
              className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-colors duration-200"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--foreground)",
              }}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#code-execution")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-color)")
              }
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-bold mb-6">Popular Blog Posts</h3>
        {isLoading && <p>Loading blog posts...</p>}
        {error && <p style={{ color: "var(--accent-color)" }}>{error}</p>}
        {!isLoading && blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((blog) => (
              <BlogCard
                key={blog.id}
                id={blog.id}
                title={blog.title}
                description={blog.description}
                tags={blog.tags}
                link={`/blogs/${blog.id}`}
                authorName={blog.author.firstName}
                rating={blog.rating}
              />
            ))}
          </div>
        ) : (
          !isLoading && <p>No blog posts available.</p>
        )}
      </section>

      {/* Templates */}
      <section className="container mx-auto px-6 py-12">
        <h3 className="text-3xl font-bold mb-6">Popular Templates</h3>
        {isLoading && <p>Loading blog posts...</p>}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                title={template.title}
                explanation={template.explanation}
                language={template.language}
                authorName={template.author.firstName}
                authorProfilePic={
                  template.author.profilePicture
                    ? template.author.profilePicture
                    : undefined
                }
                tags={template.tags}
                link={`/templates/${template.id}`}
              />
            ))}
          </div>
        ) : (
          <p>No templates available.</p>
        )}
      </section>

      {/* Transaction in Background */}
      <section
        className="min-h-screen mt-40"
        style={{
          background:
            "linear-gradient(to bottom, var(--background), var(--foreground) 100%)",
        }}
      ></section>
      {/* Code Execution Section */}
      <section
        id="code-execution"
        className="pb-16"
        style={{
          backgroundColor: "var(--foreground)",
        }}
      >
        <div className="container mb-40 py-32 mx-auto text-center px-10">
          <h2
            className="text-4xl font-bold mb-6"
            style={{
              color: "var(--background)",
            }}
          >
            Execute Your Code
          </h2>
          <div
            style={{
              backgroundColor: "var(--background)",
              padding: "35px",
              borderRadius: "20px",
            }}
          >
            <h2
              className="text-1xl font-bold mb-4 text-left"
              style={{
                color: "var(--foreground)",
              }}
            >
              Start coding by writing in this box:
            </h2>
            <Editor code={code} setCode={setCode} language={language} />
            <div className="mt-4 flex gap-4">
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="flex-grow h-14 p-3 rounded-lg resize-none"
                placeholder="Enter stdin input... (if any)"
                style={{
                  border: "1px solid var(--accent-color)",
                  backgroundColor: "var(--header)",
                  color: "var(--foreground)",
                }}
              />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-14 px-4 py-2 rounded-lg appearance-none text-center"
                style={{
                  backgroundColor: "var(--header)",
                  color: "var(--foreground)",
                  border: "1px solid var(--accent-color)",
                }}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="perl">Perl</option>
                <option value="r">R</option>
                <option value="ruby">Ruby</option>
                <option value="haskell">Haskell</option>
                <option value="rust">Rust</option>
              </select>

              <button
                onClick={executeCode}
                className="h-14 px-6 font-bold rounded-lg shadow transition-all"
                style={{
                  color: "var(--foreground)",
                  background: "var(--accent-color)",
                  border: "1px solid var(--accent-color)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--accent-color)")
                }
              >
                Run Code
              </button>
            </div>
            {executionError && (
              <div
                className="mt-4 p-4 rounded-lg shadow-md text-left"
                style={{
                  border: "1px solid var(--foreground)",
                  backgroundColor: "#ffeded",
                  color: "#d9534f",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                <pre>{executionError}</pre>
              </div>
            )}
            {output && (
              <div
                className="mt-6 p-4 rounded-lg shadow-md text-left"
                style={{
                  border: "1px solid var(--foreground)",
                  backgroundColor: "var(--header)",
                  color: "var(--foreground)",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                <h3 className="font-bold text-lg mb-2">Output:</h3>
                <pre>{output}</pre>
              </div>
            )}
            <div className="mt-8">
              Want to save / share your code?
              <p
                className="underline text-lg cursor-pointer"
                style={{ color: "var(--foreground)" }}
                onClick={() => setSavingTemplate(!savingTemplate)}
              >
                create a template
              </p>
            </div>
            {savingTemplate && (
              <div className="mt-8">
                <CreateTemplate
                  setIsCreating={setSavingTemplate}
                  code={code}
                  language={language}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
