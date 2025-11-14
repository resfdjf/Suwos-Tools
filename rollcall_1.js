document.addEventListener('DOMContentLoaded', () => {
    // 全局变量
    let nameList = []; // 所有学生名单
    let currentIndex = -1; // 当前点名索引
    let record = {}; // 点名记录：{ 名字: 'present/absent/late/pending' }

    // DOM 元素
    const nameTextarea = document.getElementById('name-textarea');
    const nameFile = document.getElementById('name-file');
    const importManualBtn = document.getElementById('import-manual');
    const importFileBtn = document.getElementById('import-file');
    const controlSection = document.getElementById('control-section');
    const recordSection = document.getElementById('record-section');
    const currentName = document.getElementById('current-name');
    const randomBtn = document.getElementById('random-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const resetBtn = document.getElementById('reset-btn');
    const presentBtn = document.getElementById('present-btn');
    const absentBtn = document.getElementById('absent-btn');
    const lateBtn = document.getElementById('late-btn');
    const nameListUl = document.getElementById('name-list-ul');
    const exportRecordBtn = document.getElementById('export-record');

    // 统计元素
    const totalCount = document.getElementById('total-count');
    const presentCount = document.getElementById('present-count');
    const absentCount = document.getElementById('absent-count');
    const lateCount = document.getElementById('late-count');
    const pendingCount = document.getElementById('pending-count');

    // 手动导入名单
    importManualBtn.addEventListener('click', () => {
        const text = nameTextarea.value.trim();
        if (!text) {
            alert('请输入学生名单（一行一个名字）');
            return;
        }
        // 按换行符分割，去除空行
        nameList = text.split('\n').map(name => name.trim()).filter(name => name);
        initRecord();
        updateUI();
    });

    // 读取文件导入名单
    importFileBtn.addEventListener('click', () => {
        const file = nameFile.files[0];
        if (!file) {
            alert('请选择一个TXT文件');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result.trim();
            nameList = text.split('\n').map(name => name.trim()).filter(name => name);
            initRecord();
            updateUI();
        };
        reader.readAsText(file);
    });

    // 初始化点名记录
    function initRecord() {
        record = {};
        nameList.forEach(name => {
            record[name] = 'pending'; // pending: 未点名
        });
        currentIndex = -1;
    }

    // 更新UI
    function updateUI() {
        if (nameList.length === 0) return;

        // 显示控制区和记录区
        controlSection.style.display = 'block';
        recordSection.style.display = 'block';

        // 更新统计
        updateStats();

        // 更新名单列表
        updateNameList();

        // 如果没有当前选中的名字，默认选中第一个
        if (currentIndex === -1) {
            currentIndex = 0;
            currentName.textContent = nameList[currentIndex];
            highlightCurrentName();
        }
    }

    // 更新统计
    function updateStats() {
        const total = nameList.length;
        const present = Object.values(record).filter(status => status === 'present').length;
        const absent = Object.values(record).filter(status => status === 'absent').length;
        const late = Object.values(record).filter(status => status === 'late').length;
        const pending = total - present - absent - late;

        totalCount.textContent = total;
        presentCount.textContent = present;
        absentCount.textContent = absent;
        lateCount.textContent = late;
        pendingCount.textContent = pending;
    }

    // 更新名单列表
    function updateNameList() {
        nameListUl.innerHTML = '';
        nameList.forEach((name, index) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.dataset.name = name;

            // 根据状态设置样式
            switch (record[name]) {
                case 'present':
                    li.classList.add('present');
                    break;
                case 'absent':
                    li.classList.add('absent');
                    break;
                case 'late':
                    li.classList.add('late');
                    break;
                default:
                    li.classList.add('pending');
            }

            // 点击名单中的名字，切换到该学生
            li.addEventListener('click', () => {
                currentIndex = index;
                currentName.textContent = name;
                highlightCurrentName();
            });

            nameListUl.appendChild(li);
        });
    }

    // 高亮当前点名的名字
    function highlightCurrentName() {
        document.querySelectorAll('#name-list-ul li').forEach(li => {
            li.classList.remove('current');
        });
        const currentLi = document.querySelector(`#name-list-ul li[data-name="${nameList[currentIndex]}"]`);
        if (currentLi) {
            currentLi.classList.add('current');
            currentLi.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // 随机点名
    randomBtn.addEventListener('click', () => {
        if (nameList.length === 0) return;

        // 随机选择一个索引（不重复当前索引）
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * nameList.length);
        } while (nameList.length > 1 && randomIndex === currentIndex);

        // 滚动显示效果
        let rollCount = 0;
        const rollInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % nameList.length;
            currentName.textContent = nameList[currentIndex];
            highlightCurrentName();
            rollCount++;
            if (rollCount >= 15) { // 滚动15次后停止
                clearInterval(rollInterval);
                currentIndex = randomIndex;
                currentName.textContent = nameList[currentIndex];
                highlightCurrentName();
            }
        }, 80);
    });

    // 上一个
    prevBtn.addEventListener('click', () => {
        if (nameList.length === 0) return;
        currentIndex = (currentIndex - 1 + nameList.length) % nameList.length;
        currentName.textContent = nameList[currentIndex];
        highlightCurrentName();
    });

    // 下一个
    nextBtn.addEventListener('click', () => {
        if (nameList.length === 0) return;
        currentIndex = (currentIndex + 1) % nameList.length;
        currentName.textContent = nameList[currentIndex];
        highlightCurrentName();
    });

    // 重置点名
    resetBtn.addEventListener('click', () => {
        if (confirm('确定要重置点名记录吗？所有状态将恢复为未点名')) {
            initRecord();
            currentName.textContent = nameList[0];
            updateUI();
        }
    });

    // 标记状态
    presentBtn.addEventListener('click', () => {
        if (currentIndex === -1) return;
        record[nameList[currentIndex]] = 'present';
        updateStats();
        updateNameList();
        highlightCurrentName();
    });

    absentBtn.addEventListener('click', () => {
        if (currentIndex === -1) return;
        record[nameList[currentIndex]] = 'absent';
        updateStats();
        updateNameList();
        highlightCurrentName();
    });

    lateBtn.addEventListener('click', () => {
        if (currentIndex === -1) return;
        record[nameList[currentIndex]] = 'late';
        updateStats();
        updateNameList();
        highlightCurrentName();
    });

    // 导出点名记录
    exportRecordBtn.addEventListener('click', () => {
        if (nameList.length === 0) {
            alert('暂无点名记录可导出');
            return;
        }

        // 构建记录文本
        let recordText = '班级点名记录\n';
        recordText += `导出时间：${new Date().toLocaleString()}\n`;
        recordText += `总人数：${nameList.length} | 已到：${presentCount.textContent} | 缺席：${absentCount.textContent} | 迟到：${lateCount.textContent}\n\n`;
        recordText += '姓名\t状态\n';

        nameList.forEach(name => {
            let statusText = '';
            switch (record[name]) {
                case 'present': statusText = '已到'; break;
                case 'absent': statusText = '缺席'; break;
                case 'late': statusText = '迟到'; break;
                default: statusText = '未点名';
            }
            recordText += `${name}\t${statusText}\n`;
        });

        // 创建下载链接
        const blob = new Blob([recordText], { type: 'text/plain; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `班级点名记录_${new Date().toLocaleDateString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // 日/夜模式适配（监听主题变化）
    const observer = new MutationObserver(() => {
        updateNameList(); // 主题变化时更新名单样式
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});

                // 点击后自动隐藏记录面板（可选）
                recordSection.style.display = 'none';
            });