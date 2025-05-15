import React, { useState } from 'react';
import { Card, Button, Input, Form, Typography, Space, Tooltip, message, Select, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, CopyOutlined, LinkOutlined, SaveOutlined, CloseOutlined, ReloadOutlined, GlobalOutlined, UserOutlined, KeyOutlined, ClockCircleOutlined, CommentOutlined, TagOutlined } from '@ant-design/icons';
import { PasswordEntry as PasswordEntryType, PasswordGroup } from '../../lib/types';
import { StorageManager } from '../../lib/storage';
import { generateStrongPassword } from '../../lib/password-strength';
import styles from './index.module.less';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

interface PasswordEntryProps {
  entry: PasswordEntryType;
  onSave: (entry: PasswordEntryType) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
  groups?: PasswordGroup[];
  isModal?: boolean;
  onCancel?: () => void;
  isDisplayOnly?: boolean;
  onEdit?: (entry: PasswordEntryType) => void;
  startEditing?: boolean;
}

const PasswordEntryComponent: React.FC<PasswordEntryProps> = ({ 
  entry, 
  onSave, 
  onDelete,
  isNew = false,
  groups,
  isModal = false,
  onCancel,
  isDisplayOnly = false,
  onEdit,
  startEditing = false
}) => {
  const [editedEntry, setEditedEntry] = useState<PasswordEntryType>(entry);
  const [isEditing, setIsEditing] = useState((isNew || startEditing) && !isDisplayOnly);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const storageManager = new StorageManager();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleInputChange = (name: string, value: string) => {
    setEditedEntry(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    // 验证必填项
    if (!editedEntry.website.trim()) {
      message.error('网站/应用名称不能为空');
      return;
    }
    
    if (!editedEntry.username.trim()) {
      message.error('用户名不能为空');
      return;
    }
    
    if (!editedEntry.password.trim()) {
      message.error('密码不能为空');
      return;
    }
    
    // 更新修改时间
    const updatedEntry = {
      ...editedEntry,
      updatedAt: new Date().toISOString()
    };
    
    onSave(updatedEntry);
    setIsEditing(false);
    message.success('密码已保存');
  };
  
  const handleCancel = () => {
    if (isModal && onCancel) {
      onCancel();
    } else if (isNew) {
      onDelete(entry.id);
    } else {
      setEditedEntry(entry);
      setIsEditing(false);
    }
  };
  
  const handleCopyPassword = async () => {
    try {
      await storageManager.copyToClipboard(editedEntry.password);
      setCopied(true);
      message.success('密码已复制到剪贴板');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('复制密码失败:', error);
      message.error('复制密码失败');
    }
  };
  
  const handleCopyUsername = async () => {
    try {
      await storageManager.copyToClipboard(editedEntry.username);
      message.success('用户名已复制到剪贴板');
    } catch (error) {
      console.error('复制用户名失败:', error);
      message.error('复制用户名失败');
    }
  };
  
  const handleGeneratePassword = () => {
    const newPassword = generateStrongPassword();
    setEditedEntry(prev => ({ ...prev, password: newPassword }));
    message.info('已生成强密码');
  };
  
  const handleDelete = () => {
    onDelete(entry.id);
  };
  
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 处理网址，确保以 http:// 或 https:// 开头
  const getFormattedUrl = (url: string | undefined): string => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  // 为网站名称生成随机颜色
  const getRandomColor = (text: string): string => {
    const colors = [
      // 红色系
      '#F5222D', // 红色
      '#CF1322', // 深红色
      
      // 橙色系
      '#FA541C', // 火红色
      '#FA8C16', // 橙色
      '#D4380D', // 深橙色
      '#D46B08', // 金色
      
      // 黄色系
      '#FAAD14', // 黄色
      
      // 绿色系
      '#52C41A', // 绿色
      '#52C41A', // 绿色
      '#237804', // 深绿色
      
      // 青色系
      '#13C2C2', // 青色
      '#13A8A8', // 深青色
      '#006D75', // 深青色
      
      // 蓝色系
      '#1890FF', // 天蓝色
      '#1677FF', // 新蓝色
      '#2F54EB', // 蓝色
      
      // 紫色系
      '#722ED1', // 紫色
      '#531DAB', // 深紫色
      
      // 粉色系
      '#EB2F96', // 粉色
    ];
    
    // 简单的字符串哈希
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // 获取首字母或图标
  const getInitial = (text: string): string => {
    return text.substring(0, 1).toUpperCase();
  };

  // 显示模式下的视图
  if (!isEditing) {
    const avatarBgColor = getRandomColor(entry.website);
    const websiteInitial = getInitial(entry.website);
    
    return (
      <Card 
        bordered={false}
        hoverable
        className={styles.card}
        bodyStyle={{ padding: '12px' }}
      >
        <div className={styles.cardContent}>
          {/* 头部区域：网站信息 */}
          <div className={styles.headerSection}>
            <div className={styles.websiteAvatar} style={{ backgroundColor: avatarBgColor }}>
              {websiteInitial}
            </div>
            
            <div className={styles.websiteInfo}>
              <div className={styles.titleUrlRow}>
                <Title level={5} style={{ margin: 0 }}>
                  {entry.website}
                </Title>
                
                {entry.url && (
                  <div className={styles.urlDisplay}>
                    <Tooltip title="访问网站">
                      <Button 
                        type="text" 
                        href={getFormattedUrl(entry.url)} 
                        target="_blank" 
                        icon={<LinkOutlined />} 
                        size="small"
                        className={styles.urlButton}
                      />
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* 中部区域：凭据信息 */}
          <div className={styles.credentialsSection}>
            {/* 用户名 */}
            <div className={styles.credentialItem}>
              <div className={styles.credLabel}>
                <UserOutlined />
                <span>用户名</span>
              </div>
              <div className={styles.credValue}>
                <span>{entry.username}</span>
                <Tooltip title="复制用户名">
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyUsername}
                  />
                </Tooltip>
              </div>
            </div>
            
            {/* 密码 */}
            <div className={styles.credentialItem}>
              <div className={styles.credLabel}>
                <KeyOutlined />
                <span>密码</span>
              </div>
              <div className={styles.credValue}>
                <span>{showPassword ? entry.password : '••••••••••'}</span>
                <Tooltip title={showPassword ? "隐藏密码" : "显示密码"}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />} 
                    onClick={() => setShowPassword(!showPassword)}
                  />
                </Tooltip>
                <Tooltip title={copied ? "已复制!" : "复制密码"}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<CopyOutlined />} 
                    onClick={handleCopyPassword}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
          
          {/* 备注信息（如果有） */}
          {entry.notes && (
            <div className={styles.credentialItem}>
              <div className={styles.credLabel}>
                <CommentOutlined />
                <span>备注</span>
              </div>
              <div className={styles.credValue}>
                <Paragraph ellipsis={{ rows: 1, expandable: true }} style={{ margin: 0, flex: 1 }}>
                  {entry.notes}
                </Paragraph>
              </div>
            </div>
          )}
          
          {/* 分组标签（如果有） */}
          {entry.groupId && groups && (
            <div className={styles.groupTag}>
              {(() => {
                const group = groups.find(g => g.id === entry.groupId);
                if (group) {
                  return (
                    <Tag 
                      icon={<TagOutlined />}
                      color={group.color}
                      style={{ margin: 0 }}
                    >
                      {group.name}
                    </Tag>
                  );
                }
                return null;
              })()}
            </div>
          )}
          
          {/* 底部区域：元信息和操作按钮 */}
          <div className={styles.footerSection}>
            <div className={styles.actionButtons}>
              {isModal ? (
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => setIsEditing(true)}
                />
              ) : (
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  onClick={() => {
                    if (onEdit) {
                      // 如果有onEdit回调，使用它打开模态框编辑
                      onEdit(entry);
                    } else {
                      // 否则直接进入编辑模式
                      setIsEditing(true);
                    }
                  }}
                />
              )}
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                onClick={handleDelete} 
                danger
              />
            </div>
            
            <div className={styles.metaInfo}>
              <ClockCircleOutlined />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(entry.updatedAt).getTime() !== new Date(entry.createdAt).getTime() ? 
                  `更新: ${formatDate(entry.updatedAt)}` : 
                  `创建: ${formatDate(entry.createdAt)}`
                }
              </Text>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  // 编辑模式下的视图
  const formLayout = isModal ? "horizontal" : "vertical";
  
  return (
    <Card 
      bordered={false}
      title={!isModal && (
        <Space>
          <KeyOutlined className={styles.editTitle} />
          {isNew ? "添加新密码" : "编辑密码"}
        </Space>
      )}
      className={styles.card}
      headStyle={{ 
        borderBottom: '1px solid #e5e7eb', 
        padding: '0px 24px'
      }}
    >
      <Form 
        layout={formLayout} 
        requiredMark={false} 
        className={styles.editForm}
        labelCol={isModal ? { flex: '100px' } : undefined}
        wrapperCol={isModal ? { flex: 'auto' } : undefined}
      >
        <Form.Item 
          label="网站/应用名称" 
          required
          help={!editedEntry.website.trim() ? "请输入网站或应用名称" : null}
          validateStatus={!editedEntry.website.trim() ? "error" : undefined}
        >
          <Input
            name="website"
            value={editedEntry.website}
            onChange={handleChange}
            placeholder="如: Gmail, 淘宝, 微信"
            prefix={<GlobalOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
            size="large"
          />
        </Form.Item>
        
        <Form.Item label="网址 (可选)">
          <Input
            name="url"
            value={editedEntry.url || ''}
            onChange={handleChange}
            placeholder="如: https://www.gmail.com"
            prefix={<GlobalOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
            size="large"
          />
        </Form.Item>
        
        <Form.Item 
          label="用户名/账号" 
          required
          help={!editedEntry.username.trim() ? "请输入用户名" : null}
          validateStatus={!editedEntry.username.trim() ? "error" : undefined}
        >
          <Input
            name="username"
            value={editedEntry.username}
            onChange={handleChange}
            placeholder="用户名/邮箱/手机号"
            prefix={<UserOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
            size="large"
          />
        </Form.Item>
        
        <Form.Item 
          label="密码" 
          required
          help={!editedEntry.password.trim() ? "请输入密码" : null}
          validateStatus={!editedEntry.password.trim() ? "error" : undefined}
        >
          <div className={styles.passwordInputGroup}>
            <Input.Password
              name="password"
              value={editedEntry.password}
              onChange={handleChange}
              placeholder="密码"
              visibilityToggle
              prefix={<KeyOutlined style={{ color: 'rgba(0, 0, 0, 0.3)' }} />}
              size="large"
              className={styles.passwordInput}
            />
            <Button 
              type="primary" 
              size="large" 
              icon={<ReloadOutlined />} 
              onClick={handleGeneratePassword}
              className={styles.generatePasswordBtn}
            >
              生成强密码
            </Button>
          </div>
        </Form.Item>
        
        <Form.Item label="备注 (可选)">
          <Input.TextArea
            name="notes"
            value={editedEntry.notes || ''}
            onChange={handleChange}
            placeholder="输入其他相关信息，如安全问题答案等"
            rows={3}
            size="large"
          />
        </Form.Item>
        
        {groups && groups.length > 0 && (
          <Form.Item label="分组">
            <Select
              value={editedEntry.groupId}
              onChange={(value) => handleInputChange('groupId', value)}
              placeholder="选择分组"
              size="large"
              allowClear
              suffixIcon={<TagOutlined />}
            >
              <Option value={undefined}>无分组</Option>
              {groups.map(group => (
                <Option key={group.id} value={group.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      background: group.color || '#1890FF',
                      marginRight: 8 
                    }} />
                    {group.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
        
        <Form.Item>
          <div className="flex justify-end">
            <Space>
              <Button 
                icon={<CloseOutlined />} 
                onClick={handleCancel}
                size="large"
              >
                取消
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                size="large"
                style={{ 
                  background: 'linear-gradient(to right, #4a148c, #311b92)',
                  border: 'none',
                  boxShadow: '0 4px 10px rgba(74, 20, 140, 0.2)'
                }}
              >
                保存
              </Button>
            </Space>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PasswordEntryComponent; 