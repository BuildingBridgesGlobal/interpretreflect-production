import React from 'react';
import { ReflectionTools } from '../layout/ReflectionTools';
import PreAssignmentPrepAccessible from '../PreAssignmentPrepAccessible';
import PostAssignmentDebriefEnhanced from '../PostAssignmentDebriefEnhanced';
import { TeamingPrepEnhanced } from '../TeamingPrepEnhanced';
import { TeamingReflectionEnhanced } from '../TeamingReflectionEnhanced';
import { MentoringPrepAccessible } from '../MentoringPrepAccessible';
import { MentoringReflectionAccessible } from '../MentoringReflectionAccessible';
import { WellnessCheckInAccessible } from '../WellnessCheckInAccessible';
import { EthicsMeaningCheckAccessible } from '../EthicsMeaningCheckAccessible';
import { InSessionSelfCheck } from '../InSessionSelfCheck';
import { InSessionTeamSync } from '../InSessionTeamSync';
import { RoleSpaceReflection } from '../RoleSpaceReflection';
import { DirectCommunicationReflection } from '../DirectCommunicationReflection';

interface ReflectionStudioViewProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  showPreAssignment: boolean;
  setShowPreAssignment: (show: boolean) => void;
  showPostAssignment: boolean;
  setShowPostAssignment: (show: boolean) => void;
  showTeamingPrep: boolean;
  setShowTeamingPrep: (show: boolean) => void;
  showTeamingReflection: boolean;
  setShowTeamingReflection: (show: boolean) => void;
  showMentoringPrep: boolean;
  setShowMentoringPrep: (show: boolean) => void;
  showMentoringReflection: boolean;
  setShowMentoringReflection: (show: boolean) => void;
  showWellnessCheck: boolean;
  setShowWellnessCheck: (show: boolean) => void;
  showEthicsMeaningCheck: boolean;
  setShowEthicsMeaningCheck: (show: boolean) => void;
  showInSessionSelfCheck: boolean;
  setShowInSessionSelfCheck: (show: boolean) => void;
  showInSessionTeamSync: boolean;
  setShowInSessionTeamSync: (show: boolean) => void;
  showRoleSpaceReflection: boolean;
  setShowRoleSpaceReflection: (show: boolean) => void;
  showDirectCommunication: boolean;
  setShowDirectCommunication: (show: boolean) => void;
  saveReflection?: (type: string, data: any) => void;
}

