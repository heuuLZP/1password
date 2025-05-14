import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Progress, Alert, Typography, Space } from 'antd';
import { LockOutlined, KeyOutlined, SafetyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { checkPasswordStrength } from '../../lib/password-strength';
import { MasterPasswordFormState } from '../../lib/types';
import styles from './index.module.less';

const { Text, Paragraph } = Typography;

interface MasterPasswordFormProps {
  isNewUser: boolean;
  onSubmit: (password: string) => Promise<void>;
}

const MasterPasswordForm: React.FC<MasterPasswordFormProps> = ({ isNewUser, onSubmit }) => {
  const [state, setState] = useState<MasterPasswordFormState>({
    password: '',
    confirmPassword: '',
    isSubmitting: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });
  
  const [form] = Form.useForm();
  
  useEffect(() => {
    if (state.password && isNewUser) {
      setPasswordStrength(checkPasswordStrength(state.password));
    }
  }, [state.password, isNewUser]);
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, password: value, error: undefined }));
  };
  
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState(prev => ({ ...prev, confirmPassword: value, error: undefined }));
  };
  
  const handleSubmit = async () => {
    // 表单验证已由 Ant Design Form 处理
    
    // 检查密码强度（仅新用户）
    if (isNewUser && passwordStrength.score < 50) {
      setState(prev => ({ ...prev, error: `主密码强度不足: ${passwordStrength.feedback}` }));
      return;
    }
    
    // 提交密码
    setState(prev => ({ ...prev, isSubmitting: true, error: undefined }));
    
    try {
      await onSubmit(state.password);
    } catch (error) {
      if (error instanceof Error) {
        setState(prev => ({ ...prev, error: error.message, isSubmitting: false }));
      } else {
        setState(prev => ({ ...prev, error: '未知错误', isSubmitting: false }));
      }
    }
  };
  
  // 密码强度指示器
  const renderStrengthIndicator = () => {
    if (!isNewUser || !state.password) return null;
    
    const getColorAndStatus = () => {
      if (passwordStrength.score < 50) return { color: '#ef4444', status: 'exception' as const };
      if (passwordStrength.score < 80) return { color: '#f59e0b', status: 'normal' as const };
      return { color: '#10b981', status: 'success' as const };
    };
    
    const { color, status } = getColorAndStatus();
    
    return (
      <div className={styles.strengthMeter}>
        <div className={styles.strengthLabel}>
          <Text type="secondary" style={{ fontSize: '0.75rem' }}>密码强度</Text>
          <Text style={{ fontSize: '0.75rem', color }}>
            {passwordStrength.score < 50 ? '弱' : passwordStrength.score < 80 ? '中' : '强'}
          </Text>
        </div>
        <Progress 
          percent={passwordStrength.score} 
          size="small" 
          status={status}
          strokeColor={color}
          showInfo={false}
          strokeWidth={8}
          style={{ marginBottom: 6 }}
          className={styles.strengthIndicator}
        />
        <Text type="secondary" className={styles.feedbackText}>{passwordStrength.feedback}</Text>
      </div>
    );
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      style={{ width: '100%' }}
      requiredMark={false}
    >
      <Form.Item
        name="password"
        label={
          <Text style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
            {isNewUser ? "创建主密码" : "主密码"}
          </Text>
        }
        rules={[{ required: true, message: '请输入主密码' }]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
          placeholder="输入主密码"
          size="large"
          value={state.password}
          onChange={handlePasswordChange}
          disabled={state.isSubmitting}
          className={styles.borderInput}
        />
      </Form.Item>
      
      {renderStrengthIndicator()}
      
      {isNewUser && (
        <Form.Item
          name="confirmPassword"
          label={
            <Text style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>
              确认主密码
            </Text>
          }
          rules={[
            { required: true, message: '请确认主密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
          dependencies={['password']}
        >
          <Input.Password
            prefix={<KeyOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
            placeholder="再次输入主密码"
            size="large"
            value={state.confirmPassword}
            onChange={handleConfirmChange}
            disabled={state.isSubmitting}
            className={styles.borderInput}
          />
        </Form.Item>
      )}
      
      {state.error && (
        <Form.Item>
          <Alert 
            message="错误" 
            description={state.error} 
            type="error" 
            showIcon 
            className={styles.errorAlert}
          />
        </Form.Item>
      )}
      
      {isNewUser && (
        <Form.Item>
          <div className={styles.warningBox}>
            <Space direction="vertical" size={2}>
              <Text strong style={{ color: '#f59e0b', display: 'flex', alignItems: 'center' }}>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} /> 重要提示：
              </Text>
              <Paragraph style={{ color: '#664d03', margin: 0, fontSize: '13px' }}>
                主密码是解锁您所有密码的唯一方式。如果忘记主密码，将无法恢复您的数据。
              </Paragraph>
              <Paragraph style={{ color: '#664d03', margin: 0, fontSize: '13px' }}>
                请确保您能记住这个密码，或将其安全地保存在其他地方。
              </Paragraph>
            </Space>
          </div>
        </Form.Item>
      )}
      
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          icon={<SafetyOutlined />}
          loading={state.isSubmitting}
          className={styles.submitButton}
        >
          {isNewUser ? '创建密码库' : '解锁密码库'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MasterPasswordForm; 