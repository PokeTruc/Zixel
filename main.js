window.onload = function() {
    loadData(); 
    
    // Vérifier si une session est déjà active
    const saved = localStorage.getItem('zixel_current_user');
    if (saved && getUser(saved)) {
        currentUser = saved;
        initApp(); // Lance l'interface directement
    } else {
        // Sinon, on s'assure que la fenêtre de connexion est visible
        const auth = document.getElementById('auth-container');
        auth.classList.remove('hidden');
        auth.style.display = 'flex';
    }

    // Bindings
    document.getElementById('btn-login').onclick = login;
    document.getElementById('btn-register').onclick = register;
    document.getElementById('btn-recover').onclick = recover;
    
    renderShop();
};
// Liaison des boutons
document.addEventListener('DOMContentLoaded', () => {
    const btnLeaderboard = document.getElementById('btn-leaderboard');
    if (btnLeaderboard) {
        btnLeaderboard.addEventListener('click', showLeaderboard);
    }
    
    // Autres liaisons si nécessaire
    const btnProfile = document.querySelector('button[onclick*="showProfile"]');
    if (btnProfile) btnProfile.addEventListener('click', showProfile);
});