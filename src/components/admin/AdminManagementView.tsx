import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminRole, AdminStatus, AdminUser } from '../../types';
import {
  Users,
  ShieldCheck,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldAlert,
  Check,
  Copy,
  Crown,
  Sparkles,
  UserCheck,
  UserX,
  Loader2,
  X
} from 'lucide-react';

export const AdminManagementView: React.FC = () => {
  const {
    adminList,
    invitationList,
    currentUserRole,
    currentUserEmail,
    fetchAdmins,
    inviteAdmin,
    toggleAdminStatus,
    removeAdmin,
    revokeInvitation,
    showToast
  } = useApp();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('admin');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isOwner = currentUserRole === 'owner';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAdmins();
      showToast('Admin list refreshed', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInviting) return;

    if (!inviteEmail.trim()) {
      setInviteError('Please provide a valid email address.');
      return;
    }

    setInviteError(null);
    setIsInviting(true);
    try {
      const res = await inviteAdmin(inviteEmail.trim(), inviteName.trim(), inviteRole);
      if (res.success) {
        setIsInviteModalOpen(false);
        setInviteEmail('');
        setInviteName('');
        setInviteRole('admin');
      } else if (res.error) {
        setInviteError(res.error);
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyInviteLink = (email: string, id: string) => {
    const signupUrl = `${window.location.origin}#register`;
    navigator.clipboard.writeText(signupUrl);
    setCopiedId(id);
    showToast(`Invite sign-up link copied to clipboard!`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeAdminsCount = adminList.filter((a) => a.status === 'active').length;
  const pendingInvsCount = invitationList.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Team &amp; Administrator Management
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                isOwner
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-purple-100 text-purple-800 border border-purple-300'
              }`}
            >
              {isOwner ? <Crown className="w-3 h-3 text-amber-600" /> : <ShieldCheck className="w-3 h-3 text-purple-600" />}
              <span>You are {currentUserRole}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage who can access the Neel Hair dashboard, view analytics, and respond to feedback.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-600' : ''}`} />
          </button>

          {isOwner && (
            <button
              onClick={() => {
                setInviteError(null);
                setIsInviteModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite New Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Notice for non-owners */}
      {!isOwner && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed font-medium">
            <span className="font-bold">Administrator Access:</span> You are viewing the team roster with standard administrator privileges. Only the Neel Hair Primary Salon Owner can invite new team members, alter account permissions, deactivate accounts, or delete administrators.
          </div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Admins */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Administrators
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {adminList.length}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Registered staff accounts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Access
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {activeAdminsCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Currently permitted to log in</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Invites */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Invitations
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {pendingInvsCount}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Awaiting account completion</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Registered Administrators Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Registered Administrators</h3>
            <p className="text-xs text-slate-500">
              Accounts authorized to access the Neel Hair Admin Dashboard
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {adminList.length} {adminList.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        {adminList.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">No Administrators Found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once team members register or accept invitations, their details and status will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Administrator</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  {isOwner && <th className="py-3.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {adminList.map((admin) => {
                  const isCurrent = currentUserEmail?.toLowerCase() === admin.email.toLowerCase();
                  const isPrimaryOwner = admin.isOwner || admin.role === 'owner';

                  return (
                    <tr
                      key={admin.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        admin.status === 'deactivated' ? 'opacity-60 bg-slate-50/30' : ''
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                              isPrimaryOwner
                                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-white'
                                : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                            }`}
                          >
                            {admin.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{admin.fullName}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            isPrimaryOwner
                              ? 'bg-amber-100/80 text-amber-800 border border-amber-300/80'
                              : 'bg-purple-100/80 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {isPrimaryOwner ? (
                            <>
                              <Crown className="w-3.5 h-3.5 text-amber-600" />
                              <span>Owner</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>Admin</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            admin.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {admin.status === 'active' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Deactivated</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 text-xs text-slate-500 font-medium">
                        {admin.createdAt}
                      </td>

                      {/* Actions (Owner only) */}
                      {isOwner && (
                        <td className="py-4 px-5 text-right">
                          {isPrimaryOwner ? (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              Primary Owner (Permanent)
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {/* Deactivate / Activate button */}
                              <button
                                onClick={() => toggleAdminStatus(admin.id, admin.status)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  admin.status === 'active'
                                    ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold'
                                }`}
                                title={admin.status === 'active' ? 'Deactivate account' : 'Reactivate account'}
                              >
                                {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>

                              {/* Remove user button */}
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to remove ${admin.fullName} (${admin.email}) from the admin team?`)) {
                                    removeAdmin(admin.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Remove Administrator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pending Invitations</h3>
            <p className="text-xs text-slate-500">
              Invitations awaiting registration and password setup
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {pendingInvsCount} pending
          </span>
        </div>

        {invitationList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No pending invitations. When you invite new team members, they will be listed here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Invited Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Sent Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {invitationList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div>
                        {inv.email}
                        {inv.fullName && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {inv.fullName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                        {inv.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                          inv.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : inv.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {inv.createdAt}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleCopyInviteLink(inv.email, inv.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-all cursor-pointer"
                              title="Copy invite URL for user"
                            >
                              {copiedId === inv.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Link</span>
                                </>
                              )}
                            </button>

                            {isOwner && (
                              <button
                                onClick={() => {
                                  if (confirm(`Revoke invitation for ${inv.email}?`)) {
                                    revokeInvitation(inv.id);
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer"
                              >
                                Revoke
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Invite Administrator</h3>
                <p className="text-xs text-slate-500">
                  Grant secure dashboard access to trusted team members
                </p>
              </div>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-3 focus:ring-purple-100 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="staff@neelhair.com"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white focus:ring-3 focus:ring-purple-100 text-sm font-medium outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role &amp; Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-sm font-semibold outline-none transition-all"
                >
                  <option value="admin">Administrator (Manage Feedback, QR, Reviews)</option>
                  <option value="owner">Co-Owner (Full Permissions)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Administrators can view reviews, download QR codes and respond to feedback, but cannot invite or delete other admins.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
