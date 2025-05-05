export enum ErrorSeverity {
  WARNING = 'warning',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTH = 'auth',
  NETWORK = 'network',
  STORAGE = 'storage',
  API = 'api',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown',
}

export enum LogLevel {
  FATAL = 'fatal',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export type ErrorResponse = {
  message: string;
  status?: number;
  data?: unknown;
} & Error;

export interface AppError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: String;
  userMessage: String;
  context?: Record<string, unknown>;
}

export class BaseError implements AppError {
  name: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: string;
  userMessage: string;
  context?: Record<string, unknown>;

  constructor(params: {
    message: string;
    userMessage: string;
    severity: ErrorSeverity;
    category: ErrorCategory;
    context?: Record<string, unknown>;
  }) {
    this.name = this.constructor.name;
    this.message = params.message;
    this.severity = params.severity;
    this.category = params.category;
    this.timestamp = new Date().toISOString();
    this.userMessage = params.userMessage;
    this.context = params.context;
  }
}
