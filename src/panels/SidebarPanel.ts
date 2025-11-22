import * as vscode from 'vscode';
import { getNonce } from '../utilities/helpers';

/**
 * Sidebar panel provider for the Authentic Hadith extension
 */
export class SidebarPanel implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private context: vscode.ExtensionContext) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.command) {
        case 'openDashboard':
          vscode.commands.executeCommand('authentic-hadith.openDashboard');
          break;
        case 'openLearning':
          vscode.commands.executeCommand('authentic-hadith.openLearning');
          break;
        case 'openNotes':
          vscode.commands.executeCommand('authentic-hadith.openNotes');
          break;
        case 'openBookmarks':
          vscode.commands.executeCommand('authentic-hadith.openBookmarks');
          break;
        case 'openReview':
          vscode.commands.executeCommand('authentic-hadith.openReviewQueue');
          break;
        case 'openTopics':
          vscode.commands.executeCommand('authentic-hadith.openTopics');
          break;
        case 'openSearch':
          vscode.commands.executeCommand('authentic-hadith.openSearch');
          break;
        case 'openAssistant':
          vscode.commands.executeCommand('authentic-hadith.openAssistant');
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>Authentic Hadith</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-sidebar-background);
      padding: 16px;
      font-size: 13px;
    }

    h2, h3 {
      margin: 16px 0 8px 0;
      font-weight: 600;
    }

    h2 {
      font-size: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 4px;
    }

    h3 {
      font-size: 14px;
    }

    button {
      width: 100%;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 8px;
      text-align: left;
      font-size: 13px;
    }

    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .section {
      margin-bottom: 20px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .stat-value {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>Today's Lesson</h2>
  <div class="section">
    <div class="stat">
      <span>Progress:</span>
      <span class="stat-value">0 / 3</span>
    </div>
    <button id="startLearning">Start Learning</button>
  </div>

  <h2>Quick Access</h2>
  <div class="section">
    <button id="openNotes">📝 My Notes</button>
    <button id="openBookmarks">⭐ Bookmarks</button>
    <button id="openReview">🔄 Review Queue</button>
  </div>

  <h2>Browse</h2>
  <div class="section">
    <button id="openTopics">📚 Topics</button>
    <button id="openSearch">🔍 Search</button>
  </div>

  <h2>Progress Overview</h2>
  <div class="section">
    <div class="stat">
      <span>🔥 Streak:</span>
      <span class="stat-value">0 days</span>
    </div>
    <div class="stat">
      <span>📖 Total Learned:</span>
      <span class="stat-value">0</span>
    </div>
    <div class="stat">
      <span>✅ Completion:</span>
      <span class="stat-value">0%</span>
    </div>
    <button id="openDashboard">View Dashboard</button>
  </div>

  <h2>Help</h2>
  <div class="section">
    <button id="openAssistant">🤖 AI Assistant</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    document.getElementById('openDashboard').addEventListener('click', () => {
      vscode.postMessage({ command: 'openDashboard' });
    });

    document.getElementById('startLearning').addEventListener('click', () => {
      vscode.postMessage({ command: 'openLearning' });
    });

    document.getElementById('openNotes').addEventListener('click', () => {
      vscode.postMessage({ command: 'openNotes' });
    });

    document.getElementById('openBookmarks').addEventListener('click', () => {
      vscode.postMessage({ command: 'openBookmarks' });
    });

    document.getElementById('openReview').addEventListener('click', () => {
      vscode.postMessage({ command: 'openReview' });
    });

    document.getElementById('openTopics').addEventListener('click', () => {
      vscode.postMessage({ command: 'openTopics' });
    });

    document.getElementById('openSearch').addEventListener('click', () => {
      vscode.postMessage({ command: 'openSearch' });
    });

    document.getElementById('openAssistant').addEventListener('click', () => {
      vscode.postMessage({ command: 'openAssistant' });
    });
  </script>
</body>
</html>`;
  }

  public refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }
}
