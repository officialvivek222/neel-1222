import { createClient } from '@supabase/supabase-js';
import {
  BusinessSettings,
  FeedbackItem,
  FeedbackStatus,
  ActivityPoint,
  AdminRole,
  AdminStatus,
  AdminUser,
  AdminInvitation,
  CustomerEnquiry,
  EnquiryStatus
} from '../types';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Strip any accidental trailing /rest/v1/ or slashes
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// ============================================================================
// 1. BUSINESS SETTINGS & OWNER BINDING
// ============================================================================

export async function getDbBusinessSettings(): Promise<{ settings: BusinessSettings; businessId: string } | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      if (error && error.code !== 'PGRST116') {
        console.warn('Note: Could not load businesses from Supabase:', error.message);
      }
      return null;
    }

    // Cache the businessId locally for instant access across components
    try {
      localStorage.setItem('neel_business_id', data.id);
    } catch {
      // ignore
    }

    const reviewUrl = (data.google_review_url || data.google_review_link || '').trim();

    return {
      businessId: data.id,
      settings: {
        businessName: data.name || 'Neel Hair',
        tagline: data.tagline || 'Hair • Style • Grooming',
        category: data.category || 'Hair Salon / Barber Shop',
        contactNumber: data.contact_number || '+91 87674 70988',
        businessAddress: data.address || 'Ozar, Nashik, Maharashtra',
        logoUrl: data.logo_url || '',
        googleReviewUrl: reviewUrl,
        googleReviewLink: reviewUrl,
        showGoogleReviewButton: data.show_google_review_btn ?? true,
        showFeedbackForm: data.show_feedback_form ?? true,
        qrDestinationUrl: data.qr_destination_url || (typeof window !== 'undefined' ? window.location.origin : 'https://reviewtap.in/neel-hair'),
        qrStyle: data.qr_style || 'classic',
        centerLogoUrl: data.center_logo_url || '',
        ownerId: data.owner_id || null,
        ownerEmail: data.owner_email || null
      }
    };
  } catch (err) {
    console.warn('Error connecting to Supabase businesses:', err);
    return null;
  }
}

export async function saveDbBusinessSettings(businessId: string, settings: Partial<BusinessSettings>): Promise<boolean> {
  if (!supabase) return false;

  try {
    const updatePayload: Record<string, any> = {};
    if (settings.businessName !== undefined) updatePayload.name = settings.businessName;
    if (settings.tagline !== undefined) updatePayload.tagline = settings.tagline;
    if (settings.category !== undefined) updatePayload.category = settings.category;
    if (settings.contactNumber !== undefined) updatePayload.contact_number = settings.contactNumber;
    if (settings.businessAddress !== undefined) updatePayload.address = settings.businessAddress;
    
    // Support both google_review_url and google_review_link
    if (settings.googleReviewUrl !== undefined || settings.googleReviewLink !== undefined) {
      const url = (settings.googleReviewUrl ?? settings.googleReviewLink ?? '').trim();
      updatePayload.google_review_link = url;
      updatePayload.google_review_url = url;
    }

    if (settings.showGoogleReviewButton !== undefined) updatePayload.show_google_review_btn = settings.showGoogleReviewButton;
    if (settings.showFeedbackForm !== undefined) updatePayload.show_feedback_form = settings.showFeedbackForm;
    if (settings.qrDestinationUrl !== undefined) updatePayload.qr_destination_url = settings.qrDestinationUrl;
    if (settings.qrStyle !== undefined) updatePayload.qr_style = settings.qrStyle;
    if (settings.centerLogoUrl !== undefined) updatePayload.center_logo_url = settings.centerLogoUrl;
    if (settings.ownerId !== undefined) updatePayload.owner_id = settings.ownerId;
    if (settings.ownerEmail !== undefined) updatePayload.owner_email = settings.ownerEmail;

    // Try first with full payload
    const { error } = await supabase
      .from('businesses')
      .update(updatePayload)
      .eq('id', businessId);

    if (!error) return true;

    // If database schema cache doesn't have google_review_url yet, fall back without it
    if (error && error.message.includes('google_review_url')) {
      delete updatePayload.google_review_url;
      const { error: retryErr } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', businessId);
      return !retryErr;
    }

    // If owner columns don't exist yet, retry without them
    if (error && (error.message.includes('owner_id') || error.message.includes('owner_email'))) {
      delete updatePayload.owner_id;
      delete updatePayload.owner_email;
      const { error: retryErr } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('id', businessId);
      return !retryErr;
    }

    return false;
  } catch (err) {
    console.warn('Error saving business settings to Supabase:', err);
    return false;
  }
}

