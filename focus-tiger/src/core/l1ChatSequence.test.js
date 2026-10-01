/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  disposeChatSession,
  isNoSequencesLeftError,
  openFreshChatSession,
  resolveGemmaChatWrapper
} from '../../desktop/companion/l1ChatSequence.js';

describe('l1ChatSequence', () => {
  it('detects node-llama-cpp sequence pool errors', () => {
    assert.equal(isNoSequencesLeftError(new Error('No sequences left')), true);
    assert.equal(isNoSequencesLeftError('no sequences left'), true);
    assert.equal(isNoSequencesLeftError(new Error('companion_session_disposed')), false);
  });

  it('swallows dispose failures so recycle can continue', () => {
    assert.doesNotThrow(() =>
      disposeChatSession({
        dispose() {
          throw new Error('already disposed');
        }
      })
    );
  });

  it('recreates context when getSequence throws No sequences left', async () => {
    let created = 0;
    let disposed = 0;
    const emptyContext = {
      getSequence() {
        throw new Error('No sequences left');
      },
      async dispose() {
        disposed += 1;
      }
    };
    const freshSequence = { id: 'seq-2' };
    const freshContext = {
      getSequence() {
        return freshSequence;
      }
    };
    function LlamaChatSession(opts) {
      this.contextSequence = opts.contextSequence;
    }
    const next = await openFreshChatSession({
      LlamaChatSession,
      model: {
        async createContext() {
          created += 1;
          return freshContext;
        }
      },
      context: emptyContext,
      chat: {
        dispose() {
          disposed += 1;
        }
      }
    });
    assert.equal(created, 1);
    assert.ok(disposed >= 2);
    assert.equal(next.context, freshContext);
    assert.equal(next.chat.contextSequence, freshSequence);
  });

  it('skips Gemma chat wrapper for non-gemma prompt families', async () => {
    assert.equal(await resolveGemmaChatWrapper('qwen'), undefined);
    assert.equal(await resolveGemmaChatWrapper(undefined), undefined);
  });

  it('reuses getSequence when the pool still has a slot', async () => {
    const sequence = { id: 'seq-1' };
    const context = {
      getSequence() {
        return sequence;
      }
    };
    function LlamaChatSession(opts) {
      this.contextSequence = opts.contextSequence;
    }
    const next = await openFreshChatSession({
      LlamaChatSession,
      model: {
        async createContext() {
          throw new Error('should not recreate');
        }
      },
      context,
      chat: null
    });
    assert.equal(next.context, context);
    assert.equal(next.chat.contextSequence, sequence);
  });
});
