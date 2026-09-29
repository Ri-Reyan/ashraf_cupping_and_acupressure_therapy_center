// Asia/Dhaka date and boundary helpers for ledger queries and serials.
// Timestamp ranges use inclusive start and exclusive end boundaries.
import { Temporal } from "temporal-polyfill";

export const DHAKA_TIME_ZONE = "Asia/Dhaka";

export function getDhakaToday(
  instant: Temporal.Instant = Temporal.Now.instant(),
): Temporal.PlainDate {
  return instant.toZonedDateTimeISO(DHAKA_TIME_ZONE).toPlainDate();
}

export function getDhakaSerialDate(
  instant: Temporal.Instant = Temporal.Now.instant(),
): string {
  return getDhakaToday(instant).toString();
}

export function getDhakaDayStart(
  date: Temporal.PlainDate = getDhakaToday(),
): Temporal.ZonedDateTime {
  return date.toZonedDateTime(DHAKA_TIME_ZONE);
}

export function getDhakaDayEnd(
  date: Temporal.PlainDate = getDhakaToday(),
): Temporal.ZonedDateTime {
  return date.add({ days: 1 }).toZonedDateTime(DHAKA_TIME_ZONE);
}

export function getDhakaMonthStart(
  date: Temporal.PlainDate = getDhakaToday(),
): Temporal.ZonedDateTime {
  return date.with({ day: 1 }).toZonedDateTime(DHAKA_TIME_ZONE);
}

export function getDhakaMonthEnd(
  date: Temporal.PlainDate = getDhakaToday(),
): Temporal.ZonedDateTime {
  return date
    .with({ day: 1 })
    .add({ months: 1 })
    .toZonedDateTime(DHAKA_TIME_ZONE);
}

export function formatDhakaDate(
  value: Date | Temporal.Instant,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const instant =
    value instanceof Date
      ? Temporal.Instant.fromEpochMilliseconds(value.getTime())
      : value;

  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: DHAKA_TIME_ZONE,
  }).format(new Date(Number(instant.epochMilliseconds)));
}
