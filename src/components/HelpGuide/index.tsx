import React from 'react';
import { Drawer, Tabs, Typography, Divider } from 'antd';

const { TabPane } = Tabs;
const { Title, Paragraph, Text, Link } = Typography;

interface HelpGuideProps {
  visible: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const HelpGuide: React.FC<HelpGuideProps> = ({ visible, onClose, isMobile }) => {
  return (
    <Drawer
      title="帮助与安全中心"
      width={isMobile ? '90%' : 520}
      onClose={onClose}
      open={visible}
      bodyStyle={{ padding: '24px' }}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="快速上手" key="1">
          <Typography>
            <Title level={4}>欢迎使用！</Title>
            <Paragraph>
              只需几步，即可安全管理您的所有密码。
            </Paragraph>

            <Divider />

            <Title level={5}>第一步：创建您的主密码</Title>
            <Paragraph>
              主密码是打开您密码库的唯一钥匙。请务必设置一个您自己能记住、但别人难以猜到的强密码。
              <Text strong type='danger'>请注意：我们无法帮您找回主密码，忘记它将导致数据永久丢失！！！。</Text>
            </Paragraph>

            <Title level={5}>第二步：认识主界面</Title>
            <Paragraph>
              解锁后，您会看到主界面，主要分为三个区域：
              <ul>
                <li><Text strong>菜单区域 (左侧)</Text>: 密码管理、分组管理、备份与回复、修改主密码。</li>
                <li><Text strong>详情区域 (右侧)</Text>: 菜单对应内容详情。</li>
              </ul>
            </Paragraph>

            <Title level={5}>第三步：添加您的第一条密码</Title>
            <Paragraph>
              <ol>
                <li>进入密码管理菜单。</li>
                <li>点击 <Text code>添加新密码</Text> 按钮。</li>
                <li>在弹窗中，填写网站/应用名称、用户名、密码等信息。</li>
                <li>您可以点击密码框旁的“生成密码”按钮来创建一个新的强密码。</li>
                <li>填写完毕后，系统会自动保存您的输入。</li>
              </ol>
            </Paragraph>

            <Title level={5}>第四步：查找和使用密码</Title>
            <Paragraph>
              <ul>
                <li>在顶部的<Text strong>搜索框</Text>输入关键词，可以快速找到您需要的密码。</li>
                <li>点击任何密码条目右侧的“复制”图标，即可将用户名或密码复制到剪贴板，方便粘贴。</li>
              </ul>
            </Paragraph>

            <Title level={5}>第五步：导入和导出 (重要)</Title>
            <Paragraph>
              <ul>
                <li><Text strong>导出</Text>: 在“导入/导出”功能中，您可以将整个密码库加密导出为一个文件。这是 <Text strong>备份数据</Text> 的最佳方式。</li>
                <li><Text strong>导入</Text>: 您也可以在新设备上通过导入备份文件来恢复您的数据。</li>
              </ul>
            </Paragraph>

            <Title level={5}>第六步：确保安全</Title>
            <Paragraph>
              完成操作后，请务必点击界面右上角的 <Text code>锁定</Text> 按钮。您的所有数据会立即被重新加密，直到您下次输入主密码。
            </Paragraph>
          </Typography>
        </TabPane>
        <TabPane tab="安全说明" key="2">
          <Typography>
            <Title level={4}>本系统的安全性说明</Title>
            <Paragraph>
              我们深知密码安全至关重要。本系统的设计核心就是为了用最可靠的方式保护您的数据。
            </Paragraph>

            <Title level={5}>一句话解释：您可以完全放心</Title>
            <Paragraph>
              您可以把这个系统想象成一个<Text strong>顶级的私人保险箱</Text>，而您的主密码是<Text strong>唯一一把钥匙</Text>。
              <ul>
                <li><Text strong>您的数据被锁在保险箱里</Text>: 您的所有账号密码信息都被锁在一个加密文件里。</li>
                <li><Text strong>钥匙只在您手中</Text>: 您的主密码是打开这个保险箱的唯一钥匙。我们绝不会存储或发送您的主密码，只有您自己知道。</li>
                <li><Text strong>保险箱从不离开您的家</Text>: 所有的加锁、开锁操作都在您的电脑上完成，数据从不上网。</li>
              </ul>
            </Paragraph>

            <Divider />

            <Title level={5}>给好奇的你：我们是如何加固“保险箱”的？</Title>
            <Paragraph>
              <ol>
                <li><Text strong>把您的“钥匙”变得更复杂</Text>: 我们不会直接用您的主密码。相反，我们会用一个极其耗时的方法，将您的主密码“锻造”成一把更强大的“高科技钥匙”，让暴力破解在实际中不可行。</li>
                <li><Text strong>为每个保险箱配上独一无二的锁</Text>: 我们为您的“保险箱”配备了一把独特的锁。即使其他人碰巧和您用了相同的主密码，他们的“锁”也和您的完全不同。</li>
                <li><Text strong>防篡改的“密封条”</Text>: 我们的“保险箱”有一个防篡改的数字密封条。如果加密文件被修改过，它将无法打开，这确保了您的数据不仅保密，而且完整。</li>
                <li><Text strong>我们也没有“备用钥匙”</Text>: 这是一个“零知识”系统。我们无法查看、恢复或重置您的任何数据。如果您忘记了主密码，数据将永久无法恢复。</li>
              </ol>
            </Paragraph>

            <Divider />

            <Title level={5}>给专业人士：技术实现细节</Title>
            <Paragraph>
              <ul>
                <li><Text strong>加密算法</Text>: AES-256-GCM (提供机密性、完整性和真实性)。</li>
                <li><Text strong>密钥派生函数</Text>: PBKDF2 (高迭代次数，有效抵御暴力破解)。</li>
                <li><Text strong>盐 (Salt)</Text>: 为每个加密文件生成唯一的随机盐值，防止彩虹表攻击。</li>
                <li><Text strong>初始化向量 (IV)</Text>: 每次加密都使用唯一的IV，确保语义安全。</li>
                <li><Text strong>架构</Text>: 100% 纯客户端，零知识（Zero-Knowledge）架构。</li>
              </ul>
            </Paragraph>
          </Typography>
        </TabPane>
        <TabPane tab="常见问题" key="3">
          <Typography>
            <Title level={4}>常见问题 (FAQ)</Title>

            <Title level={5}>如果我忘记了主密码怎么办？</Title>
            <Paragraph>
              <Text strong>很遗憾，无法找回。</Text> 为了保证绝对安全，我们不存储您的主密码，也无法以任何方式恢复或重置它。忘记主密码意味着加密的数据将永久无法解密。请务必妥善保管您的主密码。
            </Paragraph>

            <Title level={5}>如何备份我的数据？</Title>
            <Paragraph>
              请在“导入/导出”功能区，点击“导出全部数据”按钮。系统会生成一个加密后的文件供您下载。请将此文件保存在安全的位置（如飞书、语雀、云盘等）。这是唯一的备份方式。
            </Paragraph>

            <Title level={5}>我可以在多台设备上使用吗？</Title>
            <Paragraph>
              可以。您可以在一台设备上“导出”您的数据，然后在另一台设备上使用相同的“导入”功能和您的主密码来载入它们。请确保在传输备份文件过程中的安全。
            </Paragraph>

            <Title level={5}>这个项目是开源的吗？</Title>
            <Paragraph>
              是的，您可以在 <Link href="https://github.com/heuuLZP/1password" target="_blank">GitHub</Link> 上查看所有源代码。
            </Paragraph>
          </Typography>
        </TabPane>
      </Tabs>
    </Drawer>
  );
};

export default HelpGuide;
