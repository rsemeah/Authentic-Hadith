import * as vscode from 'vscode';
import { getWebviewHtml } from '../utilities/webviewHtml';
import { PreferencesService } from '../services/PreferencesService';

/**
 * Onboarding webview panel for multi-step wizard
 * Steps: Choose goals → Experience level → Study frequency → Completion
 */
export class OnboardingView {
  public static currentPanel: OnboardingView | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(
    panel: vscode.WebviewPanel,
    private extensionUri: vscode.Uri,
    private preferencesService: PreferencesService
  ) {
    this._panel = panel;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getWebviewContent();
    this._setWebviewMessageListener();
  }

  public static render(extensionUri: vscode.Uri, preferencesService: PreferencesService) {
    if (OnboardingView.currentPanel) {
      OnboardingView.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'authenticHadithOnboarding',
        'Welcome to Authentic Hadith',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      OnboardingView.currentPanel = new OnboardingView(panel, extensionUri, preferencesService);
    }
  }

  public dispose() {
    OnboardingView.currentPanel = undefined;
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
      <h1>Welcome to Authentic Hadith Assistant</h1>
      
      <div id="step1" class="step">
        <h2>Step 1: What are your learning goals?</h2>
        <p>Select all that apply:</p>
        <div style="margin: 16px 0;">
          <label style="display: block; margin: 8px 0;">
            <input type="checkbox" value="memorization"> Memorize authentic hadiths
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="checkbox" value="understanding"> Understand hadith meanings
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="checkbox" value="practice"> Apply teachings in daily life
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="checkbox" value="scholarship"> Study hadith sciences
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="checkbox" value="teaching"> Prepare to teach others
          </label>
        </div>
        <div class="button-group">
          <button id="next1">Next</button>
        </div>
      </div>

      <div id="step2" class="step hidden">
        <h2>Step 2: What's your experience level?</h2>
        <div style="margin: 16px 0;">
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="experience" value="beginner" checked> Beginner - New to hadith studies
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="experience" value="intermediate"> Intermediate - Some familiarity
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="experience" value="advanced"> Advanced - Regular student
          </label>
        </div>
        <div class="button-group">
          <button id="prev2" class="secondary">Previous</button>
          <button id="next2">Next</button>
        </div>
      </div>

      <div id="step3" class="step hidden">
        <h2>Step 3: How often do you want to study?</h2>
        <div style="margin: 16px 0;">
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="frequency" value="daily" checked> Daily practice
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="frequency" value="weekly"> Few times a week
          </label>
          <label style="display: block; margin: 8px 0;">
            <input type="radio" name="frequency" value="flexible"> Flexible schedule
          </label>
        </div>
        <div style="margin: 16px 0;">
          <label for="dailyGoal">Daily goal (hadiths per day):</label>
          <input type="number" id="dailyGoal" min="1" max="20" value="3">
        </div>
        <div class="button-group">
          <button id="prev3" class="secondary">Previous</button>
          <button id="next3">Next</button>
        </div>
      </div>

      <div id="step4" class="step hidden">
        <h2>🎉 You're all set!</h2>
        <p>Your learning journey is ready to begin.</p>
        <div class="card">
          <h3>Your Preferences:</h3>
          <p id="summary"></p>
        </div>
        <div class="button-group">
          <button id="prev4" class="secondary">Previous</button>
          <button id="complete">Start Learning</button>
        </div>
      </div>
    `;

    const script = `
      const vscode = acquireVsCodeApi();
      let currentStep = 1;
      let preferences = {
        goals: [],
        experienceLevel: 'beginner',
        studyFrequency: 'daily',
        dailyGoal: 3
      };

      function showStep(step) {
        document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
        document.getElementById('step' + step).classList.remove('hidden');
        currentStep = step;
        
        if (step === 4) {
          updateSummary();
        }
      }

      function updateSummary() {
        const summary = document.getElementById('summary');
        summary.innerHTML = 
          '<strong>Goals:</strong> ' + (preferences.goals.length > 0 ? preferences.goals.join(', ') : 'None selected') + '<br>' +
          '<strong>Experience:</strong> ' + preferences.experienceLevel + '<br>' +
          '<strong>Frequency:</strong> ' + preferences.studyFrequency + '<br>' +
          '<strong>Daily Goal:</strong> ' + preferences.dailyGoal + ' hadiths';
      }

      function collectStep1() {
        const checkboxes = document.querySelectorAll('#step1 input[type="checkbox"]:checked');
        preferences.goals = Array.from(checkboxes).map(cb => cb.value);
      }

      function collectStep2() {
        const selected = document.querySelector('#step2 input[name="experience"]:checked');
        preferences.experienceLevel = selected ? selected.value : 'beginner';
      }

      function collectStep3() {
        const selected = document.querySelector('#step3 input[name="frequency"]:checked');
        preferences.studyFrequency = selected ? selected.value : 'daily';
        preferences.dailyGoal = parseInt(document.getElementById('dailyGoal').value) || 3;
      }

      // Step 1 next
      document.getElementById('next1').addEventListener('click', () => {
        collectStep1();
        showStep(2);
      });

      // Step 2 navigation
      document.getElementById('prev2').addEventListener('click', () => showStep(1));
      document.getElementById('next2').addEventListener('click', () => {
        collectStep2();
        showStep(3);
      });

      // Step 3 navigation
      document.getElementById('prev3').addEventListener('click', () => showStep(2));
      document.getElementById('next3').addEventListener('click', () => {
        collectStep3();
        showStep(4);
      });

      // Step 4 navigation
      document.getElementById('prev4').addEventListener('click', () => showStep(3));
      document.getElementById('complete').addEventListener('click', () => {
        vscode.postMessage({
          command: 'complete',
          data: preferences
        });
      });

      showStep(1);
    `;

    return getWebviewHtml(this._panel.webview, 'Onboarding', content, script);
  }

  private _setWebviewMessageListener() {
    this._panel.webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'complete':
            await this.preferencesService.saveOnboardingData({
              ...message.data,
              completed: true
            });
            vscode.window.showInformationMessage('Onboarding completed! Ready to start learning.');
            this.dispose();
            // Open dashboard
            vscode.commands.executeCommand('authentic-hadith.openDashboard');
            break;
        }
      },
      null,
      this._disposables
    );
  }
}
