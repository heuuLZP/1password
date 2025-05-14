import { PasswordVault, PasswordEntry, PasswordGroup } from './types';
import { PasswordCrypto, EncryptedData } from './crypto';

export class StorageManager {
  private crypto: PasswordCrypto;
  private readonly LOCAL_STORAGE_KEY = 'passwordVaultEncrypted';
  
  constructor() {
    this.crypto = new PasswordCrypto();
  }
  
  // 保存到本地存储
  saveToLocalStorage(encryptedData: string): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, encryptedData);
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      throw new Error('保存失败，请尝试导出备份');
    }
  }
  
  // 从本地存储加载
  loadFromLocalStorage(): string | null {
    return localStorage.getItem(this.LOCAL_STORAGE_KEY);
  }
  
  // 检查是否是新用户
  isNewUser(): boolean {
    return localStorage.getItem(this.LOCAL_STORAGE_KEY) === null;
  }
  
  // 加载加密数据
  async loadEncryptedData(encryptedDataStr: string): Promise<EncryptedData> {
    try {
      return JSON.parse(encryptedDataStr) as EncryptedData;
    } catch {
      throw new Error('加密数据格式不正确');
    }
  }
  
  // 解密数据
  async decryptVault(encryptedData: EncryptedData, masterPassword: string): Promise<PasswordVault> {
    try {
      return await this.crypto.decrypt(encryptedData, masterPassword) as PasswordVault;
    } catch (error) {
      console.error('解密失败:', error);
      throw new Error('解密失败，请确认主密码正确');
    }
  }
  
  // 加密数据
  async encryptVault(vault: PasswordVault, masterPassword: string): Promise<string> {
    try {
      const encryptedData = await this.crypto.encrypt(vault, masterPassword);
      return JSON.stringify(encryptedData, null, 2);
    } catch (error) {
      console.error('加密失败:', error);
      throw new Error('加密失败，请检查数据格式');
    }
  }
  
  // 导出到文件
  async exportToFile(encryptedData: string): Promise<void> {
    const blob = new Blob([encryptedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = `password_vault_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    // 清理
    URL.revokeObjectURL(url);
  }
  
  // 从文件读取加密数据
  async readFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // 创建新的空密码库
  createEmptyVault(): PasswordVault {
    // 添加默认分组
    const defaultGroups: PasswordGroup[] = [
      this.createGroup('工作', '工作相关的账号和密码', '#1890FF'),
      this.createGroup('个人', '个人账号和密码', '#52C41A'),
      this.createGroup('金融', '银行和支付相关账号', '#FA8C16'),
      this.createGroup('娱乐', '娱乐网站账号', '#722ED1')
    ];
    
    return { 
      entries: [],
      groups: defaultGroups 
    };
  }
  
  // 创建新分组
  createGroup(name: string, description?: string, color?: string): PasswordGroup {
    const now = new Date().toISOString();
    return {
      id: this.generateId(),
      name,
      description,
      color: color || this.getRandomColor(),
      createdAt: now,
      updatedAt: now
    };
  }
  
  // 生成随机颜色
  getRandomColor(): string {
    const colors = [
      '#F5222D', // 红色
      '#FA541C', // 火红色
      '#FA8C16', // 橙色
      '#FAAD14', // 黄色
      '#52C41A', // 绿色
      '#13C2C2', // 青色
      '#1890FF', // 天蓝色
      '#2F54EB', // 蓝色
      '#722ED1', // 紫色
      '#EB2F96', // 粉色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // 获取分组中的条目
  getEntriesByGroup(vault: PasswordVault, groupId: string | undefined): PasswordEntry[] {
    if (!groupId) {
      // 返回未分组的条目
      return vault.entries.filter(entry => !entry.groupId);
    }
    
    return vault.entries.filter(entry => entry.groupId === groupId);
  }
  
  // 将条目分配到分组
  assignEntryToGroup(vault: PasswordVault, entryId: string, groupId: string | undefined): PasswordVault {
    const updatedEntries = vault.entries.map(entry => {
      if (entry.id === entryId) {
        return { ...entry, groupId, updatedAt: new Date().toISOString() };
      }
      return entry;
    });
    
    return {
      ...vault,
      entries: updatedEntries
    };
  }
  
  // 生成唯一ID
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  
  // 安全清除剪贴板
  async clearClipboard(after: number = 30000): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        navigator.clipboard.writeText('').then(resolve);
      }, after);
    });
  }
  
  // 复制到剪贴板并设置自动清除
  async copyToClipboard(text: string, autoClearAfter: number = 30000): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.clearClipboard(autoClearAfter);
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      throw new Error('复制到剪贴板失败');
    }
  }
} 