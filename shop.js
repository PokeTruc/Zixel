 function renderShop() {
    // 1. Vérifier si on est connecté
    if (!currentUser) {
        console.log("Boutique ignorée : pas d'utilisateur connecté.");
        return; // On arrête tout ici
    }

    // 2. Récupérer l'utilisateur
    const user = getUser(currentUser);
    if (!user) {
        console.error("Utilisateur introuvable dans la base de données.");
        return;
    }

    // 3. Récupérer les conteneurs (sécurité)
    const avContainer = document.getElementById('shop-avatars');
    const bnContainer = document.getElementById('shop-bonuses');
    
    if (!avContainer && !bnContainer) {
        console.warn("Conteneurs de la boutique introuvables dans le HTML.");
        return;
    }

    // ... (Le reste du code de renderShop reste identique à ce que je t'ai donné avant) ...
    // Juste assure-toi que le début est bien celui-ci :
    
    if (avContainer) {
        avContainer.innerHTML = '';
        ITEMS.avatars.forEach(item => {
            const owned = user.inventory && user.inventory.includes(item.id);
            const div = document.createElement('div');
            div.className = `shop-item ${owned ? 'owned' : ''}`;
            div.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div>${item.name}</div>
                <div class="item-price">${owned ? 'Possédé' : item.price + ' 💎'}</div>
                <button class="z-btn" style="margin-top:5px; font-size:12px;" 
                    onclick="${owned ? `equipAvatar('${item.id}')` : `buyItem('${item.id}', ${item.price})`}">
                    ${owned ? 'Équiper' : 'Acheter'}
                </button>
            `;
            avContainer.appendChild(div);
        });
    }

    if (bnContainer) {
        bnContainer.innerHTML = '';
        ITEMS.bonuses.forEach(item => {
            const owned = user.inventory && user.inventory.includes(item.id);
            const div = document.createElement('div');
            div.className = `shop-item ${owned ? 'owned' : ''}`;
            div.innerHTML = `
                <div class="item-icon">🎁</div>
                <div>${item.name}</div>
                <div style="font-size:12px">${item.desc}</div>
                <div class="item-price">${owned ? 'Possédé' : item.price + ' 💎'}</div>
                <button class="z-btn" style="margin-top:5px; font-size:12px;" 
                    onclick="${owned ? `activateBonus('${item.id}')` : `buyItem('${item.id}', ${item.price})`}">
                    ${owned ? 'Activer' : 'Acheter'}
                </button>
            `;
            bnContainer.appendChild(div);
        });
    }
}   const avContainer = document.getElementById('shop-avatars');
    if (!avContainer) return; // Sécurité si l'élément n'existe pas

    avContainer.innerHTML = '';
    ITEMS.avatars.forEach(item => {
        const owned = user.inventory && user.inventory.includes(item.id);
        const div = document.createElement('div');
        div.className = `shop-item ${owned ? 'owned' : ''}`;
        div.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div>${item.name}</div>
            <div class="item-price">${owned ? 'Possédé' : item.price + ' 💎'}</div>
            <button class="z-btn" style="margin-top:5px; font-size:12px;" 
                onclick="${owned ? `equipAvatar('${item.id}')` : `buyItem('${item.id}', ${item.price})`}">
                ${owned ? 'Équiper' : 'Acheter'}
            </button>
        `;
        avContainer.appendChild(div);
    });

    const bnContainer = document.getElementById('shop-bonuses');
    if (!bnContainer) return;

    bnContainer.innerHTML = '';
    ITEMS.bonuses.forEach(item => {
        const owned = user.inventory && user.inventory.includes(item.id);
        const div = document.createElement('div');
        div.className = `shop-item ${owned ? 'owned' : ''}`;
        div.innerHTML = `
            <div class="item-icon">🎁</div>
            <div>${item.name}</div>
            <div style="font-size:12px">${item.desc}</div>
            <div class="item-price">${owned ? 'Possédé' : item.price + ' 💎'}</div>
            <button class="z-btn" style="margin-top:5px; font-size:12px;" 
                onclick="${owned ? `activateBonus('${item.id}')` : `buyItem('${item.id}', ${item.price})`}">
                ${owned ? 'Activer' : 'Acheter'}
            </button>
        `;
        bnContainer.appendChild(div);
    });
}