import React from 'react';
import {
  ClipboardCheck,
  Brain,
  Users,
  RefreshCw,
  GraduationCap,
  Lightbulb,
  Heart,
  Compass,
  Activity,
  Zap,
  Shield,
  MessageSquare,
} from 'lucide-react';

interface ReflectionTool {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  status: Array<{ label: string; color: string }>;
  onClick?: () => void;
}

interface ReflectionToolsProps {
  onToolSelect: (tool: string) => void;
}

export const ReflectionTools: React.FC<ReflectionToolsProps> = ({ onToolSelect }) => {
  const reflectionCards: ReflectionTool[] = [
    {
      icon: ClipboardCheck,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Pre-Assignment Prep',
      description: 'Prime attention, steady the nervous system, and set...',
      status: [
        { label: 'Prepare Well', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Brain,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Post-Assignment Debrief',
      description: 'Consolidate learning, de-load stress, and turn...',
      status: [
        { label: 'Reflect & Grow', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Users,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Prep',
      description: 'Align minds and mechanics so handoffs are smooth...',
      status: [
        { label: 'Team Ready', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: RefreshCw,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Teaming Reflection',
      description: 'Consolidate what worked between partners, surface...',
      status: [
        { label: 'Team Review', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: GraduationCap,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Prep',
      description: 'Clarify the ask, define success, and set up a...',
      status: [
        { label: 'Get the Right', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Lightbulb,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Mentoring Reflection',
      description: 'Consolidate insights and capture next steps',
      status: [
        { label: 'Apply', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Heart,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'Wellness Check-in',
      description: 'Focus on emotional and physical wellbeing',
      status: [
        { label: 'Stay', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Compass,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
      title: 'Values Alignment Check-In',
      description: 'Realign with your values after challenging decisions',
      status: [
        { label: 'Values', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Activity,
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/20',
      title: 'In-Session Self-Check',
      description: 'Quick monitoring for active interpreting sessions',
      status: [
        { label: 'Real-time', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Zap,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/20',
      title: 'In-Session Team Sync',
      description: 'Team coordination check during assignments',
      status: [
        { label: 'Team sync', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: Shield,
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/20',
      title: 'Role-Space Reflection',
      description: 'Clarify and honor your professional boundaries after each assignment',
      status: [
        { label: 'Boundaries', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
    {
      icon: MessageSquare,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      title: 'Supporting Direct Communication',
      description: 'Reflect on facilitating respectful, independent communication',
      status: [
        { label: 'Direct Flow', color: 'text-gray-400' },
        { label: 'Ready to start', color: 'text-gray-400' },
      ],
    },
  ];

  const handleToolClick = (toolTitle: string) => {
    // Map tool titles to view names
    const toolMap: Record<string, string> = {
      'Pre-Assignment Prep': 'pre-assignment',
      'Post-Assignment Debrief': 'post-assignment',
      'Teaming Prep': 'teaming-prep',
      'Teaming Reflection': 'teaming-reflection',
      'Mentoring Prep': 'mentoring-prep',
      'Mentoring Reflection': 'mentoring-reflection',
      'Wellness Check-in': 'wellness',
      'Values Alignment Check-In': 'ethics-meaning',
      'In-Session Self-Check': 'in-session-self',
      'In-Session Team Sync': 'in-session-team',
      'Role-Space Reflection': 'role-space',
      'Supporting Direct Communication': 'direct-communication',
    };
    
    const viewName = toolMap[toolTitle];
    if (viewName) {
      onToolSelect(viewName);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reflectionCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-xl"
          style={{
            border: '1px solid rgba(92, 127, 79, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
          onClick={() => handleToolClick(card.title)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              Ready
            </span>
          </div>
          
          <h3 className="font-bold text-lg mb-2" style={{ color: '#1A1A1A' }}>
            {card.title}
          </h3>
          
          <p className="text-sm mb-4" style={{ color: '#525252' }}>
            {card.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {card.status.map((statusItem, statusIndex) => (
              <span
                key={statusIndex}
                className={`text-xs px-2 py-1 rounded-full bg-gray-50 ${statusItem.color}`}
              >
                {statusItem.label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};