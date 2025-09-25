const intro = document.querySelector('.intro');
const introBtn = document.querySelector('.intro-btn');
const container = document.querySelector('.container');
const gameDisplay = document.querySelector('.game-display');
const chanceCount = document.querySelector('.chance-count');
const resetBtn = document.querySelector('.reset-btn');
const answerStar = document.querySelector('.answer-star');
const stageNumber = document.querySelector('.stage-number');
const manual = document.querySelector('.manual');
const manualBtn = document.querySelector('.manual-btn')
const manualClose = document.querySelector('.manual-close');
const restartBtn = document.querySelector('.restart-btn');
const progressBar = document.querySelector('.progress-bar');

let isGameActive = false;
let attemptCount = 0;
let currentStage = 1;
let gameFound = false;

//커서 커스텀
function setupCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = ('custom-cursor');

    cursor.innerHTML = `<!-- Five-point star SVG -->
    <svg xmlns="http://www.w3.org/2000/svg"
    width="120" height="120" viewBox="0 0 24 24" aria-labelledby="starTitle" role="img">
    <title id="starTitle">별표 아이콘</title>
    <path fill="white" stroke="none" d="M12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26 Z"/>
    </svg>`;

    document.body.appendChild(cursor);

    // 마우스 이동 이벤트
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        createTrail(e.clientX, e.clientY);

        // 게임 영역 확인 및 커서 색상 변경
        checkCursorInGameArea(e.clientX, e.clientY, cursor);
    });

    // 마우스 클릭 시 물결 효과
    document.addEventListener('click', (e) => {
        // 게임 영역 안에 있는지 확인
        const isInGameArea = checkIfInGameArea(e.clientX, e.clientY);

        // 물결 요소 생성
        const ripple = document.createElement('div');
        ripple.className = isInGameArea ? 'click-ripple in-game-area' : 'click-ripple';

        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';

        // body에 추가
        document.body.appendChild(ripple);

        // 충돌 감지 시작
        checkRippleStarCollision(e.clientX, e.clientY);

        // 애니메이션이 끝나면 제거 - 물결 시간과 맞춤
        setTimeout(() => {
            ripple.remove();
        }, 1500);

        // 커서 클릭 애니메이션
        const svg = cursor.querySelector('svg');
        svg.style.transform = 'scale(0.9)';
        setTimeout(() => {
            svg.style.transform = 'scale(1)';
        }, 150);
    });
}

// 커서가 게임 영역 안에 있는지 확인하는 함수
function checkCursorInGameArea(mouseX, mouseY, cursor) {
    if (!gameDisplay || !isGameActive) return;

    const rect = gameDisplay.getBoundingClientRect();

    // 마우스가 game-display 안에 있는지 확인
    const isInside = mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

    // 커서 색상 변경
    if (isInside) {
        cursor.classList.add('in-game-area');
    } else {
        cursor.classList.remove('in-game-area');
    }
}

// 파동과 별 충돌 감지
function checkRippleStarCollision(clickX, clickY) {
    if (!isGameActive || !answerStar) return;

    // 게임 디스플레이 영역 확인
    if (!gameDisplay) return;

    const gameRect = gameDisplay.getBoundingClientRect();

    // 클릭이 게임 영역 밖이면 무시
    if (clickX < gameRect.left || clickX > gameRect.right ||
        clickY < gameRect.top || clickY > gameRect.bottom) {
        console.log('게임 영역 밖 클릭 - 무시');
        return;
    }

    const starRect = answerStar.getBoundingClientRect();
    const starCenterX = starRect.left + starRect.width / 2;
    const starCenterY = starRect.top + starRect.height / 2;

    const distance = Math.sqrt(
        Math.pow(clickX - starCenterX, 2) +
        Math.pow(clickY - starCenterY, 2)
    );

    console.log(`전체 뷰포트 기준 클릭 위치: (${clickX}, ${clickY})`);
    console.log(`별 중심: (${starCenterX}, ${starCenterY})`);
    console.log(`거리: ${distance}px`);

    rippleExpansion(distance);
}

