# 3D source models (local)

High-resolution / raw GLB sources for authoring. Optimized runtime copies live in `focus-tiger/public/models/`.

| Local source (gitignored) | Runtime path | Notes |
|---|---|---|
| `yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb` | `public/models/tiger-meditate-closed.glb` | **Current** Idle closed-eyes Yin; monochrome warm grey cotton-linen robe / tea-robe style, **no crimson trim** |
| `yin-meditate-closed-grey-kasaya-crimson-trim.source.glb` | `public/models/tiger-meditate-closed.crimson-trim-307k.glb` | Historical (superseded): grey kasaya **with crimson trim**; rollback only |
| `yin-meditate-closed-grey-kasaya.optimized-496k.glb` | — | Earlier optimized runtime backup (~496KB) |
| `yin-grey-cotton-linen-kasaya.glb` | — | Earlier grey-kasaya source (no crimson trim) |

Large source files here are intentionally **not** committed. Keep them on disk for re-export; sync via other backup if needed.

## Runtime compress recipe (quality ~2MB class)

Do **not** use one-shot `optimize … --texture-compress webp --texture-size 1024` alone — default WebP settings can crush fabric detail to ~300KB and hurt look (see `tiger-meditate-closed.webp-292k.glb` cautionary backup).

Preferred pipeline (matches other pose GLBs’ ~2MB visual budget; mesh **not** simplified):

```bash
SRC=art-reference/models/sources/yin-meditate-closed-monochrome-grey-cotton-linen-robe.source.glb
TMP=/tmp/yin-compress
mkdir -p "$TMP"

# 1) Color/normal max 1024 (same as legacy pose assets)
npx @gltf-transform/cli resize "$SRC" "$TMP/a.glb" --width 1024 --height 1024

# 2) Metallic-roughness 512 (same split as legacy KTX2 export)
npx @gltf-transform/cli resize "$TMP/a.glb" "$TMP/b.glb" --width 512 --height 512 --pattern '*metallic*'

# 3) Lossless WebP (fabric-safe). Ideal is KTX2/UASTC like legacy — needs system `ktx` CLI.
npx @gltf-transform/cli webp "$TMP/b.glb" "$TMP/c.glb" --lossless true --effort 80

# 4) Draco mesh only; keep textures; no mesh simplify
npx @gltf-transform/cli optimize "$TMP/c.glb" public/models/tiger-meditate-closed.glb \
  --compress draco \
  --texture-compress false \
  --simplify false
```

**Legacy KTX2 path** (when Khronos `ktx` / `toktx` is installed): after steps 1–2, use `--texture-compress ktx2` instead of WebP — typically lands ~2.1MB like `tiger-meditate-closed.legacy.glb` / smile / sleeping.

Formal costume authority: `docs/CHARACTER_BIBLE.md` (monochrome warm light stone-gray / greige cotton-linen wrap; no red fabric or trim).
