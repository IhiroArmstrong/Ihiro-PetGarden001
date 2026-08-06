import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAmbientNoteLabelState } from './ambientNoteLabel.js';

test('unread: pinned HINT label unless panel open', () => {
  assert.deepEqual(resolveAmbientNoteLabelState({ done: false }), {
    visible: true,
    localeKey: 'HINT_AMBIENT_SOUNDSCAPE',
    mode: 'pinned'
  });
  assert.deepEqual(
    resolveAmbientNoteLabelState({ done: false, hovering: true }),
    {
      visible: true,
      localeKey: 'HINT_AMBIENT_SOUNDSCAPE',
      mode: 'pinned'
    }
  );
  assert.deepEqual(
    resolveAmbientNoteLabelState({ done: false, panelOpen: true }),
    { visible: false, localeKey: null, mode: 'hidden' }
  );
});

test('done: hover shows AMBIENT_NOTE_HOVER; leave / panel hides', () => {
  assert.deepEqual(resolveAmbientNoteLabelState({ done: true }), {
    visible: false,
    localeKey: null,
    mode: 'hidden'
  });
  assert.deepEqual(
    resolveAmbientNoteLabelState({ done: true, hovering: true }),
    {
      visible: true,
      localeKey: 'AMBIENT_NOTE_HOVER',
      mode: 'hover'
    }
  );
  assert.deepEqual(
    resolveAmbientNoteLabelState({
      done: true,
      hovering: true,
      panelOpen: true
    }),
    { visible: false, localeKey: null, mode: 'hidden' }
  );
});
