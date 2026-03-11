

# Add "Send" Action to Draft Offers in History Table

## Problem
Draft offers in the Recent Offers table have no way to be sent to the customer. The only actions are Edit, Delete, and View. You have to go back to the generator to send.

## Solution
Add a **Send button** (envelope/send icon) to the actions column for offers with `status === 'draft'`. Clicking it invokes the existing `send-pricing-offer` edge function (same one used by `OfferGeneratorPanel.handleSendOffer`), updates status to `sent`, and shows a success toast.

## Technical Details

**File: `src/components/pricing/OffersHistory.tsx`**

1. Add a `sendMutation` using `useMutation` that calls `supabase.functions.invoke('send-pricing-offer', { body: { offerId } })` and invalidates `pricing-offers` query on success.

2. Add a Send button in the actions cell, shown when `offer.status === 'draft'` and `offer.customer_email` exists:
   ```tsx
   {offer.status === 'draft' && offer.customer_email && (
     <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); sendMutation.mutate(offer); }}>
       <Send className="h-4 w-4" />
     </Button>
   )}
   ```

3. While sending, show a `Loader2` spinner on that row's send button (track `sendingOfferId` state).

4. `Send` icon is already imported in the file.

**No other files changed** -- the `send-pricing-offer` edge function already handles everything (email delivery, status update to 'sent', Slack notification).

