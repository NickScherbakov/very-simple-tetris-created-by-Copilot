// Friend Challenge System
// Allows players to challenge friends by sharing a URL with their score.
// Friends who beat the score get +500 TC bonus.

(function () {
    'use strict';

    const CHALLENGE_REWARD = 500;
    const CHALLENGE_PARAM = 'challenge';
    const CHALLENGE_LEVEL_PARAM = 'lvl';
    const STORAGE_KEY = 'tetrisChallengeTarget';

    /* ── helpers ── */
    function t(key, fallback) {
        return (window.i18n && window.i18n.t(key)) || fallback;
    }

    function getBaseUrl() {
        return window.location.origin + window.location.pathname;
    }

    function buildChallengeUrl(score, level) {
        const url = new URL(getBaseUrl());
        url.searchParams.set(CHALLENGE_PARAM, score);
        if (level && level > 1) url.searchParams.set(CHALLENGE_LEVEL_PARAM, level);
        return url.toString();
    }

    /* ── read challenge from URL on load ── */
    function parseChallengeFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const score = parseInt(params.get(CHALLENGE_PARAM), 10);
        const level = parseInt(params.get(CHALLENGE_LEVEL_PARAM), 10) || 1;
        if (!isNaN(score) && score > 0) {
            return { score, level };
        }
        return null;
    }

    /* ── show the top acceptance banner ── */
    function showChallengeBanner(challenge) {
        const banner = document.getElementById('challenge-banner');
        if (!banner) return;

        const textEl = banner.querySelector('.challenge-banner-text');
        if (textEl) {
            const scoreSpan = `<span class="challenge-banner-score">${challenge.score.toLocaleString()}</span>`;
            const rewardSpan = `<span class="challenge-banner-reward">+${CHALLENGE_REWARD} TC</span>`;
            textEl.innerHTML =
                `🎯 ${t('challenge_banner_text', 'Beat')} ${scoreSpan} ${t('challenge_banner_to_win', 'to win')} ${rewardSpan}`;
        }

        banner.classList.add('visible');

        banner.querySelector('.challenge-banner-close').addEventListener('click', () => {
            banner.classList.remove('visible');
        });
    }

    /* ── show game-over prompt to invite friends ── */
    function showChallengePrompt(score, level) {
        if (score <= 0) return;
        const prompt = document.getElementById('challenge-prompt');
        if (!prompt) return;

        const textEl = prompt.querySelector('.challenge-prompt-text');
        if (textEl) {
            textEl.innerHTML = `${t('challenge_prompt_text', 'Your score:')} <span class="challenge-prompt-score">${score.toLocaleString()}</span><br>${t('challenge_prompt_invite', 'Challenge your friends!')}`;
        }

        const btn = prompt.querySelector('.challenge-prompt-btn');
        if (btn) {
            btn.onclick = () => {
                prompt.classList.remove('visible');
                openChallengeModal(score, level);
            };
        }

        const dismiss = prompt.querySelector('.challenge-prompt-dismiss');
        if (dismiss) {
            dismiss.onclick = () => prompt.classList.remove('visible');
        }

        prompt.classList.add('visible');
    }

    function hideChallengePrompt() {
        const prompt = document.getElementById('challenge-prompt');
        if (prompt) prompt.classList.remove('visible');
    }

    /* ── open the sharing modal ── */
    function openChallengeModal(score, level) {
        hideChallengePrompt();
        const modal = document.getElementById('challenge-modal');
        if (!modal) return;

        // Score display
        const scoreEl = modal.querySelector('.challenge-score-value');
        if (scoreEl) scoreEl.textContent = score.toLocaleString();
        const levelEl = modal.querySelector('.challenge-score-level');
        if (levelEl) levelEl.textContent = `${t('level', 'Level')} ${level}`;

        // Reward info
        const rewardEl = modal.querySelector('.challenge-reward-info');
        if (rewardEl) rewardEl.textContent = `🏆 ${t('challenge_reward_info', `If your friend beats this score, they win +${CHALLENGE_REWARD} TC!`).replace('{reward}', CHALLENGE_REWARD)}`;

        const url = buildChallengeUrl(score, level);

        // URL display
        const urlBox = modal.querySelector('.challenge-url-box');
        if (urlBox) urlBox.textContent = url;

        // Copy link button
        const copyBtn = modal.querySelector('.challenge-copy-btn');
        if (copyBtn) {
            copyBtn.textContent = `📋 ${t('challenge_copy_link', 'Copy Challenge Link')}`;
            copyBtn.classList.remove('copied');
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(url).then(() => {
                    copyBtn.textContent = `✅ ${t('challenge_link_copied', 'Copied!')}`;
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = `📋 ${t('challenge_copy_link', 'Copy Challenge Link')}`;
                        copyBtn.classList.remove('copied');
                    }, 2500);
                }).catch(() => {
                    // Fallback for older browsers
                    const ta = document.createElement('textarea');
                    ta.value = url;
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                    copyBtn.textContent = `✅ ${t('challenge_link_copied', 'Copied!')}`;
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = `📋 ${t('challenge_copy_link', 'Copy Challenge Link')}`;
                        copyBtn.classList.remove('copied');
                    }, 2500);
                });
            };
        }

        // Social sharing buttons
        const shareText = t('challenge_share_text', `🎮 Beat my Tetris score of ${score.toLocaleString()}! Win +${CHALLENGE_REWARD} TC!`).replace('{score}', score.toLocaleString()).replace('{reward}', CHALLENGE_REWARD);
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(url);

        const telegram = modal.querySelector('.challenge-social-btn.telegram');
        if (telegram) {
            telegram.href = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            telegram.target = '_blank';
            telegram.rel = 'noopener noreferrer';
        }

        const whatsapp = modal.querySelector('.challenge-social-btn.whatsapp');
        if (whatsapp) {
            whatsapp.href = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
            whatsapp.target = '_blank';
            whatsapp.rel = 'noopener noreferrer';
        }

        const twitter = modal.querySelector('.challenge-social-btn.twitter');
        if (twitter) {
            twitter.href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
            twitter.target = '_blank';
            twitter.rel = 'noopener noreferrer';
        }

        const vk = modal.querySelector('.challenge-social-btn.vk');
        if (vk) {
            vk.href = `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`;
            vk.target = '_blank';
            vk.rel = 'noopener noreferrer';
        }

        modal.querySelector('.challenge-modal-close').onclick = closeChallengeModal;
        modal.onclick = (e) => { if (e.target === modal) closeChallengeModal(); };

        modal.classList.add('visible');
    }

    function closeChallengeModal() {
        const modal = document.getElementById('challenge-modal');
        if (modal) modal.classList.remove('visible');
    }

    /* ── check if current game beat the challenge ── */
    function checkChallengeWon(playerScore) {
        const challenge = parseChallengeFromUrl();
        if (!challenge) return false;
        return playerScore > challenge.score;
    }

    /* ── show "You won the challenge!" toast ── */
    function showChallengeWonToast() {
        const toast = document.getElementById('challenge-won-toast');
        if (!toast) return;
        toast.textContent = `🎉 ${t('challenge_won', `Challenge beaten! +${CHALLENGE_REWARD} TC added!`).replace('{reward}', CHALLENGE_REWARD)}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4500);
    }

    /* ── public API ── */
    window.challengeSystem = {
        /**
         * Call this after game over with the player's final score and level.
         * Handles both checking if the challenge was beaten and showing the prompt.
         */
        onGameOver(score, level) {
            if (score <= 0) return;

            // Did the player beat an incoming challenge?
            if (checkChallengeWon(score)) {
                if (window.tetriCoins) {
                    window.tetriCoins.addCoins(CHALLENGE_REWARD);
                }
                showChallengeWonToast();
                // Remove the challenge params from the URL so it doesn't repeat
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete(CHALLENGE_PARAM);
                cleanUrl.searchParams.delete(CHALLENGE_LEVEL_PARAM);
                window.history.replaceState({}, '', cleanUrl.toString());
            }

            // Always offer the player to challenge their friends with this score
            showChallengePrompt(score, level);
        },

        /** Open the share modal directly (e.g. from a button) */
        openShareModal(score, level) {
            openChallengeModal(score, level);
        }
    };

    /* ── init on DOM ready ── */
    function init() {
        const challenge = parseChallengeFromUrl();
        if (challenge) {
            showChallengeBanner(challenge);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
