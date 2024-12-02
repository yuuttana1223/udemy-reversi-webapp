const EMPTY = 0;
const DARK = 1;
const LIGHT = 2;

const WINNER_DRAW = 0;
const WINNER_DARK = 1;
const WINNER_LIGHT = 2;

const boardElement = document.getElementById("board");
const nextDiscMessageElement = document.getElementById("next-disc-message");
const warningMessageElement = document.getElementById("warning-message");

async function showBoard(turnCount, prevDisc) {
  const response = await fetch(`/api/games/latest/turns/${turnCount}`);
  const responseBody = await response.json();
  const board = responseBody.board;
  const nextDisc = responseBody.nextDisc;
  const winnerDisc = responseBody.winnerDisc;

  showWarningMessage(prevDisc, nextDisc, winnerDisc);

  showNextDiscMessage(nextDisc);

  while (boardElement.firstChild) {
    boardElement.removeChild(boardElement.firstChild);
  }

  board.forEach((line, y) => {
    line.forEach((square, x) => {
      // <div class="square">
      const squareElement = document.createElement("div");
      squareElement.className = "square";

      if (square !== EMPTY) {
        // <div class="stone dark">
        const stoneElement = document.createElement("div");
        const color = square === DARK ? "dark" : "light";
        stoneElement.className = `stone ${color}`;

        squareElement.appendChild(stoneElement);
      } else {
        squareElement.addEventListener("click", async () => {
          const nextTurnCount = turnCount + 1;
          const res = await registerTurn(nextTurnCount, nextDisc, x, y);
          if (!res.ok) {
            return;
          }
          await showBoard(nextTurnCount, nextDisc);
        });
      }

      boardElement.appendChild(squareElement);
    });
  });
}

function discToString(disc) {
  return disc === DARK ? "黒" : "白";
}

function showWarningMessage(prevDisc, nextDisc, winnerDisc) {
  const message = warningMessage(prevDisc, nextDisc, winnerDisc);
  warningMessageElement.textContent = message;

  if (message === null) {
    warningMessageElement.style.display = "none";
    return;
  }
  warningMessageElement.style.display = "block";
}

function warningMessage(prevDisc, nextDisc, winnerDisc) {
  if (nextDisc === null) {
    if (winnerDisc === WINNER_DRAW) {
      return "引き分けです。";
    }
    return `${discToString(winnerDisc)}の勝ちです。`;
  }

  if (prevDisc === nextDisc) {
    const skippedDisc = prevDisc === DARK ? LIGHT : DARK;
    return `${discToString(skippedDisc)}は置ける場所がありません。`;
  }

  return null;
}

function showNextDiscMessage(nextDisc) {
  if (nextDisc) {
    nextDiscMessageElement.textContent = `次は${discToString(
      nextDisc
    )}の番です`;
  } else {
    nextDiscMessageElement.textContent = "";
  }
}

async function registerGame() {
  await fetch("/api/games", {
    method: "POST",
  });
}

async function registerTurn(turnCount, disc, x, y) {
  const requestBody = {
    turnCount,
    move: {
      disc,
      x,
      y,
    },
  };

  const res = await fetch("/api/games/latest/turns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
  return res;
}

async function main() {
  await registerGame();
  await showBoard(0);
}

main();
