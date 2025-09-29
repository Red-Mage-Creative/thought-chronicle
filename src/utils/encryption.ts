import { LocalDataStore } from '@/services/dataStorageService';

// Simple client-side encryption using Web Crypto API
class ClientEncryption {
  private key: CryptoKey | null = null;
  
  private async getKey(): Promise<CryptoKey> {
    if (this.key) return this.key;
    
    // Generate a key based on a combination of user-specific data
    // This is for basic protection, not military-grade security
    const userSeed = `${navigator.userAgent}-${location.origin}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(userSeed);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    this.key = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
    
    return this.key;
  }
  
  async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getKey();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );
      
      // Combine iv and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Fallback to unencrypted data
    }
  }
  
  async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getKey();
      
      // Convert from base64
      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract iv and encrypted data
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Fallback to original data
    }
  }
}

const encryption = new ClientEncryption();

export const encryptionService = {
  async encryptData(data: LocalDataStore): Promise<string> {
    const jsonString = JSON.stringify(data);
    return await encryption.encrypt(jsonString);
  },
  
  async decryptData(encryptedData: string): Promise<LocalDataStore> {
    const decryptedString = await encryption.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  },
  
  // Check if data appears to be encrypted (base64 format)
  isEncrypted(data: string): boolean {
    try {
      // Basic check for base64 format
      return btoa(atob(data)) === data;
    } catch {
      return false;
    }
  }
};