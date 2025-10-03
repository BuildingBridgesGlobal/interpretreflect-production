import { AlertCircle, CheckCircle, DollarSign, TrendingDown, TrendingUp, Users, XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

interface SubscriptionMetrics {
  totalActive: number;
  totalCancelled: number;
  totalPastDue: number;
  totalRevenue: number;
  recentCancellations: Array<{
    email: string;
    date: string;
    reason: string;
  }>;
  failedPayments: Array<{
    email: string;
    amount: number;
    attempts: number;
    nextRetry: string;
  }>;
  reconciliationIssues: Array<{
    email: string;
    issue: string;
    stripeStatus: string;
    supabaseStatus: string;
  }>;
}

export const AdminSubscriptionDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (!profile?.is_admin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadMetrics();
    } catch (error) {
      console.error("Error checking admin status:", error);
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      // Get subscription status counts
      const { data: statusCounts } = await supabase
        .from("subscription_status_summary")
        .select("*");

      // Get recent cancellations
      const { data: cancellations } = await supabase
        .from("recent_cancellations")
        .select("*")
        .limit(5);

      // Get payment issues
      const { data: paymentIssues } = await supabase
        .from("payment_issues")
        .select("*")
        .limit(10);

      // Get reconciliation issues
      const { data: reconciliation } = await supabase
        .from("subscription_reconciliation")
        .select("*")
        .eq("resolution_status", "pending")
        .limit(10);

      // Calculate total revenue (simplified)
      const { data: activeUsers } = await supabase
        .from("profiles")
        .select("subscription_tier, subscription_interval")
        .eq("subscription_status", "active");

      let totalRevenue = 0;
      activeUsers?.forEach(user => {
        if (user.subscription_interval === "month") {
          totalRevenue += 12.99;
        } else if (user.subscription_interval === "year") {
          totalRevenue += 125 / 12; // Monthly equivalent
        }
      });

      // Parse the data
      const totals = statusCounts?.reduce((acc, row) => ({
        active: acc.active + (row.subscription_status === "active" ? row.count : 0),
        cancelled: acc.cancelled + (row.subscription_status === "cancelled" ? row.count : 0),
        pastDue: acc.pastDue + (row.subscription_status === "past_due" ? row.count : 0),
      }), { active: 0, cancelled: 0, pastDue: 0 });

      setMetrics({
        totalActive: totals?.active || 0,
        totalCancelled: totals?.cancelled || 0,
        totalPastDue: totals?.pastDue || 0,
        totalRevenue: totalRevenue,
        recentCancellations: cancellations?.map(c => ({
          email: c.email,
          date: new Date(c.cancellation_date).toLocaleDateString(),
          reason: c.cancellation_reason || "Not provided"
        })) || [],
        failedPayments: paymentIssues?.map(p => ({
          email: p.email,
          amount: p.amount || 12.99,
          attempts: p.payment_retry_count || 0,
          nextRetry: p.next_retry_date
            ? new Date(p.next_retry_date).toLocaleDateString()
            : "Manual intervention needed"
        })) || [],
        reconciliationIssues: reconciliation?.map(r => ({
          email: r.email,
          issue: r.mismatch_type,
          stripeStatus: r.stripe_status,
          supabaseStatus: r.supabase_status
        })) || []
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const runReconciliation = async () => {
    try {
      // This would trigger your reconciliation workflow
      const { error } = await supabase.functions.invoke("reconcile-subscriptions");
      if (!error) {
        await loadMetrics(); // Refresh data
      }
    } catch (error) {
      console.error("Error running reconciliation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-gray-600 mt-2">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Subscription Health Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor subscription status and payment issues
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Subscriptions"
            value={metrics?.totalActive || 0}
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            trend="up"
            color="green"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${metrics?.totalRevenue.toFixed(2)}`}
            icon={<DollarSign className="w-6 h-6 text-blue-500" />}
            trend="up"
            color="blue"
          />
          <MetricCard
            title="Past Due"
            value={metrics?.totalPastDue || 0}
            icon={<AlertCircle className="w-6 h-6 text-yellow-500" />}
            trend="down"
            color="yellow"
          />
          <MetricCard
            title="Cancelled"
            value={metrics?.totalCancelled || 0}
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            trend="down"
            color="red"
          />
        </div>

        {/* Issues Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Failed Payments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
              Failed Payments
            </h2>
            {metrics?.failedPayments.length === 0 ? (
              <p className="text-gray-500">No failed payments 🎉</p>
            ) : (
              <div className="space-y-3">
                {metrics?.failedPayments.map((payment, idx) => (
                  <div key={idx} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{payment.email}</span>
                      <span className="text-sm text-gray-600">
                        ${payment.amount}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Attempts: {payment.attempts} | Next: {payment.nextRetry}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Cancellations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
              Recent Cancellations
            </h2>
            {metrics?.recentCancellations.length === 0 ? (
              <p className="text-gray-500">No recent cancellations</p>
            ) : (
              <div className="space-y-3">
                {metrics?.recentCancellations.map((cancel, idx) => (
                  <div key={idx} className="border-l-4 border-red-400 pl-4 py-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{cancel.email}</span>
                      <span className="text-xs text-gray-500">{cancel.date}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Reason: {cancel.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reconciliation Issues */}
        {metrics?.reconciliationIssues && metrics.reconciliationIssues.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Sync Issues Requiring Attention
              </h2>
              <button
                onClick={runReconciliation}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Run Reconciliation
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Issue</th>
                    <th className="text-left py-2">Stripe Status</th>
                    <th className="text-left py-2">Supabase Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.reconciliationIssues.map((issue, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{issue.email}</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                          {issue.issue}
                        </span>
                      </td>
                      <td className="py-2">{issue.stripeStatus}</td>
                      <td className="py-2">{issue.supabaseStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={loadMetrics}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Data
          </button>
          <button
            onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Open Stripe Dashboard
          </button>
          <button
            onClick={() => window.open("https://connect.pabbly.com", "_blank")}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Open Pabbly Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down";
  color: string;
}> = ({ title, value, icon, trend, color }) => {
  const trendIcon = trend === "up" ? (
    <TrendingUp className="w-4 h-4 text-green-500" />
  ) : trend === "down" ? (
    <TrendingDown className="w-4 h-4 text-red-500" />
  ) : null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        {icon}
        {trendIcon}
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default AdminSubscriptionDashboard;