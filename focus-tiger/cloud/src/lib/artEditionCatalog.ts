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

export const CIZHOU_RED_GREEN_FIVE: ArtEditionSet = Object.freeze({
	id: "cizhou-red-green-five",
	name: "Cizhou red-green five",
	unitAmount: ART_EDITION_PRICE_CENTS,
	editionLimit: ART_EDITION_LIMIT,
	sheetIds: Object.freeze([
		"cizhou-twin-fanghu",
		"cizhou-covered-ding",
		"cizhou-flower-rim-plate",
		"cizhou-dragon-fish-gu",
		"cizhou-changchun-square-plate",
	]),
});

export const GE_CRACKLE_1010_G1: ArtEditionSet = Object.freeze({
	id: "ge-crackle-1010-g1",
	name: "Ge crackle five (I)",
	unitAmount: ART_EDITION_PRICE_CENTS,
	editionLimit: ART_EDITION_LIMIT,
	sheetIds: Object.freeze([
		"ge-g1-hunting-stem-bowl",
		"ge-g1-taotie-gu",
		"ge-g1-beast-ring-hu",
		"ge-g1-upright-ear-ding",
		"ge-g1-dragon-zun",
	]),
});

export const GE_CRACKLE_1010_G2: ArtEditionSet = Object.freeze({
	id: "ge-crackle-1010-g2",
	name: "Ge crackle five (II)",
	unitAmount: ART_EDITION_PRICE_CENTS,
	editionLimit: ART_EDITION_LIMIT,
	sheetIds: Object.freeze([
		"ge-g2-taotie-li",
		"ge-g2-dragon-zun",
		"ge-g2-hunting-stem-bowl",
		"ge-g2-taotie-gu",
		"ge-g2-crackle-fanghu",
	]),
});

export const ART_EDITION_SETS: readonly ArtEditionSet[] = Object.freeze([
	CELADON_RELIEF_FIVE,
	CIZHOU_RED_GREEN_FIVE,
	GE_CRACKLE_1010_G1,
	GE_CRACKLE_1010_G2,
]);

export function findArtEditionSet(artId: string): ArtEditionSet | null {
	return ART_EDITION_SETS.find((row) => row.id === artId) || null;
}

const EDITION_SHEET_HD_ID: Readonly<Record<string, string>> = Object.freeze({
	"celadon-relief-dragon-gu": "hd-rf-01",
	"moon-white-floral-tiered-box": "hd-rf-02",
	"celadon-cloud-square-box": "hd-rf-03",
	"celadon-peony-vase": "hd-rf-04",
	"celadon-ice-crack-hu": "hd-rf-05",
	"cizhou-twin-fanghu": "hd-cz-01",
	"cizhou-covered-ding": "hd-cz-02",
	"cizhou-flower-rim-plate": "hd-cz-03",
	"cizhou-dragon-fish-gu": "hd-cz-04",
	"cizhou-changchun-square-plate": "hd-cz-05",
	"ge-g1-hunting-stem-bowl": "hd-g1-01",
	"ge-g1-taotie-gu": "hd-g1-02",
	"ge-g1-beast-ring-hu": "hd-g1-03",
	"ge-g1-upright-ear-ding": "hd-g1-04",
	"ge-g1-dragon-zun": "hd-g1-05",
	"ge-g2-taotie-li": "hd-g2-01",
	"ge-g2-dragon-zun": "hd-g2-02",
	"ge-g2-hunting-stem-bowl": "hd-g2-03",
	"ge-g2-taotie-gu": "hd-g2-04",
	"ge-g2-crackle-fanghu": "hd-g2-05",
});

export function editionSheetHdId(artId: string): string {
	return EDITION_SHEET_HD_ID[artId] || "";
}

/** Tea gift. Not a shelf sheet and not part of the 100-set count. */
export const TEA_GIFT_ART_ID = "gold-duck-yi";
export const TEA_GIFT_HD_ID = "hd-tg-01";

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
