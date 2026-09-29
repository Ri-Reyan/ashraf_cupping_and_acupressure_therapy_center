// Pure lifetime earnings calculation shared by the balance service and tests.
// Appointments contribute only while active; payouts always reduce available balance.
export interface TherapistBalance {
  lifetime: number;
  paid: number;
  balance: number;
}

export function calculateTherapistBalance(
  lifetime: number | null,
  paid: number | null,
): TherapistBalance {
  const earned = lifetime ?? 0;
  const payouts = paid ?? 0;

  return {
    lifetime: earned,
    paid: payouts,
    balance: earned - payouts,
  };
}
