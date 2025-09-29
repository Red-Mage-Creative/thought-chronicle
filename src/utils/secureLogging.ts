// Secure logging utility that sanitizes sensitive data and only logs in development

const isDevelopment = import.meta.env.DEV;

// List of sensitive keys to sanitize
const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'key', 'auth', 
  'credential', 'api', 'session', 'cookie'
];

// Sanitize objects by removing or masking sensitive fields
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Sanitize function arguments
const sanitizeArgs = (args: any[]): any[] => {
  return args.map(arg => {
    if (typeof arg === 'string' && arg.length > 100) {
      return arg.substring(0, 97) + '...';
    }
    return sanitizeObject(arg);
  });
};

export const secureLog = {
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...sanitizeArgs(args));
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...sanitizeArgs(args));
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...sanitizeArgs(args));
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, but sanitize them
    console.error('[ERROR]', ...sanitizeArgs(args));
  },
  
  // For performance logging that should only happen in development
  performance: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.time(label);
      fn();
      console.timeEnd(label);
    } else {
      fn();
    }
  }
};