// ============================================================================
// 2. OWNER REGISTRATION LOCK & SUPABASE AUTH
// ============================================================================

export interface OwnerStatus {
  isRegistered: boolean;
  ownerEmail?: string | null;
  businessName: string;
}

export async function checkOwnerRegistrationStatus(): Promise<OwnerStatus> {
  if (!supabase) {
    const cachedEmail = localStorage.getItem('neel_registered_owner_email');
    return {
      isRegistered: Boolean(cachedEmail),
      ownerEmail: cachedEmail,
      businessName: 'Neel Hair'
    };
  }

  try {
    const { data } = await supabase
      .from('businesses')
      .select('name, owner_id, owner_email')
      .limit(1)
      .maybeSingle();

    const localEmail = localStorage.getItem('neel_registered_owner_email');
    const ownerEmail = data?.owner_email || localEmail;

    return {
      isRegistered: Boolean(data?.owner_id || ownerEmail),
      ownerEmail: ownerEmail || null,
      businessName: data?.name || 'Neel Hair'
    };
  } catch {
    const cachedEmail = localStorage.getItem('neel_registered_owner_email');
    return {
      isRegistered: Boolean(cachedEmail),
      ownerEmail: cachedEmail,
      businessName: 'Neel Hair'
    };
  }
}

export async function checkPendingInvitation(email: string): Promise<AdminInvitation | null> {
  if (!supabase) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('admin_invitations')
      .select('*')
      .eq('email', cleanEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as AdminRole,
      status: data.status,
      invitedBy: data.invited_by,
      createdAt: data.created_at,
      expiresAt: data.expires_at
    };
  } catch {
    return null;
  }
}

export async function signUpOwnerWithSupabase(
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim()
        }
      }
    });

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    if (authData.session) {
      // Call secure database function claim_owner()
      const { data: claimed, error: claimErr } = await supabase.rpc('claim_owner');
      if (claimErr || !claimed) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: claimErr?.message || 'Owner claim failed. An owner account already exists.'
        };
      }

      localStorage.setItem('neel_registered_owner_email', cleanEmail);
      localStorage.setItem('neel_admin_auth', 'true');
      localStorage.setItem('neel_current_user_role', 'owner');
    }

    const needsEmailVerification = !authData.session && Boolean(authData.user && !authData.user.confirmed_at);
    return {
      success: true,
      needsEmailVerification
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Registration failed.' };
  }
}

export async function signUpInvitedAdminWithSupabase(
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; needsEmailVerification?: boolean }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  const cleanEmail = email.trim().toLowerCase();

  // Verify invitation exists and is pending
  const invitation = await checkPendingInvitation(cleanEmail);
  if (!invitation) {
    return {
      success: false,
      error: 'No active invitation found for this email. Admin registrations require an invitation from the salon owner.'
    };
  }

  try {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          full_name: fullName.trim() || invitation.fullName || 'Salon Admin'
        }
      }
    });

    if (authErr) {
      return { success: false, error: authErr.message };
    }

    if (authData.session) {
      // Call secure database function accept_invitation()
      const { data: accepted, error: acceptErr } = await supabase.rpc('accept_invitation');
      if (acceptErr || !accepted) {
        await supabase.auth.signOut();
        return {
          success: false,
          error: acceptErr?.message || 'Failed to accept invitation. Please check your invitation status.'
        };
      }

      const { data: profile } = await supabase
        .from('admin_profiles')
        .select('role')
        .eq('id', authData.user?.id)
        .maybeSingle();

      const userRole = (profile?.role as AdminRole) || 'admin';
      localStorage.setItem('neel_registered_owner_email', cleanEmail);
      localStorage.setItem('neel_admin_auth', 'true');
      localStorage.setItem('neel_current_user_role', userRole);
    }

    const needsEmailVerification = !authData.session && Boolean(authData.user && !authData.user.confirmed_at);
    return {
      success: true,
      needsEmailVerification
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Admin account creation failed.' };
  }
}

