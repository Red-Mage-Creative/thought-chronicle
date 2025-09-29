/**
 * Password security utilities using HaveIBeenPwned API
 * Uses k-anonymity approach to protect user privacy
 */

import { getPasswordStrength } from './validation';

/**
 * Converts a string to SHA-1 hash
 */
async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a password has been found in known data breaches
 * Uses HaveIBeenPwned API with k-anonymity (only sends first 5 chars of hash)
 */
export async function checkPasswordBreach(password: string): Promise<{
  isBreached: boolean;
  breachCount?: number;
  error?: string;
}> {
  try {
    // Generate SHA-1 hash of password
    const hash = await sha1(password);
    const hashPrefix = hash.substring(0, 5).toUpperCase();
    const hashSuffix = hash.substring(5).toUpperCase();

    // Query HaveIBeenPwned API with only first 5 characters
    const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'D&D-Chronicle-Security-Check'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.text();
    
    // Check if our hash suffix appears in the response
    const lines = data.split('\n');
    for (const line of lines) {
      const [suffix, count] = line.split(':');
      if (suffix === hashSuffix) {
        return {
          isBreached: true,
          breachCount: parseInt(count, 10)
        };
      }
    }

    return { isBreached: false };
  } catch (error) {
    console.error('Password breach check failed:', error);
    return {
      isBreached: false,
      error: 'Unable to check password security. Please ensure you\'re using a strong, unique password.'
    };
  }
}

/**
 * Comprehensive password security assessment
 */
export async function assessPasswordSecurity(password: string) {
  const strength = getPasswordStrength(password);
  const breach = await checkPasswordBreach(password);

  return {
    strength,
    breach,
    isSecure: strength.score >= 4 && !breach.isBreached,
    recommendations: [
      ...strength.feedback,
      ...(breach.isBreached ? ['This password has been found in data breaches. Please choose a different one.'] : [])
    ]
  };
}