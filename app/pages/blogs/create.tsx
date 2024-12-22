import { useState } from "react";
import { useRouter } from "next/router";
const CreateBlogPost = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [templateIds, setTemplateIds] = useState<string[]>([]);
  const router = useRouter();
  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddTemplateId = (templateId: string) => {
    if (templateId && !templateIds.includes(templateId)) {
      setTemplateIds([...templateIds, templateId]);
    }
  };

  const handleRemoveTemplateId = (templateId: string) => {
    setTemplateIds(templateIds.filter((id) => id !== templateId));
  };

  const handleSubmit = async () => {
    const blogPostData = {
      title,
      description,
      tags: tags.join(","),
      templateIds: templateIds.join(","),
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogPostData),
      });

      if (response.ok) {
        alert("Blog post created successfully!");
        setTitle("");
        setDescription("");
        setTags([]);
        setTemplateIds([]);
        router.push("/blogs");
      } else {
        alert(
          "failed to create post, try again and make sure you're logged in"
        );
      }
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert("failed to create post, try again and make sure you're logged in");
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 shadow-md rounded-md mt-10"
      style={{ backgroundColor: "var(--header)" }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--accent-color)" }}
      >
        Create New Blog Post
      </h1>

      {/* Title Input */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--foreground)] bg-[var(--header)] rounded-md text-white"
          placeholder="Enter blog post title"
        />
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] rounded-md text-white"
          placeholder="Enter blog post description"
          rows={5}
        ></textarea>
      </div>

      {/* Tags Input */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Tags</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] rounded-md text-white"
            placeholder="Enter the name and press enter for each tag"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-[var(--background)] px-3 py-1 rounded-full text-sm font-medium flex items-center bg-[var(--header)] rounded-md text-white"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Template IDs Input */}
      <div className="mb-4">
        <label className="block font-medium mb-2">Template IDs</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] rounded-md text-white"
            placeholder="Enter ID and press enter for each template"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTemplateId(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
        <div className="mt-2 flex gap-2 flex-wrap">
          {templateIds.map((id) => (
            <span
              key={id}
              className="bg-[var(--background)] px-3 py-1 rounded-full text-sm font-medium flex items-center bg-[var(--header)] rounded-md text-white"
            >
              {id}
              <button
                onClick={() => handleRemoveTemplateId(id)}
                className="ml-2 text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          className="bg-[var(--accent-color)] w-40 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Post Blog
        </button>
        <button
          onClick={() => router.push("/blogs")}
          className="bg-gray-500 text-white w-40 px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateBlogPost;
