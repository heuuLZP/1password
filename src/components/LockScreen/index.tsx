import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Divider, Badge, Avatar, Modal, Button, Alert, Space, Tooltip } from 'antd';
import { LockOutlined, SafetyOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import MasterPasswordForm from '../MasterPasswordForm';
import styles from './index.module.less';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

interface LockScreenProps {
  isNewUser: boolean;
  onMasterPasswordSubmit: (password: string) => Promise<void>;
}

const LockScreen: React.FC<LockScreenProps> = ({ isNewUser, onMasterPasswordSubmit }) => {
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);

  // Detect ad blocker on mount
  useEffect(() => {
    const checkAdBlocker = () => {
      if (window.adBlockerDetected) {
        setAdBlockerDetected(true);
      }
    };
    checkAdBlocker();
  }, []);

  const handleWelcomeOk = () => {
    setIsWelcomeVisible(false);
  };

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
            <Space align="center" className={styles.titleContainer}>
              <Title level={2} className="text-primary" style={{ margin: 0 }}>
                密码备忘录
              </Title>
              {isNewUser && (
                <div className="shake-element">
                  <Tooltip title="查看使用指引">
                    <Button 
                      type="link"
                      icon={<QuestionCircleOutlined style={{ fontSize: '24px' }}/>}
                      onClick={() => setIsWelcomeVisible(true)}
                    />
                  </Tooltip>
                </div>
              )}
            </Space>
            <Text style={{ textAlign: 'center', fontSize: '15px' }}>
              安全存储您的所有密码和敏感信息
            </Text>
            <Divider style={{ borderColor: 'rgba(226, 232, 240, 0.8)', margin: '32px 0 24px' }} />
          </div>
          
          <MasterPasswordForm
            isNewUser={isNewUser}
            onSubmit={onMasterPasswordSubmit}
          />
          {adBlockerDetected && (
            <Alert
              message="检测到广告拦截器"
              description="我们注意到您可能开启了广告拦截扩展，这会导致统计功能失效。如果您觉得本工具对您有帮助，希望可以将其添加到白名单中，感谢您的支持！"
              type="warning"
              showIcon
              closable
              onClose={() => setAdBlockerDetected(false)}
              className={styles.alertBanner}
            />
          )}
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

      <Modal
        title={<Title level={4}>欢迎使用您的密码备忘录！</Title>}
        open={isWelcomeVisible}
        onOk={handleWelcomeOk}
        onCancel={handleWelcomeOk}
        footer={[
          <Button key="submit" type="primary" onClick={handleWelcomeOk}>
            我明白了，开始使用
          </Button>,
        ]}
      >
        <Typography>
          <Paragraph>这是一款在您本地运行的密码管理工具，您的数据绝对安全。</Paragraph>
          <Paragraph>google analytics 仅统计访问量，不会收集您的个人信息或密码。</Paragraph>
          <Divider />
          <Title level={5}>核心三步指引：</Title>
          <ol>
            <li><Text strong>创建“私密钥匙”</Text>: 设置一个您能记住的强主密码。</li>
            <li><Text strong>开始添加</Text>: 进入主界面后，点击“添加新密码”来保存您的第一个密码。</li>
            <li><Text strong>随时锁定</Text>: 完成后，点击“锁定”按钮，数据会立刻加密，确保安全。</li>
          </ol>
        </Typography>
      </Modal>
    </Layout>
  );
};

export default LockScreen; 