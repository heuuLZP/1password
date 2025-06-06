import { useState, useEffect } from 'react';
import LockScreen from './components/LockScreen';
import Dashboard from './components/Dashboard';
import { AppState, PasswordVault } from './lib/types';
import { StorageManager } from './lib/storage';
import './App.module.less';

function App() {
  const [state, setState] = useState<AppState>({
    vault: null,
    isLocked: true,
    masterPassword: null,
    currentEntryId: null,
    encryptedData: null,
    isNewUser: true
  });
  
  const storageManager = new StorageManager();
  
  // 过滤空条目
  const filterEmptyEntries = (vault: PasswordVault): PasswordVault => {
    if (!vault || !vault.entries) return vault;
    
    return {
      ...vault,
      entries: vault.entries.filter(entry => 
        entry.website.trim() || entry.username.trim() || entry.password.trim()
      )
    };
  };
  
  // 初始化应用
  useEffect(() => {
    const initialData = storageManager.loadFromLocalStorage();
    const isNewUser = storageManager.isNewUser();
    
    setState(prev => ({
      ...prev,
      encryptedData: initialData,
      isNewUser
    }));
  }, []);
  
  // 处理主密码表单提交
  const handleMasterPasswordSubmit = async (password: string) => {
    try {
      let vault: PasswordVault;
      
      if (state.isNewUser) {
        // 新用户 - 创建空密码库并加密
        vault = storageManager.createEmptyVault();
        const encryptedData = await storageManager.encryptVault(vault, password);
        
        // 保存到本地存储
        storageManager.saveToLocalStorage(encryptedData);
        
        setState(prev => ({
          ...prev,
          vault,
          isLocked: false,
          masterPassword: password,
          encryptedData,
          isNewUser: false
        }));
      } else {
        // 现有用户 - 解密现有数据
        if (!state.encryptedData) {
          throw new Error('密码库数据丢失');
        }
        
        const encryptedData = await storageManager.loadEncryptedData(state.encryptedData);
        let vault = await storageManager.decryptVault(encryptedData, password);
        
        // 检查旧数据版本兼容性 - 如果没有groups字段，添加默认分组
        if (!vault.groups) {
          const defaultGroups = [
            storageManager.createGroup('工作', '工作相关的账号和密码', '#1890FF'),
            storageManager.createGroup('个人', '个人账号和密码', '#52C41A'),
            storageManager.createGroup('金融', '银行和支付相关账号', '#FA8C16'),
            storageManager.createGroup('娱乐', '娱乐网站账号', '#722ED1')
          ];
          
          vault = {
            ...vault,
            groups: defaultGroups
          };
        }
        
        // 过滤空条目
        vault = filterEmptyEntries(vault);
        
        setState(prev => ({
          ...prev,
          vault,
          isLocked: false,
          masterPassword: password
        }));
        
        // 如果过滤了空条目，重新保存
        const cleanEncryptedData = await storageManager.encryptVault(vault, password);
        storageManager.saveToLocalStorage(cleanEncryptedData);
      }
    } catch (error) {
      console.error('处理主密码时出错:', error);
      throw error;
    }
  };
  
  // 处理密码库变更
  const handleVaultChange = async (updatedVault: PasswordVault) => {
    // 过滤空条目
    const filteredVault = filterEmptyEntries(updatedVault);
    
    setState(prev => ({ ...prev, vault: filteredVault }));
    
    if (state.masterPassword) {
      try {
        // 重新加密并保存
        const encryptedData = await storageManager.encryptVault(filteredVault, state.masterPassword);
        storageManager.saveToLocalStorage(encryptedData);
        
        setState(prev => ({ ...prev, encryptedData }));
      } catch (error) {
        console.error('保存密码库变更时出错:', error);
        alert('保存失败，请检查是否有足够的存储空间');
      }
    }
  };
  
  // 修改主密码
  const handleChangeMasterPassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    try {
      // 验证旧密码是否正确
      if (oldPassword !== state.masterPassword) {
        throw new Error('当前密码不正确');
      }
      
      if (!state.vault) {
        throw new Error('密码库数据不存在');
      }
      
      // 使用新密码重新加密整个密码库
      const encryptedData = await storageManager.encryptVault(state.vault, newPassword);
      
      // 保存到本地存储
      storageManager.saveToLocalStorage(encryptedData);
      
      // 更新状态
      setState(prev => ({
        ...prev,
        masterPassword: newPassword,
        encryptedData
      }));
      
      return true; // 修改成功
    } catch (error) {
      console.error('修改主密码时出错:', error);
      return false; // 修改失败
    }
  };
  
  // 处理导入
  const handleImport = async (encryptedDataStr: string): Promise<boolean> => {
    try {
      if (!state.masterPassword) {
        throw new Error('未提供主密码');
      }
      
      // 先验证能否用当前主密码解密
      const encryptedData = await storageManager.loadEncryptedData(encryptedDataStr);
      let vault = await storageManager.decryptVault(encryptedData, state.masterPassword);
      
      // 检查旧数据版本兼容性 - 如果没有groups字段，添加默认分组
      if (!vault.groups) {
        const defaultGroups = [
          storageManager.createGroup('工作', '工作相关的账号和密码', '#1890FF'),
          storageManager.createGroup('个人', '个人账号和密码', '#52C41A'),
          storageManager.createGroup('金融', '银行和支付相关账号', '#FA8C16'),
          storageManager.createGroup('娱乐', '娱乐网站账号', '#722ED1')
        ];
        
        vault = {
          ...vault,
          groups: defaultGroups
        };
      }
      
      // 过滤空条目
      vault = filterEmptyEntries(vault);
      
      // 保存到本地存储
      const cleanEncryptedData = await storageManager.encryptVault(vault, state.masterPassword);
      storageManager.saveToLocalStorage(cleanEncryptedData);
      
      setState(prev => ({
        ...prev,
        vault,
        encryptedData: cleanEncryptedData
      }));
      
      return true; // 导入成功返回true
    } catch (error) {
      console.error('导入数据时出错:', error);
      return false; // 导入失败返回false
    }
  };
  
  // 处理锁定密码库
  const handleLock = () => {
    setState(prev => ({
      ...prev,
      isLocked: true,
      masterPassword: null,
      vault: null
    }));
  };
  
  if (state.isLocked) {
    return (
      <LockScreen
        isNewUser={state.isNewUser}
        onMasterPasswordSubmit={handleMasterPasswordSubmit}
      />
    );
  }
  
  return (
    <Dashboard
      vault={state.vault!}
      encryptedData={state.encryptedData!}
      onVaultChange={handleVaultChange}
      onImport={handleImport}
      onLock={handleLock}
      onChangeMasterPassword={handleChangeMasterPassword}
    />
  );
}

export default App; 