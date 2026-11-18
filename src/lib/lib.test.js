import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";
import { buildFormData, stripUndefined, toQueryString } from "./formData";
import {
  formatDuration,
  formatNumber,
  initials,
  podcastDurationLabel,
  rowNumber,
  storedDurationLabel,
  toStoredDuration,
} from "./format";
import { fromGeoPoint, locationRule, toGeoPoint } from "./geo";
import { isVideoPodcast, isVideoUrl } from "./media";
import { findNavItem } from "../layout/navigation";

describe("toQueryString", () => {
  it("drops empty values so the API never receives `searchTerm=undefined`", () => {
    expect(toQueryString({ page: 1, limit: 10, searchTerm: "", category: undefined, x: null })).toBe("?page=1&limit=10");
  });
  it("keeps false and 0, which are meaningful filters", () => {
    expect(toQueryString({ isApproved: false, page: 0 })).toBe("?isApproved=false&page=0");
  });
  it("returns an empty string when nothing is set", () => {
    expect(toQueryString({})).toBe("");
  });
  it("encodes special characters", () => {
    expect(toQueryString({ searchTerm: "a&b c" })).toBe("?searchTerm=a%26b+c");
  });
});

describe("buildFormData", () => {
  it("serialises fields under `data` and appends only real files", () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });
    const fd = buildFormData({ name: "Sermons", skip: undefined }, { category_image: file, other: null, url: "https://x" });
    expect(JSON.parse(fd.get("data"))).toEqual({ name: "Sermons" });
    expect(fd.get("category_image")).toBeInstanceOf(File);
    expect(fd.has("other")).toBe(false);
    // existing image URLs are never re-sent as files (old edit forms appended `undefined`)
    expect(fd.has("url")).toBe(false);
  });
  it("supports multiple files per field", () => {
    const a = new File(["a"], "a.png");
    const b = new File(["b"], "b.png");
    expect(buildFormData({}, { images: [a, b] }).getAll("images")).toHaveLength(2);
  });
  it("stripUndefined keeps falsy-but-defined values", () => {
    expect(stripUndefined({ a: 0, b: "", c: false, d: undefined })).toEqual({ a: 0, b: "", c: false });
  });
});

describe("getErrorMessage", () => {
  it("prefers the backend message", () => {
    expect(getErrorMessage({ status: 400, data: { message: "Category not found" } })).toBe("Category not found");
  });
  it("maps network failures to a friendly message", () => {
    expect(getErrorMessage({ status: "FETCH_ERROR", error: "TypeError" })).toMatch(/reach the server/);
  });
  it("falls back when nothing useful is present", () => {
    expect(getErrorMessage({}, "Fallback")).toBe("Fallback");
    expect(getErrorMessage(null)).toMatch(/Something went wrong/);
  });
  it("uses Error.message for thrown errors", () => {
    expect(getErrorMessage(new Error("Upload failed"))).toBe("Upload failed");
  });
});

describe("format helpers", () => {
  it("formats durations", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3725)).toBe("1:02:05");
    expect(formatDuration(-3)).toBe("0:00");
  });

  it("keeps the legacy stored duration format (minutes.seconds) round-trippable", () => {
    expect(toStoredDuration(247)).toBe(4.07);
    expect(toStoredDuration(250)).toBe(4.1);
    expect(toStoredDuration(59.6)).toBe(1); // 60s rounds to 1:00
    expect(storedDurationLabel(4.07)).toBe("4:07");
    expect(storedDurationLabel(4.1)).toBe("4:10");
    expect(storedDurationLabel(12)).toBe("12:00");
    expect(storedDurationLabel(undefined)).toBe("—");
    for (const s of [0, 7, 60, 247, 3599, 5400]) {
      expect(storedDurationLabel(toStoredDuration(s))).toBe(formatDuration(s));
    }
  });

  it("prefers durationSeconds and falls back to the legacy duration", () => {
    expect(podcastDurationLabel({ durationSeconds: 95, duration: 99 })).toBe("1:35");
    expect(podcastDurationLabel({ duration: 4.07 })).toBe("4:07");
    expect(podcastDurationLabel({})).toBe("—");
  });

  it("formats numbers compactly only when large", () => {
    expect(formatNumber(1234)).toBe("1,234");
    expect(formatNumber(25300)).toBe("25.3K");
    expect(formatNumber("abc")).toBe("0");
  });

  it("builds initials", () => {
    expect(initials("Grace  Hopper Smith")).toBe("GH");
    expect(initials("")).toBe("?");
    expect(initials(undefined)).toBe("?");
  });

  it("numbers rows continuously across pages", () => {
    expect(rowNumber(0, 1, 10)).toBe(1);
    expect(rowNumber(0, 3, 10)).toBe(21);
  });
});

describe("geo helpers", () => {
  it("converts to and from GeoJSON [lng, lat]", () => {
    expect(toGeoPoint({ lat: 23.8, lng: 90.4 })).toEqual({ type: "Point", coordinates: [90.4, 23.8] });
    expect(fromGeoPoint("Dhaka", { coordinates: [90.4, 23.8] })).toEqual({ address: "Dhaka", lat: 23.8, lng: 90.4 });
    expect(fromGeoPoint(undefined, undefined)).toEqual({ address: "", lat: undefined, lng: undefined });
  });
  it("validates a complete location", async () => {
    await expect(locationRule.validator(null, { address: "x", lat: 1, lng: 2 })).resolves.toBeUndefined();
    await expect(locationRule.validator(null, { address: " ", lat: 1, lng: 2 })).rejects.toThrow(/address/);
    await expect(locationRule.validator(null, { address: "x", lat: undefined, lng: 2 })).rejects.toThrow(/Latitude/);
  });
});

describe("isVideoUrl", () => {
  it("detects video by S3 prefix or extension", () => {
    expect(isVideoUrl("https://cdn/podcast_videos/abc")).toBe(true);
    expect(isVideoUrl("https://cdn/x/clip.MP4?sig=1")).toBe(true);
    expect(isVideoUrl("https://cdn/podcast_audio/abc.mp3")).toBe(false);
    expect(isVideoUrl(undefined)).toBe(false);
  });
  it("prefers the backend mediaType over URL guessing", () => {
    expect(isVideoPodcast({ mediaType: "audio", podcast_url: "https://cdn/x.mp4" })).toBe(false);
    expect(isVideoPodcast({ mediaType: "video", podcast_url: "https://cdn/x.mp3" })).toBe(true);
    expect(isVideoPodcast({ podcast_url: "https://cdn/podcast_videos/a" })).toBe(true); // legacy record
  });
});

describe("findNavItem", () => {
  it("matches exact and nested paths, longest prefix first", () => {
    expect(findNavItem("/").key).toBe("dashboard");
    expect(findNavItem("/albums/123").key).toBe("albums");
    expect(findNavItem("/content/faq").key).toBe("faq");
    expect(findNavItem("/content/faq").parent.key).toBe("content");
    expect(findNavItem("/nope")).toBeUndefined();
  });
  it("does not treat a shared prefix as a match", () => {
    // "/categories" must not match "/categoriesX"
    expect(findNavItem("/categoriesX")).toBeUndefined();
  });
});
