import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { sampleTopics, sampleHadiths } from '../data/sampleHadiths';

/**
 * Topics browsing webview panel
 */
export class TopicsView {
  public static currentPanel: TopicsView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, private extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri) {
    if (TopicsView.currentPanel) {
      TopicsView.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithTopics',
        'Browse Topics',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      TopicsView.currentPanel = new TopicsView(panel, extensionUri);
    }
  }

  public dispose() {
    TopicsView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(): string {
    const topicsHtml = sampleTopics.map(topic => `
      <div class="card" data-topic-id="${topic.id}">
        <h3>${topic.name}</h3>
        <p>${topic.description}</p>
        <p><strong>${topic.hadithCount} hadiths</strong></p>
        <button class="view-topic" data-topic-id="${topic.id}">View Hadiths</button>
      </div>
    `).join('');

    const content = `
      <h1>📚 Browse Topics</h1>
      <div class="grid grid-2">
        ${topicsHtml}
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('.view-topic').forEach(btn => {
        btn.addEventListener('click', (e) => {
          vscode.postMessage({ command: 'viewTopic', topicId: e.target.dataset.topicId });
        });
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Topics', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        if (message.command === 'viewTopic') {
          vscode.window.showInformationMessage(`Viewing topic: ${message.topicId}`);
          // TODO: Show topic detail view
        }
      },
      null,
      this._disposables
    );
  }
}
