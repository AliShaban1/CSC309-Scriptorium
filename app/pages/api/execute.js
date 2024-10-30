import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const LANGUAGE_CONFIG = {
  python: { extension: '.py', command: 'python3' },
  javascript: { extension: '.js', command: 'node' },
  c: { extension: '.c', command: 'gcc file.c -o file && ./file' },
  cpp: { extension: '.cpp', command: 'g++ file.cpp -o file && ./file' },
  java: { extension: '.java', command: 'javac file.java && java file' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST requests are allowed only' });
  }

  const { code, language, stdin } = req.body;

  if (!code || !language || !LANGUAGE_CONFIG[language]) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const { extension, command } = LANGUAGE_CONFIG[language];
  const tmpDir = path.join(process.cwd(), 'tmp');
  const filePath = path.join(tmpDir, `file${extension}`);

  try {
    // create the code file if it doesn't exist and write to it
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir);
      } catch (dirError) {
        return res.status(500).json({ error: "Failed to create tmp directory" });
      }
    }

    try {
      fs.writeFileSync(filePath, code);
    } catch (fileError) {
      return res.status(500).json({ error: "Failed to write code to file" });
    }

    // constrcut command 
    const execCommand = `${command} "${filePath}"`;

    const childProcess = exec(execCommand, { timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (error) {
        return res.status(400).json({ output: stderr || error.message });
      }
      res.status(200).json({ output: stdout });
    });
    // write to stdin if provided
    if (stdin) {
      childProcess.stdin.write(stdin + '\n');
    }
    childProcess.stdin.end();

  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Execution failed' });
  }
}
