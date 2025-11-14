// 初始化主题（优先使用本地存储的设置，默认日间模式）
if (localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// 切换主题
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
}

// 更新按钮图标
function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (document.documentElement.classList.contains('dark')) {
        icon.textContent = '☀️';
    } else {
        icon.textContent = '🌙';
    }
}

// 绑定按钮事件
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
        updateThemeIcon(); // 初始化图标
    }
});