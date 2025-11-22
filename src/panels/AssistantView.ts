import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { AIService } from '../services/AIService';

/**
 * AI Assistant webview panel for chat-style interaction
 */
export class AssistantView {
  public static currentPanel: AssistantView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private messages: Array<{role: 'user' | 'assistant', content: string}> = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private aiService: AIService,
    private hadithId?: string
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._updateWebview();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri, aiService: AIService, hadithId?: string) {
    if (AssistantView.currentPanel) {
      AssistantView.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithAssistant',
        'AI Assistant',
        vscode.ViewColumn.Beside,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      AssistantView.currentPanel = new AssistantView(panel, extensionUri, aiService, hadithId);
    }
  }

  public dispose() {
    AssistantView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _updateWebview() {
    this._panel.webview.html = this._getWebviewContent();
  }

  private _getWebviewContent(): string {
    const messagesHtml = this.messages.map(msg => `
      <div class="card" style="background: ${msg.role === 'user' ? 'var(--vscode-input-background)' : 'var(--vscode-editor-background)'};">
        <strong>${msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
        <p>${msg.content}</p>
      </div>
    `).join('');

    const content = `
      <h1>🤖 AI Assistant</h1>
      ${this.hadithId ? `<p><em>Context: Discussing hadith ${this.hadithId}</em></p>` : ''}
      
      <div id="messages" style="max-height: 400px; overflow-y: auto; margin-bottom: 16px;">
        ${messagesHtml || '<p><em>Ask me anything about hadiths...</em></p>'}
      </div>

      <div>
        <textarea id="messageInput" rows="3" placeholder="Type your question..."></textarea>
        <div class="button-group">
          <button id="sendBtn">Send</button>
          <button id="clearBtn" class="secondary">Clear</button>
        </div>
      </div>

      <div class="card">
        <h3>Quick Questions</h3>
        <button class="quick-question" data-q="Explain this hadith">Explain this hadith</button>
        <button class="quick-question" data-q="What is the context?">What is the context?</button>
        <button class="quick-question" data-q="Show related hadiths">Show related hadiths</button>
        <button class="quick-question" data-q="Analyze the Arabic">Analyze the Arabic</button>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();

      function sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (!message) return;

        vscode.postMessage({ command: 'sendMessage', message });
        input.value = '';
      }

      document.getElementById('sendBtn').addEventListener('click', sendMessage);
      document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      document.getElementById('clearBtn').addEventListener('click', () => {
        vscode.postMessage({ command: 'clear' });
      });

      document.querySelectorAll('.quick-question').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const q = e.target.dataset.q;
          vscode.postMessage({ command: 'sendMessage', message: q });
        });
      });

      // Auto-scroll to bottom
      const messagesDiv = document.getElementById('messages');
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    `;

    return getWebviewHtml(this._panel.webview, 'Assistant', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'sendMessage':
            this.messages.push({ role: 'user', content: message.message });
            this._updateWebview();
            
            // Get AI response
            const response = await this.aiService.sendMessage(message.message, this.hadithId);
            this.messages.push({ role: 'assistant', content: response });
            this._updateWebview();
            break;
          case 'clear':
            this.messages = [];
            this._updateWebview();
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
