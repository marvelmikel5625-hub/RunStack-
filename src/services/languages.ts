import { LanguageInfo, SupportedLanguage } from '../types/project';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: 'html-css-js',
    name: 'HTML + CSS + JS (Multi-file)',
    category: 'web',
    extension: 'html',
    isAvailable: true,
    statusNote: 'Live browser preview combining HTML, linked stylesheet, and JavaScript scripts.',
    iconName: 'Layout',
    defaultFilename: 'index.html',
  },
  {
    id: 'html',
    name: 'HTML5 (Single Document)',
    category: 'web',
    extension: 'html',
    isAvailable: true,
    statusNote: 'Self-contained HTML document with embedded styles and scripts in an isolated sandbox.',
    iconName: 'Globe',
    defaultFilename: 'index.html',
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'web',
    extension: 'js',
    isAvailable: true,
    statusNote: 'Client-side V8 execution with live console output, syntax validation, and error detection.',
    iconName: 'FileCode',
    defaultFilename: 'script.js',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'web',
    extension: 'ts',
    isAvailable: true,
    statusNote: 'Real-time in-browser transpilation via Sucrase with type stripping and live sandboxed execution.',
    iconName: 'Code',
    defaultFilename: 'index.ts',
  },
  {
    id: 'react',
    name: 'React (TSX / JSX)',
    category: 'web',
    extension: 'tsx',
    isAvailable: true,
    statusNote: 'Interactive React components transpiled in-browser with live sandboxed preview and DOM rendering.',
    iconName: 'Atom',
    defaultFilename: 'App.tsx',
  },
  {
    id: 'css',
    name: 'CSS3',
    category: 'web',
    extension: 'css',
    isAvailable: true,
    statusNote: 'Live style preview targeting structured HTML elements with keyframe inspection.',
    iconName: 'Palette',
    defaultFilename: 'style.css',
  },
  {
    id: 'python',
    name: 'Python 3',
    category: 'scripting',
    extension: 'py',
    isAvailable: true,
    statusNote: 'Official Pyodide WebAssembly runtime. Runs real Python in the browser with stdout/stderr.',
    iconName: 'Terminal',
    defaultFilename: 'main.py',
  },
  {
    id: 'sql',
    name: 'SQL (SQLite)',
    category: 'database',
    extension: 'sql',
    isAvailable: true,
    statusNote: 'In-browser SQLite engine powered by WebAssembly. Execute DDL/DQL with tabular results.',
    iconName: 'Database',
    defaultFilename: 'query.sql',
  },
  {
    id: 'json',
    name: 'JSON Data',
    category: 'web',
    extension: 'json',
    isAvailable: true,
    statusNote: 'Structured data format with Monaco schema validation and formatting.',
    iconName: 'FileJson',
    defaultFilename: 'data.json',
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'compiled',
    extension: 'cpp',
    isAvailable: false,
    statusNote: 'Requires native GCC/Clang container execution environment. Coming soon via container sandbox.',
    iconName: 'Cpu',
    defaultFilename: 'main.cpp',
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'compiled',
    extension: 'rs',
    isAvailable: false,
    statusNote: 'Requires rustc compiler service. Direct browser compilation not supported.',
    iconName: 'Cog',
    defaultFilename: 'main.rs',
  },
  {
    id: 'java',
    name: 'Java',
    category: 'compiled',
    extension: 'java',
    isAvailable: false,
    statusNote: 'Requires JVM server-side execution environment. Not executable directly in client browser.',
    iconName: 'Coffee',
    defaultFilename: 'Main.java',
  },
];

