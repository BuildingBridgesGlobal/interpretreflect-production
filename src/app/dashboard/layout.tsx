import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-gray-50">
      {/* Top Navigation */}
      <DashboardNav />

      <div className="flex">
        {/* Sidebar Navigation */}
        <DashboardSidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