export async function signInAdminWithSupabase(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: AdminRole }> {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data?.session && data.user) {
      const userId = data.user.id;

      // Query database admin_profiles row. Never trust user_metadata and never auto-create profiles from client.
      let { data: profile, error: profileErr } = await supabase
        .from('admin_profiles')
        .select('role, status')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching admin profile:', profileErr);
        await supabase.auth.signOut();
        localStorage.removeItem('neel_admin_auth');
        return {
          success: false,
          error: 'Could not read your profile (permission error)'
        };
      }

      // If user has no admin_profiles row, call supabase.rpc('claim_owner') once
      if (!profile) {
        const { data: claimed, error: claimErr } = await supabase.rpc('claim_owner');
        if (claimErr) {
          console.error('claim_owner RPC error:', claimErr);
        }
        if (claimed) {
          const { data: refetchedProfile, error: refetchErr } = await supabase
            .from('admin_profiles')
            .select('role, status')
            .eq('id', userId)
            .maybeSingle();

          if (refetchErr) {
            console.error('Error refetching profile after claim_owner:', refetchErr);
          }
          profile = refetchedProfile;
        } else {
          // If not claimed as owner, also try accept_invitation in case user was invited
          const { data: accepted, error: acceptErr } = await supabase.rpc('accept_invitation');
          if (acceptErr) {
            console.error('accept_invitation RPC error:', acceptErr);
          }
          if (accepted) {
            const { data: refetchedProfile, error: refetchErr } = await supabase
              .from('admin_profiles')
              .select('role, status')
              .eq('id', userId)
              .maybeSingle();

            if (refetchErr) {
              console.error('Error refetching profile after accept_invitation:', refetchErr);
            }
            profile = refetchedProfile;
          }
        }
      }

      if (!profile) {
        await supabase.auth.signOut();
        localStorage.removeItem('neel_admin_auth');
        return {
          success: false,
          error: 'No admin profile found for this account'
        };
      }

      if (profile.status === 'deactivated') {
        await supabase.auth.signOut();
        localStorage.removeItem('neel_admin_auth');
        return {
          success: false,
          error: 'Your account is deactivated'
        };
      }

      if (profile.status !== 'active') {
        await supabase.auth.signOut();
        localStorage.removeItem('neel_admin_auth');
        return {
          success: false,
          error: "You don't have access"
        };
      }

      const userRole = profile.role as AdminRole;
      localStorage.setItem('neel_admin_auth', 'true');
      localStorage.setItem('neel_registered_owner_email', cleanEmail);
      localStorage.setItem('neel_current_user_role', userRole);

      return { success: true, role: userRole };
    }

    return { success: false, error: 'Login session could not be established.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Authentication failed' };
  }
}

export async function getAdminProfile(userId: string): Promise<AdminUser | null> {
  if (!supabase) return null;
  try {
    const { data } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name || 'Administrator',
      role: data.role as AdminRole,
      status: data.status as AdminStatus,
      createdAt: data.created_at,
      isOwner: data.role === 'owner'
    };
  } catch {
    return null;
  }
}

