import { LanguageInfo, SupportedLanguage } from '../types/project';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: 'html-css-js',
    name: 'HTML + CSS + JS',
    category: 'web',
    extension: 'html',
    isAvailable: true,
    statusNote: 'Live browser preview with sandboxed DOM, console interception, and real-time execution.',
    iconName: 'Layout',
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
    id: 'html',
    name: 'HTML5',
    category: 'web',
    extension: 'html',
    isAvailable: true,
    statusNote: 'Live sandboxed HTML5 rendering with DOM inspection.',
    iconName: 'Globe',
    defaultFilename: 'index.html',
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
    id: 'typescript',
    name: 'TypeScript',
    category: 'web',
    extension: 'ts',
    isAvailable: false,
    statusNote: 'Server-side compiler required. Client-side transpilation container planned.',
    iconName: 'Code',
    defaultFilename: 'index.ts',
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
  <title>RunStack HTML5 Document</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      max-width: 650px;
      margin: 0 auto;
      color: #1e293b;
      line-height: 1.6;
    }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
  </style>
</head>
<body>
  <h1>HTML5 Living Document</h1>
  <p>Start writing semantic HTML5. Changes are reflected in the live preview.</p>
  
  <article>
    <h2>Semantic Components</h2>
    <ul>
      <li>Modern HTML5 structure tags</li>
      <li>Instant sandboxed rendering</li>
      <li>Isolated iframe security</li>
    </ul>
  </article>
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
        name: 'index.ts',
        path: 'index.ts',
        language: 'typescript',
        content: `// TypeScript starter file
interface Developer {
  name: string;
  role: string;
  languages: string[];
}

const user: Developer = {
  name: "Alex",
  role: "Full-Stack Engineer",
  languages: ["TypeScript", "Python"]
};

console.log(user);`,
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
