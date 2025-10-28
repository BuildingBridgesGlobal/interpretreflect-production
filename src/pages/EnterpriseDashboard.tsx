import { Activity, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationRole } from '../hooks/useOrganizationRole';
import { organizationService, OrganizationMetrics, OrganizationAlert } from '../services/organizationService';

export const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const { isOrgAdmin, organizations, loading: roleLoading } = useOrganizationRole();
  
  const [metrics, setMetrics] = useState<OrganizationMetrics | null>(null);
  const [alerts, setAlerts] = useState<OrganizationAlert[]>([]);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not an org admin
    if (!roleLoading && !isOrgAdmin) {
      navigate('/');
      return;
    }

    // Load data if user is admin
    if (!roleLoading && isOrgAdmin && organizations.length > 0) {
      loadDashboardData(organizations[0].id);
    }
  }, [roleLoading, isOrgAdmin, organizations, navigate]);

  const loadDashboardData = async (orgId: string) => {
    setLoading(true);
    try {
      // Load organization details
      const org = await organizationService.getOrganization(orgId);
      if (org) {
        setOrgName(org.name);
      }

      // Load latest metrics
      const latestMetrics = await organizationService.getLatestMetrics(orgId);
      if (latestMetrics) {
        setMetrics(latestMetrics);
      }

      // Load recent alerts
      const recentAlerts = await organizationService.getRecentAlerts(orgId, 10);
      setAlerts(recentAlerts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B8268' }}></div>
          <p style={{ color: '#6B8268' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if team size is below minimum (5 members)
  const minimumTeamSize = 5;
  const hasEnoughMembers = (metrics?.totalMembers || 0) >= minimumTeamSize;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#2D3748' }}>
            Team Dashboard
          </h1>
          <p className="text-lg" style={{ color: '#6B8268' }}>
            {orgName}
          </p>
          <p className="text-sm mt-1" style={{ color: '#718096' }}>
            Aggregate wellness metrics for your interpreter team
          </p>
        </div>

        {/* Insufficient Data Warning */}
        {!hasEnoughMembers && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#92400E' }}>
                  Insufficient Team Size
                </h3>
                <p className="text-sm" style={{ color: '#92400E' }}>
                  Your team needs at least {minimumTeamSize} active members to display aggregate metrics (currently {metrics?.totalMembers || 0}). 
                  This ensures individual privacy and meaningful data analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Team Size Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8" style={{ color: '#6B8268' }} />
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#718096' }}>
              Team Size
            </h3>
            <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
              {metrics?.totalMembers || 0}
            </p>
            <p className="text-xs mt-2" style={{ color: '#A0AEC0' }}>
              {metrics?.activeMembers || 0} active this week
            </p>
          </div>

          {/* Average Burnout Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8" style={{ color: '#EF4444' }} />
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#718096' }}>
              Avg Burnout Risk
            </h3>
            {hasEnoughMembers ? (
              <>
                <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                  {metrics?.avgBurnoutScore.toFixed(0) || 0}%
                </p>
                <p className="text-xs mt-2" style={{ color: '#A0AEC0' }}>
                  {metrics?.highBurnoutCount || 0} members above 70%
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#A0AEC0' }}>Data hidden</p>
            )}
          </div>

          {/* Average Confidence Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" style={{ color: '#10B981' }} />
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#718096' }}>
              Avg Confidence
            </h3>
            {hasEnoughMembers ? (
              <>
                <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                  {metrics?.avgConfidenceLevel.toFixed(0) || 0}%
                </p>
                <p className="text-xs mt-2" style={{ color: '#A0AEC0' }}>
                  {metrics?.lowConfidenceCount || 0} members below 30%
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#A0AEC0' }}>Data hidden</p>
            )}
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8" style={{ color: '#6B8268' }} />
            </div>
            <h3 className="text-sm font-medium mb-1" style={{ color: '#718096' }}>
              Weekly Activity
            </h3>
            {hasEnoughMembers ? (
              <>
                <p className="text-3xl font-bold" style={{ color: '#2D3748' }}>
                  {(metrics?.totalReflections || 0) + (metrics?.totalStressResets || 0)}
                </p>
                <p className="text-xs mt-2" style={{ color: '#A0AEC0' }}>
                  {metrics?.totalReflections || 0} reflections, {metrics?.totalStressResets || 0} stress resets
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: '#A0AEC0' }}>Data hidden</p>
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        {hasEnoughMembers && alerts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#2D3748' }}>
              Recent Alerts
            </h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: alert.severity === 'critical' ? '#FEF2F2' : alert.severity === 'warning' ? '#FEF3C7' : '#F0FDF4',
                    borderColor: alert.severity === 'critical' ? '#FCA5A5' : alert.severity === 'warning' ? '#FCD34D' : '#86EFAC'
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="w-5 h-5 flex-shrink-0 mt-0.5"
                      style={{
                        color: alert.severity === 'critical' ? '#DC2626' : alert.severity === 'warning' ? '#D97706' : '#059669'
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1" style={{ color: '#2D3748' }}>
                        {alert.title}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: '#4B5563' }}>
                        {alert.message}
                      </p>
                      {alert.actionItems.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                            Suggested Actions:
                          </p>
                          <ul className="list-disc list-inside text-xs space-y-1" style={{ color: '#6B7280' }}>
                            {alert.actionItems.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Alerts Message */}
        {hasEnoughMembers && alerts.length === 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm text-center">
            <p style={{ color: '#A0AEC0' }}>No alerts at this time. Your team is doing well! 🎉</p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'rgba(107, 130, 104, 0.1)', border: '1px solid rgba(107, 130, 104, 0.2)' }}>
          <p className="text-xs" style={{ color: '#6B8268' }}>
            🔒 <strong>Privacy Notice:</strong> This dashboard shows aggregate data only. Individual interpreter information is never displayed. 
            All team members have consented to aggregate data tracking for wellness monitoring purposes.
          </p>
        </div>
      </div>
    </div>
  );
};
