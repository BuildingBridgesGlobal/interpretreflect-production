// Phase 1 Feature Audit - Runtime Checks
// Run with: node tests/phase1-audit.js

const BASE_URL = 'http://localhost:5173';

async function auditPhase1Features() {
  console.log('🔍 Phase 1 Feature Audit - Runtime Checks\n');
  console.log('Base URL:', BASE_URL);
  console.log('----------------------------------------\n');

  const results = {
    'EI-UI': { found: false, evidence: [] },
    'RCL': { found: false, evidence: [] },
    'ECE': { found: false, evidence: [] },
    'LEA': { found: false, evidence: [] },
    'Reflection Workflow': { found: false, evidence: [] }
  };

  try {
    // Check if app is running
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      console.error('❌ App not accessible at', BASE_URL);
      return results;
    }
    console.log('✅ App is running\n');

    // Check for routes
    const routes = [
      '/check-in',
      '/journal',
      '/credentials', 
      '/coach',
      '/history',
      '/api/credential-events'
    ];

    for (const route of routes) {
      try {
        const res = await fetch(BASE_URL + route, { 
          method: 'GET',
          redirect: 'manual' 
        });
        
        if (res.status < 400) {
          console.log(`✓ Route exists: ${route} (status: ${res.status})`);
          
          // Map routes to features
          if (route.includes('check-in')) {
            results['EI-UI'].found = true;
            results['EI-UI'].evidence.push(`${route} route exists`);
          }
          if (route.includes('credential')) {
            results['RCL'].found = true;
            results['RCL'].evidence.push(`${route} route exists`);
          }
          if (route.includes('coach')) {
            results['LEA'].found = true;
            results['LEA'].evidence.push(`${route} route exists`);
          }
          if (route.includes('history')) {
            results['Reflection Workflow'].found = true;
            results['Reflection Workflow'].evidence.push(`${route} route exists`);
          }
        } else {
          console.log(`✗ Route not found: ${route} (status: ${res.status})`);
        }
      } catch (err) {
        console.log(`✗ Route error: ${route} -`, err.message);
      }
    }

    // Check for Supabase tables via browser console
    console.log('\n📊 Database Check Instructions:');
    console.log('1. Open browser console at', BASE_URL);
    console.log('2. Click "Check DB Status" button if visible');
    console.log('3. Look for these tables in console output:');
    console.log('   - consent_policies (ECE)');
    console.log('   - credential_events (RCL)');
    console.log('   - reflections (Workflow)');

  } catch (error) {
    console.error('Audit error:', error);
  }

  // Summary
  console.log('\n========================================');
  console.log('AUDIT SUMMARY:');
  console.log('========================================');
  
  for (const [feature, data] of Object.entries(results)) {
    const status = data.found ? '✅ FOUND' : '❌ NOT FOUND';
    console.log(`${feature}: ${status}`);
    if (data.evidence.length > 0) {
      data.evidence.forEach(e => console.log(`  - ${e}`));
    }
  }

  return results;
}

// Run audit
auditPhase1Features().then(() => {
  console.log('\n✨ Audit complete');
}).catch(err => {
  console.error('Fatal error:', err);
});