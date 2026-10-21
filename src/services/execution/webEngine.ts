import { ProjectFile } from '../../types/project';
import { transform } from 'sucrase';

export interface WebEngineBundle {
  html: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'ico': return 'image/x-icon';
    case 'woff': return 'font/woff';
    case 'woff2': return 'font/woff2';
    case 'ttf': return 'font/ttf';
    default: return 'application/octet-stream';
  }
}

/**
 * Prepares sandboxed HTML document from project files.
 * Correctly combines HTML, CSS, JavaScript, TypeScript, and React components.
 * Injects RunStack bridge for:
 * 1. Console capturing & live REPL evaluation
 * 2. Uncaught runtime error interceptors
 * 3. Genuine CSS/Web Animation inspection via document.getAnimations()
 * 4. Genuine Network request tracking for fetch & XMLHttpRequest
 * 5. Relative asset (image/font) data URL resolution
 * 6. Internal link navigation for multi-page static projects
 * 7. In-sandbox modal dialog fallback for window.alert
 * 8. Real-time TypeScript and TSX/JSX transpilation via Sucrase
 */
export function buildSandboxedDocument(
  files: ProjectFile[],
  activeFile?: ProjectFile
): string {
  // Identify primary entry files
  let htmlFile = files.find((f) => f.path === 'index.html');
  if (activeFile && (activeFile.language === 'html' || activeFile.name.endsWith('.html'))) {
    htmlFile = activeFile;
  } else if (!htmlFile) {
    htmlFile = files.find((f) => f.name.endsWith('.html'));
  }

  const cssFiles = files.filter((f) => f.path.endsWith('.css') || f.name.endsWith('.css'));
  const jsFiles = files.filter((f) => f.path.endsWith('.js') || f.name.endsWith('.js'));
  const assetFiles = files.filter(
    (f) =>
      f.isBinary ||
      /\.(png|jpe?g|gif|webp|svg|ico|woff2?|ttf)$/i.test(f.name)
  );

  let htmlContent = '';

  if (activeFile?.language === 'html' && !htmlFile) {
    htmlContent = activeFile.content;
  } else if (htmlFile) {
    htmlContent = htmlFile.content;
  } else if (activeFile?.language === 'css') {
    // CSS-only mode with preview sandbox target
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CSS3 Sandbox</title>
</head>
<body>
  <div class="preview-stage">
    <h2>CSS3 Live Preview Canvas</h2>
    <p>Styles from your editor are applied directly to the elements below.</p>
    <div class="box"></div>
    <button class="sample-btn">Interactive Button</button>
  </div>
</body>
</html>`;
  } else if (activeFile?.language === 'javascript') {
    // JS-only mode with live console output canvas
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JavaScript Sandbox</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 1.5rem; color: #1e293b; line-height: 1.5; }
    .badge { display: inline-block; padding: 3px 8px; background: #eff6ff; color: #1d4ed8; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="badge">JavaScript Runtime Sandbox</div>
  <p>Check the <strong>Console</strong> tab in the Developer Panel below to view real-time log, info, warning, and error outputs.</p>
</body>
</html>`;
  } else if (activeFile?.language === 'typescript') {
    // TypeScript-only mode with live preview canvas
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TypeScript Sandbox</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 1.5rem; color: #1e293b; line-height: 1.5; }
    .badge { display: inline-block; padding: 3px 8px; background: #f0fdf4; color: #166534; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="badge">TypeScript Runtime Sandbox (Sucrase)</div>
  <div id="app"></div>
</body>
</html>`;
  } else if (activeFile?.name.endsWith('.tsx') || activeFile?.name.endsWith('.jsx')) {
    // React mode with live root element
    htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>React Sandbox</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`;
  } else {
    htmlContent = `<!DOCTYPE html><html><body><p style="font-family:sans-serif;color:#64748b;padding:1rem;">No HTML entry point found.</p></body></html>`;
  }

  // The RunStack client bridge script
  const bridgeScript = `
<script>
(function() {
  function safeStringify(arg) {
    if (arg === null) return 'null';
    if (arg === undefined) return 'undefined';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
    try {
      if (arg instanceof Error) {
        return arg.name + ': ' + arg.message + (arg.stack ? '\\n' + arg.stack : '');
      }
      if (arg instanceof Element) {
        return '<' + arg.tagName.toLowerCase() + (arg.id ? '#' + arg.id : '') + (arg.className ? '.' + String(arg.className).trim().replace(/\\s+/g, '.') : '') + '>';
      }
      return JSON.stringify(arg, null, 2);
    } catch(e) {
      return String(arg);
    }
  }

  // Window Alert In-Sandbox Dialog (works in sandboxed iframe without security restrictions)
  window.alert = function(msg) {
    var text = msg === undefined ? '' : String(msg);
    console.log('[alert]', text);
    try {
      var old = document.getElementById('runstack-alert-dialog');
      if (old) old.remove();

      var dialog = document.createElement('div');
      dialog.id = 'runstack-alert-dialog';
      dialog.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#0f172a;color:#f8fafc;padding:12px 20px;border-radius:10px;font-family:system-ui,-apple-system,sans-serif;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.35);z-index:9999999;display:flex;align-items:center;gap:14px;border:1px solid #334155;max-width:92vw;';

      var span = document.createElement('span');
      span.textContent = text;

      var okBtn = document.createElement('button');
      okBtn.textContent = 'OK';
      okBtn.style.cssText = 'background:#2563eb;color:#fff;border:none;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:600;cursor:pointer;';
      okBtn.onclick = function() { dialog.remove(); };

      dialog.appendChild(span);
      dialog.appendChild(okBtn);
      document.body.appendChild(dialog);
      setTimeout(function() { if (dialog.parentNode) dialog.remove(); }, 6000);
    } catch(e) {}
  };

  // 1. Console Interception
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  ['log', 'info', 'warn', 'error'].forEach(function(level) {
    console[level] = function() {
      const args = Array.prototype.slice.call(arguments);
      try {
        const text = args.map(safeStringify).join(' ');
        window.parent.postMessage({
          source: 'RUNSTACK_SANDBOX',
          type: 'CONSOLE_MESSAGE',
          payload: {
            id: 'c_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            type: level,
            text: text,
            timestamp: Date.now()
          }
        }, '*');
      } catch (err) {}
      if (originalConsole[level]) {
        originalConsole[level].apply(console, args);
      }
    };
  });

  // 2. Uncaught Runtime Errors
  window.__reportRunstackRuntimeError = function(error, filename) {
    var line = 1;
    var col = 1;
    if (error && error.stack) {
      var match = error.stack.match(/(?:<anonymous>|blob:|data:|script\.js|html|:\s*)(\d+):(\d+)/i) || error.stack.match(/:(\d+):(\d+)/);
      if (match) {
        line = parseInt(match[1], 10);
        col = parseInt(match[2], 10);
        if (line > 3) line = line - 3;
      }
    }
    window.parent.postMessage({
      source: 'RUNSTACK_SANDBOX',
      type: 'RUNTIME_ERROR',
      payload: {
        id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        file: filename || 'script.js',
        line: line,
        column: col,
        message: error instanceof Error ? error.message : String(error),
        severity: 'error',
        source: 'runtime'
      }
    }, '*');
  };

  window.onerror = function(message, source, lineno, colno, error) {
    let cleanFile = 'script.js';
    if (source) {
      const parts = source.split('/');
      cleanFile = parts[parts.length - 1] || 'script.js';
    }

    window.parent.postMessage({
      source: 'RUNSTACK_SANDBOX',
      type: 'RUNTIME_ERROR',
      payload: {
        id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        file: cleanFile,
        line: lineno || 1,
        column: colno || 1,
        message: String(message),
        severity: 'error',
        source: 'runtime'
      }
    }, '*');
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    const reasonMsg = event.reason instanceof Error
      ? event.reason.message
      : safeStringify(event.reason);

    window.parent.postMessage({
      source: 'RUNSTACK_SANDBOX',
      type: 'RUNTIME_ERROR',
      payload: {
        id: 'rej_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        file: 'script.js',
        line: 1,
        column: 1,
        message: 'Unhandled Promise Rejection: ' + reasonMsg,
        severity: 'error',
        source: 'runtime'
      }
    }, '*');
  });

  // 3. Genuine CSS & Web Animation Inspector
  function inspectAnimations() {
    try {
      if (!document.getAnimations) return;
      const anims = document.getAnimations();
      const payload = anims.map(function(anim, index) {
        const target = anim.effect && anim.effect.target;
        return {
          id: 'anim_' + index + '_' + (anim.animationName || 'unnamed'),
          name: anim.animationName || (anim.effect && anim.effect.name) || 'Animation #' + (index + 1),
          playState: anim.playState || 'running',
          playbackRate: anim.playbackRate || 1,
          currentTime: Math.round(anim.currentTime || 0),
          duration: anim.effect && anim.effect.getComputedTiming ? (anim.effect.getComputedTiming().duration || 1000) : 1000,
          targetTag: target ? target.tagName.toLowerCase() : 'element',
          targetClass: target && target.className ? String(target.className) : undefined,
          targetId: target && target.id ? target.id : undefined,
        };
      });

      window.parent.postMessage({
        source: 'RUNSTACK_SANDBOX',
        type: 'ANIMATIONS_UPDATE',
        payload: payload
      }, '*');
    } catch(err) {}
  }

  // Periodic animation scan
  setInterval(inspectAnimations, 1000);
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(inspectAnimations, 400);
  });

  // 4. Genuine Network Request Interception (fetch & XHR)
  const originalFetch = window.fetch;
  window.fetch = function() {
    const args = arguments;
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || 'unknown';
    const method = (args[1] && args[1].method) || 'GET';
    const start = performance.now();
    const reqId = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    return originalFetch.apply(this, args)
      .then(function(res) {
        const duration = Math.round(performance.now() - start);
        window.parent.postMessage({
          source: 'RUNSTACK_SANDBOX',
          type: 'NETWORK_REQUEST',
          payload: {
            id: reqId,
            method: method.toUpperCase(),
            url: url,
            status: res.status,
            statusText: res.statusText,
            type: 'fetch',
            durationMs: duration,
            timestamp: Date.now()
          }
        }, '*');
        return res;
      })
      .catch(function(err) {
        const duration = Math.round(performance.now() - start);
        window.parent.postMessage({
          source: 'RUNSTACK_SANDBOX',
          type: 'NETWORK_REQUEST',
          payload: {
            id: reqId,
            method: method.toUpperCase(),
            url: url,
            status: 'failed',
            statusText: err.message,
            type: 'fetch',
            durationMs: duration,
            timestamp: Date.now()
          }
        }, '*');
        throw err;
      });
  };

  const originalXhrOpen = XMLHttpRequest.prototype.open;
  const originalXhrSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(method, url) {
    this._rs_method = method;
    this._rs_url = url;
    this._rs_start = performance.now();
    return originalXhrOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function() {
    const xhr = this;
    const reqId = 'xhr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    xhr.addEventListener('load', function() {
      const duration = Math.round(performance.now() - (xhr._rs_start || performance.now()));
      window.parent.postMessage({
        source: 'RUNSTACK_SANDBOX',
        type: 'NETWORK_REQUEST',
        payload: {
          id: reqId,
          method: (xhr._rs_method || 'GET').toUpperCase(),
          url: xhr._rs_url || 'unknown',
          status: xhr.status,
          statusText: xhr.statusText,
          type: 'xhr',
          durationMs: duration,
          timestamp: Date.now()
        }
      }, '*');
    });

    xhr.addEventListener('error', function() {
      const duration = Math.round(performance.now() - (xhr._rs_start || performance.now()));
      window.parent.postMessage({
        source: 'RUNSTACK_SANDBOX',
        type: 'NETWORK_REQUEST',
        payload: {
          id: reqId,
          method: (xhr._rs_method || 'GET').toUpperCase(),
          url: xhr._rs_url || 'unknown',
          status: 'failed',
          statusText: 'Network Error',
          type: 'xhr',
          durationMs: duration,
          timestamp: Date.now()
        }
      }, '*');
    });

    return originalXhrSend.apply(this, arguments);
  };

  // 5. Commands from parent (RunStack IDE)
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.target !== 'RUNSTACK_SANDBOX') return;

    if (event.data.action === 'EVAL_CODE' && typeof event.data.code === 'string') {
      try {
        const evalResult = window.eval(event.data.code);
        console.log(evalResult);
      } catch (err) {
        console.error(err);
      }
    } else if (event.data.action === 'CONTROL_ANIMATION' && document.getAnimations) {
      const cmd = event.data.payload;
      const anims = document.getAnimations();
      anims.forEach(function(anim) {
        if (cmd.action === 'pause') anim.pause();
        else if (cmd.action === 'play') anim.play();
        else if (cmd.action === 'restart') {
          anim.currentTime = 0;
          anim.play();
        } else if (cmd.action === 'rate' && typeof cmd.rate === 'number') {
          anim.playbackRate = cmd.rate;
        }
      });
      setTimeout(inspectAnimations, 100);
    }
  });

  // 6. Anchor Click Navigation for Multi-Page Projects
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') {
      el = el.parentElement;
    }
    if (!el) return;
    var href = el.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      return;
    }
    e.preventDefault();
    window.parent.postMessage({
      source: 'RUNSTACK_SANDBOX',
      type: 'NAVIGATE_PAGE',
      payload: { path: href }
    }, '*');
  }, true);
})();
</script>
`;

  // Pre-generate data URLs for assets (images, fonts, SVGs)
  const assetMap = new Map<string, string>();
  assetFiles.forEach((file) => {
    let dataUrl = '';
    if (file.isBinary && file.binaryData) {
      dataUrl = `data:${getMimeType(file.name)};base64,${arrayBufferToBase64(file.binaryData)}`;
    } else if (file.name.endsWith('.svg') && file.content) {
      dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(file.content)}`;
    }
    if (dataUrl) {
      assetMap.set(file.path, dataUrl);
      assetMap.set(file.name, dataUrl);
      assetMap.set('./' + file.path, dataUrl);
      assetMap.set('./' + file.name, dataUrl);
    }
  });

  const replaceAssetReferences = (content: string): string => {
    if (assetMap.size === 0) return content;
    let result = content;
    assetMap.forEach((dataUrl, refPath) => {
      const escaped = refPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`(src=["'])${escaped}(["'])`, 'gi'), `$1${dataUrl}$2`);
      result = result.replace(new RegExp(`(href=["'])${escaped}(["'])`, 'gi'), `$1${dataUrl}$2`);
      result = result.replace(new RegExp(`url\\(\\s*["']?${escaped}["']?\\s*\\)`, 'gi'), `url("${dataUrl}")`);
    });
    return result;
  };

  let processedHtml = replaceAssetReferences(htmlContent);

  // 1. Resolve and inline CSS files
  cssFiles.forEach((cssFile) => {
    const linkRegex = new RegExp(`<link[^>]+href=["'](\\.\\/)?${cssFile.name}["'][^>]*>`, 'i');
    const resolvedCss = replaceAssetReferences(cssFile.content);
    const inlineStyle = `<style data-source="${cssFile.path}">\n/* ${cssFile.path} */\n${resolvedCss}\n</style>`;

    if (linkRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(linkRegex, inlineStyle);
    } else {
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', `${inlineStyle}\n</head>`);
      } else {
        processedHtml = `${inlineStyle}\n${processedHtml}`;
      }
    }
  });

  if (activeFile?.language === 'css' && !cssFiles.some((f) => f.id === activeFile.id)) {
    const inlineStyle = `<style data-source="${activeFile.path}">\n${activeFile.content}\n</style>`;
    if (processedHtml.includes('</head>')) {
      processedHtml = processedHtml.replace('</head>', `${inlineStyle}\n</head>`);
    } else {
      processedHtml = `${inlineStyle}\n${processedHtml}`;
    }
  }

  // 2. Resolve, transpile (TS/TSX/JSX via Sucrase), and inline script files
  const scriptFiles = files.filter(
    (f) =>
      /\.(js|mjs|ts|tsx|jsx)$/i.test(f.name) ||
      f.language === 'javascript' ||
      f.language === 'typescript'
  );

  const hasReact = files.some(
    (f) =>
      /\.(tsx|jsx)$/i.test(f.name) ||
      f.name === 'App.tsx' ||
      f.content.includes("from 'react'") ||
      f.content.includes('from "react"') ||
      f.content.includes('import React')
  );

  if (hasReact && !processedHtml.includes('react.development.js') && !processedHtml.includes('react@')) {
    const reactCdnScripts = `<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>\n<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>`;
    if (processedHtml.includes('</head>')) {
      processedHtml = processedHtml.replace('</head>', `${reactCdnScripts}\n</head>`);
    } else {
      processedHtml = `${reactCdnScripts}\n${processedHtml}`;
    }
  }

  let inlineJsBlocks = '';
  scriptFiles.forEach((scriptFile) => {
    let runnableContent = scriptFile.content;
    const isTsOrJsx =
      /\.(ts|tsx|jsx)$/i.test(scriptFile.name) ||
      scriptFile.language === 'typescript' ||
      (scriptFile.content.includes('<') && scriptFile.content.includes('/>'));

    if (isTsOrJsx) {
      try {
        const isJsx = /\.(tsx|jsx)$/i.test(scriptFile.name) || (scriptFile.content.includes('<') && scriptFile.content.includes('/>'));
        const transforms: Array<'typescript' | 'jsx' | 'imports'> = isJsx
          ? ['typescript', 'jsx', 'imports']
          : ['typescript', 'imports'];
        const res = transform(scriptFile.content, {
          transforms,
          jsxRuntime: 'classic',
        });
        runnableContent = res.code;
      } catch (transpileErr: any) {
        const errMsg = transpileErr?.message || String(transpileErr);
        const line = transpileErr?.loc?.line || 1;
        const col = transpileErr?.loc?.column || 1;
        runnableContent = `console.error("Transpilation error in ${scriptFile.name}: ${errMsg.replace(/"/g, '\\"')}");
        if (typeof window.__reportRunstackRuntimeError === 'function') {
          window.__reportRunstackRuntimeError(${JSON.stringify(errMsg)}, '${scriptFile.name}', ${line}, ${col});
        }`;
      }
    }

    const scriptSrcRegex = new RegExp(
      `<script[^>]+src=["'](\\.\\/)?${scriptFile.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>\\s*<\\/script>`,
      'i'
    );
    const wrappedScript = `<script data-source="${scriptFile.path}">\n// ${scriptFile.path}\ntry {\n${runnableContent}\n} catch(e) {\n  console.error(e);\n  if (typeof window.__reportRunstackRuntimeError === 'function') {\n    window.__reportRunstackRuntimeError(e, '${scriptFile.name}');\n  }\n}\n</script>`;

    if (scriptSrcRegex.test(processedHtml)) {
      processedHtml = processedHtml.replace(scriptSrcRegex, wrappedScript);
    } else {
      inlineJsBlocks += `\n${wrappedScript}`;
    }
  });

  if (activeFile && (activeFile.language === 'javascript' || activeFile.language === 'typescript') && !scriptFiles.some((f) => f.id === activeFile.id)) {
    let runnableContent = activeFile.content;
    if (activeFile.language === 'typescript' || activeFile.name.endsWith('.ts')) {
      try {
        runnableContent = transform(activeFile.content, { transforms: ['typescript', 'imports'] }).code;
      } catch (e: any) {
        runnableContent = `console.error(${JSON.stringify(e?.message || String(e))});`;
      }
    }
    const wrappedScript = `<script data-source="${activeFile.path}">\ntry {\n${runnableContent}\n} catch(e) {\n  console.error(e);\n  if (typeof window.__reportRunstackRuntimeError === 'function') {\n    window.__reportRunstackRuntimeError(e, '${activeFile.name}');\n  }\n}\n</script>`;
    inlineJsBlocks += `\n${wrappedScript}`;
  }

  // React auto-mount support if <div id="root"></div> exists and App component is declared
  if (hasReact) {
    const reactMountScript = `<script>
if (typeof ReactDOM !== 'undefined' && typeof React !== 'undefined') {
  var rootNode = document.getElementById('root');
  if (rootNode && !rootNode._reactRoot) {
    var comp = typeof App !== 'undefined' ? App : (typeof window.App !== 'undefined' ? window.App : null);
    if (comp) {
      rootNode._reactRoot = ReactDOM.createRoot(rootNode);
      rootNode._reactRoot.render(React.createElement(comp));
    }
  }
}
</script>`;
    inlineJsBlocks += `\n${reactMountScript}`;
  }

  // 3. Inject Bridge Script (must run before any user scripts)
  if (processedHtml.includes('<head>')) {
    processedHtml = processedHtml.replace('<head>', `<head>\n${bridgeScript}`);
  } else if (processedHtml.includes('<html>')) {
    processedHtml = processedHtml.replace('<html>', `<html><head>${bridgeScript}</head>`);
  } else {
    processedHtml = `${bridgeScript}\n${processedHtml}`;
  }

  // Append any unlinked JS blocks before </body>
  if (inlineJsBlocks) {
    if (processedHtml.includes('</body>')) {
      processedHtml = processedHtml.replace('</body>', `${inlineJsBlocks}\n</body>`);
    } else {
      processedHtml += `\n${inlineJsBlocks}`;
    }
  }

  return processedHtml;
}
