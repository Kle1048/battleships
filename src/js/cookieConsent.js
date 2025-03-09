// Cookie consent management
const cookieConsent = {
    consentKey: 'naval_warfare_cookie_consent',
    
    init: function() {
        // Minimal implementation
        console.log('Cookie consent initialized');
    },

    hasConsent() {
        return localStorage.getItem(this.consentKey) === 'true';
    },

    giveConsent() {
        localStorage.setItem(this.consentKey, 'true');
        this.hideConsentBanner();
    },

    showConsentBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        banner.innerHTML = `
            This game uses localStorage to save your high scores and game settings. 
            By playing, you agree to our 
            <a href="privacy.html" target="_blank" style="color: #4CAF50;">Privacy Policy</a> and 
            <a href="terms.html" target="_blank" style="color: #4CAF50;">Terms of Service</a>.
            <button id="accept-cookies" style="
                background: #4CAF50;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                margin-left: 1rem;
                cursor: pointer;
                border-radius: 4px;
            ">Accept</button>
        `;
        
        document.body.appendChild(banner);
        
        document.getElementById('accept-cookies').onclick = () => {
            this.giveConsent();
        };
    },

    hideConsentBanner() {
        const banner = document.getElementById('cookie-consent');
        if (banner) {
            banner.remove();
        }
    }
};

// Export for global use
window.cookieConsent = cookieConsent; 