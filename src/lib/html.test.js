import { describe, expect, it } from "vitest";
import { isBlankHtml, normalizeHtml } from "./html";

describe("normalizeHtml", () => {
  it("trims empty paragraphs at the start and end", () => {
    expect(normalizeHtml("<p><br></p><p>About us</p><p><br></p><p>&nbsp;</p>")).toBe("<p>About us</p>");
    expect(normalizeHtml("<div><br/></div><h2>Terms</h2>")).toBe("<h2>Terms</h2>");
  });
  it("keeps intentional blank lines between content", () => {
    expect(normalizeHtml("<p>A</p><p><br></p><p>B</p>")).toBe("<p>A</p><p><br></p><p>B</p>");
  });
  it("handles empty input", () => {
    expect(normalizeHtml(undefined)).toBe("");
    expect(normalizeHtml("<p><br></p>")).toBe("");
  });
});

describe("isBlankHtml", () => {
  it("treats markup without visible text as blank", () => {
    expect(isBlankHtml("")).toBe(true);
    expect(isBlankHtml("<p><br></p><p>&nbsp;</p>")).toBe(true);
    expect(isBlankHtml("<p>Hello</p>")).toBe(false);
  });
  it("counts images and rules as content", () => {
    expect(isBlankHtml('<p><img src="x.png"></p>')).toBe(false);
    expect(isBlankHtml("<hr>")).toBe(false);
  });
});
