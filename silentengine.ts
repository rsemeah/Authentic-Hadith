/**
 * SilentEngine - Single File Blueprint
 *
 * HOW TO USE REAL API KEYS (NEXT ITERATION):
 * 1. Create a `.env` file (DO NOT COMMIT IT) with:
 *
 *    ENGINE_API_KEY=se_prod_change_this_to_random_32_chars
 *    ALLOWED_ORIGINS=https://hirewire.app,https://insense.app,https://authentichadith.app
 *    NODE_ENV=development
 *
 *    OPENAI_API_KEY=your_openai_key_here
 *    ANTHROPIC_API_KEY=your_anthropic_key_here
 *    GOOGLE_API_KEY=your_google_gemini_key_here
 *    GROQ_API_KEY=your_groq_key_here
 *    OPENROUTER_API_KEY=your_openrouter_key_here
 *
 *    HASH_PROMPTS=true
 *    LOG_RETENTION_DAYS=90
 *
 * 2. In production (e.g. Vercel), set those same names in the dashboard UI.
 * 3. NEVER paste real keys into this file. ONLY use process.env.VAR_NAME.
 */

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import cron from "node-cron";

// Optional: if you use zod later for JSON validation
// import { z } from "zod";

/* -------------------------------------------------------
 *  Types
 * -----------------------------------------------------*/

type TaskType =
  | "general"
  | "code"
  | "analysis"
  | "json"
  | "creative"
  | "explanation"
  | "chat";

interface GenerateRequest {
  prompt: string;
  taskType?: TaskType;
  maxTokens?: number;
  temperature?: number;
  [key: string]: any;
}

interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

interface GenerateResponse {
  content: string;
  model: string;
  provider: string;
  tokens: TokenUsage;
  latency: number;
  cost: number;
  requestId: string;
}

interface RequestLog {
  id: string;
  timestamp: string;
  request: any;
  response: any;
  error?: string;
  fallbackUsed: boolean;
}

interface RoutingRule {
  taskType: TaskType;
  primaryModel: string;
  backupModel?: string;
  strategy: "single" | "fallback";
}

/* -------------------------------------------------------
 *  Production Security Validation
 * -----------------------------------------------------*/

function validateProductionSecurity() {
  if (process.env.NODE_ENV === "production") {
    // App-level engine key
    if (
      !process.env.ENGINE_API_KEY ||
      process.env.ENGINE_API_KEY === "dev-key-change-in-production"
    ) {
      throw new Error(
        "❌ FATAL: ENGINE_API_KEY must be set to a secure value in production"
      );
    }

    if (process.env.ENGINE_API_KEY.length < 32) {
      throw new Error(
        "❌ FATAL: ENGINE_API_KEY must be at least 32 characters long"
      );
    }

    // At least one model provider
    if (
      !process.env.OPENAI_API_KEY &&
      !process.env.ANTHROPIC_API_KEY &&
      !process.env.GOOGLE_API_KEY &&
      !process.env.GROQ_API_KEY &&
      !process.env.OPENROUTER_API_KEY
    ) {
      throw new Error(
        "❌ FATAL: At least one provider API key must be configured"
      );
    }

    console.log("✅ Production security checks passed");
  }
}

validateProductionSecurity();

/* -------------------------------------------------------
 *  Privacy Filter (PII-safe logging)
 * -----------------------------------------------------*/

interface PrivacyConfig {
  logFullContent: boolean;
  redactPII: boolean;
  hashPrompts: boolean;
  retentionDays: number;
}

class PrivacyFilter {
  private config: PrivacyConfig;

  private piiPatterns = {
    email:
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone:
      /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    creditCard:
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    ipAddress:
      /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  };

  constructor(config: PrivacyConfig) {
    this.config = config;
  }

  sanitizeForLogging(content: string, contentType: "prompt" | "response"): string {
    if (process.env.NODE_ENV === "development" && this.config.logFullContent) {
      return content;
    }

    if (this.config.hashPrompts && contentType === "prompt") {
      return this.hashContent(content);
    }

    if (this.config.redactPII) {
      return this.redactPII(content);
    }

    if (content.length > 200) {
      return (
        content.slice(0, 100) +
        `... [${content.length - 200} chars] ...` +
        content.slice(-100)
      );
    }

    return content;
  }

