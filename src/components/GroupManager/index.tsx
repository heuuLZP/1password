import React, { useState } from 'react';
import { 
  Typography, 
  Button, 
  List, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Tooltip, 
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { PasswordVault, PasswordGroup } from '../../lib/types';
import { StorageManager } from '../../lib/storage';
import styles from './index.module.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface GroupManagerProps {
  vault: PasswordVault;
  onVaultChange: (vault: PasswordVault) => void;
}

interface GroupFormData {
  id?: string;
  name: string;
  description?: string;
  color: string;
}

const GroupManager: React.FC<GroupManagerProps> = ({ vault, onVaultChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GroupFormData | null>(null);
  const [form] = Form.useForm();
  
  const storageManager = new StorageManager();
  
  // 显示添加分组的表单
  const showAddGroupModal = () => {
    // 重置表单
    form.resetFields();
    // 设置初始颜色
    setCurrentGroup({
      name: '',
      color: storageManager.getRandomColor()
    });
    setIsModalVisible(true);
  };
  
  // 显示编辑分组的表单
  const showEditGroupModal = (group: PasswordGroup) => {
    setCurrentGroup({
      id: group.id,
      name: group.name,
      description: group.description,
      color: group.color || '#1890FF'
    });
    
    form.setFieldsValue({
      name: group.name,
      description: group.description,
      color: group.color
    });
    
    setIsModalVisible(true);
  };
  
  // 处理表单提交
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const { name, description, color } = values;
      
      if (currentGroup?.id) {
        // 更新现有分组
        const updatedGroups = vault.groups.map(group => {
          if (group.id === currentGroup.id) {
            return {
              ...group,
              name,
              description,
              color,
              updatedAt: new Date().toISOString()
            };
          }
          return group;
        });
        
        onVaultChange({
          ...vault,
          groups: updatedGroups
        });
      } else {
        // 添加新分组
        const newGroup = storageManager.createGroup(name, description, color);
        
        onVaultChange({
          ...vault,
          groups: [...vault.groups, newGroup]
        });
      }
      
      setIsModalVisible(false);
      setCurrentGroup(null);
    });
  };
  
  // 处理取消操作
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentGroup(null);
  };
  
  // 删除分组
  const handleDeleteGroup = (groupId: string) => {
    // 移除分组
    const updatedGroups = vault.groups.filter(group => group.id !== groupId);
    
    // 移除关联的条目中的分组ID
    const updatedEntries = vault.entries.map(entry => {
      if (entry.groupId === groupId) {
        return { ...entry, groupId: undefined };
      }
      return entry;
    });
    
    onVaultChange({
      ...vault,
      groups: updatedGroups,
      entries: updatedEntries
    });
  };
  
  // 获取分组下条目的数量
  const getGroupEntriesCount = (groupId: string) => {
    return vault.entries.filter(entry => entry.groupId === groupId).length;
  };
  
  // 获取没有分组的条目数量
  const getUngroupedEntriesCount = () => {
    return vault.entries.filter(entry => !entry.groupId).length;
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={4}>分组管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddGroupModal}
        >
          添加分组
        </Button>
      </div>
      
      <List
        className={styles.groupList}
        itemLayout="horizontal"
        dataSource={[{ id: 'ungrouped', name: '未分组', special: true }, ...vault.groups]}
        renderItem={item => {
          const isUngrouped = 'special' in item;
          const entriesCount = isUngrouped 
            ? getUngroupedEntriesCount() 
            : getGroupEntriesCount(item.id);
            
          return (
            <List.Item
              key={item.id}
              className={styles.groupItem}
              actions={!isUngrouped ? [
                <Tooltip title="编辑分组" key="edit">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => showEditGroupModal(item as PasswordGroup)} 
                  />
                </Tooltip>,
                <Popconfirm
                  key="delete"
                  title="确定要删除此分组吗？"
                  onConfirm={() => handleDeleteGroup(item.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              ] : []}
            >
              <div className={styles.groupInfo}>
                {!isUngrouped && (
                  <div 
                    className={styles.colorDot} 
                    style={{ backgroundColor: (item as PasswordGroup).color || '#1890FF' }} 
                  />
                )}
                <Text strong={true}>{item.name}</Text>
                <Text type="secondary" className={styles.entriesCount}>
                  {entriesCount} 条密码
                </Text>
              </div>
            </List.Item>
          );
        }}
      />
      
      <Modal
        title={
          <Space>
            <TagOutlined />
            {currentGroup?.id ? '编辑分组' : '添加分组'}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} icon={<CloseOutlined />}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            icon={<SaveOutlined />}
          >
            保存
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={currentGroup || {}}
        >
          <Form.Item
            name="name"
            label="分组名称"
            rules={[{ required: true, message: '请输入分组名称' }]}
          >
            <Input placeholder="分组名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述（可选）"
          >
            <TextArea 
              placeholder="分组描述"
              rows={2}
            />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="分组颜色"
            initialValue={currentGroup?.color || '#1890FF'}
          >
            <Input type="color" style={{ width: '100%', height: '32px' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GroupManager; 