export async function getAdminsList(businessId?: string): Promise<{ admins: AdminUser[]; invitations: AdminInvitation[] }> {
  if (!supabase) {
    const savedAdmins = localStorage.getItem('neel_admin_list');
    const savedInvs = localStorage.getItem('neel_invitations_list');
    return {
      admins: savedAdmins ? JSON.parse(savedAdmins) : [],
      invitations: savedInvs ? JSON.parse(savedInvs) : []
    };
  }

  try {
    const [profilesRes, invsRes] = await Promise.all([
      supabase.from('admin_profiles').select('*').order('created_at', { ascending: true }),
      supabase.from('admin_invitations').select('*').order('created_at', { ascending: false })
    ]);

    const admins: AdminUser[] = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      email: p.email,
      fullName: p.full_name || 'Administrator',
      role: p.role as AdminRole,
      status: p.status as AdminStatus,
      createdAt: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isOwner: p.role === 'owner'
    }));

    const invitations: AdminInvitation[] = (invsRes.data || []).map((i: any) => ({
      id: i.id,
      email: i.email,
      fullName: i.full_name,
      role: i.role as AdminRole,
      status: i.status,
      invitedBy: i.invited_by,
      createdAt: new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiresAt: i.expires_at
    }));

    // If database returned empty because tables just got created, ensure owner is visible
    if (admins.length === 0) {
      const ownerEmail = localStorage.getItem('neel_registered_owner_email');
      if (ownerEmail) {
        admins.push({
          id: 'owner-local',
          email: ownerEmail,
          fullName: 'Neel Hair Owner',
          role: 'owner',
          status: 'active',
          createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          isOwner: true
        });
      }
    }

    return { admins, invitations };
  } catch (err) {
    console.warn('Error fetching admin list:', err);
    return { admins: [], invitations: [] };
  }
}

export async function inviteAdminWithSupabase(
  email: string,
  fullName: string,
  role: AdminRole = 'admin',
  invitedByUserId?: string,
  businessId?: string
): Promise<{ success: boolean; error?: string; invitation?: AdminInvitation }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Check if user is already an admin
    const { data: existingUser } = await supabase
      .from('admin_profiles')
      .select('id, email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingUser) {
      return { success: false, error: 'An administrator account already exists for this email address.' };
    }

    // 2. Check if a pending invitation already exists
    const { data: existingInvite } = await supabase
      .from('admin_invitations')
      .select('id, status')
      .eq('email', cleanEmail)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvite) {
      return { success: false, error: 'A pending invitation has already been sent to this email address.' };
    }

    // 3. Insert new invitation record
    const { data, error } = await supabase
      .from('admin_invitations')
      .insert({
        email: cleanEmail,
        full_name: fullName.trim(),
        role: role,
        invited_by: invitedByUserId || null,
        business_id: businessId || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create invitation record.' };
    }

    const invitation: AdminInvitation = {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role as AdminRole,
      status: data.status,
      invitedBy: data.invited_by,
      createdAt: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiresAt: data.expires_at
    };

    return { success: true, invitation };
  } catch (err: any) {
    return { success: false, error: err.message || 'Invitation operation failed.' };
  }
}

export async function updateAdminStatusWithSupabase(
  adminId: string,
  status: AdminStatus
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  try {
    // Protect primary owner
    const { data: targetUser } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', adminId)
      .maybeSingle();

    if (targetUser?.role === 'owner') {
      return { success: false, error: 'The primary owner account cannot be deactivated or modified.' };
    }

    const { error } = await supabase
      .from('admin_profiles')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', adminId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update admin status.' };
  }
}

export async function deleteAdminWithSupabase(
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  try {
    // Protect primary owner
    const { data: targetUser } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', adminId)
      .maybeSingle();

    if (targetUser?.role === 'owner') {
      return { success: false, error: 'The primary owner account cannot be deleted.' };
    }

    const { error } = await supabase
      .from('admin_profiles')
      .delete()
      .eq('id', adminId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to remove admin.' };
  }
}

export async function revokeAdminInvitationWithSupabase(
  invitationId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

  try {
    const { error } = await supabase
      .from('admin_invitations')
      .update({ status: 'revoked' })
      .eq('id', invitationId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to revoke invitation.' };
  }
}

export async function resetPasswordWithSupabase(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const cleanEmail = email.trim().toLowerCase();
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}#reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Password reset request failed.' };
  }
}

export async function updateUserPasswordWithSupabase(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Password update failed.' };
  }
}

export async function signOutAdminFromSupabase(): Promise<void> {
  try {
    localStorage.removeItem('neel_admin_auth');
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn('Error signing out from Supabase:', err);
  }
}

