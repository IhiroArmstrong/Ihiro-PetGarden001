import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import type { KVNamespace } from "@cloudflare/workers-types";
import {
	coPracticeResearchRowKey,
	coPracticeResearchStudyPrefix,
} from "../lib/coPracticeResearchKv.ts";
import {
	CO_PRACTICE_RESEARCH_MAX_BODY_BYTES,
	handleCoPracticeResearchIngestDelete,
	handleCoPracticeResearchIngestPost,
} from "./coPracticeResearchIngest.ts";
import type { Env } from "../types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
	readFileSync(
		join(here, "../../../docs/research/research-payload.v1.golden.json"),
		"utf8",
	),
);

function mockKv(): KVNamespace {
	const memory = new Map<string, string>();
	return {
		put: async (key: string, value: string) => {
			memory.set(key, value);
		},
		get: async (key: string) => memory.get(key) ?? null,
		delete: async (key: string) => {
			memory.delete(key);
		},
		list: async (opts: { prefix?: string; cursor?: string }) => {
			const prefix = opts.prefix ?? "";
			const names = [...memory.keys()]
				.filter((k) => k.startsWith(prefix))
				.sort();
			return {
				keys: names.map((name) => ({ name })),
				list_complete: true,
				cursor: "",
			};
		},
	} as KVNamespace;
}

describe("coPracticeResearchIngest routes", () => {
	it("POST stores golden row and drops unknown keys", async () => {
		const kv = mockKv();
		const env = { CO_PRACTICE_RESEARCH_KV: kv } as Env;
		const body = { ...golden, transcript: "nope" };
		const req = new Request("https://example.test/api/co-practice-research-ingest", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
		const res = await handleCoPracticeResearchIngestPost(req, env);
		assert.equal(res.status, 200);
		const key = coPracticeResearchRowKey(golden.studyId, golden.week);
		const stored = await kv.get(key);
		assert.ok(stored);
		const parsed = JSON.parse(stored!);
		assert.equal(parsed.studyId, golden.studyId);
		assert.equal(parsed.transcript, undefined);
	});

	it("POST rejects oversized body", async () => {
		const kv = mockKv();
		const env = { CO_PRACTICE_RESEARCH_KV: kv } as Env;
		const big = "x".repeat(CO_PRACTICE_RESEARCH_MAX_BODY_BYTES + 1);
		const req = new Request("https://example.test/api/co-practice-research-ingest", {
			method: "POST",
			body: big,
		});
		const res = await handleCoPracticeResearchIngestPost(req, env);
		assert.equal(res.status, 413);
	});

	it("DELETE removes all weekly rows for studyId", async () => {
		const kv = mockKv();
		const env = { CO_PRACTICE_RESEARCH_KV: kv } as Env;
		await kv.put(
			coPracticeResearchRowKey(golden.studyId, "2026-W45"),
			"{}",
		);
		await kv.put(
			coPracticeResearchRowKey(golden.studyId, golden.week),
			"{}",
		);
		await kv.put(
			coPracticeResearchRowKey(
				"a1b2c3d4-e5f6-4789-a012-3456789abcde",
				golden.week,
			),
			"{}",
		);

		const req = new Request("https://example.test/api/co-practice-research-ingest", {
			method: "DELETE",
			headers: {
				authorization: `Bearer ${golden.studyId}`,
			},
		});
		const res = await handleCoPracticeResearchIngestDelete(req, env);
		assert.equal(res.status, 200);
		const json = (await res.json()) as { deleted: number };
		assert.equal(json.deleted, 2);

		const left = await kv.get(
			coPracticeResearchRowKey(golden.studyId, golden.week),
		);
		assert.equal(left, null);

		const other = await kv.get(
			coPracticeResearchRowKey(
				"a1b2c3d4-e5f6-4789-a012-3456789abcde",
				golden.week,
			),
		);
		assert.ok(other);

		const prefix = coPracticeResearchStudyPrefix(golden.studyId);
		const listed = await kv.list({ prefix });
		assert.equal(listed.keys.length, 0);
	});

	it("DELETE rejects bad Bearer", async () => {
		const kv = mockKv();
		const env = { CO_PRACTICE_RESEARCH_KV: kv } as Env;
		const req = new Request("https://example.test/api/co-practice-research-ingest", {
			method: "DELETE",
			headers: { authorization: "Bearer not-uuid" },
		});
		const res = await handleCoPracticeResearchIngestDelete(req, env);
		assert.equal(res.status, 400);
	});
});
