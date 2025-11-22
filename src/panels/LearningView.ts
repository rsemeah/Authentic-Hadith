import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { sampleHadiths } from '../data/sampleHadiths';
import { StateKeys } from '../utilities/constants';

/**
 * Learning Mode webview panel for daily hadith learning
 */
export class LearningView {
  public static currentPanel: LearningView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private currentIndex = 0;

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private context: vscode.ExtensionContext
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._updateWebview();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri, context: vscode.ExtensionContext) {
    if (LearningView.currentPanel) {
      LearningView.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithLearning',
        'Learning Mode',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      LearningView.currentPanel = new LearningView(panel, extensionUri, context);
    }
  }

  public dispose() {
    LearningView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _updateWebview() {
    const hadith = sampleHadiths[this.currentIndex];
    this._panel.webview.html = this._getWebviewContent(hadith, this.currentIndex, sampleHadiths.length);
  }

  private _getWebviewContent(hadith: any, index: number, total: number): string {
    const content = `
      <h1>📖 Learning Mode</h1>
      <p>Hadith ${index + 1} of ${total}</p>

      <div class="card">
        <h2>${hadith.collection}</h2>
        <p><strong>Reference:</strong> ${hadith.reference}</p>
        <p><strong>Narrator:</strong> ${hadith.narrator}</p>
        
        <h3>Arabic Text</h3>
        <div class="arabic">${hadith.arabic}</div>
        
        <h3>Translation</h3>
        <p>${hadith.translation}</p>
        
        <h3>Explanation</h3>
        <p>${hadith.explanation || 'No explanation available.'}</p>
        
        <h3>Topics</h3>
        <p>${hadith.topics.join(', ')}</p>
      </div>

      <div class="card">
        <h3>💭 Reflection Prompt</h3>
        <p>How can you apply this teaching in your daily life?</p>
        <textarea id="reflection" rows="4" placeholder="Write your reflection..."></textarea>
      </div>

      <div class="button-group">
        <button id="prevBtn" ${index === 0 ? 'disabled' : ''}>Previous</button>
        <button id="nextBtn">Next</button>
        <button id="markLearned">Mark as Learned</button>
        <button id="openAssistant" class="secondary">Ask Assistant</button>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();

      document.getElementById('prevBtn')?.addEventListener('click', () => {
        vscode.postMessage({ command: 'previous' });
      });

      document.getElementById('nextBtn')?.addEventListener('click', () => {
        const reflection = document.getElementById('reflection').value;
        vscode.postMessage({ command: 'next', reflection });
      });

      document.getElementById('markLearned')?.addEventListener('click', () => {
        const reflection = document.getElementById('reflection').value;
        vscode.postMessage({ command: 'markLearned', hadithId: '${hadith.id}', reflection });
      });

      document.getElementById('openAssistant')?.addEventListener('click', () => {
        vscode.postMessage({ command: 'openAssistant', hadithId: '${hadith.id}' });
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Learning', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'previous':
            if (this.currentIndex > 0) {
              this.currentIndex--;
              this._updateWebview();
            }
            break;
          case 'next':
            if (this.currentIndex < sampleHadiths.length - 1) {
              this.currentIndex++;
              this._updateWebview();
            } else {
              vscode.window.showInformationMessage('You\'ve completed all hadiths!');
            }
            break;
          case 'markLearned':
            // Save progress
            const progress = this.context.globalState.get(StateKeys.PROGRESS, {
              totalLearned: 0,
              currentStreak: 1,
              lastStudyDate: new Date().toISOString(),
              completionPercentage: 0
            });
            progress.totalLearned++;
            await this.context.globalState.update(StateKeys.PROGRESS, progress);
            
            vscode.window.showInformationMessage('Hadith marked as learned!');
            
            // Auto-advance
            if (this.currentIndex < sampleHadiths.length - 1) {
              this.currentIndex++;
              this._updateWebview();
            }
            break;
          case 'openAssistant':
            vscode.commands.executeCommand('authentic-hadith.openAssistant', message.hadithId);
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
