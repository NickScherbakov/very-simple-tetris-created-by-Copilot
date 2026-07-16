/**
 * TetriCoins Real-Money Shop
 *
 * How to set up payments (no backend required):
 * ─────────────────────────────────────────────
 * 1. Create a Stripe account at https://stripe.com
 * 2. In the Stripe Dashboard → Payment Links → Create three links for each package
 * 3. For each link set the "After payment" redirect URL to:
 *      https://<YOUR-DOMAIN>/?payment=success&pkg=<PACKAGE_ID>&sid=<SOME_RANDOM_TOKEN>
 *    Replace PACKAGE_ID with "starter", "standard", or "premium"
 *    The "sid" (session ID) parameter prevents double-granting the same purchase.
 * 4. Replace the three PAYMENT_LINKS values below with your real Stripe Payment Link URLs.
 * 5. Deploy — done. No server needed.
 *
 * Security note:
 *   Since this is a client-side game with virtual currency, the risk of abuse is minimal.
 *   For a production game with significant real-money value, add server-side verification.
 */

const SHOP_PACKAGES = [
    {
        id:       'starter',
        icon:     '💰',
        nameKey:  'shop_pkg_starter',
        coins:    1_000,
        bonusKey: null,
        priceUSD: '$0.99',
        popular:  false,
        // ↓ Replace with your Stripe Payment Link for the Starter pack
        paymentUrl: 'https://buy.stripe.com/YOUR_STARTER_LINK',
    },
    {
        id:       'standard',
        icon:     '💎',
        nameKey:  'shop_pkg_standard',
        coins:    5_500,
        bonusKey: 'shop_pkg_standard_bonus',
        priceUSD: '$3.99',
        popular:  true,
        // ↓ Replace with your Stripe Payment Link for the Standard pack
        paymentUrl: 'https://buy.stripe.com/YOUR_STANDARD_LINK',
    },
    {
        id:       'premium',
        icon:     '👑',
        nameKey:  'shop_pkg_premium',
        coins:    17_000,
        bonusKey: 'shop_pkg_premium_bonus',
        priceUSD: '$9.99',
        popular:  false,
        // ↓ Replace with your Stripe Payment Link for the Premium pack
        paymentUrl: 'https://buy.stripe.com/YOUR_PREMIUM_LINK',
    },
];

// Coins granted per package ID (used when reading the success redirect)
const PACKAGE_COINS = Object.fromEntries(
    SHOP_PACKAGES.map(p => [p.id, p.coins])
);

const USED_SESSIONS_KEY = 'tetrisUsedPaymentSessions';