// ============================================================================
// 3. FEEDBACK DATA OPERATIONS
// ============================================================================

export async function getDbFeedbacks(): Promise<FeedbackItem[] | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return null;
    }

    return data.map((row: any) => {
      const dateObj = row.created_at ? new Date(row.created_at) : new Date();
      const formattedDate = isNaN(dateObj.getTime())
        ? 'Recently'
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return {
        id: row.id,
        customerName: row.customer_name || 'Guest Customer',
        rating: Number(row.rating) || 5,
        service: row.service || 'Haircut',
        feedbackText: row.feedback_text || '',
        createdAt: formattedDate,
        status: (row.status as FeedbackStatus) || 'pending',
        customerAvatar: row.customer_avatar || (row.customer_name ? row.customer_name.charAt(0).toUpperCase() : 'G'),
        phone: row.phone || ''
      };
    });
  } catch (err) {
    console.warn('Error fetching feedbacks from Supabase:', err);
    return null;
  }
}

export async function insertDbFeedback(
  businessId: string | null,
  item: {
    customerName: string;
    rating: number;
    service: string;
    feedbackText: string;
    phone?: string;
  }
): Promise<FeedbackItem | null> {
  if (!supabase) return null;

  try {
    const effectiveBizId = businessId || localStorage.getItem('neel_business_id') || undefined;
    const avatar = item.customerName.trim().charAt(0).toUpperCase() || 'G';
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `fb-${Date.now()}`;
    const payload: any = {
      id,
      customer_name: item.customerName.trim() || 'Guest Customer',
      rating: item.rating,
      service: item.service,
      feedback_text: item.feedbackText.trim(),
      phone: item.phone ? item.phone.trim() : '',
      status: 'pending',
      customer_avatar: avatar
    };

    if (effectiveBizId) {
      payload.business_id = effectiveBizId;
    }

    const { error } = await supabase
      .from('feedback')
      .insert(payload);

    if (error) {
      console.warn('Note: Could not insert feedback into Supabase table:', error?.message);
      return null;
    }

    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return {
      id,
      customerName: payload.customer_name,
      rating: payload.rating,
      service: payload.service,
      feedbackText: payload.feedback_text,
      createdAt: formattedDate,
      status: 'pending',
      customerAvatar: avatar,
      phone: payload.phone
    };
  } catch (err) {
    console.warn('Error inserting feedback to Supabase:', err);
    return null;
  }
}

export async function updateDbFeedbackStatus(id: string, status: FeedbackStatus): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('feedback')
      .update({ status })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Error updating feedback status in Supabase:', err);
    return false;
  }
}

export async function deleteDbFeedback(id: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Error deleting feedback from Supabase:', err);
    return false;
  }
}

// ============================================================================
// 4. ANALYTICS & TELEMETRY (QR SCANS & GOOGLE CLICKS)
// ============================================================================

export async function recordDbAnalyticsEvent(
  businessId: string | null,
  eventType: 'qr_scan' | 'google_click' | 'feedback_submitted'
): Promise<void> {
  if (!supabase) return;

  try {
    const effectiveBizId = businessId || localStorage.getItem('neel_business_id') || '3b0ee36b-47db-4bec-9516-9ea8ffdcef99';
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      business_id: effectiveBizId
    });
  } catch (err) {
    console.warn('Error recording analytics event in Supabase:', err);
  }
}

export interface DbAnalyticsSummary {
  totalScans: number;
  scansGrowth: number;
  googleClicks: number;
  clicksGrowth: number;
  activityData: ActivityPoint[];
}

// Production baseline timestamp: exclude any pre-launch testing events
export const PRODUCTION_RESET_TIMESTAMP = '2026-11-17T15:00:00.000Z';

