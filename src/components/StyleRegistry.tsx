import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

interface StyleRegistryProps {
  children: React.ReactNode;
}

ConfigProvider.config({
  theme: {
    primaryColor: '#873bf4',
  },
});

const StyleRegistry: React.FC<StyleRegistryProps> = ({ children }) => {
  return (
    <ConfigProvider 
      locale={zhCN}
      prefixCls="ant"
    >
      {children}
    </ConfigProvider>
  );
};

export default StyleRegistry; 