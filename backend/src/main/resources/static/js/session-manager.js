// 세션 관리 및 자동 로그아웃 경고 팝업
class SessionManager {
    constructor() {
        this.sessionTimeout = 5 * 60 * 1000; // 5분 (밀리초)
        this.warningTime = 1 * 60 * 1000;    // 1분 전 경고 (밀리초)
        this.checkInterval = 10 * 1000;       // 10초마다 체크
        this.lastActivityTime = Date.now();
        this.warningShown = false;
        this.countdownInterval = null;

        this.init();
    }

    init() {
        // 사용자 활동 감지 이벤트들
        const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        activities.forEach(event => {
            document.addEventListener(event, () => this.resetTimer(), true);
        });

        // 정기적으로 세션 상태 체크
        setInterval(() => this.checkSession(), this.checkInterval);

        // 페이지 로드 시 세션 체크
        this.checkServerSession();
    }

    resetTimer() {
        this.lastActivityTime = Date.now();
        this.warningShown = false;

        // 경고 팝업이 있다면 숨기기
        const warningPopup = document.getElementById('session-warning-popup');
        if (warningPopup) {
            warningPopup.remove();
        }

        // 카운트다운 중지
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    checkSession() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivityTime;
        const timeUntilExpire = this.sessionTimeout - timeSinceLastActivity;

        // 세션이 만료된 경우
        if (timeUntilExpire <= 0) {
            this.logout();
            return;
        }

        // 1분 전 경고 표시
        if (timeUntilExpire <= this.warningTime && !this.warningShown) {
            this.showWarning(Math.ceil(timeUntilExpire / 1000));
            this.warningShown = true;
        }
    }

    showWarning(remainingSeconds) {
        // 기존 팝업 제거
        const existingPopup = document.getElementById('session-warning-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // 팝업 생성
        const popup = document.createElement('div');
        popup.id = 'session-warning-popup';
        popup.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    min-width: 350px;
                    border: 2px solid #dc3545;
                ">
                    <div style="color: #dc3545; font-size: 24px; margin-bottom: 15px;">
                        ⚠️ 세션 만료 경고
                    </div>
                    <div style="font-size: 16px; margin-bottom: 20px; color: #333;">
                        세션이 곧 만료됩니다.<br>
                        <span style="color: #dc3545; font-weight: bold; font-size: 20px;">
                            <span id="countdown">${remainingSeconds}</span>초
                        </span> 후에 자동으로 로그아웃됩니다.
                    </div>
                    <div style="margin-bottom: 20px;">
                        <button id="extend-session-btn" style="
                            background-color: #28a745;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-right: 10px;
                        ">세션 연장</button>
                        <button id="logout-now-btn" style="
                            background-color: #6c757d;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 16px;
                        ">지금 로그아웃</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // 버튼 이벤트 리스너
        document.getElementById('extend-session-btn').addEventListener('click', () => {
            this.extendSession();
        });

        document.getElementById('logout-now-btn').addEventListener('click', () => {
            this.logout();
        });

        // 카운트다운 시작
        this.startCountdown();
    }

    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;

        let seconds = parseInt(countdownElement.textContent);

        this.countdownInterval = setInterval(() => {
            seconds--;
            if (countdownElement) {
                countdownElement.textContent = seconds;
            }

            if (seconds <= 0) {
                clearInterval(this.countdownInterval);
                this.logout();
            }
        }, 1000);
    }

    async extendSession() {
        try {
            // 서버에 세션 연장 요청
            const response = await fetch('/api/extend-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                this.resetTimer();
                this.showMessage('세션이 연장되었습니다.', 'success');
            } else {
                throw new Error('세션 연장 실패');
            }
        } catch (error) {
            console.error('세션 연장 오류:', error);
            this.showMessage('세션 연장에 실패했습니다. 다시 로그인해주세요.', 'error');
            setTimeout(() => this.logout(), 2000);
        }
    }

    async checkServerSession() {
        try {
            const response = await fetch('/api/session-status', {
                method: 'GET',
                credentials: 'same-origin'
            });

            if (!response.ok || response.status === 401) {
                // 세션이 이미 만료된 경우
                this.logout();
            }
        } catch (error) {
            console.error('세션 상태 확인 오류:', error);
        }
    }

    logout() {
        // 팝업 제거
        const popup = document.getElementById('session-warning-popup');
        if (popup) {
            popup.remove();
        }

        // 카운트다운 중지
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        // 로그아웃 처리
        window.location.href = '/logout';
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10001;
                ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
            ">
                ${message}
            </div>
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
}

// 페이지 로드 시 세션 관리자 초기화 (로그인된 경우만)
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 페이지나 회원가입 페이지가 아닌 경우에만 세션 관리 시작
    if (!window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/signup')) {

        // 사용자가 로그인되어 있는지 확인
        fetch('/api/session-status', {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => {
            if (response.ok) {
                // 로그인된 경우만 세션 관리자 초기화
                new SessionManager();
            }
        })
        .catch(error => {
            console.error('세션 상태 확인 오류:', error);
        });
    }
});

