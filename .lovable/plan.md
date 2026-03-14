

# Add "View Offer" Link to Slack Notifications

## What
Add a clickable button in the Slack notifications (both when an offer is **sent** and when it's **accepted**) so team members can jump directly to the offer page.

## How

The offer URL pattern is already established: `https://naviosolutions.com/offer/{offer_token}`

### 1. `supabase/functions/send-pricing-offer/index.ts` (sent notification)
Add an `actions` block after the `context` block (after line 372) with a "View Offer" button linking to `offerViewUrl` (already computed on line 119).

### 2. `supabase/functions/accept-offer/index.ts` (accepted notification)
Build the offer URL from `offer.offer_token` and add an `actions` block after the `context` block (after line 143) with a "View Offer" button.

### Slack Block Format
```json
{
  "type": "actions",
  "elements": [{
    "type": "button",
    "text": { "type": "plain_text", "text": "View Offer" },
    "url": "https://naviosolutions.com/offer/{token}",
    "style": "primary"
  }]
}
```

Both edge functions will be redeployed automatically.