export async function getDbAnalyticsStats(businessId?: string | null): Promise<DbAnalyticsSummary | null> {
  if (!supabase) return null;

  try {
    const effectiveBizId = businessId || localStorage.getItem('neel_business_id') || undefined;
    
    // Check for custom reset cutoff or baseline production time
    const resetCutoff = typeof window !== 'undefined'
      ? localStorage.getItem('neel_analytics_reset_time') || PRODUCTION_RESET_TIMESTAMP
      : PRODUCTION_RESET_TIMESTAMP;

    let query = supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', resetCutoff)
      .order('created_at', { ascending: true });

    if (effectiveBizId) {
      query = query.or(`business_id.eq.${effectiveBizId},business_id.is.null`);
    }

    const { data, error } = await query;
    if (error || !data) {
      return {
        totalScans: 0,
        scansGrowth: 0,
        googleClicks: 0,
        clicksGrowth: 0,
        activityData: []
      };
    }

    const totalScans = data.filter((e) => e.event_type === 'qr_scan').length;
    const googleClicks = data.filter((e) => e.event_type === 'google_click').length;

    // Clean Production Slate: If no activity has occurred yet, return clean zeroes
    if (totalScans === 0 && googleClicks === 0) {
      return {
        totalScans: 0,
        scansGrowth: 0,
        googleClicks: 0,
        clicksGrowth: 0,
        activityData: []
      };
    }

    // Group events into dates across the timeline
    const dateMap: Record<string, { date: string; qrScans: number; googleClicks: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[label] = { date: label, qrScans: 0, googleClicks: 0 };
    }

    data.forEach((e) => {
      if (!e.created_at) return;
      const d = new Date(e.created_at);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[label]) {
        dateMap[label] = { date: label, qrScans: 0, googleClicks: 0 };
      }
      if (e.event_type === 'qr_scan') {
        dateMap[label].qrScans++;
      } else if (e.event_type === 'google_click') {
        dateMap[label].googleClicks++;
      }
    });

    const activityData: ActivityPoint[] = Object.values(dateMap).slice(-7);

    // Period growth
    const midpoint = Math.floor(data.length / 2);
    const pastScans = data.slice(0, midpoint).filter((e) => e.event_type === 'qr_scan').length;
    const recentScans = data.slice(midpoint).filter((e) => e.event_type === 'qr_scan').length;
    const scansGrowth = pastScans > 0 ? Math.round(((recentScans - pastScans) / pastScans) * 100) : 0;

    const pastClicks = data.slice(0, midpoint).filter((e) => e.event_type === 'google_click').length;
    const recentClicks = data.slice(midpoint).filter((e) => e.event_type === 'google_click').length;
    const clicksGrowth = pastClicks > 0 ? Math.round(((recentClicks - pastClicks) / pastClicks) * 100) : 0;

    return {
      totalScans,
      scansGrowth,
      googleClicks,
      clicksGrowth,
      activityData
    };
  } catch (err) {
    console.warn('Error fetching analytics stats from Supabase:', err);
    return null;
  }
}

// ============================================================================
// 8. CONTACT ENQUIRIES & WHATSAPP QUOTATIONS
// ============================================================================

