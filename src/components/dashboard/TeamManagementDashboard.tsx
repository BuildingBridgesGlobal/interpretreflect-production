'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Users, TrendingUp, AlertTriangle, CheckCircle, Eye, Shield, UserPlus,
  BarChart3, Calendar, Clock, MapPin, Filter, Search, Download,
  Settings, Mail, MessageSquare, UserCheck, Activity, Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'interpreter' | 'supervisor' | 'admin';
  status: 'active' | 'inactive';
  last_activity: string;
  eri_score: number;
  eri_band: 'stable' | 'watch' | 'at_risk';
  assignment_count: number;
  specialization: string[];
  burnout_risk: 'low' | 'medium' | 'high';
}

interface TeamAnalytics {
  total_members: number;
  active_interpreters: number;
  avg_eri_score: number;
  at_risk_count: number;
  high_burnout_risk: number;
  recent_assignments: number;
}

interface AssignmentPattern {
  interpreter_id: string;
  pattern_type: 'high_performer' | 'at_risk' | 'recovering' | 'consistent';
  confidence: number;
  recommendations: string[];
}

export function TeamManagementDashboard({ userId, userRole }: { 
  userId: string; 
  userRole: 'supervisor' | 'admin' | 'interpreter';
}) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamAnalytics, setTeamAnalytics] = useState<TeamAnalytics | null>(null);
  const [assignmentPatterns, setAssignmentPatterns] = useState<AssignmentPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const supabase = createClient();

  const loadTeamData = async () => {
    try {
      // Load team members based on user role
      let query = supabase
        .from('users')
        .select(`
          id,
          email,
          raw_user_meta_data->full_name as full_name,
          raw_user_meta_data->role as role,
          raw_user_meta_data->specializations as specialization,
          created_at,
          last_sign_in_at
        `);

      if (userRole === 'supervisor') {
        // Load only interpreters under this supervisor
        query = query.eq('raw_user_meta_data->supervisor_id', userId);
      }

      const { data: members, error: membersError } = await query;

      if (!membersError && members) {
        // Load ERI data for each member
        const membersWithEri = await Promise.all(
          members.map(async (member) => {
            const { data: eriData } = await supabase
              .from('user_eri')
              .select('eri_score_rounded, eri_band, assignment_count')
              .eq('user_id', member.id)
              .single();

            const { data: burnoutData } = await supabase
              .from('assignment_eri')
              .select('post_strain_score, recovery_reflection_score')
              .eq('user_id', member.id)
              .order('assignment_date', { ascending: false })
              .limit(5);

            // Calculate burnout risk
            let burnout_risk: 'low' | 'medium' | 'high' = 'low';
            if (burnoutData && burnoutData.length > 0) {
              const avgStrain = burnoutData.reduce((sum, item) => sum + item.post_strain_score, 0) / burnoutData.length;
              const avgRecovery = burnoutData.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / burnoutData.length;
              
              if (avgStrain > 0.7 && avgRecovery < 0.3) burnout_risk = 'high';
              else if (avgStrain > 0.5 && avgRecovery < 0.4) burnout_risk = 'medium';
            }

            return {
              id: member.id,
              email: member.email,
              full_name: member.full_name || member.email.split('@')[0],
              role: member.role || 'interpreter',
              status: member.last_sign_in_at ? 'active' : 'inactive',
              last_activity: member.last_sign_in_at || member.created_at,
              eri_score: eriData?.eri_score_rounded || 0,
              eri_band: eriData?.eri_band || 'insufficient_data',
              assignment_count: eriData?.assignment_count || 0,
              specialization: member.specialization || [],
              burnout_risk
            };
          })
        );

        setTeamMembers(membersWithEri);

        // Calculate team analytics
        const analytics: TeamAnalytics = {
          total_members: membersWithEri.length,
          active_interpreters: membersWithEri.filter(m => m.status === 'active').length,
          avg_eri_score: Math.round(membersWithEri.reduce((sum, m) => sum + m.eri_score, 0) / membersWithEri.length),
          at_risk_count: membersWithEri.filter(m => m.eri_band === 'at_risk').length,
          high_burnout_risk: membersWithEri.filter(m => m.burnout_risk === 'high').length,
          recent_assignments: membersWithEri.reduce((sum, m) => sum + m.assignment_count, 0)
        };

        setTeamAnalytics(analytics);

        // Analyze assignment patterns
        const patterns = await analyzeAssignmentPatterns(membersWithEri);
        setAssignmentPatterns(patterns);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAssignmentPatterns = async (members: TeamMember[]): Promise<AssignmentPattern[]> => {
    const patterns: AssignmentPattern[] = [];

    for (const member of members) {
      if (member.assignment_count < 5) continue;

      const { data: recentAssignments } = await supabase
        .from('assignment_eri')
        .select('eri_assign_score, post_strain_score, recovery_reflection_score')
        .eq('user_id', member.id)
        .order('assignment_date', { ascending: false })
        .limit(10);

      if (!recentAssignments || recentAssignments.length < 5) continue;

      const avgEri = recentAssignments.reduce((sum, item) => sum + item.eri_assign_score, 0) / recentAssignments.length;
      const eriTrend = recentAssignments.slice(-5).reduce((sum, item, i, arr) => {
        if (i === 0) return 0;
        return sum + (item.eri_assign_score - arr[i-1].eri_assign_score);
      }, 0) / 4;

      const avgStrain = recentAssignments.reduce((sum, item) => sum + item.post_strain_score, 0) / recentAssignments.length;
      const avgRecovery = recentAssignments.reduce((sum, item) => sum + item.recovery_reflection_score, 0) / recentAssignments.length;

      let pattern_type: AssignmentPattern['pattern_type'] = 'consistent';
      let confidence = 75;
      let recommendations: string[] = [];

      if (avgEri >= 80 && eriTrend >= 0) {
        pattern_type = 'high_performer';
        confidence = 90;
        recommendations = [
          'Consider for mentoring role',
          'Maintain current workload',
          'Share best practices with team'
        ];
      } else if (avgEri < 60 && eriTrend < 0) {
        pattern_type = 'at_risk';
        confidence = 85;
        recommendations = [
          'Schedule immediate check-in',
          'Reduce assignment complexity',
          'Provide additional support',
          'Consider workload adjustment'
        ];
      } else if (avgEri < 60 && eriTrend >= 0) {
        pattern_type = 'recovering';
        confidence = 80;
        recommendations = [
          'Continue current support',
          'Monitor progress closely',
          'Gradually increase complexity',
          'Celebrate improvements'
        ];
      } else {
        recommendations = [
          'Maintain balanced workload',
          'Continue regular check-ins',
          'Look for optimization opportunities'
        ];
      }

      patterns.push({
        interpreter_id: member.id,
        pattern_type,
        confidence,
        recommendations
      });
    }

    return patterns;
  };

  useEffect(() => {
    loadTeamData();
  }, [userId, userRole]);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'at_risk' && member.eri_band === 'at_risk') ||
                       (riskFilter === 'high_burnout' && member.burnout_risk === 'high') ||
                       (riskFilter === 'stable' && member.eri_band === 'stable');
    
    return matchesSearch && matchesRole && matchesRisk;
  });

  const exportTeamData = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'ERI Score', 'ERI Band', 'Assignments', 'Burnout Risk', 'Status', 'Last Activity'],
      ...filteredMembers.map(member => [
        member.full_name,
        member.email,
        member.role,
        member.eri_score,
        member.eri_band,
        member.assignment_count,
        member.burnout_risk,
        member.status,
        new Date(member.last_activity).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-electric border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-brand-gray-600">Loading team data...</span>
        </div>
      </div>
    );
  }

  if (userRole === 'interpreter') {
    return (
      <div className="bg-white rounded-data shadow-card p-8 border border-brand-gray-200">
        <div className="text-center">
          <Shield className="w-12 h-12 text-brand-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-primary mb-2">Access Restricted</h3>
          <p className="text-brand-gray-600">Team management features are only available for supervisors and administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview Cards */}
      {teamAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-600">Total Team Members</p>
                <p className="text-2xl font-bold text-brand-primary">{teamAnalytics.total_members}</p>
              </div>
              <Users className="w-8 h-8 text-brand-electric" />
            </div>
          </div>

          <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-600">Average ERI Score</p>
                <p className="text-2xl font-bold text-brand-primary">{teamAnalytics.avg_eri_score}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-600">At Risk Interpreters</p>
                <p className="text-2xl font-bold text-red-600">{teamAnalytics.at_risk_count}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray-600">High Burnout Risk</p>
                <p className="text-2xl font-bold text-orange-600">{teamAnalytics.high_burnout_risk}</p>
              </div>
              <Activity className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-data shadow-card p-6 border border-brand-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="interpreter">Interpreters</option>
              <option value="supervisor">Supervisors</option>
              <option value="admin">Administrators</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-electric focus:border-transparent"
            >
              <option value="all">All Risk Levels</option>
              <option value="at_risk">At Risk</option>
              <option value="high_burnout">High Burnout</option>
              <option value="stable">Stable</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportTeamData}
              className="flex items-center gap-2 px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            
            {userRole === 'admin' && (
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                <UserPlus className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-data shadow-card border border-brand-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Team Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">ERI Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Assignments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Burnout Risk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-brand-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-brand-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-brand-primary">{member.full_name}</div>
                    <div className="text-sm text-brand-gray-500">{member.email}</div>
                  </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      member.role === 'admin' ? 'bg-red-100 text-red-800' :
                      member.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{member.eri_score}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        member.eri_band === 'stable' ? 'bg-green-100 text-green-800' :
                        member.eri_band === 'watch' ? 'bg-yellow-100 text-yellow-800' :
                        member.eri_band === 'at_risk' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.eri_band?.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gray-500">
                    {member.assignment_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.burnout_risk === 'low' ? 'bg-green-100 text-green-800' :
                      member.burnout_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.burnout_risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="text-brand-electric hover:text-brand-electric-hover"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-brand-gray-400 hover:text-brand-gray-600">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-data shadow-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-brand-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-brand-primary">{selectedMember.full_name}</h3>
                  <p className="text-sm text-brand-gray-600">{selectedMember.email}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-brand-gray-400 hover:text-brand-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Performance Summary */}
              <div>
                <h4 className="font-semibold text-brand-primary mb-3">Performance Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-brand-gray-50 rounded-lg p-4">
                    <div className="text-sm text-brand-gray-600">ERI Score</div>
                    <div className="text-2xl font-bold text-brand-primary">{selectedMember.eri_score}</div>
                  </div>
                  <div className="bg-brand-gray-50 rounded-lg p-4">
                    <div className="text-sm text-brand-gray-600">Assignments</div>
                    <div className="text-2xl font-bold text-brand-primary">{selectedMember.assignment_count}</div>
                  </div>
                </div>
              </div>

              {/* Pattern Analysis */}
              <div>
                <h4 className="font-semibold text-brand-primary mb-3">Assignment Pattern</h4>
                {assignmentPatterns
                  .filter(pattern => pattern.interpreter_id === selectedMember.id)
                  .map(pattern => (
                    <div key={pattern.interpreter_id} className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          {pattern.pattern_type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                          {pattern.confidence}% confidence
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {pattern.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-electric text-white rounded-lg hover:bg-brand-electric-hover transition-colors">
                  <UserCheck className="w-4 h-4" />
                  Schedule Check-in
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-brand-gray-100 text-brand-primary rounded-lg hover:bg-brand-gray-200 transition-colors">
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}