// Calculates a therapist's earned, paid, and available lifetime balance.
// Reads active appointment shares and all recorded payouts; balance is never stored.
import "server-only";
import { prisma } from "@/lib/prisma";
import { calculateTherapistBalance } from "@/lib/services/balance-calculator";

export async function getTherapistBalance(therapistId: string) {
  const [earnings, payouts] = await Promise.all([
    prisma.orm.public.Appointment.where({ therapistId })
      .where((appointment) => appointment.deletedAt.isNull())
      .aggregate((aggregate) => ({
        lifetime: aggregate.sum("therapistShare"),
      })),
    prisma.orm.public.TherapistPayout.where({ therapistId }).aggregate(
      (aggregate) => ({ paid: aggregate.sum("amount") }),
    ),
  ]);

  return calculateTherapistBalance(earnings.lifetime, payouts.paid);
}