  private redactPII(content: string): string {
    let sanitized = content;

    Object.entries(this.piiPatterns).forEach(([type, pattern]) => {
      sanitized = sanitized.replace(
        pattern,
        `[REDACTED_${type.toUpperCase()}]`
      );
    });

    return sanitized;
  }

  private hashContent(content: string): string {
    return (
      "hash_" +
      crypto
        .createHash("sha256")
        .update(content)
        .digest("hex")
        .slice(0, 16)
    );
  }

  shouldRetainLog(logDate: Date): boolean {
    const retentionMs =
      this.config.retentionDays * 24 * 60 * 60 * 1000;
    return Date.now() - logDate.getTime() < retentionMs;
  }
}

const privacyFilter = new PrivacyFilter({
  logFullContent: process.env.NODE_ENV === "development",
  redactPII: process.env.NODE_ENV === "production",
  hashPrompts: process.env.HASH_PROMPTS === "true",
  retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || "90"),
});

/* -------------------------------------------------------
 *  Logger with daily rotation + archive
 * -----------------------------------------------------*/

class Logger {
  private logs: RequestLog[] = [];
  private logDir: string;
  private currentLogFile: string;
  private maxLogsInMemory = 1000;

  constructor(logDir: string = "./logs") {
    this.logDir = logDir;

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.currentLogFile = this.getLogFilePath();
    this.loadRecentLogs();
  }

  private getLogFilePath(date: Date = new Date()): string {
    const dateStr = date.toISOString().split("T")[0];
    return path.join(this.logDir, `requests-${dateStr}.json`);
  }

