import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"](.*)['"]$/, '$1');
    env[match[1]] = value;
  }
});

const rawUrl = env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetProductionData() {
  console.log('====================================================');
  console.log('STARTING PRODUCTION DATA RESET (NEEL HAIR CLEAN SLATE)');
  console.log('====================================================');

  // 1. Purge all test and demo records from feedback table
  console.log('\n1. Purging test feedback records...');
  const { data: allFb, error: getFbErr } = await supabase.from('feedback').select('id');
  if (getFbErr) {
    console.error('Error fetching feedbacks:', getFbErr.message);
  } else if (allFb && allFb.length > 0) {
    const ids = allFb.map(f => f.id);
    const { error: delFbErr } = await supabase.from('feedback').delete().in('id', ids);
    if (delFbErr) {
      console.error('Error deleting feedbacks:', delFbErr.message);
    } else {
      console.log(`✓ Successfully deleted ${ids.length} test feedback records.`);
    }
  } else {
    console.log('✓ feedback table is already empty (0 records).');
  }

  // 2. Purge all telemetry events from analytics_events table
  console.log('\n2. Purging test analytics events (scans, clicks)...');
  const { data: allEv, error: getEvErr } = await supabase.from('analytics_events').select('id');
  if (getEvErr) {
    console.error('Error fetching analytics_events:', getEvErr.message);
  } else if (allEv && allEv.length > 0) {
    const ids = allEv.map(e => e.id);
    const { error: delEvErr } = await supabase.from('analytics_events').delete().in('id', ids);
    if (delEvErr) {
      console.error('Error deleting analytics events:', delEvErr.message);
    } else {
      console.log(`✓ Successfully deleted ${ids.length} test analytics events.`);
    }
  } else {
    console.log('✓ analytics_events table is already empty (0 records).');
  }

  // 3. Reset businesses record to clean production baseline
  console.log('\n3. Resetting businesses record to clean production baseline...');
  const { data: bizList, error: getBizErr } = await supabase.from('businesses').select('*').limit(1);
  if (getBizErr) {
    console.error('Error fetching business:', getBizErr.message);
  } else if (bizList && bizList.length > 0) {
    const biz = bizList[0];
    const updatePayload = {
      name: 'Neel Hair',
      tagline: 'Hair • Style • Grooming',
      category: 'Hair Salon / Barber Shop',
      contact_number: '+91 87674 70988',
      address: 'Ozar, Nashik, Maharashtra',
      google_review_link: '', // Ready for owner to paste their official link
      show_google_review_btn: true,
      show_feedback_form: true,
      qr_style: 'classic',
      center_logo_url: ''
    };

    const { error: upBizErr } = await supabase
      .from('businesses')
      .update(updatePayload)
      .eq('id', biz.id);

    if (upBizErr) {
      console.error('Error resetting business settings:', upBizErr.message);
    } else {
      console.log('✓ Business settings reset to clean production defaults for Neel Hair.');
    }
  }

  // 4. Verify clean slate
  console.log('\n4. Verifying clean production state...');
  const { data: fbCount } = await supabase.from('feedback').select('id');
  const { data: evCount } = await supabase.from('analytics_events').select('id');
  console.log(`Current counts in database -> Feedback: ${fbCount?.length || 0}, Analytics: ${evCount?.length || 0}`);
  console.log('\n✓ PRODUCTION DATABASE RESET COMPLETED SUCCESSFULLY!');
}

resetProductionData().catch(console.error);
