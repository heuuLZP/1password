import React from 'react';
import { Layout, Typography, Space, Card, Divider, Badge, Avatar } from 'antd';
import { LockOutlined, SafetyOutlined } from '@ant-design/icons';
import MasterPasswordForm from '../MasterPasswordForm';
import styles from './index.module.less';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;

interface LockScreenProps {
  isNewUser: boolean;
  onMasterPasswordSubmit: (password: string) => Promise<void>;
}

const LockScreen: React.FC<LockScreenProps> = ({ isNewUser, onMasterPasswordSubmit }) => {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <Card 
          bordered={false}
          className={styles.loginCard}
        >
          <div className={styles.logoContainer}>
            <div className={styles.logoWrapper}>
              <Avatar 
                size={84} 
                icon={<LockOutlined />} 
                className={styles.gradientAvatar}
              />
              <Badge 
                count={<SafetyOutlined className="text-primary" />} 
                className={styles.badgeWrapper}
              />
            </div>
            <Title level={2} className="text-primary" style={{ margin: '8px 0' }}>
              密码备忘录
            </Title>
            <Text style={{ textAlign: 'center', fontSize: '15px' }}>
              安全存储您的所有密码和敏感信息
            </Text>
            <Divider style={{ borderColor: 'rgba(226, 232, 240, 0.8)', margin: '32px 0 24px' }} />
          </div>
          
          <MasterPasswordForm
            isNewUser={isNewUser}
            onSubmit={onMasterPasswordSubmit}
          />
        </Card>
      </Content>
      
      <Footer className={styles.footer}>
        <div className={styles.footerText}>
          密码备忘录 &copy; {new Date().getFullYear()} | 端到端加密保护
        </div>
        <div className={styles.footerSubtext}>
          您的密码安全，永不离线
        </div>
      </Footer>
    </Layout>
  );
};

export default LockScreen; 