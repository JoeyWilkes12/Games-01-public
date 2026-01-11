document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.game-card');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('coming-soon')) {
                e.preventDefault();
                showToast(`Coming Soon! We're building this game right now.`);
            }
        });
    });

    // Simple toast notification system
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);

    let toastTimeout;

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
