import * as vscode from 'vscode';
import { ConfigKeys } from '../utilities/constants';
import { OnboardingData } from '../utilities/types';

/**
 * Service for managing user preferences and settings
 * Uses VS Code's global configuration for persistent storage
 */
export class PreferencesService {
  constructor(private context: vscode.ExtensionContext) {}

  // Onboarding preferences
  async isOnboardingCompleted(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration();
    return config.get<boolean>(ConfigKeys.ONBOARDING_COMPLETED, false);
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(ConfigKeys.ONBOARDING_COMPLETED, completed, vscode.ConfigurationTarget.Global);
  }

  async getDailyGoal(): Promise<number> {
    const config = vscode.workspace.getConfiguration();
    return config.get<number>(ConfigKeys.DAILY_GOAL, 3);
  }

  async setDailyGoal(goal: number): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(ConfigKeys.DAILY_GOAL, goal, vscode.ConfigurationTarget.Global);
  }

  async getExperienceLevel(): Promise<'beginner' | 'intermediate' | 'advanced'> {
    const config = vscode.workspace.getConfiguration();
    return config.get<'beginner' | 'intermediate' | 'advanced'>(ConfigKeys.EXPERIENCE_LEVEL, 'beginner');
  }

  async setExperienceLevel(level: 'beginner' | 'intermediate' | 'advanced'): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(ConfigKeys.EXPERIENCE_LEVEL, level, vscode.ConfigurationTarget.Global);
  }

  async getOnboardingGoals(): Promise<string[]> {
    const config = vscode.workspace.getConfiguration();
    return config.get<string[]>(ConfigKeys.ONBOARDING_GOALS, []);
  }

  async setOnboardingGoals(goals: string[]): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(ConfigKeys.ONBOARDING_GOALS, goals, vscode.ConfigurationTarget.Global);
  }

  async getStudyFrequency(): Promise<'daily' | 'weekly' | 'flexible'> {
    const config = vscode.workspace.getConfiguration();
    return config.get<'daily' | 'weekly' | 'flexible'>(ConfigKeys.STUDY_FREQUENCY, 'daily');
  }

  async setStudyFrequency(frequency: 'daily' | 'weekly' | 'flexible'): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(ConfigKeys.STUDY_FREQUENCY, frequency, vscode.ConfigurationTarget.Global);
  }

  // Get all onboarding data at once
  async getOnboardingData(): Promise<OnboardingData> {
    return {
      goals: await this.getOnboardingGoals(),
      experienceLevel: await this.getExperienceLevel(),
      studyFrequency: await this.getStudyFrequency(),
      dailyGoal: await this.getDailyGoal(),
      completed: await this.isOnboardingCompleted()
    };
  }

  // Save all onboarding data at once
  async saveOnboardingData(data: Partial<OnboardingData>): Promise<void> {
    if (data.goals !== undefined) {
      await this.setOnboardingGoals(data.goals);
    }
    if (data.experienceLevel !== undefined) {
      await this.setExperienceLevel(data.experienceLevel);
    }
    if (data.studyFrequency !== undefined) {
      await this.setStudyFrequency(data.studyFrequency);
    }
    if (data.dailyGoal !== undefined) {
      await this.setDailyGoal(data.dailyGoal);
    }
    if (data.completed !== undefined) {
      await this.setOnboardingCompleted(data.completed);
    }
  }
}
