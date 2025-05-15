import React, { useState, useRef } from 'react';
import { Button, Typography, Alert, Card, message, Row, Col, Tooltip, Modal, Input, Space, Divider } from 'antd';
import { DownloadOutlined, UploadOutlined, InfoCircleOutlined, ExclamationCircleOutlined, CopyOutlined, ImportOutlined } from '@ant-design/icons';
import { StorageManager } from '../../lib/storage';
import styles from './index.module.less';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface ImportExportProps {
  encryptedData: string;
  onImport: (encryptedData: string) => Promise<boolean>;
}

const ImportExport: React.FC<ImportExportProps> = ({ encryptedData, onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [textImportModalVisible, setTextImportModalVisible] = useState(false);
  const [exportedText, setExportedText] = useState('');
  const [importText, setImportText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageManager = new StorageManager();
  
  // 处理导出
  const handleExport = async () => {
    setError(null);
    setSuccess(null);
    setIsExporting(true);
    
    try {
      await storageManager.exportToFile(encryptedData);
      setSuccess('密码库已成功导出为文件');
      message.success('密码库已成功导出为文件');
    } catch (err) {
      setError('导出失败，请重试');
      message.error('导出失败，请重试');
      console.error('导出错误:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  // 处理导出为文本
  const handleExportAsText = () => {
    setError(null);
    setSuccess(null);
    setIsExporting(true);
    
    try {
      setExportedText(encryptedData);
      setTextModalVisible(true);
      setSuccess('密码库已成功导出为文本');
    } catch (err) {
      setError('导出为文本失败，请重试');
      message.error('导出为文本失败，请重试');
      console.error('导出为文本错误:', err);
    } finally {
      setIsExporting(false);
    }
  };
  
  // 复制文本到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportedText)
      .then(() => {
        message.success('已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败，请手动复制');
      });
  };
  
  // 处理导入按钮点击
  const handleImportClick = () => {
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // 处理文件选择
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsImporting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const file = files[0];
      const fileContent = await storageManager.readFromFile(file);
      
      // 验证文件格式
      try {
        const parsed = JSON.parse(fileContent);
        if (!parsed.metadata || !parsed.encrypted_data) {
          throw new Error('文件格式不正确');
        }
      } catch (parseError) {
        throw new Error('导入的文件不是有效的密码库文件');
      }
      
      // 尝试导入并验证是否能用当前主密码解密
      const importSuccess = await onImport(fileContent);
      
      if (importSuccess) {
        setSuccess('密码库已成功导入');
        message.success('密码库已成功导入');
      } else {
        throw new Error('导入失败，主密码与导入数据不匹配');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        message.error(err.message);
      } else {
        setError('导入失败，请确保文件格式正确且与当前主密码匹配');
        message.error('导入失败，请确保文件格式正确且与当前主密码匹配');
      }
      console.error('导入错误:', err);
    } finally {
      setIsImporting(false);
      // 清空文件输入，以便可以重新选择同一个文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // 显示文本导入模态框
  const showTextImportModal = () => {
    setImportText('');
    setTextImportModalVisible(true);
    setError(null);
    setSuccess(null);
  };
  
  // 处理文本导入
  const handleTextImport = async () => {
    setIsImporting(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!importText.trim()) {
        throw new Error('导入文本不能为空');
      }
      
      // 验证文本格式
      try {
        const parsed = JSON.parse(importText);
        if (!parsed.metadata || !parsed.encrypted_data) {
          throw new Error('文本格式不正确');
        }
      } catch (parseError) {
        throw new Error('导入的文本不是有效的密码库数据');
      }
      
      // 尝试导入并验证是否能用当前主密码解密
      const importSuccess = await onImport(importText);
      
      if (importSuccess) {
        setTextImportModalVisible(false);
        setSuccess('密码库已成功从文本导入');
        message.success('密码库已成功从文本导入');
      } else {
        throw new Error('导入失败，主密码与导入数据不匹配');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        message.error(err.message);
      } else {
        setError('导入失败，请确保文本格式正确且与当前主密码匹配');
        message.error('导入失败，请确保文本格式正确且与当前主密码匹配');
      }
      console.error('文本导入错误:', err);
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={4} className={styles.headerTitle}>备份与恢复</Title>
      </div>
      
      <div className={styles.content}>
        <Row gutter={[24, 24]} className={styles.cardsRow}>
          <Col xs={24} md={12}>
            <Card 
              bordered={false} 
              className={styles.exportCard}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <Title level={5} className={styles.cardTitle}>导出密码库</Title>
                </div>
                <Paragraph className={styles.cardDescription}>
                  将密码库导出为加密文件或文本，可用于备份或迁移到其他设备。
                </Paragraph>
                
                <div className={styles.buttonWrapper}>
                  <Space size="middle">
                    <Tooltip title="保存到本地文件">
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                        loading={isExporting}
                        size="large"
                        className={styles.exportButton}
                      >
                        {isExporting ? '导出中...' : '导出为文件'}
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="导出为可复制的文本">
                      <Button
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={handleExportAsText}
                        size="large"
                        className={styles.exportTextButton}
                      >
                        导出为文本
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={12}>
            <Card 
              bordered={false} 
              className={styles.importCard}
            >
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <Title level={5} className={styles.cardTitle}>导入密码库</Title>
                </div>
                
                <Paragraph className={styles.cardDescription}>
                  从先前导出的文件或文本中导入密码库。
                </Paragraph>
                
                <div className={styles.warningBox}>
                  <ExclamationCircleOutlined className={styles.warningIcon} />
                  <Text className={styles.warningText}>
                    警告：这将覆盖当前的密码库！
                  </Text>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  style={{ display: 'none' }}
                />
                
                <div className={styles.buttonWrapper}>
                  <Space size="middle">
                    <Tooltip title="从本地文件导入">
                      <Button
                        type="primary"
                        danger
                        icon={<UploadOutlined />}
                        onClick={handleImportClick}
                        loading={isImporting}
                        size="large"
                        className={styles.importButton}
                      >
                        {isImporting ? '导入中...' : '从文件导入'}
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="从粘贴的文本导入">
                      <Button
                        type="primary"
                        danger
                        icon={<ImportOutlined />}
                        onClick={showTextImportModal}
                        size="large"
                        className={styles.importTextButton}
                      >
                        从文本导入
                      </Button>
                    </Tooltip>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        
        {(error || success) && (
          <div className={styles.alertWrapper}>
            {error && (
              <Alert
                message="导入错误"
                description={error}
                type="error"
                showIcon
                className={styles.alert}
              />
            )}
            
            {success && (
              <Alert
                message="操作成功"
                description={success}
                type="success"
                showIcon
                className={styles.alert}
              />
            )}
          </div>
        )}
      </div>
      
      <div className={styles.footer}>
        <Card 
          bordered={false} 
          className={styles.tipsCard}
        >
          <div className={styles.tipsContent}>
            <div className={styles.tipsTitleRow}>
              <div className={styles.tipsIconWrapper}>
                <InfoCircleOutlined className={styles.tipsIcon} />
              </div>
              <Text strong className={styles.tipsTitle}>安全提示</Text>
            </div>
            <ul className={styles.tipsList}>
              <li>
                <Text className={styles.tipsItem}>定期备份您的密码库，防止数据丢失</Text>
              </li>
              <li>
                <Text className={styles.tipsItem}>导出的文件和文本都是加密的，需要您的主密码才能解锁</Text>
              </li>
              <li>
                <Text className={styles.tipsItem}>请将备份数据保存在安全的位置</Text>
              </li>
              <li>
                <Text className={styles.tipsItem}>文本导入/导出功能适合在移动设备上使用</Text>
              </li>
            </ul>
          </div>
        </Card>
      </div>
      
      {/* 导出文本模态框 */}
      <Modal
        title="导出的密码库文本"
        open={textModalVisible}
        onCancel={() => setTextModalVisible(false)}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyToClipboard}>
            复制到剪贴板
          </Button>,
          <Button key="close" onClick={() => setTextModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        <Paragraph>
          <Text type="secondary">下方是您的加密密码库数据。您可以复制此文本用于备份或传输到其他设备。</Text>
        </Paragraph>
        <Divider />
        <TextArea
          value={exportedText}
          autoSize={{ minRows: 6, maxRows: 10 }}
          readOnly
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
      </Modal>
      
      {/* 导入文本模态框 */}
      <Modal
        title="从文本导入密码库"
        open={textImportModalVisible}
        onCancel={() => setTextImportModalVisible(false)}
        footer={[
          <Button 
            key="import" 
            type="primary" 
            danger 
            icon={<ImportOutlined />} 
            onClick={handleTextImport}
            loading={isImporting}
          >
            导入
          </Button>,
          <Button key="cancel" onClick={() => setTextImportModalVisible(false)}>
            取消
          </Button>
        ]}
        width={600}
      >
        <Paragraph>
          <Text type="secondary">请粘贴之前导出的密码库文本数据。</Text>
        </Paragraph>
        <div className={styles.warningBox} style={{ margin: '12px 0' }}>
          <ExclamationCircleOutlined className={styles.warningIcon} />
          <Text className={styles.warningText}>
            警告：这将覆盖当前的密码库！
          </Text>
        </div>
        <TextArea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="在此粘贴密码库文本数据..."
          autoSize={{ minRows: 6, maxRows: 10 }}
        />
      </Modal>
    </div>
  );
};

export default ImportExport; 