// ── Helper: read used session IDs from localStorage ────────────
function getUsedSessions() {
    try {
        const raw = localStorage.getItem(USED_SESSIONS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function markSessionUsed(sid) {
    try {
        const used = getUsedSessions();
        used.push(sid);
        // Keep only the last 100 to avoid unbounded growth
        const trimmed = used.slice(-100);
        localStorage.setItem(USED_SESSIONS_KEY, JSON.stringify(trimmed));
    } catch {
        // ignore
    }
}

function isSessionUsed(sid) {
    return getUsedSessions().includes(sid);
}

// ── Check URL on page load for payment success ─────────────────
function checkPaymentSuccess() {
    const params  = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const pkg     = params.get('pkg');
    const sid     = params.get('sid');

    if (payment !== 'success' || !pkg || !sid) return;

    const coins = PACKAGE_COINS[pkg];
    if (!coins) return;

    if (isSessionUsed(sid)) {
        // Already granted — clean URL and stop
        cleanUrl();
        return;
    }

    // Grant coins
    if (typeof window.tetriCoins !== 'undefined' && window.tetriCoins) {
        window.tetriCoins.addCoins(coins);
    }

    markSessionUsed(sid);
    cleanUrl();

    // Show success UI after a short delay (let the game init)
    setTimeout(() => openShopModal(pkg, coins), 600);
}

function cleanUrl() {
    if (window.history && window.history.replaceState) {
        const clean = window.location.pathname;
        window.history.replaceState({}, document.title, clean);
    }
}

// ── Build the success redirect URL for a payment link ──────────
function buildSuccessUrl(pkgId) {
    const base = window.location.origin + window.location.pathname;
    // Use crypto.randomUUID() for a cryptographically secure session ID
    const sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : (Date.now().toString(36) + Array.from(
              (typeof crypto !== 'undefined' && crypto.getRandomValues)
                  ? crypto.getRandomValues(new Uint8Array(12))
                  : new Uint8Array(12).map(() => Math.floor(Math.random() * 256))
          ).map(b => b.toString(16).padStart(2, '0')).join(''));
    return `${base}?payment=success&pkg=${encodeURIComponent(pkgId)}&sid=${encodeURIComponent(sid)}`;
}

// ── Build the full payment URL with success_url appended safely ─
const PLACEHOLDER_URLS = new Set([
    'https://buy.stripe.com/YOUR_STARTER_LINK',
    'https://buy.stripe.com/YOUR_STANDARD_LINK',
    'https://buy.stripe.com/YOUR_PREMIUM_LINK',
]);

function isPlaceholderUrl(url) {
    return PLACEHOLDER_URLS.has(url);
}

function buildPaymentUrl(paymentBase, successUrl) {
    try {
        const url = new URL(paymentBase);
        url.searchParams.set('success_url', successUrl);
        return url.toString();
    } catch {
        // Fallback for non-standard URLs: use URLSearchParams for safe encoding
        const params = new URLSearchParams({ success_url: successUrl });
        const sep = paymentBase.includes('?') ? '&' : '?';
        return `${paymentBase}${sep}${params.toString()}`;
    }
}

// ── Build the modal HTML ───────────────────────────────────────
function buildShopModal() {
    const lang    = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
    const t       = key => (typeof getTranslation === 'function' ? getTranslation(key, lang) : key);
    const balance = (typeof window.tetriCoins !== 'undefined' && window.tetriCoins)
        ? window.tetriCoins.getBalance().toLocaleString()
        : '—';

    const packagesHtml = SHOP_PACKAGES.map(pkg => {
        const successUrl  = buildSuccessUrl(pkg.id);
        const paymentHref = isPlaceholderUrl(pkg.paymentUrl)
            ? '#shop-not-configured'
            : buildPaymentUrl(pkg.paymentUrl, successUrl);
        const bonusHtml   = pkg.bonusKey
            ? `<div class="pkg-bonus">✦ ${t(pkg.bonusKey)}</div>` : '';
        const popularBadge = pkg.popular
            ? `<span class="popular-badge">${t('shop_popular')}</span>` : '';

        return `
        <div class="shop-package${pkg.popular ? ' popular' : ''}">
            ${popularBadge}
            <div class="shop-pkg-icon">${pkg.icon}</div>
            <div class="shop-pkg-info">
                <div class="pkg-name">${t(pkg.nameKey)}</div>
                <div class="pkg-coins">${pkg.coins.toLocaleString()} TC</div>
                ${bonusHtml}
            </div>
            <button class="shop-pkg-buy"
                    data-pkg="${pkg.id}"
                    data-href="${paymentHref}">
                ${pkg.priceUSD}
            </button>
        </div>`;
    }).join('');

    return `
    <div id="shop-modal" style="display:none;">
        <div class="shop-modal-content">
            <button id="close-shop" aria-label="Close">&times;</button>
            <h2>💎 ${t('shop_title')}</h2>
            <p class="shop-subtitle">${t('shop_subtitle')}</p>

            <div class="shop-balance-strip">
                <span>${t('shop_your_balance')}</span>
                <span class="tc-amount" id="shop-balance-display">${balance} TC</span>
            </div>

            <div id="shop-packages-view">
                <div class="shop-packages">${packagesHtml}</div>
                <p class="shop-note">
                    ${t('shop_note')}
                    <a href="https://stripe.com" target="_blank" rel="noopener">Stripe</a>.
                </p>
            </div>

            <div id="shop-success-msg">
                <span class="success-icon">🎉</span>
                <h3 id="shop-success-heading"></h3>
                <p id="shop-success-text"></p>
            </div>
        </div>
    </div>`;
}

// ── Open the modal ─────────────────────────────────────────────
function openShopModal(successPkg, successCoins) {
    let modal = document.getElementById('shop-modal');
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', buildShopModal());
        modal = document.getElementById('shop-modal');
        attachShopEvents(modal);
    }

    // Refresh balance
    const balanceEl = modal.querySelector('#shop-balance-display');
    if (balanceEl && typeof window.tetriCoins !== 'undefined' && window.tetriCoins) {
        balanceEl.textContent = window.tetriCoins.getBalance().toLocaleString() + ' TC';
    }

    const packagesView = modal.querySelector('#shop-packages-view');
    const successMsg   = modal.querySelector('#shop-success-msg');

    if (successPkg && successCoins) {
        // Show success state
        const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
        const t    = key => (typeof getTranslation === 'function' ? getTranslation(key, lang) : key);
        packagesView.style.display = 'none';
        successMsg.style.display   = 'block';
        const heading = modal.querySelector('#shop-success-heading');
        const text    = modal.querySelector('#shop-success-text');
        if (heading) heading.textContent = t('shop_success_heading');
        if (text) text.textContent =
            t('shop_success_text').replace('{coins}', successCoins.toLocaleString());
    } else {
        packagesView.style.display = '';
        successMsg.style.display   = 'none';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeShopModal() {
    const modal = document.getElementById('shop-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ── Wire up events inside the modal ───────────────────────────
function attachShopEvents(modal) {
    modal.querySelector('#close-shop').addEventListener('click', closeShopModal);
    modal.addEventListener('click', e => {
        if (e.target === modal) closeShopModal();
    });

    modal.addEventListener('click', e => {
        const btn = e.target.closest('.shop-pkg-buy');
        if (!btn) return;

        const href = btn.dataset.href;
        if (href === '#shop-not-configured') {
            const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
            const t    = key => (typeof getTranslation === 'function' ? getTranslation(key, lang) : key);
            alert(t('shop_error_not_configured'));
            return;
        }
        // Navigate to payment page (same tab, so the redirect back works)
        window.location.href = href;
    });
}

// ── Add "Shop" button next to the balance display ─────────────
function injectShopButton() {
    const balanceItem = document.querySelector('.balance-item');
    if (!balanceItem) return;
    if (balanceItem.querySelector('.shop-open-btn')) return; // already added

    const lang = typeof getCurrentLanguage === 'function' ? getCurrentLanguage() : 'en';
    const t    = key => (typeof getTranslation === 'function' ? getTranslation(key, lang) : key);

    const btn = document.createElement('button');
    btn.className    = 'shop-open-btn';
    btn.textContent  = '+ ' + t('shop_btn');
    btn.title        = t('shop_btn_title');
    btn.setAttribute('aria-label', t('shop_btn_title'));
    btn.addEventListener('click', () => openShopModal());
    balanceItem.appendChild(btn);
}

// ── Init ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    injectShopButton();
    checkPaymentSuccess();
});
