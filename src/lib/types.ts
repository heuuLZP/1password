// 定义密码条目的类型
export interface PasswordEntry {
  id: string;         // 唯一标识符
  website: string;    // 网站/应用名称
  url?: string;       // 网址
  username: string;   // 用户名
  password: string;   // 密码
  notes?: string;     // 备注
  createdAt: string;  // 创建日期
  updatedAt: string;  // 最后修改日期
  type?: EntryType;   // 条目类型
  groupId?: string;   // 分组ID
}

// 条目类型枚举
export enum EntryType {
  PASSWORD = 'password',
  CARD = 'card',
  IDENTITY = 'identity',
  NOTE = 'note'
}

// 密码分组定义
export interface PasswordGroup {
  id: string;          // 唯一标识符
  name: string;        // 分组名称
  description?: string; // 分组描述
  color?: string;      // 分组颜色
  createdAt: string;   // 创建日期
  updatedAt: string;   // 最后修改日期
}

// 支付卡信息
export interface CardInfo {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardType?: string;
}

// 身份信息
export interface IdentityInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
}

// 密码库类型
export interface PasswordVault {
  entries: PasswordEntry[];
  groups: PasswordGroup[]; // 添加分组数组
}

// 应用状态接口
export interface AppState {
  vault: PasswordVault | null;
  isLocked: boolean;
  masterPassword: string | null;
  currentEntryId: string | null;
  encryptedData: string | null;
  isNewUser: boolean;
}

// 主密码表单状态
export interface MasterPasswordFormState {
  password: string;
  confirmPassword?: string;
  error?: string;
  isSubmitting: boolean;
}

// 密码强度结果
export interface PasswordStrength {
  score: number;  // 0-100
  feedback: string;
} 