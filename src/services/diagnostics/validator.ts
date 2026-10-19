import * as acorn from 'acorn';
import { Diagnostic } from '../../types/diagnostics';
import { ProjectFile } from '../../types/project';

/**
 * Validates JavaScript code for syntax errors using Acorn parser.
 * Provides exact line and column numbers, real error messages, and deterministic suggested fixes.
 */
export function validateJavaScript(code: string, fileName: string = 'script.js'): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (!code.trim()) return diagnostics;

  try {
    acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      allowHashBang: true,
      allowAwaitOutsideFunction: true,
    });
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const acornErr = err as {
        message?: string;
        loc?: { line: number; column: number };
        pos?: number;
      };

      const line = acornErr.loc?.line || 1;
      const column = acornErr.loc?.column !== undefined ? acornErr.loc.column + 1 : 1;
      const rawMessage = acornErr.message || 'Syntax error in JavaScript code.';
      // Clean up "(line:col)" suffix added by acorn if present
      const cleanMessage = rawMessage.replace(/\s\(\d+:\d+\)$/, '');

      let suggestedFix: string | undefined;
      if (cleanMessage.includes('Unexpected token')) {
        suggestedFix = 'Check for missing or misplaced punctuation, operators, or unclosed brackets.';
      } else if (cleanMessage.includes('Unexpected end of input') || cleanMessage.includes('Unterminated')) {
        suggestedFix = 'Check for unclosed strings, parentheses `)`, brackets `]`, or braces `}`.';
      } else if (cleanMessage.includes('Identifier') && cleanMessage.includes('already been declared')) {
        suggestedFix = 'Rename the duplicate variable identifier or remove the second declaration.';
      }

      diagnostics.push({
        id: `diag_js_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        file: fileName,
        line,
        column,
        message: cleanMessage,
        severity: 'error',
        source: 'static',
        suggestedFix,
      });
    }
  }

  return diagnostics;
}

/**
 * Validates HTML for structural integrity, unclosed tags, and doctype.
 */
export function validateHtml(code: string, fileName: string = 'index.html'): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!code.trim()) return diagnostics;

  const lines = code.split('\n');

  // Check doctype
  if (!code.toLowerCase().includes('<!doctype html>')) {
    diagnostics.push({
      id: `diag_html_doctype_${Date.now()}`,
      file: fileName,
      line: 1,
      column: 1,
      message: 'Missing standard `<!DOCTYPE html>` declaration.',
      severity: 'info',
      source: 'static',
      suggestedFix: 'Add `<!DOCTYPE html>` at the beginning of your HTML document.',
    });
  }

  // Self-closing void tags in HTML5
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  // Track container tags
  const tagsToTrack = ['div', 'span', 'p', 'section', 'article', 'main', 'header', 'footer', 'nav', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'button', 'form'];

  for (const tag of tagsToTrack) {
    if (voidTags.has(tag)) continue;

    const openRegex = new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');

    const openMatches = code.match(openRegex) || [];
    const closeMatches = code.match(closeRegex) || [];

    if (openMatches.length > closeMatches.length) {
      // Pinpoint last opening tag line
      let lastLine = lines.length;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (new RegExp(`<${tag}(\\s[^>]*)?>`, 'i').test(lines[i])) {
          lastLine = i + 1;
          break;
        }
      }

      diagnostics.push({
        id: `diag_html_unclosed_${tag}_${Date.now()}`,
        file: fileName,
        line: lastLine,
        column: 1,
        message: `Unclosed tag <${tag}>: Found ${openMatches.length} opening tag(s) but only ${closeMatches.length} closing tag(s).`,
        severity: 'warning',
        source: 'static',
        suggestedFix: `Add a closing </${tag}> tag.`,
      });
    } else if (closeMatches.length > openMatches.length) {
      diagnostics.push({
        id: `diag_html_extra_close_${tag}_${Date.now()}`,
        file: fileName,
        line: 1,
        column: 1,
        message: `Orphan closing tag </${tag}> without matching opening <${tag}>.`,
        severity: 'warning',
        source: 'static',
        suggestedFix: `Remove the extraneous </${tag}> tag.`,
      });
    }
  }

  return diagnostics;
}

/**
 * Validates CSS for balanced braces and block structure.
 */
export function validateCss(code: string, fileName: string = 'style.css'): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (!code.trim()) return diagnostics;

  const lines = code.split('\n');
  let openBraces = 0;
  let lastOpenLine = 1;
  let lastOpenCol = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '{') {
        openBraces++;
        lastOpenLine = i + 1;
        lastOpenCol = c + 1;
      } else if (char === '}') {
        openBraces--;
        if (openBraces < 0) {
          diagnostics.push({
            id: `diag_css_extra_${i}_${Date.now()}`,
            file: fileName,
            line: i + 1,
            column: c + 1,
            message: 'Unexpected closing brace `}` without matching opening `{`.',
            severity: 'error',
            source: 'static',
            suggestedFix: 'Remove the extra closing brace `}`.',
          });
          openBraces = 0;
        }
      }
    }
  }

  if (openBraces > 0) {
    diagnostics.push({
      id: `diag_css_unclosed_${Date.now()}`,
      file: fileName,
      line: lastOpenLine,
      column: lastOpenCol,
      message: `Unclosed CSS block: ${openBraces} missing closing \`}\` brace(s).`,
      severity: 'error',
      source: 'static',
      suggestedFix: 'Add closing `}` at the end of the style rule.',
    });
  }

  return diagnostics;
}

/**
 * Audits all project files and returns unified diagnostics list.
 */
export function validateProjectFiles(files: ProjectFile[]): Diagnostic[] {
  const allDiagnostics: Diagnostic[] = [];

  for (const file of files) {
    if (file.path.endsWith('.js') || file.language === 'javascript') {
      allDiagnostics.push(...validateJavaScript(file.content, file.path));
    } else if (file.path.endsWith('.html') || file.language === 'html') {
      allDiagnostics.push(...validateHtml(file.content, file.path));
    } else if (file.path.endsWith('.css') || file.language === 'css') {
      allDiagnostics.push(...validateCss(file.content, file.path));
    }
  }

  return allDiagnostics;
}
