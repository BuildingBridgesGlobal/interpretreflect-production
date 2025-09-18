import { useState } from 'react';

export interface ModalState {
  // Pre/Post Assignment
  showPreAssignmentPrep: boolean;
  showPostAssignmentDebrief: boolean;

  // Teaming
  showTeamingPrep: boolean;
  showTeamingReflection: boolean;

  // Mentoring
  showMentoringPrep: boolean;
  showMentoringReflection: boolean;

  // Wellness
  showWellnessCheckIn: boolean;
  showEthicsMeaningCheck: boolean;

  // In-Session
  showInSessionSelfCheck: boolean;
  showInSessionTeamSync: boolean;

  // Role & Communication
  showRoleSpaceReflection: boolean;
  showDirectCommunicationReflection: boolean;

  // Stress Reset Modals
  showBreathingPractice: boolean;
  showBreathingModal: boolean;
  showEmotionMappingModal: boolean;
  showBodyCheckIn: boolean;
  showBodyCheckInModal: boolean;
  showProfessionalBoundariesReset: boolean;
  showBoundariesWhyModal: boolean;
  showTemperatureExploration: boolean;
  showAssignmentReset: boolean;
  showAssignmentWhyModal: boolean;
  showTechnologyFatigueReset: boolean;
  showEmotionMapping: boolean;
  showAffirmationStudio: boolean;
  showFiveZoneModal: boolean;

  // Other
  showWelcomeModal: boolean;
}

export interface ModalActions {
  // Pre/Post Assignment
  setShowPreAssignmentPrep: (show: boolean) => void;
  setShowPostAssignmentDebrief: (show: boolean) => void;

  // Teaming
  setShowTeamingPrep: (show: boolean) => void;
  setShowTeamingReflection: (show: boolean) => void;

  // Mentoring
  setShowMentoringPrep: (show: boolean) => void;
  setShowMentoringReflection: (show: boolean) => void;

  // Wellness
  setShowWellnessCheckIn: (show: boolean) => void;
  setShowEthicsMeaningCheck: (show: boolean) => void;

  // In-Session
  setShowInSessionSelfCheck: (show: boolean) => void;
  setShowInSessionTeamSync: (show: boolean) => void;

  // Role & Communication
  setShowRoleSpaceReflection: (show: boolean) => void;
  setShowDirectCommunicationReflection: (show: boolean) => void;

  // Stress Reset Modals
  setShowBreathingPractice: (show: boolean) => void;
  setShowBreathingModal: (show: boolean) => void;
  setShowEmotionMappingModal: (show: boolean) => void;
  setShowBodyCheckIn: (show: boolean) => void;
  setShowBodyCheckInModal: (show: boolean) => void;
  setShowProfessionalBoundariesReset: (show: boolean) => void;
  setShowBoundariesWhyModal: (show: boolean) => void;
  setShowTemperatureExploration: (show: boolean) => void;
  setShowAssignmentReset: (show: boolean) => void;
  setShowAssignmentWhyModal: (show: boolean) => void;
  setShowTechnologyFatigueReset: (show: boolean) => void;
  setShowEmotionMapping: (show: boolean) => void;
  setShowAffirmationStudio: (show: boolean) => void;
  setShowFiveZoneModal: (show: boolean) => void;

  // Other
  setShowWelcomeModal: (show: boolean) => void;

  // Utility functions
  closeAllModals: () => void;
  isAnyModalOpen: () => boolean;
}

const initialModalState: ModalState = {
  // Pre/Post Assignment
  showPreAssignmentPrep: false,
  showPostAssignmentDebrief: false,

  // Teaming
  showTeamingPrep: false,
  showTeamingReflection: false,

  // Mentoring
  showMentoringPrep: false,
  showMentoringReflection: false,

  // Wellness
  showWellnessCheckIn: false,
  showEthicsMeaningCheck: false,

  // In-Session
  showInSessionSelfCheck: false,
  showInSessionTeamSync: false,

  // Role & Communication
  showRoleSpaceReflection: false,
  showDirectCommunicationReflection: false,

  // Stress Reset Modals
  showBreathingPractice: false,
  showBreathingModal: false,
  showEmotionMappingModal: false,
  showBodyCheckIn: false,
  showBodyCheckInModal: false,
  showProfessionalBoundariesReset: false,
  showBoundariesWhyModal: false,
  showTemperatureExploration: false,
  showAssignmentReset: false,
  showAssignmentWhyModal: false,
  showTechnologyFatigueReset: false,
  showEmotionMapping: false,
  showAffirmationStudio: false,
  showFiveZoneModal: false,

  // Other
  showWelcomeModal: false,
};

