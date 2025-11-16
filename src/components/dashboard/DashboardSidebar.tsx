'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & insights',
  },
  {
    name: 'Readiness Check',
    href: '/dashboard/baseline',
    icon: Target,
    description: '2-minute pre-session calibration',
  },
  // Removed Skill Builders and renamed Performance Hub to Insights
  {
    name: 'Insights',
    href: '/dashboard/performance',
    icon: TrendingUp,
    description: 'Analytics & trends',
  },
  {
    name: 'Assignments',
    href: '/dashboard/assignments',
    icon: Calendar,
    description: 'Upcoming & history',
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r-2 border-brand-gray-200 fixed left-0 top-[73px] bottom-0 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-start gap-3 p-3 rounded-lg transition-all
                  ${isActive
                    ? 'bg-brand-electric-light text-brand-electric border-l-4 border-brand-electric'
                    : 'text-brand-gray-600 hover:bg-brand-gray-50 hover:text-brand-primary'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-brand-electric' : 'text-brand-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold font-body ${isActive ? 'text-brand-electric' : ''}`}>
                    {item.name}
                  </p>
                  <p className="text-xs text-brand-gray-500 font-body mt-0.5">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade CTA */}
        <div className="mt-8 p-4 bg-gradient-to-br from-brand-electric-light to-brand-energy-light rounded-lg border-2 border-brand-electric">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-energy rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-bold text-brand-primary font-sans">
              Upgrade to Pro
            </h3>
          </div>
          <p className="text-xs text-brand-gray-600 mb-3 font-body">
            Unlock advanced analytics, unlimited AI conversations, and priority support.
          </p>
          <Link
            href="/pricing"
            className="block text-center bg-brand-electric text-white text-xs font-bold py-2 px-4 rounded-lg hover:bg-brand-primary transition-colors font-body"
          >
            View Plans
          </Link>
        </div>
      </div>
    </aside>
  );
}
