/**
 * Sales unit is one set of five. The edition records 100 sets, then stops.
 * Member sheets are granted with the set. They are not sold alone.
 */

export const ART_EDITION_LIMIT = 100;
export const ART_EDITION_PRICE_CENTS = 995;

export type ArtEditionSet = {
	id: string;
	name: string;
	unitAmount: number;
	editionLimit: number;
	sheetIds: readonly string[];
};

export const CELADON_RELIEF_FIVE: ArtEditionSet = Object.freeze({
	id: "celadon-relief-five",
	name: "Celadon relief five",
	unitAmount: ART_EDITION_PRICE_CENTS,
	editionLimit: ART_EDITION_LIMIT,
	sheetIds: Object.freeze([
		"celadon-relief-dragon-gu",
		"moon-white-floral-tiered-box",
		"celadon-cloud-square-box",
		"celadon-peony-vase",
		"celadon-ice-crack-hu",
	]),
});

export const ART_EDITION_SETS: readonly ArtEditionSet[] = Object.freeze([
	CELADON_RELIEF_FIVE,
]);

export function findArtEditionSet(artId: string): ArtEditionSet | null {
	return ART_EDITION_SETS.find((row) => row.id === artId) || null;
}

const RELIEF_HD_ID: Readonly<Record<string, string>> = Object.freeze({
	"celadon-relief-dragon-gu": "hd-rf-01",
	"moon-white-floral-tiered-box": "hd-rf-02",
	"celadon-cloud-square-box": "hd-rf-03",
	"celadon-peony-vase": "hd-rf-04",
	"celadon-ice-crack-hu": "hd-rf-05",
});

export function editionSheetHdId(artId: string): string {
	return RELIEF_HD_ID[artId] || "";
}

export function findArtEditionSheet(artId: string): { id: string; setId: string } | null {
	for (const set of ART_EDITION_SETS) {
		if (set.sheetIds.includes(artId)) return { id: artId, setId: set.id };
	}
	return null;
}

/** Ids written when this payment is confirmed. A single old sheet stays one id. */
export function artGrantIds(artId: string, singleKnown: boolean): string[] {
	const set = findArtEditionSet(artId);
	if (set) return [set.id, ...set.sheetIds];
	if (singleKnown) return [artId];
	return [];
}

export function editionSoldKey(setId: string): string {
	return `art-edition-sold:${setId}`;
}

export function decideEditionSale(
	sold: number,
	limit: number,
): { ok: true; next: number } | { ok: false; reason: "edition_closed" } {
	const count = Number.isInteger(sold) && sold > 0 ? sold : 0;
	if (count >= limit) return { ok: false, reason: "edition_closed" };
	return { ok: true, next: count + 1 };
}

export function decideEditionRelease(sold: number): number {
	const count = Number.isInteger(sold) && sold > 0 ? sold : 0;
	return count > 0 ? count - 1 : 0;
}