// 파동 확장 시뮬레이션
function rippleExpansion(targetDistance) {
    let currentRadius = 15;
    const maxRadius = 75;
    const animationDuration = 1500;
    const radiusIncrement = (maxRadius - currentRadius) / (animationDuration / 16);

    const collisionCheck = setInterval(() => {
        currentRadius += radiusIncrement;

        // 파동이 별에 닿았는지 확인
        if (currentRadius >= targetDistance - 10 && currentRadius <= targetDistance + 10) {
            console.log('별 발견!');
            showDistanceAlert(targetDistance);
            clearInterval(collisionCheck);
        }
        // 파동이 최대 크기에 도달하면 중단 (별 못찾음)
        else if (currentRadius >= maxRadius) {
            console.log('별 못찾음');
            showDistanceAlert(targetDistance);
            clearInterval(collisionCheck);
        }
    }, 16);
}

// 거리별 알림 메시지 표시
function showDistanceAlert(distance) {
    let message = '';
    let alertClass = '';

    if (distance <= 10) {
        message = '🎉 별을 찾았습니다! 다음 단계로 이동합니다!';
        alertClass = 'success';
        gameFound = true;

        displayCustomAlert(message, alertClass);
        handleStageComplete();  // 성공 처리 함수 호출
        return;
    }
    else if (distance <= 30) {
        message = '🔥 매우 가까워요! 거의 다 왔어요!';
        alertClass = 'very-close';
    } else if (distance <= 80) {
        message = '🌊 파동 안에 별이 있어요!';
        alertClass = 'close';
    } else if (distance <= 150) {
        message = '👀 중간 거리에요. 더 찾아보세요!';
        alertClass = 'medium';
    }
    else if (distance <= 300) {
        message = '🌙 멀어요. 다른 곳을 시도해보세요!';
        alertClass = 'far';
    }
    else {
        message = '☠️ 많이 멀어요. 반대 쪽을 시도해보세요!';
        alertClass = 'else';
    }

    displayCustomAlert(message, alertClass);
}

// 알림 표시
function displayCustomAlert(message, alertClass) {
    removeExistingAlert();
    const alertDiv = createAlertElement(message, alertClass);
    document.body.appendChild(alertDiv);
    scheduleAlertRemoval(alertDiv);
}

// 기존 알림 제거
function removeExistingAlert() {
    const existingAlert = document.querySelector('.distance-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
}

// 알림 요소 생성
function createAlertElement(message, alertClass) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `distance-alert ${alertClass}`;
    alertDiv.textContent = message;
    return alertDiv;
}

// 알림 자동 제거 스케줄
function scheduleAlertRemoval(alertDiv) {
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 2000);
}

// 별 발견 함수
function handleStageComplete() {
    isGameActive = false;

    if (stageNumber) {
        stageNumber.textContent = '성공!';
        stageNumber.classList.add('success');
    }

    // 별 발견 효과
    if (answerStar) {
        answerStar.classList.remove('hidden');
        answerStar.style.animation = 'starFound 0.8s ease-in-out 4';
    }

    // 2초 후 다음 스테이지로
    setTimeout(() => {
        if (stageNumber) {
            stageNumber.classList.remove('success');
        }
        nextStage();
    }, 300);
}

// 다음 스테이지 이동 함수
function nextStage() {
    // 5스테이지 완료 후 게임 초기화
    if (currentStage >= 5) {
        // 게임 완료 알림
        showActionAlert('🎉 모든 별을 찾았습니다! 게임이 초기화됩니다.');

        // 2초 후 초기화
        setTimeout(() => {
            currentStage = 1;
            attemptCount = 0;

            // localStorage 데이터 삭제
            localStorage.removeItem('cursorStarGame');

            // UI 업데이트 및 게임 재시작
            updateStageDisplay();
            if (chanceCount) {
                chanceCount.textContent = attemptCount;
            }
            initGame();

            console.log('게임 완료! 초기화됨');
        }, 2000);

        return;
    }

    currentStage++;
    updateStageDisplay();
    initGame();

    console.log(`스테이지 ${currentStage}로 이동`);
}

