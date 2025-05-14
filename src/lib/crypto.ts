// 核心加密功能模块
export class PasswordCrypto {
  // 从主密码派生密钥
  async deriveKey(masterPassword: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
    // 使用PBKDF2从主密码生成密钥
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(masterPassword);
    
    const importedKey = await window.crypto.subtle.importKey(
      'raw', passwordBuffer, {name: 'PBKDF2'}, false, ['deriveKey']
    );
    
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      importedKey,
      {name: 'AES-GCM', length: 256},
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  // 加密数据
  async encrypt(data: object, masterPassword: string): Promise<EncryptedData> {
    // 生成随机盐值和IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const iterations = 100000;
    
    const key = await this.deriveKey(masterPassword, salt, iterations);
    
    // 加密数据
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {name: 'AES-GCM', iv: iv},
      key,
      dataBuffer
    );
    
    // 返回加密后的数据和元数据
    return {
      metadata: {
        salt: this.bufferToBase64(salt),
        iv: this.bufferToBase64(iv),
        iterations: iterations,
        version: '1.0'
      },
      encrypted_data: this.bufferToBase64(new Uint8Array(encryptedBuffer))
    };
  }
  
  // 解密数据
  async decrypt(encryptedData: EncryptedData, masterPassword: string): Promise<object> {
    const salt = this.base64ToBuffer(encryptedData.metadata.salt);
    const iv = this.base64ToBuffer(encryptedData.metadata.iv);
    const iterations = encryptedData.metadata.iterations;
    
    const key = await this.deriveKey(masterPassword, salt, iterations);
    
    // 解密数据
    const encryptedBuffer = this.base64ToBuffer(encryptedData.encrypted_data);
    
    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {name: 'AES-GCM', iv: iv},
        key,
        encryptedBuffer
      );
      
      // 解析并返回解密后的数据
      const decoder = new TextDecoder();
      const decryptedText = decoder.decode(decryptedBuffer);
      return JSON.parse(decryptedText);
    } catch (error) {
      throw new Error('解密失败，密码可能不正确');
    }
  }
  
  // Base64转换工具方法
  private bufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, [...buffer]));
  }
  
  private base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

// 类型定义
export interface EncryptedData {
  metadata: {
    salt: string;
    iv: string;
    iterations: number;
    version: string;
  };
  encrypted_data: string;
} 