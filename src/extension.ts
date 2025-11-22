import * as vscode from 'vscode';
import { Commands } from './utilities/constants';
import { PreferencesService } from './services/PreferencesService';
import { NotesService } from './services/NotesService';
import { BookmarksService } from './services/BookmarksService';
import { SRSService } from './services/SRSService';
import { AIService } from './services/AIService';
import { OnboardingView } from './panels/OnboardingView';
import { DashboardView } from './panels/DashboardView';
import { NotesView } from './panels/NotesView';
import { SearchView } from './panels/SearchView';
import { TopicsView } from './panels/TopicsView';
import { LearningView } from './panels/LearningView';
import { ReviewView } from './panels/ReviewView';
import { AssistantView } from './panels/AssistantView';
import { SidebarPanel } from './panels/SidebarPanel';

/**
 * Extension activation function
 * Called when VS Code activates the extension
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Authentic Hadith extension is now active');

  // Initialize services
  const preferencesService = new PreferencesService(context);
  const notesService = new NotesService(context);
  const bookmarksService = new BookmarksService(context);
  const srsService = new SRSService(context);
  const aiService = new AIService();

  // Register sidebar panel
  const sidebarProvider = new SidebarPanel(context.extensionUri, context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('authentic-hadith-sidebar-view', sidebarProvider)
  );

  // Check if onboarding is needed
  checkOnboarding(preferencesService);

  // Register all commands
  registerCommands(context, {
    preferencesService,
    notesService,
    bookmarksService,
    srsService,
    aiService
  });

  // Show welcome message
  vscode.window.showInformationMessage('Welcome to Authentic Hadith Assistant!');
}

/**
 * Check if onboarding is completed, show onboarding if not
 */
async function checkOnboarding(preferencesService: PreferencesService) {
  const completed = await preferencesService.isOnboardingCompleted();
  if (!completed) {
    // Delay showing onboarding to let VS Code fully load
    setTimeout(() => {
      vscode.commands.executeCommand(Commands.START_ONBOARDING);
    }, 2000);
  }
}

/**
 * Register all extension commands
 */
function registerCommands(
  context: vscode.ExtensionContext,
  services: {
    preferencesService: PreferencesService;
    notesService: NotesService;
    bookmarksService: BookmarksService;
    srsService: SRSService;
    aiService: AIService;
  }
) {
  const { preferencesService, notesService, bookmarksService, srsService, aiService } = services;

  // Onboarding command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.START_ONBOARDING, () => {
      OnboardingView.render(context.extensionUri, preferencesService);
    })
  );

  // Dashboard command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_DASHBOARD, () => {
      DashboardView.render(context.extensionUri, context, preferencesService);
    })
  );

  // Notes commands
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_NOTES, () => {
      NotesView.render(context.extensionUri, notesService);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.EXPORT_NOTES_MARKDOWN, async () => {
      const markdown = await notesService.exportNotesToMarkdown();
      const uri = await vscode.window.showSaveDialog({
        filters: { 'Markdown': ['md'] },
        defaultUri: vscode.Uri.file('hadith-notes.md')
      });
      
      if (uri) {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(markdown, 'utf8'));
        vscode.window.showInformationMessage(`Notes exported to ${uri.fsPath}`);
      }
    })
  );

  // Bookmarks commands
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_BOOKMARKS, async () => {
      const bookmarks = await bookmarksService.getAllBookmarks();
      const items = bookmarks.map(b => ({
        label: `Hadith ${b.hadithId}`,
        description: b.notes,
        hadithId: b.hadithId
      }));

      if (items.length === 0) {
        vscode.window.showInformationMessage('No bookmarks yet!');
        return;
      }

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a bookmark to view'
      });

      if (selected) {
        vscode.window.showInformationMessage(`Opening hadith: ${selected.hadithId}`);
        // TODO: Open hadith detail view
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.TOGGLE_BOOKMARK, async (hadithId?: string) => {
      if (!hadithId) {
        hadithId = await vscode.window.showInputBox({
          prompt: 'Enter hadith ID to bookmark'
        });
      }
      
      if (hadithId) {
        const isBookmarked = await bookmarksService.toggleBookmark(hadithId);
        vscode.window.showInformationMessage(
          isBookmarked ? 'Bookmark added!' : 'Bookmark removed!'
        );
      }
    })
  );

  // Search command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_SEARCH, () => {
      SearchView.render(context.extensionUri);
    })
  );

  // Topics command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_TOPICS, () => {
      TopicsView.render(context.extensionUri);
    })
  );

  // Learning command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_LEARNING, (hadithId?: string) => {
      LearningView.render(context.extensionUri, context);
      // TODO: If hadithId provided, start with that specific hadith
    })
  );

  // Review commands
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_REVIEW_QUEUE, () => {
      ReviewView.render(context.extensionUri, srsService);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.RECORD_REVIEW, async (hadithId: string, quality: string) => {
      await srsService.recordReview(hadithId, quality as any);
      vscode.window.showInformationMessage('Review recorded!');
    })
  );

  // Assistant command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.OPEN_ASSISTANT, (hadithId?: string) => {
      AssistantView.render(context.extensionUri, aiService, hadithId);
    })
  );

  // Sidebar command
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.SHOW_SIDEBAR, () => {
      vscode.commands.executeCommand('workbench.view.extension.authentic-hadith-sidebar');
    })
  );
}

/**
 * Extension deactivation function
 * Called when VS Code deactivates the extension
 */
export function deactivate() {
  console.log('Authentic Hadith extension is now deactivated');
}
