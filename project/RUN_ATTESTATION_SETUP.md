# Attestation Receipt Setup Guide

## Quick Setup Instructions

### 1. Run the SQL Schema in Supabase

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/attestation_receipts_schema.sql`
4. Click "Run" to execute

### 2. Test in Your Application

Add this test component to any page (e.g., PersonalizedHomepage):

```tsx
import { AttestationReceiptManager } from './AttestationReceiptManager';

// In your component:
const [showAttestations, setShowAttestations] = useState(false);

// In your JSX:
<button
  onClick={() => setShowAttestations(true)}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  View Attestations
</button>

{showAttestations && (
  <AttestationReceiptManager
    onClose={() => setShowAttestations(false)}
  />
)}
```

### 3. Auto-generate After Activities

When a user completes a wellness check:

```tsx
import { attestWellnessActivity } from '../services/attestationReceiptService';

// After wellness check submission:
const result = await attestWellnessActivity(user.id, 'wellness_check');
if (result.success) {
  console.log('Attestation generated:', result.data);
}
```

### 4. Test the Flow

1. **Generate a Readiness Attestation**:
   - Click "View Attestations"
   - Click "Generate Readiness"
   - You'll see a new receipt with hash and signature

2. **Verify a Receipt**:
   - Click the shield icon on any receipt
   - See the verification result

3. **Download Receipt**:
   - Click the download icon
   - Get a JSON file with the signed attestation

## Integration Examples

### After Wellness Check-in

```tsx
// In WellnessCheckInAccessible.tsx
import { AttestationReceiptManager } from './AttestationReceiptManager';

// After successful submission:
<AttestationReceiptManager
  autoGenerate={true}
  activityType="wellness_check"
  stressLevel={currentStressLevel}
/>
```

### After Team Sync

```tsx
// In TeamingReflectionEnhanced.tsx
<AttestationReceiptManager
  autoGenerate={true}
  activityType="team_sync"
/>
```

### Show Readiness Badge

```tsx
import { checkReadinessStatus } from '../services/attestationReceiptService';

const [isReady, setIsReady] = useState(false);

useEffect(() => {
  checkReadinessStatus(user.id).then(result => {
    setIsReady(result.isReady);
  });
}, []);

// Display badge
{isReady && (
  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
    <CheckCircle className="w-4 h-4 text-green-600" />
    <span className="text-sm text-green-700">Ready</span>
  </div>
)}
```

## What Attestation Receipts Do

1. **Prove Wellness State** without revealing any health data
2. **Timestamped & Signed** - Cryptographically secure
3. **No PHI/Payload** - Just proof of state achieved
4. **Shareable** - Can be verified by anyone with the receipt ID
5. **Audit Trail** - Every verification is logged

## Receipt Types Available

- `readiness` - Ready for assignment
- `recovery` - Recovered from stress
- `wellness_check` - Completed wellness check
- `team_sync` - Team synchronization done
- `training_complete` - Training finished
- `shift_ready` - Ready for shift
- `break_taken` - Wellness break completed
- `debrief_complete` - Debrief finished

## Verification URL

Each receipt has a verification URL:
```
https://interpretreflect.com/verify/{receipt_id}
```

This can be shared with:
- Agencies (prove readiness)
- Team members (confirm sync)
- Clients (show compliance)

## Security Features

1. **SHA-256 Hashing** - User IDs are never exposed
2. **HMAC Signatures** - Receipts can't be forged
3. **Nonce Protection** - Prevents replay attacks
4. **Expiration Support** - Receipts can expire
5. **Audit Logging** - All verifications tracked

## Testing Checklist

- [ ] SQL schema executed in Supabase
- [ ] AttestationReceiptManager component renders
- [ ] Can generate readiness attestation
- [ ] Receipt shows hash and signature
- [ ] Verification returns valid result
- [ ] Download produces JSON file
- [ ] Expired receipts show as invalid
- [ ] Multiple receipt types work

## Troubleshooting

### "Failed to generate attestation receipt"
- Check Supabase connection
- Ensure SQL functions were created
- Check browser console for errors

### "Invalid signature" on verification
- Receipt may be expired
- Database key may not match

### Component not showing
- Ensure user is authenticated
- Check imports are correct

## Next Steps

1. **Add to Production**:
   - Run SQL in production Supabase
   - Enable for premium users only

2. **Agency Integration**:
   - Add verification endpoint
   - Create agency dashboard view
   - Show interpreter readiness status

3. **W3C Verifiable Credentials** (Future):
   - Add for 60-day tier
   - Implement DID support
   - Create credential issuance flow