  private loadRecentLogs() {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        const data = fs.readFileSync(this.currentLogFile, "utf-8");
        this.logs = JSON.parse(data);
        console.log(
          `📂 Loaded ${this.logs.length} logs from ${this.currentLogFile}`
        );
      }
    } catch {
      console.warn("⚠️ Could not load logs, starting fresh");
      this.logs = [];
    }
  }

  log(request: any, response: any, error?: string, fallbackUsed = false) {
    const logEntry: RequestLog = {
      id: response.requestId,
      timestamp: new Date().toISOString(),
      request: {
        ...request,
        prompt: privacyFilter.sanitizeForLogging(
          request.prompt,
          "prompt"
        ),
      },
      response: {
        ...response,
        content: privacyFilter.sanitizeForLogging(
          response.content,
          "response"
        ),
      },
      error,
      fallbackUsed,
    };

    this.logs.push(logEntry);

    const expectedFile = this.getLogFilePath();
    if (expectedFile !== this.currentLogFile) {
      this.saveLogs();
      this.currentLogFile = expectedFile;
      this.logs = [logEntry];
    }

    if (this.logs.length > this.maxLogsInMemory) {
      this.saveLogs();
      const keepRecent = this.maxLogsInMemory / 2;
      this.logs = this.logs.slice(-keepRecent);
    }

    if (this.logs.length % 10 === 0) {
      this.saveLogs();
    }
  }

  private saveLogs() {
    try {
      const tempFile = `${this.currentLogFile}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.logs, null, 2));
      fs.renameSync(tempFile, this.currentLogFile);
      console.log(
        `💾 Saved ${this.logs.length} logs to ${this.currentLogFile}`
      );
    } catch (error) {
      console.error("❌ Error saving logs:", error);
    }
  }

  async getLogsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<RequestLog[]> {
    const allLogs: RequestLog[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const filePath = this.getLogFilePath(currentDate);

      if (fs.existsSync(filePath)) {
        try {
          const data = fs.readFileSync(filePath, "utf-8");
          const logs = JSON.parse(data);
          allLogs.push(...logs);
        } catch {
          console.warn(`⚠️ Could not read ${filePath}`);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return allLogs;
  }

  async archiveOldLogs(olderThanDays = 30) {
    const archiveDir = path.join(this.logDir, "archive");
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const files = fs.readdirSync(this.logDir);

    for (const file of files) {
      if (!file.startsWith("requests-") || !file.endsWith(".json")) continue;

      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        const archivePath = path.join(archiveDir, file);
        fs.renameSync(filePath, archivePath);
        console.log(`📦 Archived ${file}`);
      }
    }
  }

  shutdown() {
    this.saveLogs();
  }
}

const logger = new Logger();

/* -------------------------------------------------------
 *  Rate Limiter (per API key)
 * -----------------------------------------------------*/

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  maxTokens?: number;
  maxCost?: number;
}

interface RateLimitEntry {
  requests: number;
  tokens: number;
  cost: number;
  windowStart: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.configs.set("default", {
      windowMs: 60 * 1000,
      maxRequests: 100,
      maxTokens: 100_000,
      maxCost: 1.0,
    });

    setInterval(() => this.cleanup(), 60 * 1000);
  }

  setLimit(apiKey: string, config: RateLimitConfig) {
    this.configs.set(apiKey, config);
  }

  async checkLimit(
    apiKey: string,
    estimatedTokens = 1000,
    estimatedCost = 0.01
  ): Promise<boolean> {
    const config =
      this.configs.get(apiKey) || this.configs.get("default")!;
    const now = Date.now();
    let entry = this.limits.get(apiKey);

    if (!entry || now - entry.windowStart > config.windowMs) {
      entry = {
        requests: 0,
        tokens: 0,
        cost: 0,
        windowStart: now,
      };
      this.limits.set(apiKey, entry);
    }

    if (entry.requests >= config.maxRequests) return false;
    if (config.maxTokens && entry.tokens + estimatedTokens > config.maxTokens)
      return false;
    if (config.maxCost && entry.cost + estimatedCost > config.maxCost)
      return false;

    return true;
  }

  recordUsage(apiKey: string, tokens: number, cost: number) {
    const entry = this.limits.get(apiKey);
    if (!entry) return;

    entry.requests++;
    entry.tokens += tokens;
    entry.cost += cost;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      const config =
        this.configs.get(key) || this.configs.get("default")!;
      if (now - entry.windowStart > config.windowMs * 2) {
        this.limits.delete(key);
      }
    }
  }
}

const rateLimiter = new RateLimiter();

/* -------------------------------------------------------
 *  Provider Base + Stubs (API keys via env only)
 * -----------------------------------------------------*/

interface IProvider {
  generate(request: GenerateRequest): Promise<GenerateResponse>;
  getName(): string;
  checkHealth(): Promise<boolean>;
}

abstract class BaseProvider implements IProvider {
  protected modelName = "";
  private lastHealthCheck = 0;
  private healthCheckInterval = 5 * 60 * 1000;
  private healthy = true;

  abstract generate(request: GenerateRequest): Promise<GenerateResponse>;
  abstract getName(): string;

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.healthy;
    }

    try {
      await this.performHealthCheck();
      this.healthy = true;
    } catch (err) {
      console.warn(`⚠️ Health check failed for ${this.getName()}`, err);
      this.healthy = false;
    } finally {
      this.lastHealthCheck = now;
    }

    return this.healthy;
  }

  protected async performHealthCheck(): Promise<void> {
    // Default: cheap call. In next iteration, replace with real minimal request.
    await this.generate({
      prompt: "ping",
      maxTokens: 1,
    });
  }
}

/**
 * PROVIDER STUBS:
 * In the next iteration, Kodex should fill in the actual SDK calls
 * using the env vars below:
 *
 * - process.env.OPENAI_API_KEY
 * - process.env.ANTHROPIC_API_KEY
 * - process.env.GOOGLE_API_KEY
 * - process.env.GROQ_API_KEY
 * - process.env.OPENROUTER_API_KEY
 */

class OpenAIProvider extends BaseProvider {
  constructor(modelName: string) {
    super();
    this.modelName = modelName;
    if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set (OpenAIProvider)");
    }
  }

  getName() {
    return `openai:${this.modelName}`;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const start = Date.now();
    // TODO (next iteration): use OpenAI SDK with process.env.OPENAI_API_KEY
    const content = `[OPENAI PLACEHOLDER RESPONSE for ${request.prompt.slice(
      0,
      40
    )}...]`;

    return {
      content,
      model: this.modelName,
      provider: "openai",
      tokens: { input: 0, output: 0, total: 0 },
      latency: Date.now() - start,
      cost: 0,
      requestId: `req_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    };
  }
}

