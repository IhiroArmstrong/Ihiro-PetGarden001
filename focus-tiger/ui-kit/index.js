/**
 * Focus Tiger UI Kit — entry
 * Import once; registers all custom elements. No bundler required.
 *
 *   <link rel="stylesheet" href="./tokens.css" />
 *   <script type="module" src="./index.js"></script>
 */

import { TigerHud, TIGER_HUD_TAG } from "./components/tiger-hud.js";
import { StreakMeter, STREAK_METER_TAG } from "./components/streak-meter.js";
import { PrimaryButton, PRIMARY_BUTTON_TAG } from "./components/primary-button.js";
import { SecondaryButton, SECONDARY_BUTTON_TAG } from "./components/secondary-button.js";
import {
  TooltipCard,
  DialogBox,
  TOOLTIP_CARD_TAG,
  DIALOG_BOX_TAG,
} from "./components/tooltip-card.js";
import {
  NotificationBadge,
  NOTIFICATION_BADGE_TAG,
} from "./components/notification-badge.js";
import { ProgressBar, PROGRESS_BAR_TAG } from "./components/progress-bar.js";
import {
  AchievementModal,
  ACHIEVEMENT_MODAL_TAG,
} from "./components/achievement-modal.js";
import {
  CollectionShelf,
  COLLECTION_SHELF_TAG,
} from "./components/collection-shelf.js";
import {
  DailyQuestCard,
  DAILY_QUEST_CARD_TAG,
} from "./components/daily-quest-card.js";

function define(tag, Ctor) {
  if (!customElements.get(tag)) {
    customElements.define(tag, Ctor);
  }
}

define(TIGER_HUD_TAG, TigerHud);
define(STREAK_METER_TAG, StreakMeter);
define(PRIMARY_BUTTON_TAG, PrimaryButton);
define(SECONDARY_BUTTON_TAG, SecondaryButton);
define(TOOLTIP_CARD_TAG, TooltipCard);
define(DIALOG_BOX_TAG, DialogBox);
define(NOTIFICATION_BADGE_TAG, NotificationBadge);
define(PROGRESS_BAR_TAG, ProgressBar);
define(ACHIEVEMENT_MODAL_TAG, AchievementModal);
define(COLLECTION_SHELF_TAG, CollectionShelf);
define(DAILY_QUEST_CARD_TAG, DailyQuestCard);

export {
  TigerHud,
  StreakMeter,
  PrimaryButton,
  SecondaryButton,
  TooltipCard,
  DialogBox,
  NotificationBadge,
  ProgressBar,
  AchievementModal,
  CollectionShelf,
  DailyQuestCard,
};
