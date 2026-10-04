import { supabase } from '../db/supabase';

export async function getApprovals(status?: string) {
  let query = supabase
    .from('approvals')
    .select('id, type, booking_id, customer_id, payload, status, created_at, resolved_at')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  } else if (!status) {
    query = query.eq('status', 'pending');
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function updateApproval(id: string, action: 'approve' | 'reject') {
  const { data: existing, error: lookupError } = await supabase
    .from('approvals')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (!existing) {
    return null;
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const resolvedAt = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('approvals')
    .update({
      status: newStatus,
      resolved_at: resolvedAt
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // Log owner action in activity_log
  await supabase.from('activity_log').insert({
    actor: 'owner',
    action: action === 'approve' ? 'approval approved' : 'approval rejected',
    entity_type: 'approval',
    entity_id: id,
    metadata: {
      approvalId: id,
      approvalType: existing.type,
      action,
      previousStatus: existing.status,
      newStatus
    }
  });

  return updated;
}
