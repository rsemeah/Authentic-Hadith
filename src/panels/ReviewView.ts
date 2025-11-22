import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { SRSService } from '../services/SRSService';
import { sampleHadiths } from '../data/sampleHadiths';

/**
 * Review Queue webview panel for spaced repetition review
 */
export class ReviewView {
  public static currentPanel: ReviewView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private srsService: SRSService
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._updateWebview();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri, srsService: SRSService) {
    if (ReviewView.currentPanel) {
      ReviewView.currentPanel._panel.reveal(vscode.ViewColumn.One);
      ReviewView.currentPanel._updateWebview();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithReview',
        'Review Queue',
        vscode.ViewColumn.One,
        { enableScripts: true, retainContextWhenHidden: true }
      );
      ReviewView.currentPanel = new ReviewView(panel, extensionUri, srsService);
    }
  }

  public dispose() {
    ReviewView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private async _updateWebview() {
    const dueItems = await this.srsService.getDueReviews();
    const upcoming = await this.srsService.getUpcomingReviews(7);
    this._panel.webview.html = this._getWebviewContent(dueItems, upcoming);
  }

  private _getWebviewContent(dueItems: any[], upcoming: any[]): string {
    const dueHtml = dueItems.length > 0 
      ? dueItems.map(item => {
          const hadith = sampleHadiths.find(h => h.id === item.hadithId);
          return `
            <div class="card">
              <h3>${hadith?.collection} - ${hadith?.reference}</h3>
              <p>${hadith?.translation.substring(0, 100)}...</p>
              <p><strong>Last reviewed:</strong> ${new Date(item.lastReviewed).toLocaleDateString()}</p>
              <button class="review-item" data-hadith-id="${item.hadithId}">Review Now</button>
            </div>
          `;
        }).join('')
      : '<p>No reviews due today. Great work!</p>';

    const upcomingHtml = upcoming.length > 0
      ? upcoming.map(item => {
          const hadith = sampleHadiths.find(h => h.id === item.hadithId);
          return `
            <div class="list-item">
              <strong>${hadith?.collection}</strong><br>
              Due: ${new Date(item.nextReview).toLocaleDateString()}
            </div>
          `;
        }).join('')
      : '<p>No upcoming reviews</p>';

    const content = `
      <h1>🔄 Review Queue</h1>
      
      <div class="card">
        <h2>Due Today (${dueItems.length})</h2>
        ${dueHtml}
      </div>

      <div class="card">
        <h2>Upcoming Reviews</h2>
        ${upcomingHtml}
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('.review-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          vscode.postMessage({ 
            command: 'reviewHadith', 
            hadithId: e.target.dataset.hadithId 
          });
        });
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Review Queue', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        if (message.command === 'reviewHadith') {
          this._showReviewInterface(message.hadithId);
        }
      },
      null,
      this._disposables
    );
  }

  private _showReviewInterface(hadithId: string) {
    const hadith = sampleHadiths.find(h => h.id === hadithId);
    if (!hadith) return;

    const content = `
      <h1>Review Hadith</h1>
      <div class="card">
        <div class="arabic">${hadith.arabic}</div>
        <p>${hadith.translation}</p>
      </div>
      <h2>How well did you remember this?</h2>
      <div class="button-group">
        <button class="record-review" data-quality="again">Again</button>
        <button class="record-review" data-quality="hard">Hard</button>
        <button class="record-review" data-quality="medium">Medium</button>
        <button class="record-review" data-quality="easy">Easy</button>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      document.querySelectorAll('.record-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
          vscode.postMessage({ 
            command: 'recordReview', 
            hadithId: '${hadithId}',
            quality: e.target.dataset.quality 
          });
        });
      });
    `;

    this._panel.webview.html = getWebviewHtml(this._panel.webview, 'Review', content, script);
    
    // Update message listener for recording
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        if (message.command === 'recordReview') {
          await this.srsService.recordReview(message.hadithId, message.quality);
          vscode.window.showInformationMessage('Review recorded!');
          this._updateWebview();
        }
      }
    );
  }
}
