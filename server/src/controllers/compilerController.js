import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import axios from 'axios';

const TMP_DIR = path.join(os.tmpdir(), 'faang-forge-compiler');

if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
}

// JDoodle Language Configuration
const JDOODLE_LANGMAP = {
    javascript: { language: 'nodejs', versionIndex: '4' },
    node: { language: 'nodejs', versionIndex: '4' },
    python: { language: 'python3', versionIndex: '4' },
    java: { language: 'java', versionIndex: '4' },
    cpp: { language: 'cpp', versionIndex: '5' },
    'c++': { language: 'cpp', versionIndex: '5' },
    c: { language: 'c', versionIndex: '5' }
};

export const executeCode = async (req, res) => {
    let { language, sourceCode, stdin } = req.body;
    language = (language || '').toLowerCase();

    if (!sourceCode) {
        return res.status(400).json({ message: "Source code is required" });
    }

    // 1. Try JDoodle API first (Recommended for production/Render)
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (clientId && clientSecret) {
        const langConfig = JDOODLE_LANGMAP[language];
        if (!langConfig) return res.status(400).json({ message: `Unsupported language: ${language}` });
        
        try {
            const response = await axios.post('https://api.jdoodle.com/v1/execute', {
                clientId,
                clientSecret,
                script: sourceCode,
                stdin: stdin || '',
                language: langConfig.language,
                versionIndex: langConfig.versionIndex
            });

            // JDoodle returns: { output, statusCode, memory, cpuTime, error }
            if (response.data.error) {
                return res.json({
                    compile: { code: 1, stderr: response.data.error, stdout: '' },
                    run: null
                });
            }

            return res.json({
                compile: { code: 0, stderr: '', stdout: '' },
                run: {
                    code: response.data.statusCode === 200 ? 0 : 1,
                    stdout: response.data.output || '',
                    stderr: ''
                }
            });
        } catch (err) {
            console.error('JDoodle API Error:', err.message);
            return res.status(500).json({ message: "Cloud execution failed. Please verify JDoodle credentials." });
        }
    }

    // 2. Fallback to Local Execution via child_process (For local dev environment)
    const sessionId = uuidv4();
    const sessionDir = path.join(TMP_DIR, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    let fileName, execArgs, compileArgs;
    
    if (language === 'javascript' || language === 'node') {
        fileName = 'script.js';
        execArgs = ['node', [fileName]];
    } else if (language === 'python') {
        fileName = 'script.py';
        execArgs = ['python', [fileName]]; // Could be python3
    } else if (language === 'java') {
        fileName = 'Solution.java';
        const match = sourceCode.match(/public\s+class\s+(\w+)/);
        if (match && match[1]) {
            fileName = match[1] + '.java';
        }
        compileArgs = ['javac', [fileName]];
        execArgs = ['java', [fileName.replace('.java', '')]];
    } else if (language === 'cpp' || language === 'c++') {
        fileName = 'main.cpp';
        compileArgs = ['g++', [fileName, '-o', 'main.exe']];
        execArgs = [path.join(sessionDir, 'main.exe'), []];
    } else {
        return res.status(400).json({ message: "Unsupported language" });
    }

    const filePath = path.join(sessionDir, fileName);
    fs.writeFileSync(filePath, sourceCode);

    const runProcess = (cmd, args, input = null, timeout = 5000) => {
        return new Promise((resolve) => {
            const child = spawn(cmd, args, { cwd: sessionDir });
            let stdout = '';
            let stderr = '';
            
            if (input) {
                child.stdin.write(input);
                child.stdin.end();
            }

            const timer = setTimeout(() => {
                child.kill('SIGKILL');
                resolve({ code: 1, stdout, stderr: stderr + '\nError: Execution Timed Out (5000ms).' });
            }, timeout);

            child.stdout.on('data', (data) => stdout += data.toString());
            child.stderr.on('data', (data) => stderr += data.toString());

            child.on('close', (code) => {
                clearTimeout(timer);
                resolve({ code, stdout, stderr });
            });
            
            child.on('error', (err) => {
                clearTimeout(timer);
                resolve({ 
                    code: 1, 
                    stdout, 
                    stderr: `Failed to start subprocess: ${err.message}\nThis means the requested compiler (${cmd}) is not installed on the server hosting this app. If hosted on Render, please configure JDoodle API keys in your environment variables for cloud execution.` 
                });
            });
        });
    };

    try {
        let compileResult = { code: 0, stderr: '', stdout: '' };
        if (compileArgs) {
            compileResult = await runProcess(compileArgs[0], compileArgs[1], null, 5000);
            if (compileResult.code !== 0) {
                return res.json({ compile: compileResult, run: null });
            }
        }

        const runResult = await runProcess(execArgs[0], execArgs[1], stdin, 5000);
        res.json({ compile: compileResult, run: runResult });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server execution error" });
    } finally {
        setTimeout(() => {
            fs.rm(sessionDir, { recursive: true, force: true }, () => {});
        }, 1000);
    }
};
