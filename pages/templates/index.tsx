import React, { useState, useEffect } from "react";
import TemplateCard from "@/components/TemplateCard";
import { Template } from "@/types";

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filter, setFilter] = useState("title"); // Default filter
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [placeholder, setPlaceholder] = useState(`Search templates by ${filter}`)

  // Fetch templates
  const fetchTemplates = async () => {
    // Construct the URL with query parameters
    const url = new URL("/api/templates", window.location.origin);
    if (filter === "title") {
      url.searchParams.append("title", query || ""); // Add the title query parameter
    } else if (filter === "code") {
      url.searchParams.append("code", query || ""); // Add the code query parameter
    } else if (filter === "tag") {
      url.searchParams.append("tags", query || ""); // Add the tags query parameter
    } else if (filter === "my templates") {
      const token = localStorage.getItem("token");
      if (!token) {
        setFilter("title");
        setPlaceholder("Search templates by title")
      } else {
        const profUrl = new URL("/api/auth/profile", window.location.origin);
        const response = await fetch(profUrl.toString(), {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const json = await response.json();
          const id = json.user.id;
          url.searchParams.append("authorId", id);
        }
      }
    }
    url.searchParams.append("page", page.toString()); // Add the page query parameter

    const response = await fetch(url.toString(), {
      method: "GET", // Use GET method
    });

    const data = await response.json();
    setTemplates(data.results);
    setTotalPages(data.totalPages);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [filter, query, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to the first page on a new search
    fetchTemplates();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="flex justify-center mt-2" style={{ minWidth: "53%" }}>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPlaceholder(`Search templates by ${e.target.value}`) }}
          className="h-14 px-4 py-2 rounded-lg appearance-none text-center"
          style={{
            backgroundColor: "var(--header)",
            color: "var(--foreground)",
            border: "1px solid var(--accent-color)",
          }}
        >
          <option value="title">Title</option>
          <option value="code">Code</option>
          <option value="tag">Tag</option>
          <option value="my templates">My Templates</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e);
          }}
          placeholder={placeholder}
          className="ml-2 p-3 border rounded-lg w-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {templates.map((template) => (
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

      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="font-bold text-xl  enabled:text-blue-600"
        >
          &lt;
        </button>
        <span className="text-sm text-gray-3">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="font-bold text-xl enabled:text-blue-600"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default TemplatesPage;
