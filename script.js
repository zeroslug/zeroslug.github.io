document.addEventListener('DOMContentLoaded', () => {
    const puzzleBoard = document.getElementById('puzzle-board');
    const puzzlePiecesContainer = document.getElementById('puzzle-pieces');

    // 您的5张图片路径数组
    const puzzleImages = [
        'space0.png',
        'space1.png',
        'space2.png',
        'space3.png'
    ];

    // 用于爆炸效果的水果图片
    const fruitImages = [
        'https://i.ibb.co/6y4jGkY/cat-image.jpg',
        'https://i.ibb.co/W21t30j/apple.png',
        'https://i.ibb.co/L90rCqg/banana.png',
        'https://i.ibb.co/zX5Y145/strawberry.png',
        'https://i.ibb.co/gST1Fq4/grape.png',
        'https://i.ibb.co/nRL7XG1/orange.png'
    ];

    const rows = 4;
    const cols = 4;
    const totalPieces = rows * cols;
    const pieceSize = 200;
    let currentDragPiece = null;
    let piecesData = [];
    const statusMessage = document.getElementById('status-message');

    // 用于触摸和鼠标事件的变量
    let originalParent = null;

    function initializeGame() {
        puzzleBoard.innerHTML = '';
        puzzlePiecesContainer.innerHTML = '';
        piecesData = [];

        // 随机选择一张拼图图片
        const randomIndex = Math.floor(Math.random() * puzzleImages.length);
        const selectedImage = puzzleImages[randomIndex];

        for (let i = 0; i < totalPieces; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const piece = document.createElement('div');
            piece.classList.add('puzzle-piece');
            piece.dataset.index = i;
            piece.style.backgroundImage = `url(${selectedImage})`;
            piece.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
            piecesData.push(piece);

            const placeholder = document.createElement('div');
            placeholder.classList.add('puzzle-piece-placeholder');
            placeholder.dataset.index = i;
            puzzleBoard.appendChild(placeholder);
        }

        piecesData.sort(() => Math.random() - 0.5);
        piecesData.forEach(piece => {
            const pieceContainer = document.createElement('div');
            pieceContainer.classList.add('puzzle-piece-container');
            pieceContainer.appendChild(piece);
            puzzlePiecesContainer.appendChild(pieceContainer);
        });

        const oldButton = document.getElementById('reset-button');
        if (oldButton) {
            oldButton.remove();
        }
        displayMessage('拖动图片到左侧拼图板');
    }

    initializeGame();

    function displayMessage(message, color = '#333') {
        statusMessage.textContent = message;
        statusMessage.style.color = color;
    }

    // --- 鼠标和触摸事件处理的统一逻辑 ---

    // 监听鼠标和触摸开始事件
    document.addEventListener('mousedown', startDrag);
    document.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        const target = e.target.closest('.puzzle-piece');
        if (target) {
            e.preventDefault();
            currentDragPiece = target;
            originalParent = currentDragPiece.parentElement;
            currentDragPiece.classList.add('dragging');

            // 复制一个节点用于拖动，这样不会影响原始布局
            const clonedPiece = currentDragPiece.cloneNode(true);
            clonedPiece.id = 'drag-clone';
            clonedPiece.style.position = 'absolute';
            clonedPiece.style.zIndex = '100';
            document.body.appendChild(clonedPiece);

            // 隐藏原始图块
            currentDragPiece.style.visibility = 'hidden';

            // 绑定移动和结束事件
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchmove', dragMove, { passive: false });
            document.addEventListener('touchend', endDrag);

            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            updateClonePosition(clonedPiece, clientX, clientY);
        }
    }

    function dragMove(e) {
        if (!currentDragPiece) return;
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const clonedPiece = document.getElementById('drag-clone');

        updateClonePosition(clonedPiece, clientX, clientY);

        // 突出显示放置区
        const targetPlaceholder = document.elementFromPoint(clientX, clientY)?.closest('.puzzle-piece-placeholder');
        document.querySelectorAll('.puzzle-piece-placeholder').forEach(p => p.style.outline = '');
        if (targetPlaceholder) {
            targetPlaceholder.style.outline = '2px solid #00f';
        }
    }

    function endDrag(e) {
        if (!currentDragPiece) return;

        const clientX = e.clientX || e.changedTouches[0].clientX;
        const clientY = e.clientY || e.changedTouches[0].clientY;
        const targetPlaceholder = document.elementFromPoint(clientX, clientY)?.closest('.puzzle-piece-placeholder');

        handleDrop(targetPlaceholder);

        // 清理事件监听器和临时元素
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', endDrag);
        
        const clonedPiece = document.getElementById('drag-clone');
        if(clonedPiece) clonedPiece.remove();
        
        currentDragPiece.classList.remove('dragging');
        currentDragPiece.style.visibility = 'visible';
        currentDragPiece = null;
        originalParent = null;
    }

    function updateClonePosition(clone, x, y) {
        const cloneRect = clone.getBoundingClientRect();
        clone.style.left = `${x - cloneRect.width / 2}px`;
        clone.style.top = `${y - cloneRect.height / 2}px`;
    }

    function handleDrop(targetPlaceholder) {
        if (currentDragPiece) {
            if (targetPlaceholder) {
                // 清除目标占位符的突出显示
                targetPlaceholder.style.outline = '';
                
                // 如果目标占位符已有拼图块，交换位置
                if (targetPlaceholder.children.length > 0) {
                    const existingPiece = targetPlaceholder.children[0];
                    originalParent.appendChild(existingPiece);
                }
                
                targetPlaceholder.appendChild(currentDragPiece);
            } else {
                // 放回原位
                originalParent.appendChild(currentDragPiece);
            }

            const piecesOnBoard = puzzleBoard.querySelectorAll('.puzzle-piece').length;
            if (piecesOnBoard === totalPieces) {
                setTimeout(checkWinCondition, 300);
            }
        }
    }

    function checkWinCondition() {
        let isWin = true;
        const placeholders = puzzleBoard.querySelectorAll('.puzzle-piece-placeholder');
        
        placeholders.forEach(placeholder => {
            const childPiece = placeholder.querySelector('.puzzle-piece');
            if (!childPiece || placeholder.dataset.index !== childPiece.dataset.index) {
                isWin = false;
            }
        });

        if (isWin) {
            showFireworks();
            displayMessage('恭喜你，拼图完成！', 'green');
            showResetButton();
        } else {
            displayMessage('拼图不正确，请继续尝试！', 'red');
        }
    }

    function showResetButton() {
        const button = document.createElement('button');
        button.id = 'reset-button';
        button.textContent = '重新开始';
        button.style.marginTop = '20px';
        button.style.padding = '10px 20px';
        button.style.fontSize = '1.2em';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', initializeGame);

        document.body.appendChild(button);
    }

    function showFireworks() {
        const container = document.getElementById('fireworks-container');
        container.innerHTML = '';

        const numFireworks = 3;

        for (let i = 0; i < numFireworks; i++) {
            setTimeout(() => {
                createFireworkExplosion();
            }, i * 1500 + Math.random() * 500);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, numFireworks * 1500 + 3000);

        function createFireworkExplosion() {
            const launchTrail = document.createElement('div');
            launchTrail.classList.add('firework-trail');
            const startX = Math.random() * (window.innerWidth - 200) + 100;
            launchTrail.style.left = startX + 'px';
            launchTrail.style.bottom = '0';
            launchTrail.style.backgroundColor = 'hsl(' + Math.random() * 360 + ', 100%, 80%)';

            container.appendChild(launchTrail);

            setTimeout(() => {
                launchTrail.remove();
                const numParticles = 20;
                for (let i = 0; i < numParticles; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('firework-particle');
                    const fruitIndex = Math.floor(Math.random() * fruitImages.length);
                    particle.style.backgroundImage = `url(${fruitImages[fruitIndex]})`;
                    
                    const size = Math.random() * 50 + 50 + 'px';
                    particle.style.width = size;
                    particle.style.height = size;
                    
                    const angle = Math.random() * 2 * Math.PI;
                    const distance = Math.random() * 300 + 100;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;

                    particle.style.setProperty('--x', `${x}px`);
                    particle.style.setProperty('--y', `${y}px`);
                    
                    particle.style.left = startX + 'px';
                    particle.style.top = '20vh';
                    
                    container.appendChild(particle);
                    
                    setTimeout(() => particle.remove(), 1000);
                }
            }, 1000);
        }
    }
});