// 게임 영역 안에 있는지 확인하는 함수 (트레일용)
function checkIfInGameArea(x, y) {
    if (!gameDisplay || !isGameActive) return false;

    const rect = gameDisplay.getBoundingClientRect();

    return x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom;
}

// 스테이지 표시 업데이트
function updateStageDisplay() {
    const stageNumber = document.querySelector('.stage-number');
    if (stageNumber) {
        stageNumber.textContent = currentStage.toString().padStart(2, '0');
    }

    // 진행률 바 업데이트 (5스테이지 기준)
    if (progressBar) {
        const progress = Math.min((currentStage - 1) * 20, 100); // 5스테이지면 100%
        progressBar.style.width = progress + '%';
    }
}

// 커서 트레일 생성 (게임 영역에서는 파란색)
function createTrail(x, y) {
    // 게임 영역 안에 있는지 확인
    const isInGameArea = checkIfInGameArea(x, y);
    const trailColor = isInGameArea ? '#9a7ee8' : 'white'; // 보라색 또는 흰색

    const dot = document.createElement('div');
    dot.style.cssText = `position:fixed; left:${x}px; top:${y}px; width:6px; height:6px; background:${trailColor}; border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%, -50%)`;
    document.body.appendChild(dot);

    let opacity = 1;
    const fade = setInterval(() => {
        opacity -= 0.05;
        dot.style.opacity = opacity;

        if (opacity <= 0) {
            clearInterval(fade);
            dot.remove();
        }
    }, 50);
}

// 시도 횟수 표시
function attemptDisplay() {
    if (gameDisplay && chanceCount) {
        gameDisplay.addEventListener('click', (e) => {
            if (!isGameActive) return;

            attemptCount++;
            chanceCount.textContent = attemptCount;

            // 시도 횟수 변경 시 저장
            saveGameData();

            console.log(`시도 횟수: ${attemptCount}번`);

            const rect = gameDisplay.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            console.log(`게임 영역 내 클릭 위치: (${Math.round(clickX)}, ${Math.round(clickY)})`);
        });
    }
}

// 버튼 액션 알림 표시 함수
function showActionAlert(message) {
    const existingAlert = document.querySelector('.action-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 알림 요소 생성
    const alertDiv = document.createElement('div');
    alertDiv.className = 'action-alert';
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);


    // 진입 애니메이션
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 100);

    // 3초 후 제거
    setTimeout(() => {
        alertDiv.classList.add('hide');
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 300);
    }, 3000);
}


// 게임 리셋
function resetGame() {
    if (resetBtn && chanceCount) {
        resetBtn.addEventListener('click', () => {
            attemptCount = 0;
            chanceCount.textContent = attemptCount;
            initGame();
            // 별 재배치 알림
            showActionAlert('별을 재배치하였습니다');
        });
    }

    if (restartBtn && chanceCount) {
        restartBtn.addEventListener('click', () => {
            attemptCount = 0;
            currentStage = 1;
            chanceCount.textContent = attemptCount;

            updateStageDisplay();
            localStorage.removeItem('cursorStartGame');
            initGame();
            // 게임 초기화 알림
            showActionAlert('게임을 초기화하였습니다');
        });
    }
}

// 게임 초기화
function initGame() {
    isGameActive = true;
    attemptCount = 0;

    answerStar.style.animation = '';
    if (chanceCount) {
        chanceCount.textContent = attemptCount;
    }

    // 별 표시
    if (answerStar) {
        answerStar.classList.add('hidden');
    }

    // 별을 랜덤 위치에 배치
    placeStarRandomly();

    // 게임 데이터 저장
    saveGameData();

    // 수정된 로그 메시지
    console.log(`스테이지 ${currentStage} 시작!`);
}

