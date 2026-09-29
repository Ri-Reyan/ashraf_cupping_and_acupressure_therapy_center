import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import {
  getDhakaDayEnd,
  getDhakaDayStart,
  getDhakaMonthEnd,
  getDhakaMonthStart,
  getDhakaSerialDate,
} from "@/lib/dhaka-time";

describe("Asia/Dhaka date boundaries", () => {
  it("uses Dhaka's calendar date for appointment serials", () => {
    const beforeDhakaMidnight = Temporal.Instant.from("2026-09-28T17:59:59Z");
    const atDhakaMidnight = Temporal.Instant.from("2026-09-28T18:00:00Z");

    expect(getDhakaSerialDate(beforeDhakaMidnight)).toBe("2026-09-28");
    expect(getDhakaSerialDate(atDhakaMidnight)).toBe("2026-09-29");
  });

  it("returns half-open Dhaka-local day bounds", () => {
    const date = Temporal.PlainDate.from("2026-09-29");

    expect(getDhakaDayStart(date).toInstant().toString()).toBe(
      "2026-09-28T18:00:00Z",
    );
    expect(getDhakaDayEnd(date).toInstant().toString()).toBe(
      "2026-09-29T18:00:00Z",
    );
  });

  it("returns half-open Dhaka-local month bounds", () => {
    const date = Temporal.PlainDate.from("2026-09-29");

    expect(getDhakaMonthStart(date).toInstant().toString()).toBe(
      "2026-08-31T18:00:00Z",
    );
    expect(getDhakaMonthEnd(date).toInstant().toString()).toBe(
      "2026-09-30T18:00:00Z",
    );
  });
});
