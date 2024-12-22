import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const LANGUAGE_CONFIG = {
  python: { image: 'code-executor-python', extension: '.py' },
  javascript: { image: 'code-executor-js', extension: '.js' },
  c: { image: 'code-executor-c', extension: '.c' },
  cpp: { image: 'code-executor-cpp', extension: '.cpp' },
  java: { image: 'code-executor-java', extension: '.java' },
  perl: { image: 'code-executor-perl', extension: '.pl' },
  r: { image: 'code-executor-r', extension: '.r' },
  ruby: { image: 'code-executor-ruby', extension: '.rb' },
  haskell: { image: 'code-executor-haskell', extension: '.hs' },
  rust: { image: 'code-executor-rust', extension: '.rs' }
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Error: POST requests are allowed only' });
  }

  const { code, language, stdin } = req.body;

  if (!code || !language || !LANGUAGE_CONFIG[language]) {
    return res.status(400).json({ error: 'Error: No code to execute or language not supported' });
  }

  const { image, extension } = LANGUAGE_CONFIG[language];
  const tmpDir = path.join(process.cwd(), 'tmp');
  const id = randomUUID();
  const filePath = path.join(tmpDir, `${id.toString()}${extension}`);

  try {
    // create the code file if it doesn't exist and write to it
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir);
      } catch (dirError) {
        return res.status(500).json({ error: "Error: Failed to create tmp directory" });
      }
    }

    try {
      fs.writeFileSync(filePath, code);
    } catch (fileError) {
      return res.status(500).json({ error: "Error: Failed to write code to file" });
    }

    // constrcut command 
    // const execCommand = typeof command === 'function' ? command(filePath) : `${command} "${filePath}"`;

    const dockerCommand = `docker run --rm --network=none --memory=128m --cpus=0.5 --pids-limit=50 -v "${tmpDir}:/code" -e FILE_NAME="${id.toString()}${extension}" -e STDIN=${stdin} ${image}"`;

    exec(dockerCommand, { timeout: 5000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (error) {
        if (error.signal === 'SIGTERM' || error.signal === 'SIGKILL') {
          return res.status(408).json({ output: "Error: execution timed out." });
        } else {
          // filter the error message to avoid leaking the file path
          console.log(error.code);
          const filteredError = (stderr || error.message).replace(filePath, "temporary file");
          return res.status(400).json({ output: filteredError });
        }
      }
      fs.rmdir(tmpDir, { recursive: true, force: true }, () => { return; });
      res.status(200).json({ output: stdout });
    });
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Error: Execution failed' });
  }
}
