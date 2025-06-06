import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert, Space, Progress } from 'antd';
import { LockOutlined, KeyOutlined } from '@ant-design/icons';
import { checkPasswordStrength } from '../../lib/password-strength';
import styles from './index.module.less';

const { Title, Text } = Typography;

interface ChangePasswordProps {
  onChangeMasterPassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ onChangeMasterPassword }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ''
  });

  // 监控密码强度
  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword));
    } else {
      setPasswordStrength({ score: 0, feedback: '' });
    }
  }, [newPassword]);

  const onFinish = async (values: any) => {
    const { currentPassword, newPassword, confirmPassword } = values;
    
    // 验证两次新密码输入是否一致
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    
    // 验证新密码与旧密码不同
    if (currentPassword === newPassword) {
      setError('新密码不能与当前密码相同');
      return;
    }
    
    // 检查密码强度
    if (passwordStrength.score < 50) {
      setError(`主密码强度不足: ${passwordStrength.feedback}`);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await onChangeMasterPassword(currentPassword, newPassword);
      
      if (result) {
        setSuccess(true);
        message.success('主密码修改成功');
        form.resetFields();
        setNewPassword('');
      } else {
        setError('修改主密码失败，请重试');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '修改主密码失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 渲染密码强度指示器
  const renderPasswordStrength = () => {
    if (!newPassword) return null;
    
    const getColorAndStatus = () => {
      if (passwordStrength.score < 50) return { color: '#ef4444', status: 'exception' as const };
      if (passwordStrength.score < 80) return { color: '#f59e0b', status: 'normal' as const };
      return { color: '#10b981', status: 'success' as const };
    };
    
    const { color, status } = getColorAndStatus();
    
    return (
      <div className={styles.passwordStrengthMeter}>
        <div className={styles.passwordStrengthLabel}>
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
        />
        <Text type="secondary" style={{ fontSize: '0.75rem' }}>{passwordStrength.feedback}</Text>
      </div>
    );
  };

  return (
    <div className={styles.changePasswordContainer}>
      <Card bordered={false}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3}>
              <KeyOutlined /> 修改主密码
            </Title>
            <Text type="secondary">
              定期更换主密码可以提高您的密码库安全性。请确保新密码足够强壮且易于记忆。
            </Text>
          </div>
          
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}
          
          {success && (
            <Alert
              message="主密码已成功修改"
              description="您的密码库已使用新的主密码重新加密。请确保记住您的新密码，它无法被恢复。"
              type="success"
              showIcon
              closable
              onClose={() => setSuccess(false)}
            />
          )}
          
          <Form
            form={form}
            name="change_password"
            onFinish={onFinish}
            layout="vertical"
            requiredMark="optional"
            className={styles.passwordForm}
          >
            <Form.Item
              name="currentPassword"
              label="当前密码"
              rules={[
                { required: true, message: '请输入当前密码' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入当前密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码长度至少为8个字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入新密码" 
                size="large"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Item>
            
            {renderPasswordStrength()}
            
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请再次输入新密码" 
                size="large"
              />
            </Form.Item>
            
            <Form.Item className={styles.submitButton}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                loading={loading}
                disabled={passwordStrength.score < 50 && newPassword !== ''}
              >
                修改主密码
              </Button>
            </Form.Item>
          </Form>
          
          <Alert
            message="安全提示"
            description={
              <ul className={styles.tips} style={{ paddingLeft: '20px', margin: 0 }}>
                <li>建议使用包含大小写字母、数字和特殊符号的复杂密码</li>
                <li>不要使用与其他网站相同的密码</li>
                <li>更改主密码后，请确保记住新密码，它无法被恢复</li>
                <li>定期更换密码可以提高安全性</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default ChangePassword; 