export const ReflectionStudioView: React.FC<ReflectionStudioViewProps> = ({
  currentView,
  setCurrentView,
  activeCategory,
  setActiveCategory,
  showPreAssignment,
  setShowPreAssignment,
  showPostAssignment,
  setShowPostAssignment,
  showTeamingPrep,
  setShowTeamingPrep,
  showTeamingReflection,
  setShowTeamingReflection,
  showMentoringPrep,
  setShowMentoringPrep,
  showMentoringReflection,
  setShowMentoringReflection,
  showWellnessCheck,
  setShowWellnessCheck,
  showEthicsMeaningCheck,
  setShowEthicsMeaningCheck,
  showInSessionSelfCheck,
  setShowInSessionSelfCheck,
  showInSessionTeamSync,
  setShowInSessionTeamSync,
  showRoleSpaceReflection,
  setShowRoleSpaceReflection,
  showDirectCommunication,
  setShowDirectCommunication,
  saveReflection,
}) => {
  const handleToolSelect = (tool: string) => {
    switch (tool) {
      case 'pre-assignment':
        setShowPreAssignment(true);
        break;
      case 'post-assignment':
        setShowPostAssignment(true);
        break;
      case 'teaming-prep':
        setShowTeamingPrep(true);
        break;
      case 'teaming-reflection':
        setShowTeamingReflection(true);
        break;
      case 'mentoring-prep':
        setShowMentoringPrep(true);
        break;
      case 'mentoring-reflection':
        setShowMentoringReflection(true);
        break;
      case 'wellness':
        setShowWellnessCheck(true);
        break;
      case 'ethics-meaning':
        setShowEthicsMeaningCheck(true);
        break;
      case 'in-session-self':
        setShowInSessionSelfCheck(true);
        break;
      case 'in-session-team':
        setShowInSessionTeamSync(true);
        break;
      case 'role-space':
        setShowRoleSpaceReflection(true);
        break;
      case 'direct-communication':
        setShowDirectCommunication(true);
        break;
    }
  };

  return (
    <main
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="main"
      aria-labelledby="reflection-studio-heading"
    >
      {/* Main Content */}
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2
            id="reflection-studio-heading"
            className="text-4xl font-bold mb-3"
            style={{ color: '#1A1A1A', letterSpacing: '-0.5px' }}
          >
            Reflection Studio
          </h2>
          <p className="text-lg" style={{ color: '#3A3A3A', fontWeight: '400' }}>
            Ready to reflect and grow today?
          </p>
        </div>

        {/* Category Tabs */}
        <nav
          className="flex space-x-3 mb-8 p-2 rounded-2xl"
          role="tablist"
          aria-label="Reflection categories"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}
        >
          <button
            onClick={() => setActiveCategory('structured')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeCategory === 'structured' ? 'shadow-md' : ''
            }`}
            role="tab"
            aria-selected={activeCategory === 'structured'}
            style={{
              backgroundColor: activeCategory === 'structured' ? '#1A3D26' : 'transparent',
              color: activeCategory === 'structured' ? '#FFFFFF' : '#6B7280',
            }}
          >
            Structured Reflections
          </button>
          <button
            onClick={() => setActiveCategory('quick')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeCategory === 'quick' ? 'shadow-md' : ''
            }`}
            role="tab"
            aria-selected={activeCategory === 'quick'}
            style={{
              backgroundColor: activeCategory === 'quick' ? '#1A3D26' : 'transparent',
              color: activeCategory === 'quick' ? '#FFFFFF' : '#6B7280',
            }}
          >
            Quick Check-ins
          </button>
          <button
            onClick={() => setActiveCategory('team')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeCategory === 'team' ? 'shadow-md' : ''
            }`}
            role="tab"
            aria-selected={activeCategory === 'team'}
            style={{
              backgroundColor: activeCategory === 'team' ? '#1A3D26' : 'transparent',
              color: activeCategory === 'team' ? '#FFFFFF' : '#6B7280',
            }}
          >
            Team & Mentoring
          </button>
        </nav>

        {/* Reflection Tools Grid */}
        <ReflectionTools onToolSelect={handleToolSelect} />
      </div>

      {/* Modals for each reflection tool */}
      {showPreAssignment && (
        <PreAssignmentPrepAccessible onClose={() => setShowPreAssignment(false)} />
      )}
      
      {showPostAssignment && (
        <PostAssignmentDebriefEnhanced onClose={() => setShowPostAssignment(false)} />
      )}
      
      {showTeamingPrep && (
        <TeamingPrepEnhanced onClose={() => setShowTeamingPrep(false)} />
      )}
      
      {showTeamingReflection && (
        <TeamingReflectionEnhanced onClose={() => setShowTeamingReflection(false)} />
      )}
      
      {showMentoringPrep && (
        <MentoringPrepAccessible onClose={() => setShowMentoringPrep(false)} />
      )}
      
      {showMentoringReflection && (
        <MentoringReflectionAccessible onClose={() => setShowMentoringReflection(false)} />
      )}
      
      {showWellnessCheck && (
        <WellnessCheckInAccessible 
          onClose={() => setShowWellnessCheck(false)}
          onComplete={(data) => {
            if (saveReflection) {
              saveReflection('wellness_checkin', data);
            }
            setShowWellnessCheck(false);
          }}
        />
      )}
      
      {showEthicsMeaningCheck && (
        <EthicsMeaningCheckAccessible onClose={() => setShowEthicsMeaningCheck(false)} />
      )}
      
      {showInSessionSelfCheck && (
        <InSessionSelfCheck onClose={() => setShowInSessionSelfCheck(false)} />
      )}
      
      {showInSessionTeamSync && (
        <InSessionTeamSync onClose={() => setShowInSessionTeamSync(false)} />
      )}
      
      {showRoleSpaceReflection && (
        <RoleSpaceReflection onClose={() => setShowRoleSpaceReflection(false)} />
      )}
      
      {showDirectCommunication && (
        <DirectCommunicationReflection onClose={() => setShowDirectCommunication(false)} />
      )}
    </main>
  );
};