# 3D source models (local)

High-resolution / raw GLB sources for authoring. Optimized runtime copies live in `focus-tiger/public/models/`.

| Local source (gitignored) | Runtime path | Notes |
|---|---|---|
| `yin-meditate-closed-grey-kasaya-crimson-trim.source.glb` | `public/models/tiger-meditate-closed.glb` | Current Idle closed-eyes Yin; grey cotton-linen kasaya with crimson trim |
| `yin-meditate-closed-grey-kasaya.optimized-496k.glb` | — | Previous optimized runtime backup (~496KB) |
| `yin-grey-cotton-linen-kasaya.glb` | — | Earlier grey-kasaya source (no crimson trim) |

Large source files here are intentionally **not** committed. Keep them on disk for re-export; sync via other backup if needed.

Compress recipe used for runtime:

```bash
npx @gltf-transform/cli optimize \
  art-reference/models/sources/<source>.glb \
  public/models/tiger-meditate-closed.glb \
  --compress draco \
  --texture-compress webp \
  --texture-size 1024
```
