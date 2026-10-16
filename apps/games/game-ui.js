/* Dialog focus behavior shared by the game surfaces. Game state stays in each game. */
(() => {
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"]'));
    const previousFocus = new WeakMap();
    const focusable = dialog => Array.from(dialog.querySelectorAll('button, a[href], input, select, [tabindex="0"]')).filter(el => !el.disabled && el.getClientRects().length);
    for (const dialog of dialogs) {
        new MutationObserver(() => {
            if (!dialog.classList.contains('hidden')) {
                previousFocus.set(dialog, document.activeElement);
                (focusable(dialog)[0] || dialog).focus();
            } else {
                previousFocus.get(dialog)?.focus();
            }
        }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                const close = dialog.querySelector('#close-settings, #close-modal, .close-modal, #confirm-stay-btn');
                if (close) { event.preventDefault(); close.click(); }
            }
            if (event.key !== 'Tab') return;
            const items = focusable(dialog);
            if (!items.length) return;
            if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
            if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
        });
    }
})();
