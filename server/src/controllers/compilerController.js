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

const JUDGE0_API = 'https://ce.judge0.com';

const JUDGE0_LANGMAP = {
    javascript: 63, node: 63, python: 71, java: 62, cpp: 54, 'c++': 54, c: 50
};

const toBase64 = (str) => Buffer.from(str || '').toString('base64');
const fromBase64 = (str) => str ? Buffer.from(str, 'base64').toString('utf-8') : '';

export const executeCode = async (req, res) => {
    let { language, sourceCode, stdin } = req.body;
    language = (language || '').toLowerCase();

    if (!sourceCode) {
        return res.status(400).json({ message: "Source code is required" });
    }

    // =========================================================================
    // METHOD 1: Judge0 CE (Public Free API - Zero Configuration)
    // =========================================================================
    const judge0LangId = JUDGE0_LANGMAP[language];
    if (judge0LangId) {
        try {
            const submission = await axios.post(
                `${JUDGE0_API}/submissions?base64_encoded=true&wait=true`,
                {
                    source_code: toBase64(sourceCode),
                    language_id: judge0LangId,
                    stdin: toBase64(stdin || ''),
                    cpu_time_limit: 5
                },
                { timeout: 15000, headers: { 'Content-Type': 'application/json' } }
            );

            const result = submission.data;
            if (result && result.status) {
                const stdout = fromBase64(result.stdout);
                const stderr = fromBase64(result.stderr);
                const compileOutput = fromBase64(result.compile_output);
                const statusId = result.status.id;

                if (statusId === 6) {
                    return res.json({ compile: { code: 1, stderr: compileOutput || stderr, stdout: '' }, run: null });
                }

                let runStderr = stderr;
                if (statusId === 5) runStderr = (stderr ? stderr + '\n' : '') + 'Error: Time Limit Exceeded.';
                else if (statusId >= 7 && statusId <= 12) runStderr = (stderr ? stderr + '\n' : '') + `Runtime Error: ${result.status.description || 'Unknown'}`;

                return res.json({
                    compile: { code: 0, stderr: compileOutput || '', stdout: '' },
                    run: { code: statusId === 3 ? 0 : 1, stdout: stdout, stderr: runStderr }
                });
            }
        } catch (err) {
            console.log('Judge0 CE fallback triggered:', err.message);
            // Silently fall through to Method 2 if Judge0 is rate limited or down
        }
    }

    // =========================================================================
    // METHOD 2: JDoodle API (Requires Keys - Production Grade)
    // =========================================================================
    const clientId = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (clientId && clientSecret) {
        const langConfig = JDOODLE_LANGMAP[language];
        if (langConfig) {
            try {
                const response = await axios.post('https://api.jdoodle.com/v1/execute', {
                    clientId, clientSecret, script: sourceCode, stdin: stdin || '',
                    language: langConfig.language, versionIndex: langConfig.versionIndex
                }, { timeout: 15000 });

                if (response.data.error) {
                    return res.json({ compile: { code: 1, stderr: response.data.error, stdout: '' }, run: null });
                }

                return res.json({
                    compile: { code: 0, stderr: '', stdout: '' },
                    run: { code: response.data.statusCode === 200 ? 0 : 1, stdout: response.data.output || '', stderr: '' }
                });
            } catch (err) {
                console.log('JDoodle fallback triggered:', err.message);
            }
        }
    }

    // =========================================================================
    // METHOD 3: Local Execution with child_process.spawn() (Requires local compilers)
    // =========================================================================
    const sessionId = uuidv4();
    const sessionDir = path.join(TMP_DIR, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });

    let fileName, execArgs, compileArgs;
    
    if (language === 'javascript' || language === 'node') {
        fileName = 'script.js'; execArgs = ['node', [fileName]];
    } else if (language === 'python') {
        fileName = 'script.py'; execArgs = ['python', [fileName]];
    } else if (language === 'java') {
        fileName = 'Solution.java';
        const match = sourceCode.match(/public\s+class\s+(\w+)/);
        if (match && match[1]) fileName = match[1] + '.java';
        compileArgs = ['javac', [fileName]]; execArgs = ['java', [fileName.replace('.java', '')]];
    } else if (language === 'cpp' || language === 'c++') {
        fileName = 'main.cpp'; compileArgs = ['g++', [fileName, '-o', 'main.exe']]; execArgs = [path.join(sessionDir, 'main.exe'), []];
    } else {
        return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const filePath = path.join(sessionDir, fileName);
    fs.writeFileSync(filePath, sourceCode);

    const runProcess = (cmd, args, input = null, timeout = 5000) => {
        return new Promise((resolve) => {
            const child = spawn(cmd, args, { cwd: sessionDir });
            let stdout = ''; let stderr = '';
            
            if (input) { child.stdin.write(input); child.stdin.end(); }

            const timer = setTimeout(() => {
                child.kill('SIGKILL');
                resolve({ code: 1, stdout, stderr: stderr + '\nError: Execution Timed Out (5000ms).' });
            }, timeout);

            child.stdout.on('data', (data) => stdout += data.toString());
            child.stderr.on('data', (data) => stderr += data.toString());

            child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
            child.on('error', (err) => {
                clearTimeout(timer);
                resolve({ 
                    code: 1, stdout, 
                    stderr: `Failed to start subprocess: spawn ${cmd} ENOENT\nThis means the requested compiler (${cmd}) is not installed on the server hosting this app. To fix this permanently, please run your server using Node OR configure JDoodle API keys in your .env variables for cloud execution.` 
                });
            });
        });
    };

    try {
        let compileResult = { code: 0, stderr: '', stdout: '' };
        if (compileArgs) {
            compileResult = await runProcess(compileArgs[0], compileArgs[1], null, 5000);
            if (compileResult.code !== 0) return res.json({ compile: compileResult, run: null });
        }
        const runResult = await runProcess(execArgs[0], execArgs[1], stdin, 5000);
        res.json({ compile: compileResult, run: runResult });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server execution error" });
    } finally {
        setTimeout(() => fs.rm(sessionDir, { recursive: true, force: true }, () => {}), 1000);
    }
};
