import { describe, expect, it } from "vitest";
import { extractDriveFolderId, driveEmbedUrl } from "./google-drive";

describe("extractDriveFolderId", () => {
  it("reads the id from a /drive/folders/ link", () => {
    expect(extractDriveFolderId("https://drive.google.com/drive/folders/1AbC-dEf_Gh?usp=sharing")).toBe(
      "1AbC-dEf_Gh"
    );
  });

  it("reads the id from a ?id= link", () => {
    expect(extractDriveFolderId("https://drive.google.com/open?id=1AbC-dEf_Gh")).toBe("1AbC-dEf_Gh");
  });

  it("rejects a link from another site", () => {
    expect(extractDriveFolderId("https://example.com/drive/folders/1AbC")).toBeNull();
  });

  it("rejects garbage input", () => {
    expect(extractDriveFolderId("nem link é")).toBeNull();
  });
});

describe("driveEmbedUrl", () => {
  it("builds the embeddedfolderview url", () => {
    expect(driveEmbedUrl("https://drive.google.com/drive/folders/1AbC?usp=sharing")).toBe(
      "https://drive.google.com/embeddedfolderview?id=1AbC#grid"
    );
  });

  it("returns null when the link isn't a valid folder link", () => {
    expect(driveEmbedUrl("https://example.com")).toBeNull();
  });
});
