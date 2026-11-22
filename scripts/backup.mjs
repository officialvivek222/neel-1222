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

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAndBackup() {
  console.log('\n=========================================');
  console.log('STEP 1: INSPECT CURRENT SUPABASE TABLES');
  console.log('=========================================');

  // Check businesses
  const { data: businesses, error: bErr } = await supabase.from('businesses').select('*');
  if (bErr) console.error('Error fetching businesses:', bErr);
  else console.log(`Found ${businesses?.length || 0} business record(s). Columns:`, businesses[0] ? Object.keys(businesses[0]) : 'None');

  // Check feedback
  const { data: feedbacks, error: fErr } = await supabase.from('feedback').select('*');
  if (fErr) console.error('Error fetching feedback:', fErr);
  else console.log(`Found ${feedbacks?.length || 0} feedback record(s).`);

  // Check analytics_events
  const { data: analytics, error: aErr } = await supabase.from('analytics_events').select('*');
  if (aErr) console.error('Error fetching analytics_events:', aErr);
  else console.log(`Found ${analytics?.length || 0} analytics_event record(s).`);

  const backupData = {
    timestamp: new Date().toISOString(),
    projectUrl: supabaseUrl,
    businesses: businesses || [],
    feedback: feedbacks || [],
    analytics_events: analytics || []
  };

  fs.writeFileSync('backup_dev_data.json', JSON.stringify(backupData, null, 2), 'utf8');
  console.log('\n✓ Successfully backed up all development data to backup_dev_data.json');
}

inspectAndBackup().catch(err => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
