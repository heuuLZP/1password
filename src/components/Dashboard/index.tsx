import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Space, Card, Menu } from 'antd';
import { 
  LockOutlined, 
  CloudOutlined,
  TagsOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import EntryList from '../EntryList';
import ImportExport from '../ImportExport';
import GroupManager from '../GroupManager';
import { PasswordVault } from '../../lib/types';
import styles from './index.module.less';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Text } = Typography;

interface DashboardProps {
  vault: PasswordVault;
  encryptedData: string;
  onVaultChange: (updatedVault: PasswordVault) => void;
  onImport: (encryptedDataStr: string) => Promise<boolean>;
  onLock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  vault,
  encryptedData,
  onVaultChange,
  onImport,
  onLock
}) => {
  const [currentCategory, setCurrentCategory] = useState('passwords');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 监听窗口大小变化，自动适应移动设备
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setCollapsed(window.innerWidth <= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const renderContent = () => {
    switch(currentCategory) {
      case 'passwords':
        return (
          <EntryList
            vault={vault}
            onVaultChange={onVaultChange}
          />
        );
      case 'groups':
        return (
          <GroupManager
            vault={vault}
            onVaultChange={onVaultChange}
          />
        );
      case 'backup':
        return (
          <ImportExport
            encryptedData={encryptedData}
            onImport={onImport}
          />
        );
      default:
        return (
          <div className={styles.comingSoonContainer}>
            <Title level={3}>即将推出</Title>
            <Text type="secondary">此功能正在开发中</Text>
          </div>
        );
    }
  };

  return (
    <Layout className={styles.layout}>
      <Header className={`${styles.header} app-header`}>
        <Space size="middle">
          {isMobile && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              style={{ color: 'white' }}
            />
          )}
          <Title level={4} style={{ color: 'white', margin: 0 }}>密码备忘录</Title>
        </Space>
        
        <Space size="middle">
          <Button 
            icon={<LockOutlined />} 
            onClick={onLock}
            className="bg-white text-primary border-transparent"
            style={{ 
              boxShadow: '0 2px 10px rgba(255, 255, 255, 0.2)',
            }}
          >
            {!isMobile ? '锁定密码库' : ''}
          </Button>
        </Space>
      </Header>
      
      <Layout className={styles.mainLayout}>
        <Sider 
          width={228} 
          collapsible={true}
          collapsed={collapsed}
          trigger={null}
          className={styles.sider}
          theme="light"
          breakpoint="lg"
          onBreakpoint={broken => {
            setCollapsed(broken);
          }}
          collapsedWidth={isMobile ? 0 : 80}
        >
          <Menu
            mode="inline"
            className={styles.siderMenu}
            selectedKeys={[currentCategory]}
            style={{ background: 'transparent' }}
            onSelect={({ key }) => {
              setCurrentCategory(key as string);
              if (isMobile) {
                setCollapsed(true);
              }
            }}
            theme="dark"
            items={[
              {
                key: 'passwords',
                icon: <LockOutlined />,
                label: '密码',
              },
              {
                key: 'groups',
                icon: <TagsOutlined />,
                label: '分组管理',
              },
              {
                key: 'backup',
                icon: <CloudOutlined />,
                label: '备份与恢复',
              },
            ]}
          />
        </Sider>
        
        <Layout className={styles.contentLayout}>
          <Content className={styles.mainContent}>
            <div className={styles.contentWrapper}>
              <Card 
                bordered={false}
                className={styles.contentCard}
              >
                {renderContent()}
              </Card>
            </div>
          </Content>
          
          <Footer className={styles.mainFooter}>
            <Space direction="vertical" size={1}>
              <Text type="secondary">密码备忘录 &copy; {new Date().getFullYear()}</Text>
              <Text type="secondary" className="text-xs">您的数据仅在本地安全加密存储</Text>
            </Space>
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard; 