export const useModalState = (): ModalState & ModalActions => {
  const [modalState, setModalState] = useState<ModalState>(initialModalState);

  // Create setter functions for each modal
  const setters: ModalActions = {
    // Pre/Post Assignment
    setShowPreAssignmentPrep: (show: boolean) =>
      setModalState(prev => ({ ...prev, showPreAssignmentPrep: show })),
    setShowPostAssignmentDebrief: (show: boolean) =>
      setModalState(prev => ({ ...prev, showPostAssignmentDebrief: show })),

    // Teaming
    setShowTeamingPrep: (show: boolean) =>
      setModalState(prev => ({ ...prev, showTeamingPrep: show })),
    setShowTeamingReflection: (show: boolean) =>
      setModalState(prev => ({ ...prev, showTeamingReflection: show })),

    // Mentoring
    setShowMentoringPrep: (show: boolean) =>
      setModalState(prev => ({ ...prev, showMentoringPrep: show })),
    setShowMentoringReflection: (show: boolean) =>
      setModalState(prev => ({ ...prev, showMentoringReflection: show })),

    // Wellness
    setShowWellnessCheckIn: (show: boolean) =>
      setModalState(prev => ({ ...prev, showWellnessCheckIn: show })),
    setShowEthicsMeaningCheck: (show: boolean) =>
      setModalState(prev => ({ ...prev, showEthicsMeaningCheck: show })),

    // In-Session
    setShowInSessionSelfCheck: (show: boolean) =>
      setModalState(prev => ({ ...prev, showInSessionSelfCheck: show })),
    setShowInSessionTeamSync: (show: boolean) =>
      setModalState(prev => ({ ...prev, showInSessionTeamSync: show })),

    // Role & Communication
    setShowRoleSpaceReflection: (show: boolean) =>
      setModalState(prev => ({ ...prev, showRoleSpaceReflection: show })),
    setShowDirectCommunicationReflection: (show: boolean) =>
      setModalState(prev => ({ ...prev, showDirectCommunicationReflection: show })),

    // Stress Reset Modals
    setShowBreathingPractice: (show: boolean) =>
      setModalState(prev => ({ ...prev, showBreathingPractice: show })),
    setShowBreathingModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showBreathingModal: show })),
    setShowEmotionMappingModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showEmotionMappingModal: show })),
    setShowBodyCheckIn: (show: boolean) =>
      setModalState(prev => ({ ...prev, showBodyCheckIn: show })),
    setShowBodyCheckInModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showBodyCheckInModal: show })),
    setShowProfessionalBoundariesReset: (show: boolean) =>
      setModalState(prev => ({ ...prev, showProfessionalBoundariesReset: show })),
    setShowBoundariesWhyModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showBoundariesWhyModal: show })),
    setShowTemperatureExploration: (show: boolean) =>
      setModalState(prev => ({ ...prev, showTemperatureExploration: show })),
    setShowAssignmentReset: (show: boolean) =>
      setModalState(prev => ({ ...prev, showAssignmentReset: show })),
    setShowAssignmentWhyModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showAssignmentWhyModal: show })),
    setShowTechnologyFatigueReset: (show: boolean) =>
      setModalState(prev => ({ ...prev, showTechnologyFatigueReset: show })),
    setShowEmotionMapping: (show: boolean) =>
      setModalState(prev => ({ ...prev, showEmotionMapping: show })),
    setShowAffirmationStudio: (show: boolean) =>
      setModalState(prev => ({ ...prev, showAffirmationStudio: show })),
    setShowFiveZoneModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showFiveZoneModal: show })),

    // Other
    setShowWelcomeModal: (show: boolean) =>
      setModalState(prev => ({ ...prev, showWelcomeModal: show })),

    // Utility functions
    closeAllModals: () => setModalState(initialModalState),

    isAnyModalOpen: () => {
      return Object.values(modalState).some(value => value === true);
    },
  };

  return {
    ...modalState,
    ...setters,
  };
};

export default useModalState;