export async function getDbEnquiries(businessId?: string | null): Promise<CustomerEnquiry[]> {
  const fallback = (): CustomerEnquiry[] => {
    try {
      const saved = localStorage.getItem('neel_customer_enquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  if (!supabase) return fallback();

  try {
    const { data, error } = await supabase
      .from('customer_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return fallback();
    }

    const enquiries: CustomerEnquiry[] = data.map((d: any) => ({
      id: d.id,
      businessId: d.business_id,
      customerName: d.customer_name,
      phone: d.phone,
      service: d.service,
      message: d.message || '',
      status: (d.status as EnquiryStatus) || 'new',
      quotationAmount: Number(d.quotation_amount) || 0,
      discountAmount: Number(d.discount_amount) || 0,
      finalAmount: Number(d.final_amount) || 0,
      notes: d.notes || '',
      quotedAt: d.quoted_at || undefined,
      createdAt: new Date(d.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }));

    try {
      localStorage.setItem('neel_customer_enquiries', JSON.stringify(enquiries));
    } catch {
      // ignore
    }

    return enquiries;
  } catch {
    return fallback();
  }
}

export async function insertDbEnquiry(
  enquiry: Omit<CustomerEnquiry, 'id' | 'createdAt'>
): Promise<{ success: boolean; data?: CustomerEnquiry; error?: string }> {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `enq-${Date.now()}`;
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const newEnquiry: CustomerEnquiry = {
    id,
    businessId: enquiry.businessId,
    customerName: enquiry.customerName.trim(),
    phone: enquiry.phone.trim(),
    service: enquiry.service.trim(),
    message: enquiry.message?.trim() || '',
    status: enquiry.status || 'new',
    quotationAmount: enquiry.quotationAmount || 0,
    discountAmount: enquiry.discountAmount || 0,
    finalAmount: enquiry.finalAmount || 0,
    notes: enquiry.notes || '',
    createdAt: formattedDate
  };

  // Sync to localStorage
  try {
    const current = localStorage.getItem('neel_customer_enquiries');
    const list: CustomerEnquiry[] = current ? JSON.parse(current) : [];
    localStorage.setItem('neel_customer_enquiries', JSON.stringify([newEnquiry, ...list]));
  } catch {
    // ignore
  }

  if (!supabase) {
    return { success: true, data: newEnquiry };
  }

  try {
    const payload = {
      id,
      customer_name: newEnquiry.customerName,
      phone: newEnquiry.phone,
      service: newEnquiry.service,
      message: newEnquiry.message,
      status: newEnquiry.status,
      quotation_amount: newEnquiry.quotationAmount,
      discount_amount: newEnquiry.discountAmount,
      final_amount: newEnquiry.finalAmount,
      notes: newEnquiry.notes,
      business_id: enquiry.businessId || null,
      created_at: now.toISOString()
    };

    const { error } = await supabase.from('customer_enquiries').insert(payload);
    if (error) {
      console.warn('Enquiry stored locally; Supabase insert notice:', error.message);
    }
    return { success: true, data: newEnquiry };
  } catch (err: any) {
    return { success: true, data: newEnquiry };
  }
}

export async function updateDbEnquiryQuotation(
  id: string,
  quote: {
    quotationAmount: number;
    discountAmount: number;
    finalAmount: number;
    notes?: string;
    status?: EnquiryStatus;
  }
): Promise<boolean> {
  const quotedAt = new Date().toISOString();
  const nextStatus: EnquiryStatus = quote.status || 'quoted';

  // Update localStorage
  try {
    const current = localStorage.getItem('neel_customer_enquiries');
    if (current) {
      const list: CustomerEnquiry[] = JSON.parse(current);
      const updated = list.map((item) =>
        item.id === id
          ? {
              ...item,
              quotationAmount: quote.quotationAmount,
              discountAmount: quote.discountAmount,
              finalAmount: quote.finalAmount,
              notes: quote.notes !== undefined ? quote.notes : item.notes,
              status: nextStatus,
              quotedAt
            }
          : item
      );
      localStorage.setItem('neel_customer_enquiries', JSON.stringify(updated));
    }
  } catch {
    // ignore
  }

  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('customer_enquiries')
      .update({
        quotation_amount: quote.quotationAmount,
        discount_amount: quote.discountAmount,
        final_amount: quote.finalAmount,
        notes: quote.notes || '',
        status: nextStatus,
        quoted_at: quotedAt
      })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function updateDbEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<boolean> {
  try {
    const current = localStorage.getItem('neel_customer_enquiries');
    if (current) {
      const list: CustomerEnquiry[] = JSON.parse(current);
      const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
      localStorage.setItem('neel_customer_enquiries', JSON.stringify(updated));
    }
  } catch {
    // ignore
  }

  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('customer_enquiries')
      .update({ status })
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function deleteDbEnquiry(id: string): Promise<boolean> {
  try {
    const current = localStorage.getItem('neel_customer_enquiries');
    if (current) {
      const list: CustomerEnquiry[] = JSON.parse(current);
      const updated = list.filter((item) => item.id !== id);
      localStorage.setItem('neel_customer_enquiries', JSON.stringify(updated));
    }
  } catch {
    // ignore
  }

  if (!supabase) return true;

  try {
    const { error } = await supabase
      .from('customer_enquiries')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}
