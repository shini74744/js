// == 字体图标样式注入 ==
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
document.head.appendChild(fontLink);

// == 自定义 CSS 注入 ==
const style = document.createElement('style');
style.textContent = `
.footer-link:hover {
    text-decoration: underline !important;
    opacity: 0.8;
}
.server-footer-name > div,
.server-footer-theme {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
}
@keyframes fadeColor {
    0%   { color: inherit; }
    100% { color: var(--target-color); }
}
@keyframes fadeLoop {
    0% { opacity: 0; transform: translateY(5px); }
    50% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-5px); }
}
.fade-loop {
    animation: fadeLoop 2.5s ease-in-out infinite;
}
@keyframes rotateIcon {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
.rotate-icon {
    animation: rotateIcon 2s linear infinite;
}
`;
document.head.appendChild(style);

// == JS 功能实现 ==
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function animateTextColor(element, text) {
    element.innerHTML = '';
    for (let i = 0; i < text.length; i++) {
        const span = document.createElement('span');
        span.textContent = text[i];
        span.style.setProperty('--target-color', getRandomColor());
        span.style.animation = 'fadeColor 1s ease forwards';
        span.style.animationDelay = `${i * 0.2}s`;
        element.appendChild(span);
    }
}

function updateFooterLeft() {
    const footerLeft = document.querySelector('.server-footer-name > div:first-child');
    if (!footerLeft) return;

    const container = document.createElement('span');
    container.classList.add('color-animate');

    const icon = document.createElement('i');
    icon.className = 'fas fa-server';
    icon.style.marginRight = '6px';

    const link = document.createElement('a');
    link.href = 'https://t.me/contact/1746959833:pDG7N84llgNWazU8';
    link.target = '_blank';
    link.className = 'footer-link';
    link.style.textDecoration = 'none';

    container.appendChild(icon);
    container.appendChild(link);
    footerLeft.innerHTML = '';
    footerLeft.appendChild(container);

    const text = 'MyStatus 监控系统 ©2025';
    animateTextColor(link, text);

    setInterval(() => {
        animateTextColor(link, text);
    }, 6000);
}

function updateFooterRight() {
    const footerRight = document.querySelector('.server-footer-theme');
    if (!footerRight) return;

    const section = document.createElement('section');
    section.classList.add('fade-loop');

    section.innerHTML = `
        <a href="https://github.com/nezhahq/nezha" target="_blank" class="footer-link" style="color: #888; text-decoration: none;">
            <i class="fab fa-github rotate-icon" style="margin-right: 6px;"></i> Powered by NeZha
        </a>
    `;
    footerRight.innerHTML = '';
    footerRight.appendChild(section);
}

setTimeout(() => {
    updateFooterLeft();
    updateFooterRight();
}, 1000);
