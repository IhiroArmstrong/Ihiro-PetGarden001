/**
 * First shelf of Yin's Art Collection.
 * Keep ids and amounts aligned with `src/core/yinArtCollection.js`.
 * Checkout uses Stripe price_data so these amounts are the charge, not a client hint.
 */

export const ART_COLLECTION_PRODUCT = "art-collection";

export type ArtCollectionWork = {
	id: string;
	unitAmount: number;
	name: string;
};

export const ART_COLLECTION_WORKS: readonly ArtCollectionWork[] = Object.freeze([
	Object.freeze({
		id: "moonlit-celadon-jar",
		unitAmount: 299,
		name: "Moonlit Celadon Jar",
	}),
	Object.freeze({
		id: "amber-phoenix-ewer",
		unitAmount: 299,
		name: "Amber Phoenix Ewer",
	}),
	Object.freeze({
		id: "amber-hu-vase",
		unitAmount: 199,
		name: "Amber Hu Vase",
	}),
	Object.freeze({
		id: "gold-inlaid-ge",
		unitAmount: 199,
		name: "Gold-Inlaid Ge",
	}),
	Object.freeze({
		id: "pale-jade-ding",
		unitAmount: 99,
		name: "Pale Jade Ding",
	}),
]);

export function findArtCollectionWork(artId: string): ArtCollectionWork | null {
	return ART_COLLECTION_WORKS.find((work) => work.id === artId) || null;
}
