import { PasswordStrength } from './types';

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];
  
  // 长度检查
  if (password.length < 8) {
    feedback.push('密码太短，建议至少8个字符');
    score += password.length * 2;
  } else if (password.length < 12) {
    score += 20;
  } else {
    score += Math.min(password.length * 2, 40);
  }
  
  // 复杂度检查
  if (/[A-Z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('建议包含大写字母');
  }
  
  if (/[a-z]/.test(password)) {
    score += 10;
  } else {
    feedback.push('建议包含小写字母');
  }
  
  if (/[0-9]/.test(password)) {
    score += 10;
  } else {
    feedback.push('建议包含数字');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 15;
  } else {
    feedback.push('建议包含特殊字符');
  }
  
  // 重复字符检查
  const repeats = password.match(/(.)\1{2,}/g);
  if (repeats) {
    score -= repeats.length * 5;
    feedback.push('避免连续重复字符');
  }
  
  // 连续字符检查 (如 abc, 123)
  let hasSequence = false;
  const sequences = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  
  for (const seq of sequences) {
    for (let i = 0; i < password.length - 2; i++) {
      const fragment = password.substring(i, i + 3).toLowerCase();
      if (seq.includes(fragment)) {
        hasSequence = true;
        break;
      }
    }
    if (hasSequence) break;
  }
  
  if (hasSequence) {
    score -= 10;
    feedback.push('避免使用连续字符');
  }
  
  // 常见密码模式检查
  const commonPatterns = [
    /^(password|passwort|密码)/i,
    /^(123|abc)/i,
    /^(qwerty|asdfgh)/i,
    /^(admin|administrator)/i,
    /^(welcome|willkommen|欢迎)/i
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score -= 20;
      feedback.push('避免使用常见密码模式');
      break;
    }
  }
  
  // 调整最终得分到0-100区间
  score = Math.max(0, Math.min(score, 100));
  
  // 设置最终反馈
  let finalFeedback = '';
  if (score < 50) {
    finalFeedback = feedback.join('；') || '密码强度较弱，建议修改';
  } else if (score < 80) {
    finalFeedback = feedback.join('；') || '密码强度中等';
  } else {
    finalFeedback = '密码强度良好';
  }
  
  return {
    score,
    feedback: finalFeedback
  };
}

// 生成随机密码
export function generateStrongPassword(length: number = 16, options: {
  includeUppercase?: boolean,
  includeLowercase?: boolean,
  includeNumbers?: boolean,
  includeSymbols?: boolean
} = {}): string {
  const defaults = {
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  };
  
  const config = { ...defaults, ...options };
  
  let charset = '';
  if (config.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (config.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (config.includeNumbers) charset += '0123456789';
  if (config.includeSymbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  // 确保密码长度至少为8
  length = Math.max(length, 8);
  
  let password = '';
  const charsetLength = charset.length;
  
  // 使用安全的随机数生成器
  const randomValues = new Uint32Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charsetLength];
  }
  
  return password;
} 