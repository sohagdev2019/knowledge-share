# A/B Testing for Lock Messaging Conversion

## Overview

This document describes the A/B testing system implemented for optimizing teacher plan upgrade conversions when limits are reached.

## Active Tests

### 1. Headline Tone Test (`headline_tone`)
**Goal**: Test whether growth-focused headlines convert better than informational warnings.

- **Variant A (Informational)**: "Course limit reached"
- **Variant B (Growth-Focused)**: "You're growing fast — unlock more courses"

**Status**: ✅ Enabled

### 2. CTA Label Test (`cta_label`)
**Goal**: Test which CTA wording drives more conversions.

- **Variant A**: "Upgrade Plan"
- **Variant B**: "Unlock Pro Features"
- **Variant C**: "Grow My Teaching"

**Status**: ✅ Enabled

### 3. Reassurance Placement Test (`reassurance_placement`)
**Goal**: Test whether early reassurance reduces hesitation.

- **Variant A**: Reassurance at bottom of modal
- **Variant B**: Reassurance directly under CTA

**Status**: ✅ Enabled

### 4. Plan Comparison Test (`plan_comparison`)
**Goal**: Test whether showing comparison increases or decreases conversion.

- **Variant A**: Single recommended plan (Pro Teacher only)
- **Variant B**: Starter vs Pro comparison table

**Status**: ⏸️ Disabled (implement when needed)

## How It Works

### Variant Assignment
- Users are assigned a variant on first visit (stored in cookie for 30 days)
- Same variant is shown consistently across sessions
- Variants are randomly distributed (50/50 for A/B, 33/33/33 for A/B/C)

### Tracking Events
The system tracks the following events:
- **view**: When a lock message is displayed
- **click**: When upgrade CTA is clicked
- **conversion**: When upgrade is completed
- **dismiss**: When user closes/dismisses the modal

### Analytics Endpoint
Events are sent to `/api/analytics/ab-test` for processing.

**TODO**: Integrate with your analytics service (PostHog, Mixpanel, Google Analytics, etc.)

## Configuration

Edit `lib/ab-test-config.ts` to:
- Enable/disable tests
- Change variants
- Update descriptions

## Key Metrics to Track

1. **Upgrade Click-Through Rate (CTR)**
   - Percentage of users who click upgrade CTA after seeing lock message

2. **Conversion Rate**
   - Percentage of users who complete upgrade after clicking CTA

3. **Modal Dismissal Rate**
   - Percentage of users who close modal without clicking

4. **Time to Decision**
   - Average time from viewing lock message to clicking upgrade

5. **Churn After Limit Hit**
   - Percentage of users who leave after hitting limit

## Testing Best Practices

1. **Test Duration**: Run tests for at least 1 full billing cycle
2. **Sample Size**: Ensure statistical significance (typically 100+ conversions per variant)
3. **One Variable**: Test one variable at a time
4. **Segment Analysis**: Analyze by:
   - New vs experienced teachers
   - Starter vs Pro users
   - Time of day/week
5. **Avoid Conflicts**: Don't test during major UI changes

## Implementation Details

### Components
- `HardLockMessage.tsx`: Modal dialog for hard locks (limit reached)
- `SoftLockWarning.tsx`: Warning alert for soft locks (80-90% usage)
- `ABTestProvider.tsx`: Client-side context provider
- `ABTestProviderServer.tsx`: Server-side wrapper that assigns variants

### Utilities
- `lib/ab-testing.ts`: Core A/B testing logic
- `lib/ab-test-config.ts`: Test configuration

### Integration
The A/B test provider is integrated into the admin layout (`app/admin/layout.tsx`), making variants available to all admin pages.

## Example Analytics Integration

```typescript
// In app/api/analytics/ab-test/route.ts
import { PostHog } from 'posthog-node';

const posthog = new PostHog(process.env.POSTHOG_API_KEY);

export async function POST(request: NextRequest) {
  const { testName, variant, eventType, metadata } = await request.json();
  
  await posthog.capture(metadata.userId, 'ab_test_event', {
    test_name: testName,
    variant,
    event_type: eventType,
    ...metadata,
  });
  
  return NextResponse.json({ success: true });
}
```

## Next Steps

1. **Integrate Analytics**: Connect to your analytics service
2. **Create Dashboard**: Build analytics dashboard to view test results
3. **Implement Plan Comparison**: Add Variant B for plan comparison test
4. **Add More Tests**: Implement remaining tests from the original list
5. **Automated Analysis**: Set up automated statistical significance testing

