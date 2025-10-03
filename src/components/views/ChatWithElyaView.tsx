import React from 'react';
import { ChatWithElyaIframe } from '../ChatWithElyaIframe';

export const ChatWithElyaView: React.FC = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatWithElyaIframe />
    </div>
  );
};