import * as vscode from 'vscode';
import { getNonce } from './helpers';

/**
 * Base HTML template for webview panels
 */
export function getWebviewHtml(
  webview: vscode.Webview,
  title: string,
  content: string,
  scriptContent?: string
): string {
  const nonce = getNonce();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }
    
    h1, h2, h3 {
      margin-bottom: 16px;
      font-weight: 600;
    }
    
    h1 { font-size: 24px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; }
    
    p {
      margin-bottom: 12px;
    }
    
    button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      margin: 4px;
    }
    
    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    
    button.secondary {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    
    button.secondary:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }
    
    input, textarea, select {
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      padding: 8px;
      border-radius: 4px;
      font-size: 14px;
      width: 100%;
      margin-bottom: 12px;
    }
    
    input:focus, textarea:focus, select:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    
    .card {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .button-group {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
    
    .arabic {
      font-size: 20px;
      direction: rtl;
      text-align: right;
      margin: 16px 0;
      line-height: 1.8;
    }
    
    .hidden {
      display: none;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .grid {
      display: grid;
      gap: 16px;
      margin: 16px 0;
    }
    
    .grid-2 {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
    
    .list-item {
      padding: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
      cursor: pointer;
    }
    
    .list-item:hover {
      background-color: var(--vscode-list-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
  ${scriptContent ? `<script nonce="${nonce}">${scriptContent}</script>` : ''}
</body>
</html>`;
}