class AnthropicProvider extends BaseProvider {
  constructor(modelName: string) {
    super();
    this.modelName = modelName;
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not set (AnthropicProvider)");
    }
  }

  getName() {
    return `anthropic:${this.modelName}`;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const start = Date.now();
    // TODO: use Anthropic SDK with process.env.ANTHROPIC_API_KEY
    const content = `[CLAUDE PLACEHOLDER RESPONSE for ${request.prompt.slice(
      0,
      40
    )}...]`;

    return {
      content,
      model: this.modelName,
      provider: "anthropic",
      tokens: { input: 0, output: 0, total: 0 },
      latency: Date.now() - start,
      cost: 0,
      requestId: `req_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    };
  }
}

class GroqProvider extends BaseProvider {
  constructor(modelName: string) {
    super();
    this.modelName = modelName;
    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY not set (GroqProvider)");
    }
  }

  getName() {
    return `groq:${this.modelName}`;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const start = Date.now();
    // TODO: use Groq SDK with process.env.GROQ_API_KEY
    const content = `[GROQ PLACEHOLDER RESPONSE for ${request.prompt.slice(
      0,
      40
    )}...]`;

    return {
      content,
      model: this.modelName,
      provider: "groq",
      tokens: { input: 0, output: 0, total: 0 },
      latency: Date.now() - start,
      cost: 0,
      requestId: `req_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    };
  }
}

class GoogleProvider extends BaseProvider {
  constructor(modelName: string) {
    super();
    this.modelName = modelName;
    if (!process.env.GOOGLE_API_KEY) {
      console.warn("GOOGLE_API_KEY not set (GoogleProvider)");
    }
  }

  getName() {
    return `google:${this.modelName}`;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const start = Date.now();
    // TODO: use Google Gemini client with process.env.GOOGLE_API_KEY
    const content = `[GEMINI PLACEHOLDER RESPONSE for ${request.prompt.slice(
      0,
      40
    )}...]`;

    return {
      content,
      model: this.modelName,
      provider: "google",
      tokens: { input: 0, output: 0, total: 0 },
      latency: Date.now() - start,
      cost: 0,
      requestId: `req_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    };
  }
}

class OpenRouterProvider extends BaseProvider {
  constructor(modelName: string) {
    super();
    this.modelName = modelName;
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY not set (OpenRouterProvider)");
    }
  }

  getName() {
    return `openrouter:${this.modelName}`;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const start = Date.now();
    // TODO: use OpenRouter API with process.env.OPENROUTER_API_KEY
    const content = `[OPENROUTER PLACEHOLDER RESPONSE for ${request.prompt.slice(
      0,
      40
    )}...]`;

    return {
      content,
      model: this.modelName,
      provider: "openrouter",
      tokens: { input: 0, output: 0, total: 0 },
      latency: Date.now() - start,
      cost: 0,
      requestId: `req_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    };
  }
}

/* -------------------------------------------------------
 *  Routing Config (centralized)
 * -----------------------------------------------------*/

const routingConfig: {
  default: string;
  rules: RoutingRule[];
} = {
  default: "groq-llama-3.1-70b",
  rules: [
    {
      taskType: "code",
      primaryModel: "anthropic:claude-haiku-4",
      backupModel: "groq:llama-3.1-70b",
      strategy: "fallback",
    },
    {
      taskType: "analysis",
      primaryModel: "anthropic:claude-haiku-4",
      backupModel: "groq:llama-3.1-70b",
      strategy: "fallback",
    },
    {
      taskType: "json",
      primaryModel: "groq:llama-3.1-70b",
      strategy: "single",
    },
    {
      taskType: "creative",
      primaryModel: "anthropic:claude-haiku-4",
      backupModel: "groq:llama-3.1-70b",
      strategy: "fallback",
    },
    {
      taskType: "explanation",
      primaryModel: "groq:llama-3.1-70b",
      backupModel: "google:gemini-1.5-flash",
      strategy: "fallback",
    },
    {
      taskType: "chat",
      primaryModel: "groq:llama-3.1-70b",
      strategy: "single",
    },
  ],
};

