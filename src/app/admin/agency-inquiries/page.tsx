'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, Building2, Users, Clock, CheckCircle, XCircle, MailIcon } from 'lucide-react';

interface AgencyInquiry {
  id: string;
  name: string;
  email: string;
  agency_name: string;
  team_size: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  created_at: string;
  contacted_at: string | null;
  notes: string | null;
}

export default function AgencyInquiriesAdmin() {
  const [inquiries, setInquiries] = useState<AgencyInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'contacted' | 'approved' | 'rejected'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    try {
      let query = supabase
        .from('agency_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inquiries:', error);
        return;
      }

      setInquiries(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: AgencyInquiry['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('agency_inquiries')
        .update({ 
          status, 
          notes: notes || null,
          contacted_at: status === 'contacted' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating inquiry:', error);
        return;
      }

      fetchInquiries();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: AgencyInquiry['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary dark:border-blue-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary dark:text-blue-300 mb-2 font-sans">
            Agency Inquiries
          </h1>
          <p className="text-brand-gray-600 dark:text-gray-400 font-body">
            Manage agency and team manager inquiries
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: inquiries.length, filter: 'all' as const },
            { label: 'Pending', value: inquiries.filter(i => i.status === 'pending').length, filter: 'pending' as const },
            { label: 'Contacted', value: inquiries.filter(i => i.status === 'contacted').length, filter: 'contacted' as const },
            { label: 'Approved', value: inquiries.filter(i => i.status === 'approved').length, filter: 'approved' as const }
          ].map(stat => (
            <button
              key={stat.label}
              onClick={() => setFilter(stat.filter)}
              className={`p-4 rounded-data border transition-all ${
                filter === stat.filter
                  ? 'border-brand-energy dark:border-orange-500 bg-brand-energy-light dark:bg-orange-400/20'
                  : 'border-brand-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-energy/50 dark:hover:border-orange-500/50'
              }`}
            >
              <div className="text-2xl font-bold text-brand-primary dark:text-blue-300 font-sans">{stat.value}</div>
              <div className="text-sm text-brand-gray-600 dark:text-gray-400 font-body">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Inquiries List */}
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-brand-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-brand-gray-600 dark:text-gray-400 font-body">No inquiries found</p>
            </div>
          ) : (
            inquiries.map(inquiry => (
              <div key={inquiry.id} className="bg-white dark:bg-gray-800 rounded-data shadow-card border border-brand-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-brand-primary dark:text-blue-300 font-sans">{inquiry.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-brand-gray-600 dark:text-gray-400 font-body">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {inquiry.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {inquiry.agency_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {inquiry.team_size}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-brand-gray-500 dark:text-gray-500 font-body">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(inquiry.created_at)}
                  </div>
                </div>

                {inquiry.message && (
                  <div className="mb-4">
                    <p className="text-sm text-brand-gray-700 dark:text-gray-300 font-body">{inquiry.message}</p>
                  </div>
                )}

                {inquiry.notes && (
                  <div className="mb-4 p-3 bg-brand-gray-50 dark:bg-gray-700 rounded-data">
                    <p className="text-sm text-brand-gray-600 dark:text-gray-400 font-body">
                      <strong>Notes:</strong> {inquiry.notes}
                  </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {inquiry.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(inquiry.id, 'contacted')}
                        className="px-3 py-1.5 bg-brand-energy dark:bg-orange-500 text-white rounded-data text-sm font-medium hover:bg-brand-energy-hover dark:hover:bg-orange-600 transition-colors flex items-center gap-1"
                      >
                        <MailIcon className="w-4 h-4" />
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Add notes for approval:');
                          if (notes !== null) {
                            updateStatus(inquiry.id, 'approved', notes);
                          }
                        }}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-data text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                    </>
                  )}
                  
                  {inquiry.status === 'contacted' && (
                    <button
                      onClick={() => {
                        const notes = prompt('Add notes for approval:');
                        if (notes !== null) {
                          updateStatus(inquiry.id, 'approved', notes);
                        }
                      }}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-data text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  
                  {(inquiry.status === 'pending' || inquiry.status === 'contacted') && (
                    <button
                      onClick={() => {
                        const notes = prompt('Add notes for rejection:');
                        if (notes !== null) {
                          updateStatus(inquiry.id, 'rejected', notes);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-data text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}