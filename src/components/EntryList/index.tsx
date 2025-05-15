import React, { useState } from 'react';
import { Input, Button, Typography, Empty, Space, Modal, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, ExclamationCircleOutlined, TagOutlined } from '@ant-design/icons';
import { PasswordEntry, PasswordVault } from '../../lib/types';
import PasswordEntryComponent from '../PasswordEntry/index';
import { StorageManager } from '../../lib/storage';
import styles from './index.module.less';

const { Title, Text } = Typography;
const { Search } = Input;
const { confirm } = Modal;
const { TabPane } = Tabs;

interface EntryListProps {
  vault: PasswordVault;
  onVaultChange: (vault: PasswordVault) => void;
}

const EntryList: React.FC<EntryListProps> = ({ vault, onVaultChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<PasswordEntry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [startEditing, setStartEditing] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(undefined);
  
  const storageManager = new StorageManager();
  
  // 添加新条目
  const handleAddNew = () => {
    const now = new Date().toISOString();
    const newEntry: PasswordEntry = {
      id: storageManager.generateId(),
      website: '',
      username: '',
      password: '',
      createdAt: now,
      updatedAt: now,
      groupId: activeGroupId // 使用当前选中的分组
    };
    
    setCurrentEntry(newEntry);
    setIsNewEntry(true);
    setModalVisible(true);
  };
  
  // 编辑条目
  const handleEditEntry = (entry: PasswordEntry) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setStartEditing(true);
    setModalVisible(true);
  };
  
  // 关闭模态框
  const handleCloseModal = () => {
    setModalVisible(false);
    setCurrentEntry(null);
    setStartEditing(false);
  };
  
  // 保存条目
  const handleSaveEntry = (editedEntry: PasswordEntry) => {
    // 验证必填字段是否已填写
    if (!editedEntry.website.trim() || !editedEntry.username.trim() || !editedEntry.password.trim()) {
      return;
    }
    
    if (isNewEntry) {
      // 如果是保存新条目，则添加到列表中
      onVaultChange({
        ...vault,
        entries: [editedEntry, ...vault.entries]
      });
    } else {
      // 更新现有条目
      const updatedEntries = vault.entries.map(entry => 
        entry.id === editedEntry.id ? editedEntry : entry
      );
      
      onVaultChange({
        ...vault,
        entries: updatedEntries
      });
    }
    
    setModalVisible(false);
    setCurrentEntry(null);
  };
  
  // 删除条目
  const handleDeleteEntry = (id: string) => {
    // 使用Ant Design的确认对话框
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个密码记录吗？此操作不可恢复。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        const updatedEntries = vault.entries.filter(entry => entry.id !== id);
        
        onVaultChange({
          ...vault,
          entries: updatedEntries
        });
        
        // 如果删除的是当前正在编辑的条目，关闭模态框
        if (modalVisible && currentEntry && currentEntry.id === id) {
          setModalVisible(false);
          setCurrentEntry(null);
        }
      }
    });
  };
  
  // 搜索过滤
  const filteredEntries = vault.entries.filter(entry => {
    // 过滤掉空条目
    if (!entry.website.trim() && !entry.username.trim() && !entry.password.trim()) {
      return false;
    }
    
    // 根据分组筛选
    if (activeGroupId !== undefined) {
      if (activeGroupId === 'ungrouped') {
        if (entry.groupId) return false;
      } else if (entry.groupId !== activeGroupId) {
        return false;
      }
    }
    
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.website.toLowerCase().includes(searchLower) ||
      entry.username.toLowerCase().includes(searchLower) ||
      (entry.url && entry.url.toLowerCase().includes(searchLower)) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchLower))
    );
  });
  
  // 排序：按更新时间倒序
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
  
  // // 清除搜索
  // const handleClearSearch = () => {
  //   setSearchTerm('');
  // };
  
  // // 根据分组ID获取分组信息
  // const getGroupById = (groupId: string): PasswordGroup | undefined => {
  //   return vault.groups.find(group => group.id === groupId);
  // };
  
  // 渲染分组筛选选项
  const renderGroupTabs = () => {
    return (
      <Tabs 
        activeKey={activeGroupId || 'all'} 
        onChange={(key) => setActiveGroupId(key === 'all' ? undefined : key)}
        className={styles.groupTabs}
        tabBarExtraContent={
          <div className={styles.tabsActions}>
            {vault.entries.length > 0 && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddNew}
              >
                添加新密码
              </Button>
            )}
          </div>
        }
      >
        <TabPane 
          tab={
            <span>
              <TagOutlined />
              全部
            </span>
          } 
          key="all"
        />
        <TabPane 
          tab={
            <span>
              <TagOutlined />
              未分组
            </span>
          } 
          key="ungrouped"
        />
        {vault.groups.map(group => (
          <TabPane 
            tab={
              <span>
                <div 
                  className={styles.tabColorDot} 
                  style={{ backgroundColor: group.color || '#1890FF' }}
                />
                {group.name}
              </span>
            } 
            key={group.id}
          />
        ))}
      </Tabs>
    );
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>密码库</Title>
          <Text type="secondary" style={{ marginLeft: '8px' }}>
            共 {vault.entries.length} 条记录
            {searchTerm && ` (搜索结果: ${filteredEntries.length} 条)`}
          </Text>
        </div>
      </div>
      
      {renderGroupTabs()}
      
      <Search
        placeholder="搜索..."
        allowClear
        enterButton={
          <Button 
            type="primary" 
            icon={<SearchOutlined />}
          >
            搜索
          </Button>
        }
        size="large"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onSearch={(value) => setSearchTerm(value)}
        className={styles.searchContainer}
        style={{ 
          marginBottom: '1.5rem',
          overflow: 'hidden'
        }}
      />
      
      {/* 密码编辑模态框 */}
      <Modal
        title={isNewEntry ? "添加新密码" : "编辑密码"}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={720}
        destroyOnClose={true}
        maskClosable={false}
        style={{ top: 20 }}
        bodyStyle={{ padding: '24px' }}
        className="password-modal"
      >
        {currentEntry && (
          <PasswordEntryComponent
            entry={currentEntry}
            onSave={handleSaveEntry}
            onDelete={handleDeleteEntry}
            isNew={isNewEntry}
            groups={vault.groups}
            isModal={true}
            onCancel={handleCloseModal}
            onEdit={handleEditEntry}
            startEditing={startEditing}
          />
        )}
      </Modal>
      
      {filteredEntries.length === 0 ? (
        <div className={styles.emptyContainer}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 80 }}
            description={
              <Space direction="vertical" className={styles.emptyText}>
                <Text strong className={styles.strongText}>
                  {searchTerm ? '没有找到匹配的密码记录' : (
                    activeGroupId ? '该分组下没有密码记录' : '密码库为空'
                  )}
                </Text>
                <Text type="secondary">
                  {searchTerm 
                    ? '请尝试使用其他关键词' 
                    : '点击"添加新密码"开始使用密码备忘录'}
                </Text>
              </Space>
            }
          >
            {!searchTerm && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddNew}
              >
                添加新密码
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <>
          <div className={styles.entryList}>
            {sortedEntries.map(entry => (
              <div key={entry.id} className={styles.entryItem}>
                <PasswordEntryComponent
                  entry={entry}
                  onSave={handleSaveEntry}
                  onDelete={handleDeleteEntry}
                  groups={vault.groups}
                  onEdit={handleEditEntry}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EntryList; 