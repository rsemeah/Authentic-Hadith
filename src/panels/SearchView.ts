import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { sampleHadiths } from '../data/sampleHadiths';
import { Hadith } from '../utilities/types';

/**
 * Search webview panel for quick and advanced hadith search
 */
export class SearchView {
  public static currentPanel: SearchView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri) {
    if (SearchView.currentPanel) {
      SearchView.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithSearch',
        'Search Hadiths',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      SearchView.currentPanel = new SearchView(panel, extensionUri);
    }
  }

  public dispose() {
    SearchView.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(): string {
    const content = `
      <h1>🔍 Search Hadiths</h1>
      
      <div class="card">
        <input type="text" id="searchQuery" placeholder="Search by keyword, topic, or narrator...">
        <div class="button-group">
          <button id="searchBtn">Search</button>
          <button id="clearBtn" class="secondary">Clear</button>
        </div>
      </div>

      <div class="card">
        <h3>Advanced Filters</h3>
        <select id="collectionFilter">
          <option value="">All Collections</option>
          <option value="Sahih al-Bukhari">Sahih al-Bukhari</option>
          <option value="Sahih Muslim">Sahih Muslim</option>
          <option value="Jami\` at-Tirmidhi">Jami\` at-Tirmidhi</option>
          <option value="Sunan Abi Dawud">Sunan Abi Dawud</option>
        </select>
        <select id="topicFilter">
          <option value="">All Topics</option>
          <option value="faith">Faith</option>
          <option value="worship">Worship</option>
          <option value="character">Character</option>
          <option value="knowledge">Knowledge</option>
        </select>
      </div>

      <div id="results">
        <p>Enter a search query to find hadiths</p>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      const hadiths = ${JSON.stringify(sampleHadiths)};

      function performSearch() {
        const query = document.getElementById('searchQuery').value.toLowerCase();
        const collection = document.getElementById('collectionFilter').value;
        const topic = document.getElementById('topicFilter').value;
        
        let results = hadiths;

        if (query) {
          results = results.filter(h => 
            h.translation.toLowerCase().includes(query) ||
            h.arabic.includes(query) ||
            h.narrator?.toLowerCase().includes(query) ||
            h.topics.some(t => t.toLowerCase().includes(query))
          );
        }

        if (collection) {
          results = results.filter(h => h.collection === collection);
        }

        if (topic) {
          results = results.filter(h => h.topics.includes(topic));
        }

        displayResults(results);
      }

      function displayResults(results) {
        const resultsDiv = document.getElementById('results');
        
        if (results.length === 0) {
          resultsDiv.innerHTML = '<p>No results found</p>';
          return;
        }

        resultsDiv.innerHTML = '<h2>Results (' + results.length + ')</h2>' + 
          results.map(h => 
            '<div class="card">' +
            '<h3>' + h.collection + ' - ' + h.reference + '</h3>' +
            '<div class="arabic">' + h.arabic + '</div>' +
            '<p>' + h.translation + '</p>' +
            '<p><strong>Topics:</strong> ' + h.topics.join(', ') + '</p>' +
            '<div class="button-group">' +
            '<button class="view-hadith" data-id="' + h.id + '">View</button>' +
            '<button class="learn-hadith secondary" data-id="' + h.id + '">Learn</button>' +
            '</div>' +
            '</div>'
          ).join('');

        // Attach event listeners
        document.querySelectorAll('.view-hadith').forEach(btn => {
          btn.addEventListener('click', (e) => {
            vscode.postMessage({ command: 'viewHadith', hadithId: e.target.dataset.id });
          });
        });

        document.querySelectorAll('.learn-hadith').forEach(btn => {
          btn.addEventListener('click', (e) => {
            vscode.postMessage({ command: 'learnHadith', hadithId: e.target.dataset.id });
          });
        });
      }

      document.getElementById('searchBtn').addEventListener('click', performSearch);
      document.getElementById('searchQuery').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
      });
      document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('searchQuery').value = '';
        document.getElementById('collectionFilter').value = '';
        document.getElementById('topicFilter').value = '';
        document.getElementById('results').innerHTML = '<p>Enter a search query to find hadiths</p>';
      });
    `;

    return getWebviewHtml(this._panel.webview, 'Search', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case 'viewHadith':
            vscode.window.showInformationMessage(`View hadith: ${message.hadithId}`);
            // TODO: Open hadith detail view
            break;
          case 'learnHadith':
            vscode.commands.executeCommand('authentic-hadith.openLearning', message.hadithId);
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
