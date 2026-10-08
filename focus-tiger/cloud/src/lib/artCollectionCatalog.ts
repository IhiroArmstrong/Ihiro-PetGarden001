/**
 * Yin's Art Collection shelf for Stripe price_data.
 * Ids and English names match `src/core/artCollectionCatalog.js`.
 * The old five-work draft is not for sale.
 */

import { findArtEditionSet, findArtEditionSheet } from "./artEditionCatalog.ts";

export const ART_COLLECTION_PRODUCT = "art-collection";
export const ART_COLLECTION_UNIT_AMOUNT = 199;

export type ArtCollectionWork = {
	id: string;
	unitAmount: number;
	name: string;
	/** Private object stem. Not a public URL. */
	hdId: string;
};

function work(id: string, name: string, hdId: string): ArtCollectionWork {
	return Object.freeze({
		id,
		unitAmount: ART_COLLECTION_UNIT_AMOUNT,
		name,
		hdId,
	});
}

export const ART_COLLECTION_WORKS: readonly ArtCollectionWork[] = Object.freeze([
	work("celadon-taotie-gu", "Celadon taotie gu", "hd-sp-01"),
	work("celadon-taotie-zun", "Celadon taotie zun", "hd-sp-02"),
	work("celadon-floral-ring-hu", "Celadon floral ring hu", "hd-sp-03"),
	work("celadon-dragon-ring-fanghu", "Celadon dragon-ring fanghu", "hd-sp-04"),
	work("celadon-taotie-gui", "Celadon taotie gui", "hd-sp-05"),
	work("celadon-taotie-ding", "Celadon taotie ding", "hd-sp-06"),
	work("celadon-beast-foot-pan", "Celadon beast-foot pan", "hd-sp-07"),
	work("jun-moon-white-dragon-fanghu", "Jun moon-white dragon fanghu", "hd-sp-08"),
	work("ru-crackle-fanghu", "Ru crackle fanghu", "hd-sp-09"),
	work("amber-glaze-fanghu", "Amber glaze fanghu", "hd-sp-10"),
	work("ge-taotie-li", "Ge taotie li", "hd-sg-01"),
	work("ge-dragon-zun", "Ge dragon zun", "hd-sg-02"),
	work("ge-hunting-stem-bowl", "Ge hunting-scene dou", "hd-sg-03"),
	work("ge-beast-ring-hu", "Ge beast-ring hu", "hd-sg-04"),
	work("ge-upright-ear-ding", "Ge upright-ear ding", "hd-sg-05"),
	work("ge-taotie-gu", "Ge taotie gu", "hd-sg-06"),
	work("ge-crackle-fanghu", "Ge crackle fanghu", "hd-sg-07"),
	work("tixi-dragon-yi", "Tixi dragon yi", "hd-tx-01"),
	work("tixi-cloud-ge", "Tixi cloud-scroll ge", "hd-tx-02"),
	work("tixi-taotie-gu", "Tixi taotie gu", "hd-tx-03"),
	work("tixi-four-ram-zun", "Tixi four-ram zun", "hd-tx-04"),
	work("tixi-upright-ear-ding", "Tixi upright-ear ding", "hd-tx-05"),
	work("tixi-taotie-li", "Tixi taotie li", "hd-tx-06"),
	work("tixi-dragon-ring-hu", "Tixi dragon-ring hu", "hd-tx-07"),
	work("tixi-dragon-ear-gui", "Tixi dragon-ear gui", "hd-tx-08"),
]);

export function findArtCollectionWork(artId: string): ArtCollectionWork | null {
	const listed = ART_COLLECTION_WORKS.find((row) => row.id === artId);
	if (listed) return listed;
	const set = findArtEditionSet(artId);
	if (set) {
		return { id: set.id, unitAmount: set.unitAmount, name: set.name };
	}
	const sheet = findArtEditionSheet(artId);
	if (sheet) return { id: sheet.id, unitAmount: 0, name: sheet.id };
	return null;
}

/** New checkout may start only for a whole edition set. */
export function findArtForSale(artId: string): ArtCollectionWork | null {
	const set = findArtEditionSet(artId);
	if (!set) return null;
	return { id: set.id, unitAmount: set.unitAmount, name: set.name };
}
