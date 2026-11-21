/**
 * Payment System Architecture (Razorpay / Provider-Ready Adapter)
 * -------------------------------------------------------------
 * Secret gateway keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET)
 * live strictly on the backend server. All payout approvals must pass server-side
 * role authorization and idempotency verification before updating creator ledger status.
 */

export interface PayoutVerificationResult {
  verified: boolean;
  mode: "provider-verified" | "demo-simulated";
  payoutReference: string;
  status: "Payment Released";
}

export async function verifyBrandPayoutOnServer(params: {
  idempotencyKey: string;
  campaignId: string;
  applicationId: string;
  amountInr: number;
  actorRole: "creator" | "brand";
}): Promise<PayoutVerificationResult> {
  const response = await fetch("/api/payments/verify-payout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await response.json()) as {
    verified?: boolean;
    mode?: "provider-verified" | "demo-simulated";
    payoutReference?: string;
    status?: "Payment Released";
    message?: string;
  };

  if (!response.ok || !data.verified) {
    throw new Error(data.message || "Payout verification failed on server.");
  }

  return {
    verified: true,
    mode: data.mode || "demo-simulated",
    payoutReference: data.payoutReference || `demo_pay_${Date.now()}`,
    status: "Payment Released",
  };
}
