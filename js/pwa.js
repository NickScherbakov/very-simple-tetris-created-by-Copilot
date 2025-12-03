// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute
            })
            .catch(error => {
                console.warn('ServiceWorker registration failed:', error);
            });
    });
}

// Handle install prompt
let deferredPrompt;
const installButton = document.getElementById('install-pwa-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;
    // Show install button
    if (installButton) {
        installButton.style.display = 'inline-block';
    }
});

// Install PWA when button is clicked
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        // Clear the deferred prompt
        deferredPrompt = null;
        
        // Hide install button
        installButton.style.display = 'none';
    });
}

// Detect if app is running as PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
}

// Add PWA status class to body
if (isRunningAsPWA()) {
    document.body.classList.add('pwa-mode');
}

// Handle app update
navigator.serviceWorker?.addEventListener('controllerchange', () => {
    // Reload page when service worker updates
    window.location.reload();
});
