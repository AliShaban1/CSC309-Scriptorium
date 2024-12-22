import { useState } from "react";
import { useRouter } from "next/router";

const CreateTemplate = ({
  code,
  language,
  setIsCreating,
}: {
  code: string;
  language: string;
  setIsCreating: (isCreating: boolean) => void;
}) => {
  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    const templateData = {
      title,
      explanation,
      tags: tags.join(","),
      code,
      language,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        alert("Template created successfully!");
        setTitle("");
        setExplanation("");
        setTags([]);
        router.push("/templates");
      } else {
        alert(
          "Failed to create tamplate. Make sure you're logged in an try again"
        );
      }
    } catch (error) {
      console.error("Error creating template:", error);
      alert("An error occurred. Please try again later.");
      alert(
        "Failed to create template. Make sure you're logged in an try again"
      );
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 shadow-md rounded-md mt-12"
      style={{ backgroundColor: "var(--header)" }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--accent-color)" }}
      >
        Create New Template
      </h1>

      <div className="mb-4">
        <label className="block font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--foreground)] bg-[var(--header)] rounded-md text-white"
          placeholder="Enter template title"
        />
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Explanation</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] text-white"
          placeholder="Enter template explanation"
          rows={5}
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Tags</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-[var(--header)] text-white"
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
              className="bg-[var(--background)] px-3 py-1 rounded-full text-sm font-medium flex items-center bg-[var(--header)] text-white"
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

      <div className="flex gap-3 items-center justify-center ">
        <button
          onClick={handleSubmit}
          className="bg-[var(--accent-color)] w-40 h-14 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Post Template
        </button>
        <button
          onClick={() => setIsCreating(false)}
          className="bg-gray-500 text-white w-40 h-14 px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateTemplate;
