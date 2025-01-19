// Create Player Element for Draft Panels
function createPlayerElement(player) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
    li.innerHTML = `
        <div class="d-flex align-items-center">
            <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onmouseover="updatePlayerInfo('${player.id}')" onclick="updatePlayerInfo('${player.id}')">
            <span>${player.name} (${player.handicap})</span>
        </div>
    `;
    return li;
}

// Add Player to Team
function addPlayerToTeam(playerId) {
    const player = allPlayers.find(p => p.id === playerId);

    // Assign the player to the current team
    if (currentTurn === 'team-one') {
        teamOne.push(player);
        const teamOneList = document.getElementById('team-one');
        teamOneList.appendChild(createPlayerElement(player));
    } else {
        teamTwo.push(player);
        const teamTwoList = document.getElementById('team-two');
        teamTwoList.appendChild(createPlayerElement(player));
    }

    // Update available players and switch turn
    allPlayers = allPlayers.filter(p => p.id !== playerId);
    populateAvailablePlayers(allPlayers);
    currentTurn = currentTurn === 'team-one' ? 'team-two' : 'team-one';
}

// Populate Available Players
function populateAvailablePlayers(players) {
    const availablePlayersList = document.getElementById('available-players');
    availablePlayersList.innerHTML = '';

    players.forEach(player => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center fade-in';
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${player.profileImage}" alt="${player.name}" class="profile-image-sm me-2" onmouseover="updatePlayerInfo('${player.id}')" onclick="updatePlayerInfo('${player.id}')">
                <span>${player.name} (${player.handicap})</span>
            </div>
            <button class="btn btn-sm btn-${currentTurn === 'team-one' ? 'primary' : 'success'}" onclick="addPlayerToTeam('${player.id}')">
                Add to ${currentTurn === 'team-one' ? 'Team One' : 'Team Two'}
            </button>
        `;
        availablePlayersList.appendChild(li);
    });
}
