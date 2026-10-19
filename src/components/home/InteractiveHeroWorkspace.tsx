import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Globe, Palette, FileCode, CheckCircle2 } from 'lucide-react';

export const InteractiveHeroWorkspace: React.FC<{ onOpenFullPlayground: () => void }> = ({
  onOpenFullPlayground,
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');

  const [htmlCode, setHtmlCode] = useState(`<div class="interactive-card">
  <div class="glow-orb"></div>
  <h2>Live In-Browser Code</h2>
  <p>Edit HTML, CSS, or JS right here.</p>
  <button id="counterBtn" class="action-btn">
    Clicked <span id="clickCount">0</span> times
  </button>
</div>`);

  const [cssCode, setCssCode] = useState(`.interactive-card {
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  font-family: system-ui, sans-serif;
}
h2 {
  font-size: 1.15rem;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
p {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}
.action-btn {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.action-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}
.glow-orb {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
  background: #93c5fd;
  opacity: 0.35;
  border-radius: 50%;
  filter: blur(12px);
}`);

  const [jsCode, setJsCode] = useState(`let count = 0;
const btn = document.getElementById("counterBtn");
const countEl = document.getElementById("clickCount");

btn?.addEventListener("click", () => {
  count += 1;
  if (countEl) countEl.textContent = count;
});`);

  const [previewDoc, setPreviewDoc] = useState('');

  const buildDoc = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f8fafc;
      box-sizing: border-box;
    }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(e) {}
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviewDoc(buildDoc());
    }, 300);
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  return (
    <div className="w-full bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden text-left flex flex-col">
      {/* Top Editor Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        {/* Mock Window Dots & Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-md">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeTab === 'html' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3 text-orange-400" />
              <span>index.html</span>
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeTab === 'css' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3 h-3 text-blue-400" />
              <span>style.css</span>
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeTab === 'js' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3 h-3 text-amber-400" />
              <span>script.js</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            Live Reactive Preview
          </span>
          <button
            onClick={onOpenFullPlayground}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Open in Full IDE</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 h-80 sm:h-96">
        {/* Editor Code Area */}
        <div className="flex flex-col h-full bg-slate-900 p-3 font-mono text-xs">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
            <span>Editor (Interactive - try typing below!)</span>
            <span>UTF-8</span>
          </div>
          {activeTab === 'html' && (
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              className="flex-1 w-full bg-transparent text-emerald-300 font-mono text-xs resize-none focus:outline-none selection:bg-blue-900 leading-relaxed"
              spellCheck={false}
            />
          )}
          {activeTab === 'css' && (
            <textarea
              value={cssCode}
              onChange={(e) => setCssCode(e.target.value)}
              className="flex-1 w-full bg-transparent text-blue-300 font-mono text-xs resize-none focus:outline-none selection:bg-blue-900 leading-relaxed"
              spellCheck={false}
            />
          )}
          {activeTab === 'js' && (
            <textarea
              value={jsCode}
              onChange={(e) => setJsCode(e.target.value)}
              className="flex-1 w-full bg-transparent text-amber-300 font-mono text-xs resize-none focus:outline-none selection:bg-blue-900 leading-relaxed"
              spellCheck={false}
            />
          )}
        </div>

        {/* Live Preview Iframe */}
        <div className="flex flex-col h-full bg-slate-950 p-2">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Live Output</span>
            <RotateCw className="w-2.5 h-2.5 text-slate-500 animate-spin" />
          </div>
          <div className="flex-1 rounded-md overflow-hidden bg-white border border-slate-800">
            <iframe
              srcDoc={previewDoc}
              title="Interactive Hero Sandbox"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