class Router {
  private rules: Map<TaskType, RoutingRule> = new Map();

  constructor() {
    routingConfig.rules.forEach((rule) => {
      this.rules.set(rule.taskType, rule);
    });
    console.log(`📋 Loaded ${this.rules.size} routing rules`);
  }

  getRule(taskType: TaskType): RoutingRule {
    return (
      this.rules.get(taskType) || {
        taskType,
        primaryModel: routingConfig.default,
        strategy: "single",
      }
    );
  }
}

/* -------------------------------------------------------
 *  Engine (routing + fallback + JSON helper)
 * -----------------------------------------------------*/

class Engine {
  private providers: Map<string, IProvider>;
  private router: Router;
  private logger: Logger;

  constructor(providers: Map<string, IProvider>, router: Router, logger: Logger) {
    this.providers = providers;
    this.router = router;
    this.logger = logger;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }

  private alertOnFallback(primary: string, backup: string, error: Error) {
    console.warn("🚨 FALLBACK TRIGGERED", {
      primary,
      backup,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    // Next iteration: send to Slack/PagerDuty via SLACK_WEBHOOK_URL
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const taskType = request.taskType || "general";
    const rule = this.router.getRule(taskType);

    console.log(`🎯 Routing ${taskType} task to ${rule.primaryModel}`);

    let response: GenerateResponse | undefined;
    let primaryError: Error | undefined;
    let backupError: Error | undefined;
    let fallbackUsed = false;

    const primaryProvider = this.providers.get(rule.primaryModel);
    if (!primaryProvider) {
      throw new Error(`Primary model ${rule.primaryModel} not found`);
    }

    const primaryHealthy = await primaryProvider.checkHealth();
    if (!primaryHealthy && rule.backupModel && rule.strategy === "fallback") {
      console.log(
        `⚠️ Primary ${rule.primaryModel} unhealthy, using backup ${rule.backupModel} preemptively`
      );
      const backupProvider = this.providers.get(rule.backupModel);
      if (!backupProvider) {
        throw new Error(`Backup model ${rule.backupModel} not found`);
      }
      response = await backupProvider.generate(request);
      this.logger.log(request, response, undefined, true);
      return response;
    }

    try {
      response = await primaryProvider.generate(request);
      this.logger.log(request, response, undefined, false);
      return response;
    } catch (err: any) {
      primaryError = err;
      console.error(
        `❌ Primary model ${rule.primaryModel} failed: ${err.message}`
      );
    }

    if (rule.backupModel && rule.strategy === "fallback") {
      console.log(`🔄 Attempting fallback to ${rule.backupModel}`);
      try {
        const backupProvider = this.providers.get(rule.backupModel);
        if (!backupProvider) {
          throw new Error(`Backup model ${rule.backupModel} not found`);
        }
        response = await backupProvider.generate(request);
        fallbackUsed = true;

        this.logger.log(
          request,
          response,
          primaryError?.message,
          true
        );
        this.alertOnFallback(
          rule.primaryModel,
          rule.backupModel,
          primaryError!
        );
        return response;
      } catch (err: any) {
        backupError = err;
        console.error(
          `❌ Backup model ${rule.backupModel} also failed: ${err.message}`
        );
      }
    }

    const errorResponse: GenerateResponse = {
      content: "",
      model: rule.primaryModel,
      provider: "none",
      tokens: { input: 0, output: 0, total: 0 },
      latency: 0,
      cost: 0,
      requestId: this.generateRequestId(),
    };

    const combinedError = backupError
      ? `Primary: ${primaryError?.message}, Backup: ${backupError.message}`
      : primaryError?.message || "Unknown error";

    this.logger.log(request, errorResponse, combinedError, fallbackUsed);

    throw new Error(
      `All models failed for taskType=${taskType}. Primary (${rule.primaryModel}): ${primaryError?.message}` +
        (backupError
          ? `. Backup (${rule.backupModel}): ${backupError.message}`
          : "")
    );
  }

  // JSON helper with retries and cleaning
  async generateJSON<T = any>(
    request: GenerateRequest,
    maxRetries = 3
  ): Promise<{ data: T; retriesUsed: number }> {
    let attempts = 0;
    let lastError = "";

    const localRequest: GenerateRequest = { ...request, taskType: "json" };

    while (attempts < maxRetries) {
      const response = await this.generate(localRequest);

      try {
        let content = response.content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();

        const parsed = JSON.parse(content);

        // Next iteration: optionally validate with zod
        // const validated = schema.parse(parsed);

        console.log(
          `✅ Valid JSON generated (attempt ${attempts + 1}/${maxRetries})`
        );
        return { data: parsed as T, retriesUsed: attempts + 1 };
      } catch (err: any) {
        attempts++;
        lastError = err.message;
        console.warn(
          `⚠️ JSON validation failed (attempt ${attempts}/${maxRetries}): ${err.message}`
        );

        if (attempts < maxRetries) {
          localRequest.prompt +=
            `\n\n[PREVIOUS ATTEMPT FAILED]\n` +
            `Error: ${err.message}\n` +
            `Please respond with ONLY valid JSON. No markdown, no explanations, no code blocks.`;
        }
      }
    }

    throw new Error(
      `Failed to generate valid JSON after ${maxRetries} attempts. Last error: ${lastError}`
    );
  }
}

/* -------------------------------------------------------
 *  Dashboard Data (usage, cost, etc.)
 * -----------------------------------------------------*/

class DashboardDataService {
  constructor(private logger: Logger) {}

  async getUsageOverview(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.logger.getLogsByDateRange(
      startDate,
      endDate
    );

    if (logs.length === 0) {
      return {
        totalRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        avgLatency: 0,
        errorRate: 0,
        fallbackRate: 0,
        byModel: {},
        byTaskType: {},
        byDay: {},
      };
    }

    const totalCost = logs.reduce(
      (sum, l) => sum + (l.response.cost || 0),
      0
    );
    const totalTokens = logs.reduce(
      (sum, l) => sum + (l.response.tokens?.total || 0),
      0
    );
    const totalLatency = logs.reduce(
      (sum, l) => sum + (l.response.latency || 0),
      0
    );
    const errors = logs.filter((l) => !!l.error).length;
    const fallbacks = logs.filter((l) => l.fallbackUsed).length;

    const byModel: Record<string, any> = {};
    const byTaskType: Record<string, any> = {};
    const byDay: Record<string, any> = {};

    logs.forEach((log) => {
      const model = log.response.model || "unknown";
      const task = log.request.taskType || "general";
      const day = log.timestamp.split("T")[0];

      if (!byModel[model]) {
        byModel[model] = {
          requests: 0,
          cost: 0,
          tokens: 0,
          errors: 0,
          avgLatency: 0,
        };
      }
      if (!byTaskType[task]) {
        byTaskType[task] = {
          requests: 0,
          cost: 0,
          avgLatency: 0,
        };
      }
      if (!byDay[day]) {
        byDay[day] = { requests: 0, cost: 0, errors: 0 };
      }

      byModel[model].requests++;
      byModel[model].cost += log.response.cost || 0;
      byModel[model].tokens +=
        log.response.tokens?.total || 0;
      if (log.error) byModel[model].errors++;
      byModel[model].avgLatency =
        (byModel[model].avgLatency *
          (byModel[model].requests - 1) +
          (log.response.latency || 0)) /
        byModel[model].requests;

      byTaskType[task].requests++;
      byTaskType[task].cost += log.response.cost || 0;
      byTaskType[task].avgLatency =
        (byTaskType[task].avgLatency *
          (byTaskType[task].requests - 1) +
          (log.response.latency || 0)) /
        byTaskType[task].requests;

      byDay[day].requests++;
      byDay[day].cost += log.response.cost || 0;
      if (log.error) byDay[day].errors++;
    });

    return {
      totalRequests: logs.length,
      totalCost,
      totalTokens,
      avgLatency: totalLatency / logs.length,
      errorRate: errors / logs.length,
      fallbackRate: fallbacks / logs.length,
      byModel,
      byTaskType,
      byDay,
    };
  }

  async getCostProjection() {
    const overview = await this.getUsageOverview(7);
    const avgDailyCost = overview.totalCost / 7 || 0;

    return {
      daily: avgDailyCost,
      weekly: avgDailyCost * 7,
      monthly: avgDailyCost * 30,
      yearly: avgDailyCost * 365,
    };
  }
}

const dashboardData = new DashboardDataService(logger);

/* -------------------------------------------------------
 *  Express App, Middleware, Routes
 * -----------------------------------------------------*/

const app = express();
app.use(express.json());

// CORS with allowed origins from env
const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    const allowed = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!allowed.length) {
      console.warn(
        "⚠️ ALLOWED_ORIGINS not set in production. CORS is wide open!"
      );
      return callback(null, true);
    }

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

// Simple API key auth using ENGINE_API_KEY
function authenticateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const key = req.headers["x-engine-key"] as string;
  if (!key || key !== process.env.ENGINE_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

async function rateLimitMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const apiKey =
    (req.headers["x-api-key"] as string) ||
    (req.headers["x-engine-key"] as string) ||
    "default";

  const allowed = await rateLimiter.checkLimit(apiKey);
  if (!allowed) {
    return res.status(429).json({
      error: "Rate limit exceeded",
      retryAfter: 60,
    });
  }

  (req as any).rateLimitApiKey = apiKey;
  next();
}

/* -------------------------------------------------------
 *  Provider Registry + Engine instance
 * -----------------------------------------------------*/

const providers = new Map<string, IProvider>();

// Wire models to their providers here
providers.set(
  "openai:gpt-4o",
  new OpenAIProvider("gpt-4o")
);
providers.set(
  "anthropic:claude-haiku-4",
  new AnthropicProvider("claude-3-haiku-20240307")
);
providers.set(
  "groq:llama-3.1-70b",
  new GroqProvider("llama-3.1-70b")
);
providers.set(
  "google:gemini-1.5-flash",
  new GoogleProvider("gemini-1.5-flash")
);
// Add more as needed
// providers.set("openrouter:xxx", new OpenRouterProvider("xxx"));

const routerInstance = new Router();
const engine = new Engine(providers, routerInstance, logger);

/* -------------------------------------------------------
 *  Core Routes
 * -----------------------------------------------------*/

app.post(
  "/v1/generate",
  authenticateRequest,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const request: GenerateRequest = {
        prompt: req.body.prompt,
        taskType: req.body.taskType,
        maxTokens: req.body.maxTokens,
        temperature: req.body.temperature,
      };

      if (!request.prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await engine.generate(request);

      const apiKey =
        (req as any).rateLimitApiKey || "default";
      rateLimiter.recordUsage(
        apiKey,
        result.tokens.total,
        result.cost
      );

      res.json(result);
    } catch (error: any) {
      console.error("/v1/generate error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// JSON generation route (unified with engine.generateJSON)
app.post(
  "/v1/generate-json",
  authenticateRequest,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { prompt, maxRetries = 3, taskType } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const result = await engine.generateJSON(
        { prompt, taskType: taskType || "json" },
        maxRetries
      );

      const apiKey =
        (req as any).rateLimitApiKey || "default";
      // NOTE: in this stub we don't have token info; fill when real providers added
      rateLimiter.recordUsage(apiKey, 0, 0);

      res.json({
        success: true,
        data: result.data,
        meta: { retriesUsed: result.retriesUsed },
      });
    } catch (error: any) {
      console.error("/v1/generate-json error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
        hint:
          "The model failed to generate valid JSON after multiple attempts",
      });
    }
  }
);

// Dashboard: usage overview
app.get(
  "/v1/dashboard/overview",
  authenticateRequest,
  async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const overview =
        await dashboardData.getUsageOverview(days);
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Dashboard: cost projection
app.get(
  "/v1/dashboard/cost-projection",
  authenticateRequest,
  async (req, res) => {
    try {
      const projection =
        await dashboardData.getCostProjection();
      res.json(projection);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/* -------------------------------------------------------
 *  Log Archive Cron (runs daily at 2am)
 * -----------------------------------------------------*/

cron.schedule("0 2 * * *", async () => {
  console.log("🧹 Running log archive job...");
  await logger.archiveOldLogs(30);
});

/* -------------------------------------------------------
 *  Start Server
 * -----------------------------------------------------*/

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 SilentEngine running on port ${PORT}`);
});
