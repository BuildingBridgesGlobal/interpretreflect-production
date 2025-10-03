import React from 'react';
import { PersonalizedHomepage } from '../PersonalizedHomepage';

interface DashboardHomeViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ onNavigate }) => {
  return <PersonalizedHomepage onNavigate={onNavigate} />;
};