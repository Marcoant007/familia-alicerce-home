import { describe, expect, it } from "vitest";
import { albumSchema } from "./album";
import { announcementSchema } from "./announcement";
import { eventSchema } from "./event";
import { ministrySchema } from "./ministry";
import { serviceSchema } from "./service";

describe("eventSchema", () => {
    const validEvent = {
        title: "  Culto de domingo  ",
        startsAt: "2026-10-04T18:00:00-03:00",
        endsAt: "2026-10-04T20:00:00-03:00",
    };

    it("trims the title and defaults isFeatured to false", () => {
        expect(eventSchema.parse(validEvent)).toMatchObject({ title: "Culto de domingo", isFeatured: false });
    });

    it("rejects an event that ends at or before it starts", () => {
        const result = eventSchema.safeParse({ ...validEvent, endsAt: validEvent.startsAt });

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error.issues[0]?.path).toEqual(["endsAt"]);
    });

    it("requires secure registration URLs", () => {
        expect(eventSchema.safeParse({ ...validEvent, registrationUrl: "http://example.test/signup" }).success)
            .toBe(false);
    });
});

describe("announcementSchema", () => {
    const validAnnouncement = { title: "Aviso importante", publishAt: "2026-10-01T12:00:00Z" };

    it("converts an empty unpublish date to undefined", () => {
        expect(announcementSchema.parse({ ...validAnnouncement, unpublishAt: "" }).unpublishAt).toBeUndefined();
    });

    it("rejects an unpublish date before the publish date", () => {
        expect(announcementSchema.safeParse({
            ...validAnnouncement,
            unpublishAt: "2026-09-30T12:00:00Z",
        }).success).toBe(false);
    });
});

describe("serviceSchema", () => {
    it("accepts Sunday and defaults sortOrder", () => {
        expect(serviceSchema.parse({ name: "Culto", weekday: "0", time: "18:30" }))
            .toMatchObject({ weekday: 0, time: "18:30", sortOrder: 0 });
    });

    it("rejects weekdays outside the Sunday-to-Saturday range", () => {
        expect(serviceSchema.safeParse({ name: "Culto", weekday: 7, time: "18:30" }).success).toBe(false);
    });

    it("rejects wall-clock times outside valid hour and minute ranges", () => {
        expect(serviceSchema.safeParse({ name: "Culto", weekday: 0, time: "24:60" }).success).toBe(false);
    });
});

describe("ministrySchema", () => {
    it("trims required and optional text fields", () => {
        expect(ministrySchema.parse({ name: "  Louvor  ", description: "  Música  " }))
            .toMatchObject({ name: "Louvor", description: "Música", sortOrder: 0 });
    });

    it("rejects names shorter than two characters", () => {
        expect(ministrySchema.safeParse({ name: "A" }).success).toBe(false);
    });
});

describe("albumSchema", () => {
    const driveUrl = "https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOpQrSt?usp=sharing";

    it("allows blank optional form values", () => {
        const album = albumSchema.parse({ title: "Conferência", eventId: "", takenOn: "", driveUrl });

        expect(album.eventId).toBe("");
        expect(album.takenOn).toBeUndefined();
    });

    it("rejects a non-UUID event id", () => {
        expect(albumSchema.safeParse({ title: "Conferência", eventId: "not-an-id", driveUrl }).success).toBe(false);
    });

    it("rejects a link that isn't a Google Drive folder", () => {
        expect(albumSchema.safeParse({ title: "Conferência", driveUrl: "https://example.com/fotos" }).success).toBe(
            false
        );
    });
});