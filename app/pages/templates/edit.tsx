import { useState } from "react";
import Editor from "@/components/Editor";
type TemplateData = {
  title?: string;
  explanation?: string;
  tags?: string;
  code?: string;
  language?: string;
};
const EditTemplate = ({
  templateId,
  setIsEditing,
}: {
  templateId: string;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [title, setTitle] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    const templateData: TemplateData = {};

    if (title) {
      templateData.title = title;
    }

    if (explanation) {
      templateData.explanation = explanation;
    }

    if (tags.length > 0) {
      templateData.tags = tags.join(",");
    }

    if (code) {
      templateData.code = code;
    }

    if (language) {
      templateData.language = language;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        alert("Template edited successfully!");
        setTitle("");
        setExplanation("");
        setTags([]);
        setIsEditing(false);
      } else {
        alert(
          "Failed to fork. Make sure you're logged in as the writer and try again"
        );
      }
    } catch (error) {
      console.error("Error editing template:", error);
      alert(
        "Failed to fork. Make sure you're logged in as the writer and try again"
      );
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto p-6 shadow-md rounded-md mt-14 mb-32"
      style={{ backgroundColor: "var(--header)" }}
    >
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--accent-color)" }}
      >
        Edit Template {templateId}
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

      <div className="container mb-8">
        <h2
          className=" mb-4"
          style={{
            color: "var(--foreground)",
          }}
        >
          Write your updated code here:
        </h2>
        <div
          style={{
            backgroundColor: "var(--background)",
            padding: "15px",
            borderRadius: "10px",
          }}
        >
          <Editor code={code} setCode={setCode} language={language} />
          <div className="mt-4 flex gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className=" px-4 py-2 rounded-lg appearance-none text-center"
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
          </div>
        </div>
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

      <div className="flex gap-3 ">
        <button
          onClick={handleSubmit}
          className="bg-[var(--accent-color)] w-40 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Save Template
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="bg-gray-500 text-white w-40 px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditTemplate;
