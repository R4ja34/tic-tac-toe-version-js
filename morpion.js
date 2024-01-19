class Morpion {
	humanPlayer = 'J1';
	iaPlayer = 'J2';
	gameOver = false;
	gridMap = [
		[null, null, null],
		[null, null, null],
		[null, null, null],
	];

	constructor(firstPlayer = 'J1') {
		this.humanPlayer = firstPlayer;
		this.iaPlayer = (firstPlayer === 'J1') ? 'J2' : 'J1';
		this.initGame();
	}

	initGame = () => {
		this.gridMap.forEach((line, y) => {
			line.forEach((cell, x) => {
				this.getCell(x, y).onclick = () => {
					this.doPlayHuman(x, y);
				};
			});
		});

		if (this.iaPlayer === 'J1') {
			this.doPlayIa();
		}
	}

	getCell = (x, y) => {
		const column = x + 1;
		const lines = ['A', 'B', 'C'];
		const cellId = `${lines[y]}${column}`;
		return document.getElementById(cellId);
	}

  getBoardWinner = (board) => {
    const isWinningRow = ([a, b, c]) => (
      a !== null && a === b && b === c
    );

    let winner = null;

    // Horizontal
    board.forEach((line) => {
      if (isWinningRow(line)) {
        winner = line[0];
      }
    });

    // Vertical
    [0, 1, 2].forEach((col) => {
      if (isWinningRow([board[0][col], board[1][col], board[2][col]])) {
        winner = board[0][col];
        }
    });

    if (winner) {
      return winner;
    }

    // Diagonal
    const diagonal1 = [board[0][0], board[1][1], board[2][2]];
    const diagonal2 = [board[0][2], board[1][1], board[2][0]];
    if (isWinningRow(diagonal1) || isWinningRow(diagonal2)) {
        return board[1][1];
    }

    const isFull = board.every((line) => (
      line.every((cell) => cell !== null)
    ));
    return isFull ? 'tie' : null;
    }

  copyGrid = () => {
    return this.gridMap.map(row => row.slice());
  }
  

	checkWinner = (lastPlayer) => {
    const winner = this.getBoardWinner(this.gridMap);
    if (!winner) {
      return;
    }

    this.gameOver = true;
    switch(winner) {
      case 'tie':
        this.displayEndMessage("Vous êtes à égalité !");
        break;
      case this.iaPlayer:
        this.displayEndMessage("L'IA a gagné !");
        break;
      case this.humanPlayer:
        this.displayEndMessage("Tu as battu l'IA !");
        break;
    }
	}

	displayEndMessage = (message) => {
		const endMessageElement = document.getElementById('end-message');
		endMessageElement.textContent = message;
		endMessageElement.style.display = 'block';
	}

	drawHit = (x, y, player) => {
		if (this.gridMap[y][x] !== null) {
			return false;
		}

		this.gridMap[y][x] = player;
		this.getCell(x, y).classList.add(`filled-${player}`);
		this.checkWinner(player);
		return true;
	}

	doPlayHuman = (x, y) => {
		if (this.gameOver) {
			return;
		}

		if (this.drawHit(x, y, this.humanPlayer)) {
			this.doPlayIa();
		}
	}

	doPlayIa = () => {
		if (this.gameOver) {
			return;
		};

    // Fonction pour vérifier si l'IA peut gagner dans la prochaine étape
    const canWinNextMove = (x, y, player) => {
      const tempGrid = this.copyGrid();
      tempGrid[y][x] = player;
      return this.getBoardWinner(tempGrid) === player;
    };

  // Fonction pour bloquer la victoire imminente de l'adversaire
  const blockOpponentWin = () => {
      for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
              if (!this.gridMap[y][x]) {
                  const tempGrid = this.copyGrid();
                  tempGrid[y][x] = this.humanPlayer;
                  if (this.getBoardWinner(tempGrid) === this.humanPlayer) {
                      this.drawHit(x, y, this.iaPlayer);
                      return true;
                  }
              }
          }
      }
      return false;
  };

  let hasPlayed = false;

  // Priorité 1: Bloquer la victoire imminente de l'adversaire
  if (!hasPlayed) {
      hasPlayed = blockOpponentWin();
  }

  // Priorité 2: Chercher une opportunité de gagner
  if (!hasPlayed) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (!this.gridMap[y][x] && canWinNextMove(x, y, this.iaPlayer)) {
          hasPlayed = this.drawHit(x, y, this.iaPlayer);
          break;
        }
      }
      if (hasPlayed) {
        break;
      }
    }
  }

  // Priorité 3: Jouer dans le centre
  if (!hasPlayed && !this.gridMap[1][1]) {
      hasPlayed = this.drawHit(1, 1, this.iaPlayer);
  }

  // Priorité 4: Jouer dans un coin
  if (!hasPlayed) {
      const corners = [[0, 0], [0, 2], [2, 0], [2, 2]];
      for (const [x, y] of corners) {
          if (!this.gridMap[y][x]) {
              hasPlayed = this.drawHit(x, y, this.iaPlayer);
              break;
          }
      }
  }

  // Priorité 5: Jouer n'importe où (en dernier recours)
  if (!hasPlayed) {
      for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
              if (!this.gridMap[y][x]) {
                  hasPlayed = this.drawHit(x, y, this.iaPlayer);
                  break;
              }
          }
          if (hasPlayed) {
              break;
          }
      }
    }
  }
}