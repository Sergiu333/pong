// board
let board;
let boardWidth = 800;
let boardHeight = 400;
let context;

// players
let playerWidth = 10;
let playerHeight = 50;
let playerVelocityY = 0;

let player1 = {
    x : 10,
    y : boardHeight/2,
    width: playerWidth,
    height: playerHeight,
    velocityY : 0
}

let player2 = {
    x : boardWidth - playerWidth - 10,
    y : boardHeight/2,
    width: playerWidth,
    height: playerHeight,
    velocityY : 0
}

// ball
let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x : boardWidth/2,
    y : boardHeight/2,
    width: ballWidth,
    height: ballHeight,
    velocityX : 1,
    velocityY : 2
}

let player1Score = 0;
let player2Score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    context.fillStyle = "#08f";
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    requestAnimationFrame(update);
    document.addEventListener("touchstart", handleTouchStart, false);
    document.addEventListener("touchmove", handleTouchMove, false);
}


// Bonus balls
let bonusBalls = [];
let bonusBallSize = 7;

// Draw bonus balls
function drawBonusBalls() {
    context.fillStyle = "red";
    for (let bonusBall of bonusBalls) {
        context.beginPath();
        context.arc(bonusBall.x, bonusBall.y, bonusBallSize, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = "red";
        context.fillText(bonusBall.value, bonusBall.x - 5, bonusBall.y + 5);
    }
}

// Generate bonus balls
function generateBonusBalls() {
    for (let value of [1, 1]) {
        let newBall = {
            x: Math.random() * (boardWidth - bonusBallSize * 2) + bonusBallSize,
            y: Math.random() * (boardHeight - bonusBallSize * 2) + bonusBallSize,
            value: value
        };
        bonusBalls.push(newBall);
    }
}

// Check collision with bonus balls
function checkBonusCollision() {
    for (let i = bonusBalls.length - 1; i >= 0; i--) {
        if (detectCollision(ball, {
            x: bonusBalls[i].x - bonusBallSize / 2,
            y: bonusBalls[i].y - bonusBallSize / 2,
            width: bonusBallSize,
            height: bonusBallSize
        })) {
            player1Score += bonusBalls[i].value;
            bonusBalls.splice(i, 1);
        }
    }
}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // player1
    context.fillStyle = "#08f";
    let nextPlayer1Y = player1.y + player1.velocityY;
    if (!outOfBounds(nextPlayer1Y)) {
        player1.y = nextPlayer1Y;
    }
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    // player2
    let ballMiddle = ball.y + ballHeight / 2;
    let player2Middle = player2.y + playerHeight / 2;

    if (ballMiddle < player2Middle) {
        player2.velocityY = -4;
    } else {
        player2.velocityY = 4;
    }
    let nextPlayer2Y = player2.y + player2.velocityY;
    if (!outOfBounds(nextPlayer2Y)) {
        player2.y = nextPlayer2Y;
    }
    context.fillRect(player2.x, player2.y, playerWidth, playerHeight);

    // Bonus balls
    if (bonusBalls.length === 0) {
        generateBonusBalls();
    }
    drawBonusBalls();
    checkBonusCollision();

    // Main ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ballWidth, ballHeight);

    if (ball.y <= 0 || (ball.y + ballHeight >= boardHeight)) {
        ball.velocityY *= -1;
    }

    // Bounce the ball back
    if (detectCollision(ball, player1) || detectCollision(ball, player2)) {
        ball.velocityX *= -1;
    }

    // Game over
    if (ball.x < 0) {
        player2Score++;
        resetGame(1);
    }
    else if (ball.x + ballWidth > boardWidth) {
        player1Score++;
        resetGame(-1);
    }

    // Score
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth/5, 45);
    context.fillText(player2Score, boardWidth*4/5 - 45, 45);

    // Draw dotted line down the middle
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }
}

function outOfBounds(yPosition) {
    return (yPosition < 0 || yPosition + playerHeight > boardHeight);
}

function movePlayer(e) {
    //player1
    if (e.code == "KeyA") {
        player1.velocityY = -3;
    }
    else if (e.code == "KeyD") {
        player1.velocityY = 3;
    }

    //player2
    if (e.code == "ArrowLeft") {
        player2.velocityY = -3;
    }
    else if (e.code == "ArrowRight") {
        player2.velocityY = 3;
    }
}

let touchYStart = null;

function handleTouchStart(event) {
    touchYStart = event.touches[0].clientY;
    touchXStart = event.touches[0].clientX;
}

function handleTouchMove(event) {
    if (!touchYStart || !touchXStart) {
        return;
    }

    let touchYEnd = event.touches[0].clientY;
    let touchXEnd = event.touches[0].clientX;

    let deltaY = touchYEnd - touchYStart;
    let deltaX = touchXEnd - touchXStart;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
        if (deltaY < 0) {
            player1.velocityY = -3;
        } else {
            player1.velocityY = 3;
        }
    } else {
        if (deltaX < 0) {
            player1.velocityY = -3;
        } else {
            player1.velocityY = 3;
        }
    }

    touchYStart = touchYEnd;
    touchXStart = touchXEnd;
}

function detectCollision(circle, rect) {
    let distX = Math.abs(circle.x - rect.x - rect.width / 2);
    let distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.width / 2)) { return false; }
    if (distY > (rect.height / 2 + circle.height / 2)) { return false; }

    if (distX <= (rect.width / 2)) { return true; }
    if (distY <= (rect.height / 2)) { return true; }

    let dx = distX - rect.width / 2;
    let dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.width / 2 * circle.width / 2));
}

function resetGame(direction) {
    ball = {
        x : Math.random() * (boardWidth - ballWidth),
        y : Math.random() * (boardHeight - ballHeight),
        width: ballWidth,
        height: ballHeight,
        velocityX : direction * 4,
        velocityY : 4
    }
}
resetGame(1);
