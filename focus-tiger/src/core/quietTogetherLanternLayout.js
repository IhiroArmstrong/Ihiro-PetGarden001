/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * Wide Idle lantern vertical anchor — keep above weekly heatmap cluster.
 * Must stay in sync with `WeeklyPracticeHeatmap` cluster `bottom` + shell height.
 */

/** Same as `.weekly-practice-heatmap-cluster` wide `bottom`. */
export const IDLE_HEATMAP_CLUSTER_BOTTOM_CSS = 'calc(36px + 88px + 20px)';

/** Cluster shell (~48px) + gap (10px) above heatmap cluster on wide Idle. */
export const IDLE_HEATMAP_CLUSTER_SHELL_GAP_PX = 58;

/** Wide: lanterns sit fully above heatmap caption area (left cluster). */
export const IDLE_LANTERN_BOTTOM_WIDE_CSS = `calc(36px + 88px + 20px + ${IDLE_HEATMAP_CLUSTER_SHELL_GAP_PX}px)`;

/** Narrow: heatmap cluster moves to top-left; lanterns stay lower on canvas. */
export const IDLE_LANTERN_BOTTOM_NARROW_CSS = '28%';

export const IDLE_LANTERN_NARROW_MQ_MAX_PX = 430;