export const STARTER_TEMPLATES: Record<SupportedLanguage, { files: Array<{ name: string; path: string; content: string; language: string }> }> = {
  'html-css-js': {
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RunStack Interactive App</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="container">
    <header class="app-header">
      <div class="logo-mark">RS</div>
      <h1>Interactive Counter & Animation</h1>
    </header>
    
    <div class="card">
      <p class="description">Test live editing: modify HTML, CSS, or JS and see instant updates with full console capture.</p>
      
      <div class="counter-display">
        <span class="label">Count</span>
        <span id="counterValue" class="value">0</span>
      </div>

      <div class="button-group">
        <button id="decrementBtn" class="btn secondary">- Decrement</button>
        <button id="resetBtn" class="btn text">Reset</button>
        <button id="incrementBtn" class="btn primary">+ Increment</button>
      </div>

      <div class="pulse-indicator" id="pulseBox">
        <span class="indicator-text">Active CSS Pulse Animation</span>
      </div>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `/* RunStack Sample Styles */
:root {
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #0f172a;
  --text-muted: #64748b;
  --border: #e2e8f0;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: var(--bg);
  color: var(--text);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.container {
  width: 100%;
  max-width: 480px;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.logo-mark {
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
}

h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.description {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem;
  background: #f1f5f9;
  border-radius: 8px;
  margin-bottom: 1.25rem;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  font-weight: 600;
}

.value {
  font-size: 2.75rem;
  font-weight: 700;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.btn {
  flex: 1;
  padding: 0.65rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.btn.primary {
  background: var(--primary);
  color: white;
}

.btn.primary:hover {
  background: var(--primary-hover);
}

.btn.secondary {
  background: #e2e8f0;
  color: var(--text);
}

.btn.secondary:hover {
  background: #cbd5e1;
}

.btn.text {
  background: transparent;
  color: var(--text-muted);
  border-color: var(--border);
}

.btn.text:hover {
  background: #f8fafc;
  color: var(--text);
}

/* CSS Keyframe Animation inspectable in RunStack */
.pulse-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  animation: subtleFloat 3s infinite ease-in-out;
}

.indicator-text {
  font-size: 0.8125rem;
  color: #1e40af;
  font-weight: 500;
}

@keyframes subtleFloat {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.95;
  }
  50% {
    transform: translateY(-4px);
    opacity: 1;
  }
}`,
      },
      {
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `// RunStack Interactive Script
console.log("RunStack app initialized successfully.");

let count = 0;
const counterValueEl = document.getElementById("counterValue");
const incrementBtn = document.getElementById("incrementBtn");
const decrementBtn = document.getElementById("decrementBtn");
const resetBtn = document.getElementById("resetBtn");

function updateDisplay() {
  if (counterValueEl) {
    counterValueEl.textContent = count;
  }
  console.log("Current count value:", count);
}

incrementBtn?.addEventListener("click", () => {
  count += 1;
  updateDisplay();
});

decrementBtn?.addEventListener("click", () => {
  count -= 1;
  updateDisplay();
});

resetBtn?.addEventListener("click", () => {
  count = 0;
  console.info("Counter has been reset to zero.");
  updateDisplay();
});

// Periodic heartbeat verification in console
console.info("Try logging warnings or errors to inspect the RunStack Developer Console!");`,
      },
    ],
  },
  'html': {
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RunStack HTML Document</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 24px;
      margin: 0;
      background: #f8fafc;
      color: #0f172a;
    }
    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      max-width: 480px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    h1 {
      margin-top: 0;
      font-size: 1.5rem;
      color: #1e293b;
    }
    p {
      color: #64748b;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    button {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    button:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello from RunStack</h1>
    <p>This is a self-contained single-file HTML document with embedded CSS and JavaScript.</p>
    <button onclick="showMessage()">Click Me</button>
  </div>

  <script>
    function showMessage() {
      alert("RunStack is working!");
    }
  </script>
</body>
</html>`,
      },
    ],
  },
  'css': {
    files: [
      {
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `/* RunStack CSS3 Playground */
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  font-family: system-ui, sans-serif;
}

.preview-stage {
  padding: 2.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  text-align: center;
  max-width: 400px;
}

.box {
  width: 100px;
  height: 100px;
  margin: 1.5rem auto;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  animation: rotateBox 4s ease-in-out infinite;
}

@keyframes rotateBox {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}`,
      },
    ],
  },
  'javascript': {
    files: [
      {
        name: 'script.js',
        path: 'script.js',
        language: 'javascript',
        content: `// RunStack JavaScript Environment
console.log("JavaScript execution started.");

function calculateFibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

