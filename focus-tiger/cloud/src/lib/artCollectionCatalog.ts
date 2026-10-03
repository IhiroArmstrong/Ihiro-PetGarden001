/**
 * Yin's Art Collection shelf for Stripe price_data.
 * Ids and English names match `src/core/artCollectionCatalog.js`.
 * The old five-work draft is not for sale.
 */

export const ART_COLLECTION_PRODUCT = "art-collection";
export const ART_COLLECTION_UNIT_AMOUNT = 199;

export type ArtCollectionWork = {
	id: string;
	unitAmount: number;
	name: string;
};

function work(id: string, name: string): ArtCollectionWork {
	return Object.freeze({
		id,
		unitAmount: ART_COLLECTION_UNIT_AMOUNT,
		name,
	});
}

export const ART_COLLECTION_WORKS: readonly ArtCollectionWork[] = Object.freeze([
	work("celadon-taotie-gu", "Celadon taotie gu"),
	work("celadon-taotie-zun", "Celadon taotie zun"),
	work("celadon-floral-ring-hu", "Celadon floral ring hu"),
	work("celadon-dragon-ring-fanghu", "Celadon dragon-ring fanghu"),
	work("celadon-taotie-gui", "Celadon taotie gui"),
	work("celadon-taotie-ding", "Celadon taotie ding"),
	work("celadon-beast-foot-pan", "Celadon beast-foot pan"),
	work("jun-moon-white-dragon-fanghu", "Jun moon-white dragon fanghu"),
	work("ge-taotie-li", "Ge taotie li"),
	work("ge-dragon-zun", "Ge dragon zun"),
	work("ge-hunting-stem-bowl", "Ge hunting-scene dou"),
	work("ge-beast-ring-hu", "Ge beast-ring hu"),
	work("ge-upright-ear-ding", "Ge upright-ear ding"),
	work("ge-taotie-gu", "Ge taotie gu"),
	work("tixi-dragon-yi", "Tixi dragon yi"),
	work("tixi-cloud-ge", "Tixi cloud-scroll ge"),
	work("tixi-taotie-gu", "Tixi taotie gu"),
	work("tixi-four-ram-zun", "Tixi four-ram zun"),
	work("tixi-upright-ear-ding", "Tixi upright-ear ding"),
	work("tixi-taotie-li", "Tixi taotie li"),
	work("tixi-dragon-ring-hu", "Tixi dragon-ring hu"),
	work("tixi-dragon-ear-gui", "Tixi dragon-ear gui"),
]);

export function findArtCollectionWork(artId: string): ArtCollectionWork | null {
	return ART_COLLECTION_WORKS.find((row) => row.id === artId) || null;
}