// 별 랜덤 배치
function placeStarRandomly() {
    if (!gameDisplay || !answerStar) return;

    // 패딩과 테두리 고려해서 실제 내부 크기 구하기
    const displayWidth = gameDisplay.clientWidth;
    const displayHeight = gameDisplay.clientHeight;
    const margin = 30;

    // 별 크기도 고려 (대략 20px 정도로 가정)
    const starSize = 20;

    const starX = margin + Math.random() * (displayWidth - margin * 2 - starSize);
    const starY = margin + Math.random() * (displayHeight - margin * 2 - starSize);

    // 별 위치 설정
    answerStar.style.position = 'absolute';
    answerStar.style.left = starX + 'px';
    answerStar.style.top = starY + 'px';
    console.log(`별 위치: (${starX}, ${starY})`);
}

function manualDisplay() {
    const manual = document.querySelector('.manual');
    const manualBtn = document.querySelector('.manual-btn')
    const manualClose = document.querySelector('.manual-close');
    const manualContent = document.querySelector('.manual-content');

    if (manualBtn) {
        manualBtn.addEventListener('click', function (e) {
            e.preventDefault();        // 기본 동작 방지
            e.stopPropagation();      // 이벤트 버블링 중단
            console.log('버튼 클릭됨!');
            manual.classList.add('show');
        });
    }

    // 모달 닫기 (X 버튼)
    if (manualClose) {
        manualClose.addEventListener('click', function (e) {
            e.preventDefault();        // 기본 동작 방지
            e.stopPropagation();      // 이벤트 버블링 중단
            manual.classList.remove('show');
        });
    }

    // 모달 외부 클릭 시 닫기
    if (manual) {
        manual.addEventListener('click', function (e) {
            if (e.target === manual) {
                e.stopPropagation();      // 이벤트 버블링 중단
                manual.classList.remove('show');
            }
        });
    }

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && manual.classList.contains('show')) {
            manual.classList.remove('show');
        }
    });

    // 인트로 버튼 이벤트
    if (intro && introBtn && container) {
        introBtn.addEventListener('click', function () {
            intro.style.animation = 'fadeOut 0.5s ease forwards';

            setTimeout(() => {
                intro.style.display = 'none';
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.justifyContent = 'center';
                container.style.alignItems = 'center';

                // 저장된 게임 데이터가 있으면 불러오기, 없으면 새 게임 시작
                if (!loadGameData()) {
                    initGame();
                } else {
                    // 불러온 데이터로 게임 상태 복원
                    if (answerStar) {
                        answerStar.classList.add('hidden');
                    }
                    console.log('저장된 게임 데이터로 복원됨');
                }

            }, 500);
        });
    }

    if (manualContent) {
        manualContent.addEventListener('click', function (e) {
            e.stopPropagation();
        })
    }
}


//게임 데이터 저장
function saveGameData() {
    const gameData = {
        currentStage: currentStage,
        isGameActive: isGameActive,
        attemptCount: attemptCount,
        starPosition: {
            x: answerStar.style.left,
            y: answerStar.style.top
        }
    }
    localStorage.setItem('cursorStarGame', JSON.stringify(gameData));
}

// 게임 데이터 불러오기
function loadGameData() {
    const savedData = localStorage.getItem('cursorStarGame');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        currentStage = gameData.currentStage || 1;
        attemptCount = gameData.attemptCount || 0;
        isGameActive = gameData.isGameActive || false;

        // UI 업데이트
        updateStageDisplay();
        if (chanceCount) {
            chanceCount.textContent = attemptCount;
        }

        // 별 위치 복원
        if (gameData.starPosition && gameData.starPosition.x && gameData.starPosition.y) {
            answerStar.style.position = 'absolute';
            answerStar.style.left = gameData.starPosition.x;
            answerStar.style.top = gameData.starPosition.y;
        }

        console.log('게임 데이터 불러옴:', gameData);
        return true;
    }
    return false;
}

// 커서 설정 실행
setupCustomCursor();

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function () {
    manualDisplay();
    attemptDisplay();
    resetGame();
});