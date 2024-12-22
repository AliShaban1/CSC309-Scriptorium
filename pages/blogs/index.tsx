import React, { useState, useEffect } from "react";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { Blog } from "@/types";

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filter, setFilter] = useState("title"); // Default filter
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [placeholder, setPlaceholder] = useState(`Search blog posts by ${filter}`)

  // Fetch templates
  const fetchBlogs = async () => {
    // Construct the URL with query parameters
    const url = new URL("/api/blog", window.location.origin);
    if (filter === "title") {
      url.searchParams.append("title", query || ""); // Add the title query parameter
    } else if (filter === "description") {
      url.searchParams.append("description", query || ""); // Add the code query parameter
    } else if (filter === "tag") {
      url.searchParams.append("tags", query || ""); // Add the tags query parameter
    } else if (filter === "codeTemplateId") {
      url.searchParams.append("templateIds", query + "," || "");
    } else if (filter === "my blogs") {
      const token = localStorage.getItem("token");
      if (!token) {
        setFilter("title");
        setPlaceholder("Search blog posts by title")
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
    setBlogs(data.results);
    setTotalPages(data.totalPages);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [filter, query, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to the first page on a new search
    fetchBlogs();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10">
      <div className="flex justify-center items-center mt-2" style={{ minWidth: "75%" }}>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPlaceholder(`Search blog posts by ${e.target.value}`) }}
          className="h-14 px-4 py-2 mr-2 rounded-lg appearance-none text-center"
          style={{
            backgroundColor: "var(--header)",
            color: "var(--foreground)",
            border: "1px solid var(--accent-color)",
          }}
        >
          <option value="title">Title</option>
          <option value="description">Description</option>
          <option value="tag">Tag</option>
          <option value="codeTemplateId">TemplateId</option>
          <option value="my blogs">My Blogs</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e);
          }}
          placeholder={placeholder}
          className="mr-2 p-3 border rounded-lg w-full"
        />
        <Link href="/blogs/create" className="ml-2">
          <p
            className="rounded-full w-12 h-12 flex items-center justify-center"
            style={{ border: "solid var(--accent-color)" }}
          >
            +
          </p>
        </Link>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            id={blog.id}
            title={blog.title}
            description={blog.description}
            tags={blog.tags}
            link={`/blogs/${blog.id}`}
            authorName={blog.author.firstName}
            authorProfilePic={blog.author.profilePicture}
            rating={blog.rating}
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

export default BlogsPage;
