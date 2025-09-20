import { supabase } from '../lib/supabase';

export class UserDataLoader {
  static async loadUserData(userId: string): Promise<void> {
    try {
      console.log('Loading user data from Supabase...');
      
      // Load user preferences
      await this.loadPreferences(userId);
      
      // Load reflections
      await this.loadReflections(userId);
      
      // Load body check-in data
      await this.loadBodyCheckIns(userId);
      
      // Load technique usage
      await this.loadTechniqueUsage(userId);
      
      // Load burnout assessments
      await this.loadBurnoutAssessments(userId);
      
      // Load other user-specific data
      await this.loadAffirmations(userId);
      await this.loadSessions(userId);
      
      console.log('User data loaded successfully from Supabase');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private static async loadPreferences(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        data.forEach(pref => {
          if (pref.preference_type === 'breathing_accessibility') {
            localStorage.setItem('breathingAccessibilityPrefs', JSON.stringify(pref.preferences));
          } else if (pref.preference_type === 'emotional_proximity') {
            localStorage.setItem('emotionalProximityPrefs', JSON.stringify(pref.preferences));
          } else if (pref.preference_type === 'code_switch') {
            localStorage.setItem('codeSwitchResetPrefs', JSON.stringify(pref.preferences));
          } else if (pref.preference_type === 'temperature_exploration') {
            localStorage.setItem('temperaturePrefs', JSON.stringify(pref.preferences));
          }
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  private static async loadReflections(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        localStorage.setItem('savedReflections', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
    }
  }

  private static async loadBodyCheckIns(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('body_check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        localStorage.setItem('bodyCheckInData', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading body check-ins:', error);
    }
  }

  private static async loadTechniqueUsage(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('technique_usage')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        localStorage.setItem('techniqueUsage', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading technique usage:', error);
    }
  }

  private static async loadBurnoutAssessments(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('burnout_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        localStorage.setItem('burnoutAssessments', JSON.stringify(data));
        
        // Check for today's assessment
        const today = new Date().toISOString().split('T')[0];
        const todaysAssessment = data.find(a => a.assessment_date === today);
        if (todaysAssessment) {
          localStorage.setItem('todaysBurnoutAssessment', JSON.stringify(todaysAssessment));
          localStorage.setItem('lastAssessmentDate', new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Error loading burnout assessments:', error);
    }
  }

  private static async loadAffirmations(userId: string): Promise<void> {
    try {
      // Load recent affirmations
      const { data: affirmations, error: affError } = await supabase
        .from('affirmations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (affError) throw affError;

      if (affirmations && affirmations.length > 0) {
        const daily = affirmations.find(a => a.affirmation_type === 'daily');
        if (daily) {
          localStorage.setItem('dailyAffirmation', JSON.stringify(daily.content));
        }
        
        const recent = affirmations
          .filter(a => a.affirmation_type === 'recent')
          .map(a => a.content);
        if (recent.length > 0) {
          localStorage.setItem('recentAffirmations', JSON.stringify(recent));
        }
      }

      // Load favorite affirmations
      const { data: favorites, error: favError } = await supabase
        .from('affirmation_favorites')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (!favError && favorites) {
        localStorage.setItem('affirmationFavorites', JSON.stringify(favorites.favorites));
      }
    } catch (error) {
      console.error('Error loading affirmations:', error);
    }
  }

  private static async loadSessions(userId: string): Promise<void> {
    try {
      // Load body awareness sessions
      const { data: bodyAwareness, error: bodyError } = await supabase
        .from('body_awareness_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!bodyError && bodyAwareness) {
        const v1Sessions = bodyAwareness.filter(s => s.version === 'v1');
        const v2Sessions = bodyAwareness.filter(s => s.version === 'v2');
        
        if (v1Sessions.length > 0) {
          localStorage.setItem('bodyAwarenessSessions', JSON.stringify(v1Sessions));
        }
        if (v2Sessions.length > 0) {
          localStorage.setItem('bodyAwarenessV2Sessions', JSON.stringify(v2Sessions));
        }
      }

      // Load boundaries sessions
      const { data: boundaries, error: boundError } = await supabase
        .from('boundaries_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!boundError && boundaries && boundaries.length > 0) {
        localStorage.setItem('boundariesSessions', JSON.stringify(boundaries));
      }

      // Load emotional proximity sessions
      const { data: emotional, error: emotError } = await supabase
        .from('emotional_proximity_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!emotError && emotional && emotional.length > 0) {
        localStorage.setItem('emotionalProximitySessions', JSON.stringify(emotional));
      }

      // Load code switch sessions
      const { data: codeSwitch, error: codeError } = await supabase
        .from('code_switch_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!codeError && codeSwitch && codeSwitch.length > 0) {
        localStorage.setItem('codeSwitchSessions', JSON.stringify(codeSwitch));
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  static async loadAssignmentData(userId: string): Promise<void> {
    try {
      // Load pre-assignment prep
      const { data: prep, error: prepError } = await supabase
        .from('assignment_prep')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!prepError && prep && prep.length > 0) {
        localStorage.setItem('lastPreAssignmentPrep', JSON.stringify(prep[0]));
      }

      // Load post-assignment debriefs
      const { data: debriefs, error: debriefError } = await supabase
        .from('assignment_debriefs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!debriefError && debriefs && debriefs.length > 0) {
        localStorage.setItem('postAssignmentDebriefs', JSON.stringify(debriefs));
      }
    } catch (error) {
      console.error('Error loading assignment data:', error);
    }
  }

  static async loadWellnessCheckIns(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('wellness_check_ins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        localStorage.setItem('wellnessCheckInDraft', JSON.stringify(data[0]));
      }
    } catch (error) {
      console.error('Error loading wellness check-ins:', error);
    }
  }
}