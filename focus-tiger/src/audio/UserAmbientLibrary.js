/**
 * Focus Tiger™ is a product of Twinsology.
 * Copyright © 2026 Twinsology & Ihiro Armstrong Hao Hoh. All rights reserved.
 */

/**
 * User-uploaded ambient tracks (v1.0.0): IndexedDB blobs + Object URLs.
 * Built-ins stay in AMBIENT_TRACKS; this module only owns user-* ids.
 */

export const USER_AMBIENT_ID_PREFIX = 'user-';
export const USER_AMBIENT_DB_NAME = 'focus-tiger.user-ambient.v1';
export const USER_AMBIENT_STORE = 'tracks';
export const USER_AMBIENT_DB_VERSION = 1;

export const USER_AMBIENT_MAX_TRACKS = 10;
export const USER_AMBIENT_MAX_TOTAL_BYTES = 64 * 1024 * 1024;
export const USER_AMBIENT_MAX_FILE_BYTES = 20 * 1024 * 1024;

const OK_MIME = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/m4a'
]);

/**
 * @param {unknown} id
 * @returns {boolean}
 */
export function isUserAmbientTrackId(id) {
  return typeof id === 'string' && id.startsWith(USER_AMBIENT_ID_PREFIX);
}

/**
 * @param {{ id: string, label: string, addedAt: number, byteLength: number, mime: string }[]} userTracks
 * @param {{ id: string, src: string, labelKey: string }[]} builtInTracks
 */
export function mergeAmbientPanelTracks(userTracks, builtInTracks) {
  const users = [...(userTracks || [])].sort(
    (a, b) => (b.addedAt || 0) - (a.addedAt || 0)
  );
  return {
    userTracks: users,
    builtInTracks: [...(builtInTracks || [])]
  };
}

/**
 * @param {{ name?: string, type?: string, size?: number } | null | undefined} file
 * @param {{ trackCount: number, totalBytes: number }} usage
 * @returns {{ ok: true } | { ok: false, errorKey: string }}
 */
export function validateUserAmbientUpload(file, usage) {
  if (!file || typeof file !== 'object') {
    return { ok: false, errorKey: 'AMBIENT_UPLOAD_ERR_FORMAT' };
  }
  const name = String(file.name || '');
  const mime = String(file.type || '').toLowerCase();
  const size = Number(file.size) || 0;
  const lower = name.toLowerCase();
  const extOk = lower.endsWith('.mp3') || lower.endsWith('.m4a');
  const mimeOk = !mime || OK_MIME.has(mime);
  if (!extOk || !mimeOk) {
    return { ok: false, errorKey: 'AMBIENT_UPLOAD_ERR_FORMAT' };
  }
  if (size <= 0 || size > USER_AMBIENT_MAX_FILE_BYTES) {
    return { ok: false, errorKey: 'AMBIENT_UPLOAD_ERR_FILE_SIZE' };
  }
  if ((usage?.trackCount || 0) >= USER_AMBIENT_MAX_TRACKS) {
    return { ok: false, errorKey: 'AMBIENT_UPLOAD_ERR_LIMIT' };
  }
  if ((usage?.totalBytes || 0) + size > USER_AMBIENT_MAX_TOTAL_BYTES) {
    return { ok: false, errorKey: 'AMBIENT_UPLOAD_ERR_LIMIT' };
  }
  return { ok: true };
}

/**
 * @param {string} filename
 */
export function sanitizeUserAmbientLabel(filename) {
  const base = String(filename || 'track')
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\u3040-\u30ff\u4e00-\u9fff\s.-]+/g, '')
    .trim();
  const clipped = (base || 'My track').slice(0, 48);
  return clipped;
}

/**
 * @param {IDBDatabase} db
 * @param {string} mode
 */
function store(db, mode) {
  return db.transaction(USER_AMBIENT_STORE, mode).objectStore(USER_AMBIENT_STORE);
}

/**
 * @param {IDBRequest} req
 * @returns {Promise<any>}
 */
function idbReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb_error'));
  });
}

/**
 * @param {typeof indexedDB} [factory]
 * @returns {Promise<IDBDatabase>}
 */
