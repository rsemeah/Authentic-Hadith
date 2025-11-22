import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { PreferencesService } from '../services/PreferencesService';
import { StateKeys } from '../utilities/constants';

/**
 * Dashboard webview panel showing daily lesson, progress, and quick access
 */
export class DashboardView {
  public static currentPanel: DashboardView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private context: vscode.ExtensionContext,
    private preferencesService: PreferencesService
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._updateWebview();
    this._setWebviewMessageListener();
  }

  public static render(
    extensionUri: vscode.Uri,
    context: vscode.ExtensionContext,
    preferencesService: PreferencesService
  ) {
    if (DashboardView.currentPanel) {
      DashboardView.currentPanel._panel.reveal(vscode.ViewColumn.One);
      DashboardView.currentPanel._updateWebview();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithDashboard',
        'Authentic Hadith Dashboard',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      DashboardView.currentPanel = new DashboardView(panel, extensionUri, context, preferencesService);
    }
  }

  public dispose() {
    DashboardView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private async _updateWebview() {
    const progress = this.context.globalState.get(StateKeys.PROGRESS, {
      totalLearned: 0,
      currentStreak: 0,
      lastStudyDate: new Date().toISOString(),
      completionPercentage: 0
    });

    const dailyGoal = await this.preferencesService.getDailyGoal();
    const todayProgress = 0; // TODO: Calculate from today's sessions

    this._panel.webview.html = this._getWebviewContent(progress, dailyGoal, todayProgress);
  }

  private _getWebviewContent(progress: any, dailyGoal: number, todayProgress: number): string {
    const content = `
      <h1>📚 Authentic Hadith Dashboard</h1>

      <div class="card">
        <h2>Today's Lesson</h2>
        <p>Progress: ${todayProgress} / ${dailyGoal} hadiths</p>
        <div style="background: var(--vscode-progressBar-background); height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: var(--vscode-button-background); height: 100%; width: ${(todayProgress / dailyGoal) * 100}%;"></div>
        </div>
        <div class="button-group">
          <button id="startLearning">Start Learning</button>
          <button id="continueLesson" class="secondary">Continue</button>
        </div>
      </div>

      <h2>Your Progress</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>🔥 Current Streak</h3>
          <p style="font-size: 32px; font-weight: bold;">${progress.currentStreak} days</p>
        </div>
        <div class="card">
          <h3>📖 Total Learned</h3>
          <p style="font-size: 32px; font-weight: bold;">${progress.totalLearned} hadiths</p>
        </div>
        <div class="card">
          <h3>✅ Completion</h3>
          <p style="font-size: 32px; font-weight: bold;">${progress.completionPercentage}%</p>
        </div>
        <div class="card">
          <h3>🎯 Daily Goal</h3>
          <p style="font-size: 32px; font-weight: bold;">${dailyGoal}</p>
        </div>
      </div>

      <h2>Quick Access</h2>
      <div class="grid grid-2">
        <div class="card">
          <h3>📝 My Notes</h3>
          <p>View and manage your hadith notes</p>
          <button id="openNotes">Open Notes</button>
        </div>
        <div class="card">
          <h3>⭐ Bookmarks</h3>
          <p>Access your saved hadiths</p>
          <button id="openBookmarks">Open Bookmarks</button>
        </div>
        <div class="card">
          <h3>🔄 Review Queue</h3>
          <p>Practice with spaced repetition</p>
          <button id="openReview">Open Review</button>
        </div>
        <div class="card">
          <h3>🔍 Search</h3>
          <p>Find hadiths by topic or keyword</p>
          <button id="openSearch">Search</button>
        </div>
      </div>

      <div class="card">
        <h2>Browse Content</h2>
        <div class="button-group">
          <button id="browseTopics">Browse Topics</button>
          <button id="openAssistant" class="secondary">AI Assistant</button>
        </div>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();

      document.getElementById('startLearning').addEventListener('click', () => {
        vscode.postMessage({ command: 'startLearning' });
      });

      document.getElementById('continueLesson').addEventListener('click', () => {
        vscode.postMessage({ command: 'startLearning' });
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

      document.getElementById('openSearch').addEventListener('click', () => {
        vscode.postMessage({ command: 'openSearch' });
      });

      document.getElementById('browseTopics').addEventListener('click', () => {
        vscode.postMessage({ command: 'browseTopics' });
      });

      document.getElementById('openAssistant').addEventListener('click', () => {
        vscode.postMessage({ command: 'openAssistant' });
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Dashboard', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case 'startLearning':
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
          case 'openSearch':
            vscode.commands.executeCommand('authentic-hadith.openSearch');
            break;
          case 'browseTopics':
            vscode.commands.executeCommand('authentic-hadith.openTopics');
            break;
          case 'openAssistant':
            vscode.commands.executeCommand('authentic-hadith.openAssistant');
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
