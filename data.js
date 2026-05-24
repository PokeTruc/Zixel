// --- CONFIGURATION SUPABASE ---
// ⚠️ REMPLACE CES VALEURS PAR LES TIENNES RÉELLES ⚠️
// Trouve-les dans Supabase > Project Settings > API
const SUPABASE_URL = "https://vraie-url-de-ton-projet.supabase.co"; 
const SUPABASE_KEY = "vraie-cle-anon-très-longue-ici"; 

// Initialisation de Supabase
let supabaseClient = null;!$
try {
    if (typeof supabase !== 'undefined' && SUPABASE_URL !== "https://vraie-url-de-ton-projet.supabase.co") {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("✅ Supabase initialisé !");
    } else {
        console.warn("⚠️ Supabase non configuré ou URL par défaut. Mode local activé.");
    }
} catch (e) {
    console.error("❌ Erreur Supabase:", e);
}

// Données en mémoire
let db = { users: {}, leaderboard: [] };
let isInitialized = false;

// --- FONCTIONS DE SECOURS (LOCALSTORAGE) ---
function getLocalUser(username) {
    const stored = localStorage.getItem('zixel_local_user_' + username);
    return stored ? JSON.parse(stored) : null;
}

function saveLocalUser(username, userData) {
    localStorage.setItem('zixel_local_user_' + username, JSON.stringify(userData));
}

function getLocalLeaderboard() {
    const stored = localStorage.getItem('zixel_local_leaderboard');
    return stored ? JSON.parse(stored) : [];
}

function saveLocalLeaderboard(data) {
    localStorage.setItem('zixel_local_leaderboard', JSON.stringify(data));
}

// --- FONCTIONS PRINCIPALES ---

async function loadData() {
    if (isInitialized) return db;

    if (supabaseClient) {
        try {
            let { data, error } = await supabaseClient
                .from('scores')
                .select('*')
                .order('score', { ascending: false });

            if (error) throw error;

            db.leaderboard = data || [];
            db.users = {};
            db.leaderboard.forEach(u => {
                db.users[u.username] = u;
            });
            console.log("✅ Données chargées depuis Supabase !");
            isInitialized = true;
            return db;
        } catch (e) {
            console.warn("⚠️ Erreur Supabase (passage en mode local):", e.message);
        }
    }

    // Mode Local
    console.log("🔄 Mode Local activé.");
    const localData = getLocalLeaderboard();
    db.leaderboard = localData;
    db.users = {};
    localData.forEach(u => db.users[u.username] = u);
    isInitialized = true;
    return db;
}

async function saveScoreToServer(username, score, level) {
    // Mise à jour locale immédiate
    let currentEntry = db.users[username] || { username, score: 0, level: 1 };
    
    if (score > currentEntry.score) {
        currentEntry.score = score;
        currentEntry.level = level;
        db.users[username] = currentEntry;
        
        const index = db.leaderboard.findIndex(u => u.username === username);
        if (index !== -1) {
            db.leaderboard[index] = currentEntry;
        } else {
            db.leaderboard.push(currentEntry);
        }
        db.leaderboard.sort((a, b) => b.score - a.score);
        saveLocalLeaderboard(db.leaderboard);
    }

    // Tentative Supabase (non bloquante)
    if (supabaseClient) {
        try {
            let { data: existing, error: checkErr } = await supabaseClient
                .from('scores')
                .select('*')
                .eq('username', username)
                .single();

            if (checkErr && checkErr.code !== 'PGRST116') throw checkErr;

            if (existing) {
                if (score > existing.score) {
                    await supabaseClient.from('scores').update({ score, level }).eq('username', username);
                }
            } else {
                await supabaseClient.from('scores').insert([{ username, score, level }]);
            }
        } catch (e) {
            console.warn("⚠️ Échec envoi Supabase:", e.message);
        }
    }
}

async function finishGame(username, score, level) {
    await saveScoreToServer(username, score, level);
    // Appel sécurisé
    if (typeof window.showLeaderboard === 'function') {
        window.showLeaderboard();
    }
}

function getUser(username) {
    if (db.users[username]) return db.users[username];
    return getLocalUser(username);
}

async function createUser(username, email, password) {
    if (getUser(username)) return false;
    
    const newUser = {
        username: username,
        email: email,
        password: password,
        gems: 100,
        xp: 0,
        level: 1,
        inventory: [],
        avatar: '👤',
        stats: { gamesPlayed: 0, totalScore: 0 },
        bonuses: { snakeSlow: false, doubleGem: false }
    };
    
    saveLocalUser(username, newUser);
    db.users[username] = newUser;
    return true;
}

async function updateUserStats(username, action, value) {
    const user = db.users[username] || getLocalUser(username);
    if (!user) {
        console.error("Utilisateur introuvable pour:", username);
        return;
    }

    if (action === 'addGems') user.gems += value;
    if (action === 'spendGems') user.gems -= value;
    if (action === 'addXP') {
        user.xp += value;
        const xpNeeded = user.level * 100;
        if (user.xp >= xpNeeded) {
            user.level++;
            user.xp -= xpNeeded;
            alert(`🎉 Niveau supérieur ! Vous êtes niveau ${user.level}`);
        }
    }
    if (action === 'addScore') user.stats.totalScore += value;
    if (action === 'playGame') user.stats.gamesPlayed++;
    if (action === 'unlockItem') {
        if (!user.inventory.includes(value)) user.inventory.push(value);
    }
    if (action === 'setAvatar') user.avatar = value;
    if (action === 'activateBonus') user.bonuses[value] = true;

    saveLocalUser(username, user);
    db.users[username] = user;
}

async function updateLeaderboard() {
    await loadData();
    if (typeof window.showLeaderboard === 'function') window.showLeaderboard();
}

async function resetAllData() {
    if(confirm("Attention ! Cela efface les données locales.")) {
        localStorage.clear();
        location.reload();
    }
}

// Initialisation
window.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    console.log("Système de données prêt.");
});
// --- CONFIGURATION RENDER API ---
// Remplace par l'URL de ton site Render (ex: https://zixel-ultimate.onrender.com)
const RENDER_URL = "https://TON_PROJET.onrender.com"; 

let db = { users: {}, leaderboard: [] };
let isInitialized = false;

async function loadData() {
    if (isInitialized) return db;
    try {
        const response = await fetch(`${RENDER_URL}/api/leaderboard`);
        if (!response.ok) throw new Error("Erreur");
        const data = await response.json();
        db.leaderboard = data;
        db.users = {};
        data.forEach(u => db.users[u.username] = u);
        console.log("✅ Données chargées depuis Render !");
        isInitialized = true;
        return db;
    } catch (e) {
        console.error("Erreur Render:", e);
        return { users: {}, leaderboard: [] };
    }
}

async function saveScoreToServer(username, score, level) {
    try {
        await fetch(`${RENDER_URL}/api/score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, score, level })
        });
        console.log("Score envoyé à Render !");
        await loadData(); // Recharger le classement
    } catch (e) {
        console.error("Erreur envoi Render:", e);
    }
}

// ... (Le reste du code reste identique : getUser, createUser, etc.) ...
// N'oublie pas d'ajouter les autres fonctions (getUser, createUser, etc.) que tu as déjà dans ton fichier data.js