console.info("Calculating first 10 Fibonacci numbers:");
for (let i = 0; i <= 10; i++) {
  console.log(\`F(\${i}) = \${calculateFibonacci(i)}\`);
}

// Inspect objects in console
const systemSpecs = {
  platform: "RunStack JS Engine",
  sandboxed: true,
  timestamp: new Date().toISOString()
};

console.log("Runtime info:", systemSpecs);
console.warn("Tip: Check the Console tab in the Developer Panel below!");`,
      },
    ],
  },
  'python': {
    files: [
      {
        name: 'main.py',
        path: 'main.py',
        language: 'python',
        content: `# RunStack Python Playground (Powered by Pyodide WebAssembly)
import sys
import math

print("=== RunStack Python 3 Runtime ===")
print(f"Python Version: {sys.version.split()[0]}")
print("Executing in browser via WebAssembly...")
print()

# 1. Mathematical computations
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(math.isqrt(n)) + 1):
        if n % i == 0:
            return False
    return True

primes = [x for x in range(2, 50) if is_prime(x)]
print(f"Prime numbers under 50: {primes}")

# 2. String processing & formatting
data_records = [
    {"language": "Python", "type": "Scripting", "runtime": "Pyodide WASM"},
    {"language": "JavaScript", "type": "Web", "runtime": "Browser V8"},
    {"language": "SQL", "type": "Database", "runtime": "SQLite WASM"}
]

print()
print("RunStack Language Engines:")
for record in data_records:
    print(f"  * {record['language']:<12} | {record['type']:<10} | {record['runtime']}")

print()
print("Execution completed successfully.")
`,
      },
    ],
  },
  'sql': {
    files: [
      {
        name: 'query.sql',
        path: 'query.sql',
        language: 'sql',
        content: `-- RunStack SQLite WebAssembly Engine
-- Create schema and table
CREATE TABLE IF NOT EXISTS developers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  favorite_language TEXT NOT NULL,
  years_exp INTEGER
);

-- Seed initial records
INSERT INTO developers (name, role, favorite_language, years_exp) VALUES
  ('Alex Rivera', 'Frontend Engineer', 'JavaScript', 5),
  ('Elena Rostova', 'Data Scientist', 'Python', 6),
  ('Marcus Chen', 'Systems Architect', 'Rust', 8),
  ('Sarah Jenkins', 'Full-Stack Developer', 'TypeScript', 4),
  ('Devon Vance', 'Database Administrator', 'SQL', 10);

-- Query records
SELECT id, name, role, favorite_language, years_exp
FROM developers
ORDER BY years_exp DESC;

-- Aggregation example
SELECT favorite_language, COUNT(*) AS count, AVG(years_exp) AS avg_experience
FROM developers
GROUP BY favorite_language;
`,
      },
    ],
  },
  'typescript': {
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RunStack TypeScript</title>
</head>
<body style="font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; background: #f8fafc;">
  <div id="app" style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 480px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <h1 style="font-size: 1.4rem; margin-top: 0;">TypeScript Runtime</h1>
    <div id="output">Running TypeScript compilation...</div>
  </div>
  <script src="index.ts"></script>
</body>
</html>`,
      },
      {
        name: 'index.ts',
        path: 'index.ts',
        language: 'typescript',
        content: `// RunStack In-Browser TypeScript Runtime
interface Developer {
  name: string;
  role: string;
  skills: string[];
  experienceYears: number;
}

function generateReport(dev: Developer): string {
  return \`<strong>\${dev.name}</strong> (\${dev.role}) with \${dev.experienceYears} years experience. Skills: \${dev.skills.join(', ')}.\`;
}

const developer: Developer = {
  name: "Alex Vance",
  role: "Full-Stack Engineer",
  skills: ["TypeScript", "React", "Node.js"],
  experienceYears: 5
};

console.log("TypeScript loaded successfully:", developer);

const outputEl = document.getElementById("output");
if (outputEl) {
  outputEl.innerHTML = \`
    <p style="color: #059669; font-weight: 600;">✓ Compiled and executed via Sucrase</p>
    <p>\${generateReport(developer)}</p>
  \`;
}`,
      },
    ],
  },
  'react': {
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RunStack React Playground</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
</head>
<body>
  <div id="root"></div>
  <script src="App.tsx" type="text/babel"></script>
</body>
</html>`,
      },
      {
        name: 'App.tsx',
        path: 'App.tsx',
        language: 'typescript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="react-card">
      <div className="badge">React 18 + TSX</div>
      <h1>Interactive React Component</h1>
      <p>Transpiled on the fly in your browser with live sandboxed preview.</p>
      
      <div className="counter-box">
        <span className="count-label">Count</span>
        <span className="count-val">{count}</span>
        <div className="actions">
          <button onClick={() => setCount(c => c - 1)} className="btn btn-sec">- Dec</button>
          <button onClick={() => setCount(0)} className="btn btn-outline">Reset</button>
          <button onClick={() => setCount(c => c + 1)} className="btn btn-pri">+ Inc</button>
        </div>
      </div>
    </div>
  );
}`,
      },
      {
        name: 'style.css',
        path: 'style.css',
        language: 'css',
        content: `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  margin: 0;
  padding: 24px;
  background: #f8fafc;
  color: #0f172a;
  display: flex;
  justify-content: center;
}
.react-card {
  max-width: 440px;
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}
.badge {
  display: inline-block;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
h1 {
  font-size: 1.3rem;
  margin: 0 0 8px;
  color: #1e293b;
}
p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px;
}
.counter-box {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.count-label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
}
.count-val {
  display: block;
  font-size: 2.75rem;
  font-weight: 800;
  color: #2563eb;
  margin: 4px 0 12px;
}
.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.btn {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
}
.btn-pri {
  background: #2563eb;
  color: white;
}
.btn-sec {
  background: #e2e8f0;
  color: #1e293b;
}
.btn-outline {
  background: transparent;
  border-color: #cbd5e1;
  color: #64748b;
}`,
      },
    ],
  },
  'json': {
    files: [
      {
        name: 'data.json',
        path: 'data.json',
        language: 'json',
        content: `{
  "app": "RunStack",
  "version": "1.0.0",
  "author": "RunStack Team",
  "supportedLanguages": [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "python",
    "sql",
    "json"
  ],
  "features": {
    "localPersistence": true,
    "sandboxedPreview": true,
    "interactiveConsole": true,
    "zipArchiveExport": true
  }
}`,
      },
    ],
  },
  'cpp': {
    files: [
      {
        name: 'main.cpp',
        path: 'main.cpp',
        language: 'cpp',
        content: `#include <iostream>

int main() {
    std::cout << "RunStack C++ Workspace" << std::endl;
    return 0;
}`,
      },
    ],
  },
  'rust': {
    files: [
      {
        name: 'main.rs',
        path: 'main.rs',
        language: 'rust',
        content: `fn main() {
    println!("Hello from RunStack Rust workspace!");
}`,
      },
    ],
  },
  'java': {
    files: [
      {
        name: 'Main.java',
        path: 'Main.java',
        language: 'java',
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("RunStack Java Workspace");
    }
}`,
      },
    ],
  },
};
