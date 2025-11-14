// 等待页面完全加载
window.onload = function() {
    // 全局变量
    let nameList = [];
    let currentIndex = 0;
    let record = {};

    // ------------ 绑定DOM元素（确保与HTML ID完全一致）------------
    // 导入区域
    const $importSection = document.getElementById('import-section');
    const $nameTextarea = document.getElementById('name-textarea');
    const $nameFile = document.getElementById('name-file');
    const $importManualBtn = document.getElementById('import-manual');
    const $importFileBtn = document.getElementById('import-file');

    // 全屏点名区域
    const $fullscreenRollcall = document.getElementById('fullscreen-rollcall');
    const $fullscreenCurrentName = document.getElementById('fullscreen-current-name');
    const $fullscreenRandom = document.getElementById('fullscreen-random');
    const $fullscreenReset = document.getElementById('fullscreen-reset');
    const $fullscreenPresent = document.getElementById('fullscreen-present');
    const $fullscreenAbsent = document.getElementById('fullscreen-absent');
    const $fullscreenLeave = document.getElementById('fullscreen-leave');
    const $fullscreenLate = document.getElementById('fullscreen-late');
    const $fullscreenPrev = document.getElementById('fullscreen-prev');
    const $fullscreenNext = document.getElementById('fullscreen-next');
    const $backToImport = document.getElementById('back-to-import');
    const $showRecord = document.getElementById('show-record');

    // 记录区域
    const $recordSection = document.getElementById('record-section');
    const $hideRecord = document.getElementById('hide-record');
    const $nameListUl = document.getElementById('name-list-ul');
    const $exportRecordBtn = document.getElementById('export-record');

    // 统计区域
    const $totalCount = document.getElementById('total-count');
    const $presentCount = document.getElementById('present-count');
    const $absentCount = document.getElementById('absent-count');
    const $leaveCount = document.getElementById('leave-count');
    const $lateCount = document.getElementById('late-count');
    const $pendingCount = document.getElementById('pending-count');

    // ------------ 核心功能 ------------
    // 1. 手动导入名单（最简化逻辑）
    $importManualBtn.addEventListener('click', function() {
        const text = $nameTextarea.value.trim();
        if (!text) {
            alert('请输入学生名单（一行一个名字）');
            return;
        }
        // 分割名单（兼容各种换行符，只过滤空行）
        nameList = text.split(/\r?\n/).map(name => name.trim()).filter(name => name);
        if (nameList.length === 0) {
            alert('未识别到有效名字，请检查输入');
            return;
        }
        // 初始化并切换到全屏模式
        initRecord();
        $importSection.style.display = 'none';
        $recordSection.style.display = 'none';
        $fullscreenRollcall.style.display = 'flex';
        window.scrollTo(0, 0);
    });

    // 2. 文件导入名单
    $importFileBtn.addEventListener('click', function() {
        const file = $nameFile.files[0];
        if (!file) {
            alert('请选择TXT文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result.trim();
            nameList = text.split(/\r?\n/).map(name => name.trim()).filter(name => name);
            if (nameList.length === 0) {
                alert('文件中无有效名字');
                return;
            }
            initRecord();
            $importSection.style.display = 'none';
            $recordSection.style.display = 'none';
            $fullscreenRollcall.style.display = 'flex';
            window.scrollTo(0, 0);
        };
        reader.readAsText(file, 'utf-8');
    });

    // 3. 初始化点名记录
    function initRecord() {
        record = {};
        nameList.forEach(name => record[name] = 'pending');
        currentIndex = 0;
        $fullscreenCurrentName.textContent = nameList[currentIndex];
        updateStats();
        updateNameList();
    }

    // 4. 更新统计
    function updateStats() {
        const total = nameList.length;
        const present = Object.values(record).filter(s => s === 'present').length;
        const absent = Object.values(record).filter(s => s === 'absent').length;
        const leave = Object.values(record).filter(s => s === 'leave').length;
        const late = Object.values(record).filter(s => s === 'late').length;
        const pending = total - present - absent - leave - late;

        $totalCount.textContent = total;
        $presentCount.textContent = present;
        $absentCount.textContent = absent;
        $leaveCount.textContent = leave;
        $lateCount.textContent = late;
        $pendingCount.textContent = pending;
    }

    // 5. 更新名单列表
    function updateNameList() {
        $nameListUl.innerHTML = '';
        nameList.forEach((name, index) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.dataset.index = index;
            // 设置状态样式
            switch(record[name]) {
                case 'present': li.className = 'present'; break;
                case 'absent': li.className = 'absent'; break;
                case 'leave': li.className = 'leave'; break;
                case 'late': li.className = 'late'; break;
                default: li.className = 'pending';
            }
            // 点击切换学生（不关闭弹窗）
            li.addEventListener('click', function() {
                currentIndex = index;
                $fullscreenCurrentName.textContent = name;
                highlightCurrentName();
            });
            $nameListUl.appendChild(li);
        });
        highlightCurrentName();
    }

    // 6. 高亮当前学生
    function highlightCurrentName() {
        document.querySelectorAll('#name-list-ul li').forEach(li => li.classList.remove('current'));
        const currentLi = document.querySelector(`#name-list-ul li[data-index="${currentIndex}"]`);
        if (currentLi) currentLi.classList.add('current');
    }

    // 7. 随机点名（排除缺席/请假）
    $fullscreenRandom.addEventListener('click', function() {
        const available = nameList.filter(name => ['pending', 'present', 'late'].includes(record[name]));
        if (available.length === 0) {
            alert('无可用抽签对象（已排除缺席/请假）');
            return;
        }
        // 滚动动画
        let rollCount = 0;
        $fullscreenCurrentName.classList.add('rolling');
        const rollInterval = setInterval(() => {
            currentIndex = rollCount % nameList.length;
            // 只滚动可用学生
            if (['pending', 'present', 'late'].includes(record[nameList[currentIndex]])) {
                $fullscreenCurrentName.textContent = nameList[currentIndex];
            }
            rollCount++;
            if (rollCount >= 30) {
                clearInterval(rollInterval);
                $fullscreenCurrentName.classList.remove('rolling');
                // 最终随机结果
                const randomName = available[Math.floor(Math.random() * available.length)];
                currentIndex = nameList.indexOf(randomName);
                $fullscreenCurrentName.textContent = randomName;
                $fullscreenCurrentName.classList.add('shaking');
                highlightCurrentName();
                setTimeout(() => $fullscreenCurrentName.classList.remove('shaking'), 500);
            }
        }, 50);
    });

    // 8. 上一个/下一个
    $fullscreenPrev.addEventListener('click', function() {
        currentIndex = (currentIndex - 1 + nameList.length) % nameList.length;
        $fullscreenCurrentName.textContent = nameList[currentIndex];
        highlightCurrentName();
    });

    $fullscreenNext.addEventListener('click', function() {
        currentIndex = (currentIndex + 1) % nameList.length;
        $fullscreenCurrentName.textContent = nameList[currentIndex];
        highlightCurrentName();
    });

    // 9. 状态标记
    $fullscreenPresent.addEventListener('click', function() {
        record[nameList[currentIndex]] = 'present';
        updateStats();
        updateNameList();
    });

    $fullscreenAbsent.addEventListener('click', function() {
        record[nameList[currentIndex]] = 'absent';
        updateStats();
        updateNameList();
    });

    $fullscreenLeave.addEventListener('click', function() {
        record[nameList[currentIndex]] = 'leave';
        updateStats();
        updateNameList();
    });

    $fullscreenLate.addEventListener('click', function() {
        record[nameList[currentIndex]] = 'late';
        updateStats();
        updateNameList();
    });

    // 10. 重置
    $fullscreenReset.addEventListener('click', function() {
        if (confirm('重置所有点名记录？')) {
            initRecord();
        }
    });

    // 11. 显示/隐藏记录
    $showRecord.addEventListener('click', function() {
        $recordSection.style.display = 'block';
    });

    $hideRecord.addEventListener('click', function() {
        $recordSection.style.display = 'none';
    });

    // 12. 导出记录
    $exportRecordBtn.addEventListener('click', function() {
        let content = '班级点名记录\n';
        content += `导出时间：${new Date().toLocaleString()}\n`;
        content += `总人数：${$totalCount.textContent} | 已到：${$presentCount.textContent} | 缺席：${$absentCount.textContent} | 请假：${$leaveCount.textContent} | 迟到：${$lateCount.textContent}\n\n`;
        content += '姓名\t状态\n';
        nameList.forEach(name => {
            let status = '';
            switch(record[name]) {
                case 'present': status = '已到'; break;
                case 'absent': status = '缺席'; break;
                case 'leave': status = '请假'; break;
                case 'late': status = '迟到'; break;
                default: status = '未点名';
            }
            content += `${name}\t${status}\n`;
        });
        const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `点名记录_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    });

    // 13. 返回导入页面
    $backToImport.addEventListener('click', function() {
        $fullscreenRollcall.style.display = 'none';
        $importSection.style.display = 'block';
    });

    // 14. 日/夜模式适配
    const observer = new MutationObserver(updateNameList);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
};