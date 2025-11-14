// 检查当前页面
const currentPage = window.location.pathname.split('/').pop();

// 如果是测试页面
if (currentPage === 'reaction-test.html') {
    document.addEventListener('DOMContentLoaded', () => {
        const startBtn = document.getElementById('start-btn');
        const testArea = document.getElementById('test-area');
        const statusDisplay = document.getElementById('status');
        
        // --- 弹窗相关元素 ---
        const resultModal = document.getElementById('result-modal');
        const closeBtn = document.querySelector('.close-btn');
        const modalReactionTime = document.getElementById('modal-reaction-time');
        const modalBestTime = document.getElementById('modal-best-time');
        const modalAvgTime = document.getElementById('modal-avg-time');
        const modalTestCount = document.getElementById('modal-test-count');
        const modalOkBtn = document.getElementById('modal-ok-btn');
        
        let startTime;
        let endTime;
        let reactionTime;
        let testCount = 0;
        let totalReactionTime = 0;
        let bestTime = Infinity;
        let isWaiting = false;

        // --- 导航栏控制 ---
        const body = document.body;
        
        // 初始状态显示导航栏
        body.classList.add('show-nav');

        // 打开弹窗的函数
        function openModal() {
            resultModal.style.display = 'block';
            // 弹窗打开时，隐藏导航栏
            body.classList.remove('show-nav');
        }

        // 关闭弹窗的函数
        function closeModal() {
            resultModal.style.display = 'none';
        }
        
        // 开始新一轮测试的函数
        function resetTest() {
            closeModal(); // 先关闭弹窗
            
            // 重置测试区域状态
            testArea.classList.remove('active', 'waiting');
            statusDisplay.textContent = '点击下方按钮开始测试';
            startBtn.style.display = 'block'; // 重新显示开始按钮
            startTime = null; // 重置开始时间

            // 在重置完成后，延迟一点时间再显示导航栏，形成动画效果
            setTimeout(() => {
                body.classList.add('show-nav');
            }, 100);
        }
        
        // 开始测试
        startBtn.addEventListener('click', startTest);
        
        function startTest() {
            // 开始测试时，隐藏导航栏
            body.classList.remove('show-nav');

            // 隐藏开始按钮
            startBtn.style.display = 'none';
            
            // 设置等待状态
            isWaiting = true;
            testArea.classList.add('waiting');
            statusDisplay.textContent = '准备中...请等待颜色变化';
            
            // 随机等待时间（1-3秒）
            const waitTime = Math.floor(Math.random() * 2000) + 1000;
            
            setTimeout(() => {
                // 开始测试
                isWaiting = false;
                testArea.classList.remove('waiting');
                testArea.classList.add('active');
                statusDisplay.textContent = '点击！';
                startTime = Date.now();
            }, waitTime);
        }

        // 测试区域点击事件
        testArea.addEventListener('click', () => {
            // 如果正在等待或测试未开始，则点击无效
            if (isWaiting || !startTime) {
                // 如果在非等待状态下点击了灰色区域，提示重新开始
                if (!isWaiting && !startTime && startBtn.style.display === 'none') {
                     statusDisplay.textContent = '测试已取消，请点击"开始测试"重新开始。';
                     // 显示导航栏
                     body.classList.add('show-nav');
                     setTimeout(() => {
                        startBtn.style.display = 'block';
                     }, 1500);
                }
                return;
            }
            
            // 计算反应时间
            endTime = Date.now();
            reactionTime = endTime - startTime;
            
            // 更新统计数据
            testCount++;
            totalReactionTime += reactionTime;
            if (reactionTime < bestTime) {
                bestTime = reactionTime;
            }
            
            // 更新弹窗内容
            modalReactionTime.textContent = `${reactionTime} ms`;
            modalTestCount.textContent = testCount;
            modalBestTime.textContent = `${bestTime} ms`;
            modalAvgTime.textContent = `${Math.round(totalReactionTime / testCount)} ms`;
            
            // 打开弹窗
            openModal();
        });
        
        // 点击弹窗的关闭按钮
        closeBtn.addEventListener('click', resetTest);
        
        // 点击弹窗的"继续测试"按钮
        modalOkBtn.addEventListener('click', resetTest);
        
        // 点击弹窗外部区域关闭弹窗
        window.addEventListener('click', (event) => {
            if (event.target === resultModal) {
                resetTest();
            }
        });
    });
}