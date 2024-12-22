import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import { CodeEditorProps } from "@/types";

const Editor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  readOnly = false,
  height = "300px",
  width = "100%",
}) => {
  return (
    <AceEditor
      mode={language === "c" || language === "cpp" ? "c_cpp" : language}
      theme="dracula"
      value={code}
      onChange={setCode}
      fontSize={17}
      width={width}
      height={height}
      showPrintMargin={false}
      highlightActiveLine
      readOnly={readOnly}
      style={{
        borderRadius: "10px",
        color: "white",
      }}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        displayIndentGuides: true,
        tabSize: 4,
      }}
    />
  );
};

export default Editor;
