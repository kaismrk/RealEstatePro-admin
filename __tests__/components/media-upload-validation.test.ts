import { describe, it, expect } from "vitest";
import {
  validateAdFile,
  AD_MAX_IMAGE_BYTES,
  AD_MAX_VIDEO_BYTES,
} from "@/components/ads/MediaUpload";

const MB = 1024 * 1024;

describe("validateAdFile — image campaigns", () => {
  it("accepts JPEG, PNG and WebP under 5 MB", () => {
    expect(validateAdFile({ type: "image/jpeg", size: 4 * MB }, "image")).toBeNull();
    expect(validateAdFile({ type: "image/png", size: 1 * MB }, "image")).toBeNull();
    expect(validateAdFile({ type: "image/webp", size: 100 }, "image")).toBeNull();
  });

  it("accepts a file at exactly the 5 MB limit", () => {
    expect(
      validateAdFile({ type: "image/jpeg", size: AD_MAX_IMAGE_BYTES }, "image")
    ).toBeNull();
  });

  it("rejects images over 5 MB", () => {
    expect(validateAdFile({ type: "image/jpeg", size: 6 * MB }, "image")).toMatch(
      /5 MB/
    );
  });

  it("rejects non-allowed image types (gif, svg)", () => {
    expect(validateAdFile({ type: "image/gif", size: 1 * MB }, "image")).toMatch(
      /JPEG, PNG or WebP/
    );
    expect(validateAdFile({ type: "image/svg+xml", size: 1024 }, "image")).toMatch(
      /JPEG, PNG or WebP/
    );
  });

  it("rejects a video file on an image campaign", () => {
    expect(validateAdFile({ type: "video/mp4", size: 1 * MB }, "image")).toMatch(
      /JPEG, PNG or WebP/
    );
  });
});

describe("validateAdFile — video campaigns", () => {
  it("accepts MP4 under 20 MB", () => {
    expect(validateAdFile({ type: "video/mp4", size: 19 * MB }, "video")).toBeNull();
  });

  it("accepts a file at exactly the 20 MB limit", () => {
    expect(
      validateAdFile({ type: "video/mp4", size: AD_MAX_VIDEO_BYTES }, "video")
    ).toBeNull();
  });

  it("rejects videos over 20 MB", () => {
    expect(validateAdFile({ type: "video/mp4", size: 21 * MB }, "video")).toMatch(
      /20 MB/
    );
  });

  it("rejects non-MP4 video containers", () => {
    expect(validateAdFile({ type: "video/webm", size: 5 * MB }, "video")).toMatch(
      /MP4/
    );
    expect(validateAdFile({ type: "video/quicktime", size: 5 * MB }, "video")).toMatch(
      /MP4/
    );
  });

  it("rejects an image file as the main video creative", () => {
    expect(validateAdFile({ type: "image/jpeg", size: 1 * MB }, "video")).toMatch(
      /MP4/
    );
  });
});

describe("validateAdFile — video poster", () => {
  it("applies image rules to the poster of a video campaign", () => {
    expect(
      validateAdFile({ type: "image/png", size: 2 * MB }, "video", "poster")
    ).toBeNull();
  });

  it("rejects an MP4 as a poster", () => {
    expect(
      validateAdFile({ type: "video/mp4", size: 2 * MB }, "video", "poster")
    ).toMatch(/JPEG, PNG or WebP/);
  });

  it("rejects an oversize poster (> 5 MB)", () => {
    expect(
      validateAdFile({ type: "image/jpeg", size: 6 * MB }, "video", "poster")
    ).toMatch(/5 MB/);
  });
});
