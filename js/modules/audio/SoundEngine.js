// SoundEngine.js - Procedural 8-bit sound generation using Web Audio API
export class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3;
        this.initialized = false;
        
        // Load preferences from localStorage
        this.loadPreferences();
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            // Create AudioContext on user gesture
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('SoundEngine initialized');
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            this.enabled = false;
        }
    }
    
    loadPreferences() {
        const soundEnabled = localStorage.getItem('tetrisSoundEnabled');
        const volume = localStorage.getItem('tetrisVolume');
        
        if (soundEnabled !== null) {
            this.enabled = soundEnabled === 'true';
        }
        if (volume !== null) {
            this.volume = parseFloat(volume);
        }
    }
    
    savePreferences() {
        localStorage.setItem('tetrisSoundEnabled', this.enabled.toString());
        localStorage.setItem('tetrisVolume', this.volume.toString());
    }
    
    toggleSound() {
        this.enabled = !this.enabled;
        this.savePreferences();
        return this.enabled;
    }
    
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.savePreferences();
    }
    
    playTone(frequency, duration, waveType = 'square', volumeMultiplier = 1.0) {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = waveType;
        oscillator.frequency.value = frequency;
        
        const finalVolume = this.volume * volumeMultiplier;
        gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playArpeggio(frequencies, noteDuration, volumeMultiplier = 1.0) {
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, noteDuration, 'square', volumeMultiplier);
            }, index * noteDuration * 1000);
        });
    }
    
    // Game event sounds
    move() {
        // Short blip for left/right movement
        this.playTone(200, 0.05, 'square', 0.3);
    }
    
    rotate() {
        // Slightly higher blip for rotation
        this.playTone(300, 0.08, 'square', 0.4);
    }
    
    drop() {
        // Deeper thud for soft drop
        this.playTone(150, 0.15, 'sawtooth', 0.5);
    }
    
    hardDrop() {
        // Impactful slam sound
        this.playTone(100, 0.2, 'sawtooth', 0.6);
    }
    
    lineClear(count) {
        // Ascending arpeggio based on lines cleared
        const baseFrequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const frequencies = baseFrequencies.slice(0, count);
        this.playArpeggio(frequencies, 0.15, 0.5);
    }
    
    tetris() {
        // Epic 5-note arpeggio for 4-line clear
        const frequencies = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        this.playArpeggio(frequencies, 0.2, 0.6);
    }
    
    gameOver() {
        // Descending sad tone
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        // Descending frequency
        const startTime = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(400, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, startTime + 1.0);
        
        gainNode.gain.setValueAtTime(this.volume * 0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 1.0);
    }
    
    levelUp() {
        // Celebratory ascending scale
        const frequencies = [523, 659, 784, 1047, 1319]; // C5, E5, G5, C6, E6
        this.playArpeggio(frequencies, 0.1, 0.5);
    }
    
    coinEarned() {
        // "Cha-ching" coin collection sound
        if (!this.enabled || !this.initialized || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sine';
        
        const startTime = this.audioContext.currentTime;
        oscillator.frequency.setValueAtTime(800, startTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, startTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.4, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
    }
}

// Export singleton instance
export const soundEngine = new SoundEngine();
