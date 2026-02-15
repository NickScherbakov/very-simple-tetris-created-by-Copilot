'use strict';

/**
 * ReplaySystem - Records and plays back game sessions
 * @module ReplaySystem
 */

/**
 * Seeded random number generator (mulberry32)
 * Provides deterministic randomness for replay consistency
 * @param {number} seed - Initial seed value
 * @returns {function} Random number generator function
 */
function mulberry32(seed) {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export class ReplaySystem {
    constructor() {
        this.events = [];       // Array of {t: timestamp_ms, type: string}
        this.startTime = 0;
        this.seed = 0;          // Seed for deterministic piece generation
        this.recording = false;
        this.playing = false;
        this.metadata = {};     // {score, level, lines, theme, date}
        this.playbackTimeouts = [];
        this.rng = null;        // Current RNG function
    }

    /**
     * Start recording a new replay
     * @returns {number} The seed used for this recording
     */
    startRecording() {
        // Generate random seed
        this.seed = Math.floor(Math.random() * 2147483647);
        this.rng = mulberry32(this.seed);
        this.events = [];
        this.startTime = performance.now();
        this.recording = true;
        this.metadata = {};
        return this.seed;
    }

    /**
     * Record an event during gameplay
     * @param {string} type - Event type (left, right, rotate, soft_drop, hard_drop, pause, resume)
     * @param {Object} data - Additional event data (optional)
     */
    recordEvent(type, data = {}) {
        if (!this.recording) return;

        // Map full event types to compact codes
        const typeMap = {
            'left': 'l',
            'right': 'r',
            'rotate': 'u',
            'soft_drop': 'd',
            'hard_drop': 'h',
            'pause': 'p',
            'resume': 's'
        };

        const event = {
            t: Math.round(performance.now() - this.startTime),
            type: typeMap[type] || type,
            ...data
        };

        this.events.push(event);
    }

    /**
     * Stop recording and save metadata
     * @param {Object} metadata - Final game metadata
     */
    stopRecording(metadata) {
        this.recording = false;
        this.metadata = {
            ...metadata,
            date: Date.now()
        };
    }

    /**
     * Export replay data as encoded string
     * @returns {string} Base64 encoded replay data
     */
    export() {
        const data = {
            v: 1,                    // replay format version
            s: this.seed,            // PRNG seed
            m: this.metadata,        // metadata
            e: this.events           // events
        };

        try {
            const jsonStr = JSON.stringify(data);
            return btoa(encodeURIComponent(jsonStr));
        } catch (err) {
            console.error('Failed to export replay:', err);
            return null;
        }
    }

    /**
     * Import and validate replay data
     * @param {string} encoded - Base64 encoded replay string
     * @returns {Object|null} Decoded replay data or null on error
     */
    import(encoded) {
        try {
            const jsonStr = decodeURIComponent(atob(encoded));
            const data = JSON.parse(jsonStr);

            // Validate replay data
            if (!data.v || !data.s || !data.e || !Array.isArray(data.e)) {
                console.error('Invalid replay data format');
                return null;
            }

            return data;
        } catch (err) {
            console.error('Failed to import replay:', err);
            return null;
        }
    }

    /**
     * Generate shareable URL with replay data
     * @returns {string} URL with replay parameter
     */
    generateShareURL() {
        const encoded = this.export();
        if (!encoded) return null;

        const url = new URL(window.location.href);
        url.searchParams.set('replay', encoded);
        return url.toString();
    }

    /**
     * Check URL for replay parameter and return decoded data
     * @returns {Object|null} Decoded replay data or null
     */
    static fromURL() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('replay');

        if (!encoded) return null;

        const system = new ReplaySystem();
        return system.import(encoded);
    }

    /**
     * Start playback of a replay
     * @param {Object} replayData - Decoded replay data
     * @param {Object} callbacks - Event callbacks
     */
    startPlayback(replayData, callbacks) {
        this.playing = true;
        this.seed = replayData.s;
        this.rng = mulberry32(this.seed);
        this.events = replayData.e;
        this.metadata = replayData.m;

        // Map compact codes back to full event types
        const typeMap = {
            'l': 'left',
            'r': 'right',
            'u': 'rotate',
            'd': 'soft_drop',
            'h': 'hard_drop',
            'p': 'pause',
            's': 'resume'
        };

        // Clear any existing timeouts
        this.stopPlayback();

        // Schedule all events
        this.events.forEach(event => {
            const timeout = setTimeout(() => {
                if (!this.playing) return;

                const eventType = typeMap[event.type] || event.type;
                const callback = callbacks[eventType];

                if (callback) {
                    callback();
                }
            }, event.t);

            this.playbackTimeouts.push(timeout);
        });

        // Schedule completion callback
        if (this.events.length > 0 && callbacks.onComplete) {
            const lastEventTime = this.events[this.events.length - 1].t;
            const completeTimeout = setTimeout(() => {
                if (callbacks.onComplete) {
                    callbacks.onComplete();
                }
            }, lastEventTime + 1000);

            this.playbackTimeouts.push(completeTimeout);
        }
    }

    /**
     * Stop playback and clear all timeouts
     */
    stopPlayback() {
        this.playing = false;
        this.playbackTimeouts.forEach(timeout => clearTimeout(timeout));
        this.playbackTimeouts = [];
    }

    /**
     * Save current replay to localStorage
     * @param {string} name - Name for the replay
     * @returns {boolean} Success status
     */
    saveReplay(name) {
        const STORAGE_KEY = 'tetrisReplays';
        const replay = {
            name: name,
            data: this.export(),
            metadata: this.metadata,
            savedAt: Date.now()
        };

        try {
            let replays = this.loadReplays();
            replays.unshift(replay); // Add to beginning
            replays = replays.slice(0, 10); // Keep only 10 most recent

            localStorage.setItem(STORAGE_KEY, JSON.stringify(replays));
            return true;
        } catch (err) {
            console.error('Failed to save replay:', err);
            return false;
        }
    }

    /**
     * Load saved replays from localStorage
     * @returns {Array} Array of saved replays
     */
    loadReplays() {
        const STORAGE_KEY = 'tetrisReplays';
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.error('Failed to load replays:', err);
        }
        return [];
    }

    /**
     * Delete a saved replay
     * @param {number} index - Index of replay to delete
     * @returns {boolean} Success status
     */
    deleteReplay(index) {
        const STORAGE_KEY = 'tetrisReplays';
        try {
            let replays = this.loadReplays();
            if (index >= 0 && index < replays.length) {
                replays.splice(index, 1);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(replays));
                return true;
            }
        } catch (err) {
            console.error('Failed to delete replay:', err);
        }
        return false;
    }

    /**
     * Get the current RNG function
     * @returns {function|null} Current RNG or null
     */
    getRNG() {
        return this.rng;
    }

    /**
     * Check if currently recording
     * @returns {boolean}
     */
    isRecording() {
        return this.recording;
    }

    /**
     * Check if currently playing
     * @returns {boolean}
     */
    isPlaying() {
        return this.playing;
    }
}
