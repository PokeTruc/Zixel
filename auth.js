let currentUser = null;

// --- GESTION DES VUES ---
function switchAuth(view) {
    document.querySelectorAll('.auth-view').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById('view-' + view).classList.add('active');
    // Trouver le bouton cliqué et l'activer (simple hack)
    const tabs = document.querySelectorAll('.tab-btn');
    if(view === 'login') tabs[0].classList.add('active');
    if(view === 'register') tabs[1].classList.add('active');
    if(view === 'recover') tabs[2].classList.add('active');
}

function login() {
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value.trim();
    const msg = document.getElementById('login-msg');

    const user = getUser(u);
    if (user && user.password === p) {
        currentUser = u;
        msg.textContent = "Connexion réussie !";
        msg.className = "z-msg success";
        setTimeout(initApp, 800); // Petit délai pour voir le message
    } else {
        msg.textContent = "Identifiants incorrects.";
        msg.className = "z-msg";
    }
}

function register() {
    const u = document.getElementById('reg-user').value.trim();
    const e = document.getElementById('reg-email').value.trim();
    const p = document.getElementById('reg-pass').value.trim();
    const msg = document.getElementById('reg-msg');

    if (u.length < 3 || p.length < 6 || !e.includes('@')) {
        msg.textContent = "Données invalides (Pseudo min 3, MDP min 6, Email valide).";
        return;
    }
    if (getUser(u)) {
        msg.textContent = "Pseudo existant.";
        return;
    }

    if (createUser(u, e, p)) {
        msg.textContent = "Compte créé ! Connectez-vous.";
        msg.className = "z-msg success";
        setTimeout(() => { switchAuth('login'); msg.textContent = ""; }, 2000);
    }
}

function recover() {
    const e = document.getElementById('rec-email').value.trim();
    const msg = document.getElementById('rec-msg');
    let found = false;
    for (let u in db.users) {
        if (db.users[u].email === e) {
            found = true;
            alert(`Lien de récupération envoyé à ${e} (Simulation: Mot de passe temporaire: ${db.users[u].password})`);
            break;
        }
    }
    if (!found) msg.textContent = "Email non trouvé.";
    else msg.textContent = "Email envoyé !";
}

function updateAccount() {
    const newU = document.getElementById('edit-user').value.trim();
    const newP = document.getElementById('edit-pass').value.trim();
    
    if (newU && newU !== currentUser) {
        if (getUser(newU)) { alert("Pseudo pris."); return; }
        db.users[newU] = db.users[currentUser];
        delete db.users[currentUser];
        currentUser = newU;
        saveData();
        alert("Pseudo changé ! Reconnectez-vous.");
        location.reload();
    }
    if (newP) {
        db.users[currentUser].password = newP;
        saveData();
        alert("Mot de passe changé !");
    }
}

function logout() {
    currentUser = null;
    
    // 1. Cacher l'interface principale
    const main = document.getElementById('main-interface');
    main.classList.remove('active');
    main.style.display = 'none';

    // 2. Afficher la fenêtre de connexion
    const auth = document.getElementById('auth-container');
    auth.classList.remove('hidden');
    auth.style.display = 'flex'; // Force le flex pour le centrage

    // 3. Reset
    document.getElementById('login-user').value = '';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-msg').textContent = '';
}

function initApp() {
    // 1. Cacher la fenêtre de connexion
    const auth = document.getElementById('auth-container');
    auth.classList.add('hidden');
    auth.style.display = 'none'; // Important pour qu'elle ne prenne plus de place

    // 2. Afficher l'interface principale
    const main = document.getElementById('main-interface');
    main.style.display = 'block';
    main.classList.add('active');

    // 3. Mettre à jour l'UI
    updateUI();
    renderGamesMenu();
}

function updateUI() {
    const user = getUser(currentUser);
    if (!user) return;

    document.getElementById('display-name').textContent = currentUser;
    document.getElementById('gem-count').textContent = user.gems;
    document.getElementById('avatar-display').textContent = user.avatar;
    
    const xpNeeded = user.level * 100;
    const pct = Math.min((user.xp / xpNeeded) * 100, 100);
    document.getElementById('level-display').textContent = `Niveau ${user.level}`;
    document.getElementById('xp-bar').style.width = `${pct}%`;
}