export function openUserAmbientDb(factory = globalThis.indexedDB) {
  if (!factory?.open) {
    return Promise.reject(new Error('indexedDB_unavailable'));
  }
  return new Promise((resolve, reject) => {
    const req = factory.open(USER_AMBIENT_DB_NAME, USER_AMBIENT_DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(USER_AMBIENT_STORE)) {
        db.createObjectStore(USER_AMBIENT_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('idb_open_failed'));
  });
}

/**
 * In-memory store for unit tests (same record shape as IDB).
 */
export function createMemoryUserAmbientBackend() {
  /** @type {Map<string, any>} */
  const map = new Map();
  return {
    async getAll() {
      return [...map.values()];
    },
    async get(id) {
      return map.get(id) ?? null;
    },
    async put(record) {
      map.set(record.id, record);
    },
    async delete(id) {
      map.delete(id);
    },
    async clear() {
      map.clear();
    }
  };
}

/**
 * @param {IDBDatabase} db
 */
export function createIdbUserAmbientBackend(db) {
  return {
    async getAll() {
      return idbReq(store(db, 'readonly').getAll());
    },
    async get(id) {
      return idbReq(store(db, 'readonly').get(id));
    },
    async put(record) {
      await idbReq(store(db, 'readwrite').put(record));
    },
    async delete(id) {
      await idbReq(store(db, 'readwrite').delete(id));
    },
    async clear() {
      await idbReq(store(db, 'readwrite').clear());
    }
  };
}

export class UserAmbientLibrary {
  /**
   * @param {object} [options]
   * @param {{ getAll(): Promise<any[]>, get(id: string): Promise<any>, put(r: any): Promise<void>, delete(id: string): Promise<void>, clear(): Promise<void> }} [options.backend]
   * @param {() => number} [options.now]
   * @param {(blob: Blob) => string} [options.createObjectURL]
   * @param {(url: string) => void} [options.revokeObjectURL]
   */
  constructor({
    backend = null,
    now = () => Date.now(),
    createObjectURL = (blob) =>
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(blob)
        : '',
    revokeObjectURL = (url) => {
      try {
        URL.revokeObjectURL?.(url);
      } catch {
        /* ignore */
      }
    }
  } = {}) {
    this._backend = backend;
    this._now = now;
    this._createObjectURL = createObjectURL;
    this._revokeObjectURL = revokeObjectURL;
    /** @type {Map<string, string>} */
    this._urlById = new Map();
    this._ready = null;
  }

  async _ensureBackend() {
    if (this._backend) return this._backend;
    const db = await openUserAmbientDb();
    this._backend = createIdbUserAmbientBackend(db);
    return this._backend;
  }

  async ready() {
    if (!this._ready) {
      this._ready = this._ensureBackend().then(() => undefined);
    }
    return this._ready;
  }

  /**
   * @returns {Promise<{ id: string, label: string, addedAt: number, byteLength: number, mime: string }[]>}
   */
  async listMeta() {
    await this.ready();
    const rows = await this._backend.getAll();
    return rows
      .map((r) => ({
        id: r.id,
        label: r.label,
        addedAt: r.addedAt,
        byteLength: r.byteLength,
        mime: r.mime
      }))
      .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  }

  async usage() {
    const list = await this.listMeta();
    return {
      trackCount: list.length,
      totalBytes: list.reduce((s, t) => s + (t.byteLength || 0), 0)
    };
  }

  /**
   * @param {string} id
   * @returns {Promise<string | null>}
   */
  async resolveSrc(id) {
    if (!isUserAmbientTrackId(id)) return null;
    await this.ready();
    const cached = this._urlById.get(id);
    if (cached) return cached;
    const row = await this._backend.get(id);
    if (!row?.blob) return null;
    const url = this._createObjectURL(row.blob);
    if (url) this._urlById.set(id, url);
    return url || null;
  }

  /**
   * @param {File | Blob & { name?: string, type?: string }} file
   * @returns {Promise<{ ok: true, track: object } | { ok: false, errorKey: string }>}
   */
  async addFromFile(file) {
    await this.ready();
    const usage = await this.usage();
    const check = validateUserAmbientUpload(file, usage);
    if (!check.ok) return check;

    const id = `${USER_AMBIENT_ID_PREFIX}${this._now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const mime = String(file.type || 'audio/mpeg');
    const label = sanitizeUserAmbientLabel(file.name || 'track.mp3');
    const byteLength = Number(file.size) || 0;
    const blob =
      file instanceof Blob
        ? file
        : new Blob([file], { type: mime });

    const record = {
      id,
      label,
      addedAt: this._now(),
      byteLength,
      mime,
      blob
    };
    await this._backend.put(record);
    return {
      ok: true,
      track: {
        id,
        label,
        addedAt: record.addedAt,
        byteLength,
        mime
      }
    };
  }

  /**
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async remove(id) {
    if (!isUserAmbientTrackId(id)) return false;
    await this.ready();
    const url = this._urlById.get(id);
    if (url) {
      this._revokeObjectURL(url);
      this._urlById.delete(id);
    }
    await this._backend.delete(id);
    return true;
  }

  async clearAll() {
    await this.ready();
    for (const url of this._urlById.values()) {
      this._revokeObjectURL(url);
    }
    this._urlById.clear();
    await this._backend.clear();
  }
}

/** Singleton for product shell / reset. */
let sharedLibrary = null;

export function getSharedUserAmbientLibrary() {
  if (!sharedLibrary) sharedLibrary = new UserAmbientLibrary();
  return sharedLibrary;
}

/** @param {UserAmbientLibrary | null} lib */
export function setSharedUserAmbientLibraryForTests(lib) {
  sharedLibrary = lib;
}

/**
 * Clears user ambient IndexedDB (best-effort). Call alongside localStorage reset.
 * @returns {Promise<void>}
 */
export async function clearAllUserAmbientTracks() {
  try {
    const lib = getSharedUserAmbientLibrary();
    await lib.clearAll();
  } catch {
    /* private mode / IDB missing */
  }
}
