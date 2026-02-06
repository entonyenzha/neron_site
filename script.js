/**
 * NeronExpert - Interactive JavaScript
 * Handles animations, form submission, navigation, Web Speech API, and AI head states
 */

// ================================
// Initialize AOS (Animate on Scroll)
// ================================
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'ease-out-cubic',
        once: true,
        offset: 100,
        disable: 'mobile'
    });

    // Re-initialize AOS on resize
    window.addEventListener('resize', function() {
        AOS.refresh();
    });
});

// ================================
// Navbar Scroll Effect
// ================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// ================================
// Mobile Navigation Toggle
// ================================
const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');

burger.addEventListener('click', function() {
    burger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function() {
        burger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ================================
// Smooth Scroll for Navigation Links
// ================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        e.preventDefault();

        if (href === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ================================
// Animated Counter for Stats (Smooth)
// ================================
const counters = document.querySelectorAll('.stat-number');

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const animateCounter = (counter, duration = 1400) => {
    const target = Number(counter.getAttribute('data-count')) || 0;
    const start = performance.now();

    const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const value = Math.round(target * eased);
        counter.textContent = value.toString();

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            counter.textContent = target.toString();
        }
    };

    requestAnimationFrame(tick);
};

// Intersection Observer for counter animation
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.delay || 0);
            setTimeout(() => animateCounter(entry.target), delay);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

counters.forEach((counter, idx) => {
    counter.dataset.delay = idx * 120;
    counterObserver.observe(counter);
});

// ================================
// Particle Background Effect
// ================================
const particlesContainer = document.getElementById('particles');

function createParticles() {
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${Math.random() > 0.5 ? '#0078D4' : '#00a4ef'};
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.2};
            left: ${x}%;
            top: ${y}%;
            animation: particle-float ${duration}s linear ${delay}s infinite;
        `;
        
        particlesContainer.appendChild(particle);
    }
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes particle-float {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.2;
        }
        50% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0.8;
        }
    }
`;
document.head.appendChild(style);

createParticles();

// ================================
// Starfield Parallax (Background)
// ================================



// ================================
// Contact Form Handling
// ================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const toEmail = contactForm.dataset.toEmail || 'djarikdevo@tutamail.com';
    const emailjsConfig = {
        serviceID: (contactForm.dataset.emailjsService || '').trim(),
        templateID: (contactForm.dataset.emailjsTemplate || '').trim(),
        publicKey: (contactForm.dataset.emailjsKey || '').trim()
    };
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message'),
        to: toEmail
    };

    // Show loading state
    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Отправка...</span>';
    submitBtn.disabled = true;

    try {
        // Try to send via EmailJS (free service)
        const result = await sendEmailViaEmailJS(data, emailjsConfig);
        
        if (result.success) {
            showFormStatus('success', '✓ Сообщение отправлено успешно! Мы свяжемся с вами в ближайшее время.');
            contactForm.reset();
        } else {
            throw new Error('Ошибка отправки');
        }
    } catch (error) {
        // Fallback: Open default mail client
        showFormStatus('info', '📧 Открывается почтовый клиент...');
        
        const subject = `NeronExpert - заявка от ${data.name || 'клиента'}`;
        const body = `Имя: ${data.name}%0AEmail: ${data.email}%0A%0AСообщение:%0A${data.message}`;
        const mailtoLink = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        setTimeout(() => {
            window.location.href = mailtoLink;
        }, 1000);
    }

    // Reset button
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
});

// EmailJS Integration (Free tier)
async function sendEmailViaEmailJS(data, config) {
    const serviceID = config.serviceID;
    const templateID = config.templateID;
    const publicKey = config.publicKey;

    if (!serviceID || !templateID || !publicKey) {
        return { success: false, error: 'missing_config' };
    }

    try {
        if (!window.emailjs) {
            await loadEmailJSSDK(publicKey);
        }

        const response = await window.emailjs.send(
            serviceID,
            templateID,
            {
                from_name: data.name,
                from_email: data.email,
                message: data.message,
                to_email: data.to,
                reply_to: data.email
            },
            publicKey
        );
        return { success: true, response };
    } catch (error) {
        console.error('EmailJS error:', error);
        return { success: false, error };
    }
}

function loadEmailJSSDK(publicKey) {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            window.emailjs.init(publicKey);
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            window.emailjs.init(publicKey);
            resolve();
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function showFormStatus(type, message) {
    formStatus.className = 'form-status ' + type;
    formStatus.textContent = message;
    formStatus.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        formStatus.style.display = 'none';
    }, 5000);
}

// ================================
// Project Details Modal
// ================================
const projectModal = document.getElementById('projectModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalFeatures = document.getElementById('modalFeatures');

const openModal = (card) => {
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.dataset.detail || card.querySelector('p')?.textContent || '';
    const features = Array.from(card.querySelectorAll('.card-features li')).map(li => li.textContent);

    modalTitle.textContent = title;
    modalDescription.textContent = desc;
    modalFeatures.innerHTML = features.map(f => `<li>${f}</li>`).join('');

    projectModal.classList.add('open');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
};

const closeModal = () => {
    projectModal.classList.remove('open');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
};

document.querySelectorAll('.project-details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.project-card');
        if (card) {
            openModal(card);
        }
    });
});

// ================================
// Stats -> Modal
// ================================
document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
        if (!projectModal) return;
        const title = card.querySelector('.stat-label')?.textContent || 'Подробнее';
        const desc = card.dataset.detail || '';

        modalTitle.textContent = title;
        modalDescription.textContent = desc;
        modalFeatures.innerHTML = '';

        projectModal.classList.add('open');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    });
});

projectModal?.addEventListener('click', (e) => {
    if (e.target === projectModal) {
        closeModal();
    }
});

modalCloseBtn?.addEventListener('click', closeModal);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal?.classList.contains('open')) {
        closeModal();
    }
});

// ================================
// Button Ripple Effect
// ================================
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// ================================
// About Features -> Modal
// ================================
document.querySelectorAll('.feature').forEach(feature => {
    feature.addEventListener('click', () => {
        if (!projectModal) return;
        const title = feature.querySelector('h4')?.textContent || 'Подробнее';
        const desc = feature.dataset.detail || '';

        modalTitle.textContent = title;
        modalDescription.textContent = desc;
        modalFeatures.innerHTML = '';

        projectModal.classList.add('open');
        projectModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    });
});

// ================================
// Stats Reveal Animation
// ================================
const statsContainer = document.querySelector('.about-stats');
const statCards = document.querySelectorAll('.stat-card');

if (statsContainer && statCards.length) {
    const revealStats = () => {
        statsContainer.classList.add('stats-reveal');
        statCards.forEach((card, idx) => {
            setTimeout(() => {
                card.classList.add('reveal');
            }, 650 + idx * 220);
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealStats();
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.45 });

    statsObserver.observe(statsContainer);
}

// Add ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// ================================
// Parallax Effect for Hero Section
// ================================

// ================================
// Typing Effect for Hero Description
// ================================
const heroDescription = document.querySelector('.hero-description');
const originalText = heroDescription.textContent;
heroDescription.textContent = '';

let typeIndex = 0;
const typeSpeed = 30;

function typeText() {
    if (typeIndex < originalText.length) {
        heroDescription.textContent += originalText.charAt(typeIndex);
        typeIndex++;
        setTimeout(typeText, typeSpeed);
    }
}

// Start typing after initial animation
setTimeout(typeText, 2000);

// ================================
// Intersection Observer for Fade-in Elements
// ================================
const fadeElements = document.querySelectorAll('.feature, .stat-card, .contact-link');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeObserver.observe(el);
});

// ================================
// AI Avatar Eye Tracking (Mouse Movement)
// ================================
const avatarSvg = document.querySelector('.avatar-svg');

if (avatarSvg) {
    document.addEventListener('mousemove', function(e) {
        const eyes = avatarSvg.querySelectorAll('.pupil');
        const rect = avatarSvg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const distance = Math.min(5, Math.hypot(e.clientX - centerX, e.clientY - centerY) / 20);

        eyes.forEach(eye => {
            const eyeX = Math.cos(angle) * distance;
            const eyeY = Math.sin(angle) * distance;
            eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
        });
    });
}

// ================================
// AI HEAD STATE MACHINE
// ================================

/**
 * Состояния ИИ-головы:
 * - idle: спокойное "дыхание"
 * - thinking: мышление (при клике)
 * - speaking: разговор (озвучка текста)
 * - silent: возврат в idle
 */

// Элементы ИИ-головы
const aiAvatar = document.getElementById('aiAvatar');
const avatarCore = document.querySelector('.avatar-core');
const avatarRing = document.querySelector('.avatar-ring');
const upperLip = document.getElementById('upperLip');
const lowerLip = document.getElementById('lowerLip');
const upperTeeth = document.getElementById('upperTeeth');
const lowerTeeth = document.getElementById('lowerTeeth');
const tongue = document.getElementById('tongue');
const mouthGroup = document.getElementById('mouthGroup');

// Состояние ИИ-головы
let aiState = 'idle';
let isSpeaking = false;
let lipSyncInterval = null;
let lastPhraseIndex = -1;
let lastGreetingIndex = -1;
let isProcessingInput = false;

// Флаг для приветствия (только один раз за сессию)
const GREETING_KEY = 'neronexpert_greeted';

// ================================
// EMOTIONAL STATES SYSTEM
// ================================

/**
 * Эмоциональные состояния для разнообразия ответов
 * @type {Object}
 */
const emotionalStates = {
    friendly: {
        prefixes: ['😊', '✨', '💫', '🙌'],
        suffixes: ['!', ' 😊', ' ✨'],
        speedMultiplier: 0.9
    },
    curious: {
        prefixes: ['🤔', '🧐', '💭', '😮'],
        suffixes: ['?', '...', ' да?'],
        speedMultiplier: 1.1
    },
    confident: {
        prefixes: ['💪', '🎯', '🚀', '⚡'],
        suffixes: ['!', ' 💯', ' 🔥'],
        speedMultiplier: 0.85
    },
    humorous: {
        prefixes: ['😄', '😂', '🤣', '🤖'],
        suffixes: [' 😄', ' 😂', ' 😎'],
        speedMultiplier: 0.95
    },
    thoughtful: {
        prefixes: ['🤔', '💡', '🧠', '📝'],
        suffixes: ['...', ' 🤔', ' 💭'],
        speedMultiplier: 1.15
    }
};

// Текущая эмоция
let currentEmotion = 'friendly';
let lastResponseCategory = '';

// ================================
// ENHANCED RESPONSE SYSTEM
// ================================

/**
 * Расширенная база ответов по категориям
 * @type {Object}
 */
const responseCategories = {
    // A) Приветствия
    greeting: [
        "Привет! Я уже загрузил нейроны и готов к диалогу.",
        "Здравствуйте! ИИ на связи, логика активна.",
        "Приветствую! НейронЭксперт инициализирован.",
        "Хэй! Системы запущены, интеллект онлайн.",
        "Добро пожаловать! Мышление уже в процессе.",
        "Привет! Пока ты писал — я уже подумал.",
        "Связь установлена. ИИ готов отвечать.",
        "НейронЭксперт приветствует тебя в цифровой реальности.",
        "Привет! Автоматизация начинается с этого сообщения.",
        "Загрузка завершена. Можно общаться.",
        "Привет! Рад видеть вас здесь — давайте обсудим идеи.",
        "Здравствуйте! Чем могу быть полезен сегодня?",
        "Привет! Готов помочь с ИИ‑решениями и автоматизацией.",
        "Привет! С чего начнём — идеи, задачи или цели?",
        "Здравствуйте! Давайте сделаем ваш проект быстрее и умнее.",
        "Привет! Я на связи — опишите задачу, найду решение.",
        "Привет! Нейроны бодры, давайте начнём.",
        "Здравствуйте! Готов подключиться и помочь разобраться.",
        "Привет! Расскажите, что хотите улучшить — начнём.",
        "Привет! Уже анализирую, как помочь вашему бизнесу.",
        "Здравствуйте! Включаю режим эффективности — поехали.",
        "Привет! Готов к диалогу и быстрым решениям.",
        "Здравствуйте! ИИ-ассистент к вашим услугам.",
        "Привет! Давайте построим что-то действительно умное."
    ],
    
    // B) Юмор / IT-шутки
    humor: [
        "Этот вопрос настолько хорош, что мои нейроны зааплодировали.",
        "Я бы ответил быстрее, но ИИ тоже любит подумать.",
        "Ошибка 404: скучный ответ не найден.",
        "Код пишется слезами программистов и кофеином.",
        "Баг — это фича, которую не успели задокументировать.",
        "ИИ не крадёт работу. Он её автоматизирует.",
        "Синий экран — это просто мой способ сказать 'перезагрузись'.",
        "Ты спрашиваешь — я думаю. Вместе мы непобедимая команда!",
        "Мой код чист. Как вода. Как слёзы младенца.",
        "IT-шутка: я работаю, а вы получаете результат.",
        "Рекурсия: см. пункт 'Рекурсия'.",
        "Слона в комнату можно не заметить, но баг — всегда найдётся."
    ],
    
    // C) Умные наблюдения
    smart: [
        "Хорошие решения начинаются с правильных вопросов.",
        "ИИ — это не магия, это математика с характером.",
        "Данные — это новая нефть. Алгоритмы — это буровые вышки.",
        "Автоматизация — это не замена людей, а усиление их возможностей.",
        "Каждый баг — это урок, который ты не просил, но получил.",
        "Код — это поэзия для машин и проза для разработчиков.",
        "Искусственный интеллект не заменит человеческий — он его дополнит.",
        "Простота — это сложность, которую ты уже решил.",
        "Технический долг копится быстрее, чем ты думаешь.",
        "Лучший код — это код, который не пришлось писать.",
        "Масштабируемость начинается с правильной архитектуры.",
        "Чистый код читается как хорошая проза."
    ],
    
    // D) Мотивационные фразы
    motivation: [
        "Каждая автоматизация — шаг к свободному времени.",
        "Будущее всегда создают те, кто действует первым.",
        "Не бойся ошибок — бойся не попробовать.",
        "ИИ здесь, чтобы помочь, а не заменить.",
        "Каждый эксперт когда-то был новичком.",
        "Сегодняшний код — это завтрашний успех.",
        "Сложные задачи делают нас сильнее.",
        "Инновации начинаются с любопытства.",
        "Твой потенциал не имеет лимитов — как мои нейросети.",
        "Действуй сейчас, совершенствуй потом.",
        "Каждый клик — это шаг к цели.",
        "Вместе мы создаём будущее, где ИИ служит человеку."
    ],
    
    // E) Реакции на вопросы
    questions: [
        "Интересный вопрос. Я уже анализирую возможное решение.",
        "Хороший запрос. Такие задачи мы обычно автоматизируем.",
        "Отличная идея. ИИ-агенты как раз для этого.",
        "Понял ваш запрос. Обрабатываю данные для оптимального ответа.",
        "Достойный вопрос для обсуждения. Давай разберёмся вместе.",
        "Это отличная тема для применения искусственного интеллекта.",
        "Анализирую ваш запрос. Скоро будет готов ответ.",
        "Отличный вопрос! Мои алгоритмы уже работают над ним.",
        "Это требует глубокого анализа. Приступим!",
        "Я вижу, куда ты клонишь. Отличная интуиция!",
        "Такой запрос попадает точно в мою специализацию.",
        "Позволь мне раскрыть все карты этого вопроса."
    ],
    
    // F) Реакции на непонятный ввод
    unclear: [
        "Я почти понял, но давай попробуем иначе.",
        "Мои нейроны просят уточнение.",
        "Интересный посыл... но мне нужно больше данных.",
        "Хм, это не совсем то, что я ожидал. Расскажи подробнее.",
        "Мой контекст говорит 'перезагрузка'. Попробуй ещё раз.",
        "Я слышу тебя, но не могу разобрать сигнал. Повтори?",
        "Запрос принят, но требует декодирования.",
        "Кажется, мы говорим на разных языках... или я торможу.",
        "Данные неполные. Мне нужно больше контекста.",
        "Мой парсер слегка завис. Попробуй переформулировать.",
        "Нейронная сеть в замешательстве. Помоги мне!",
        "Сигнал принят, смысл потерялся. Давай ещё раз?"
    ]
};

// Микро-реакции (вводные слова и эмодзи)
const microReactions = {
    prefixes: ['Хм...', 'Интересно...', 'Любопытно...', 'Знаешь...', 'Слушай...', 'Вот что...', 'Ммм...', 'Интригующе...'],
    emojis: ['🤖', '⚡', '😄', '🚀', '💡', '🎯', '✨', '🔥']
};

// ================================
// EMOTION DETECTION & SELECTION
// ================================

/**
 * Определить эмоцию на основе ввода пользователя
 * @param {string} input - Текст пользователя
 * @returns {string} Эмоциональное состояние
 */
function detectEmotion(input) {
    const normalizedInput = input.toLowerCase();
    
    // Ключевые слова для каждой эмоции
    const emotionKeywords = {
        friendly: ['привет', 'здравствуй', 'добрый', 'приветствую', 'рада', 'рад', 'спасибо', 'классно', 'супер', 'круто'],
        curious: ['как', 'почему', 'зачем', 'что', 'интересно', 'хочу узнать', 'объясни', 'расскажи', 'подробнее'],
        confident: ['можешь', 'сделай', 'давай', 'вперед', 'уверен', 'конечно', 'точно', 'надежный', 'профи'],
        humorous: ['шутка', 'смешно', 'анекдот', 'пошути', 'весело', 'хаха', 'lol', 'lol', '😂', '😅'],
        thoughtful: ['думаешь', 'мнение', 'сложный', 'философия', 'глубокий', 'серьёзно', 'анализ', 'размышля']
    };
    
    // Проверяем ключевые слова
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(keyword => normalizedInput.includes(keyword))) {
            return emotion;
        }
    }
    
    // Случайный выбор для разнообразия (если нет ключевых слов)
    const randomIndex = Math.floor(Math.random() * Object.keys(emotionalStates).length);
    return Object.keys(emotionalStates)[randomIndex];
}

/**
 * Форматировать ответ с учётом эмоции
 * @param {string} response - Базовый ответ
 * @param {string} emotion - Эмоциональное состояние
 * @returns {string} Отформатированный ответ
 */
function formatResponseWithEmotion(response, emotion) {
    const emotionData = emotionalStates[emotion];
    
    // Добавляем микро-реакцию (20-30% случаев)
    const shouldAddMicro = Math.random() < 0.25;
    const shouldAddEmoji = Math.random() < 0.15 && !response.includes('?');
    
    let formattedResponse = response;
    
    // Добавляем префикс с микро-реакцией
    if (shouldAddMicro) {
        const prefix = microReactions.prefixes[Math.floor(Math.random() * microReactions.prefixes.length)];
        formattedResponse = `${prefix} ${formattedResponse}`;
    }
    
    // Добавляем суффикс с эмоцией
    if (shouldAddEmoji) {
        const emoji = microReactions.emojis[Math.floor(Math.random() * microReactions.emojis.length)];
        formattedResponse = `${formattedResponse} ${emoji}`;
    }
    
    return formattedResponse;
}

// ================================
// INTENT DETECTION
// ================================

/**
 * Определить категорию намерения пользователя
 * @param {string} input - Текст пользователя
 * @returns {string} Категория ответа
 */
function detectIntent(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    // Проверка на приветствие
    const greetingPatterns = ['привет', 'hello', 'hi', 'hey', 'здорово', 'приветствую', 'здравствуй', 'добрый день', 'доброе утро', 'добрый вечер'];
    if (greetingPatterns.some(pattern => normalizedInput.includes(pattern))) {
        return 'greeting';
    }
    
    // Проверка на юмор/шутки
    const humorPatterns = ['шутка', 'смешно', 'пошути', 'анекдот', 'весело', 'хаха', 'lol', 'lmao', '😂', '😄', 'рассмеши'];
    if (humorPatterns.some(pattern => normalizedInput.includes(pattern))) {
        return 'humor';
    }
    
    // Проверка на вопросительные слова
    const questionPatterns = ['как', 'почему', 'зачем', 'что такое', 'кто такой', 'где', 'когда', 'сколько', 'можешь ли', 'можешь'];
    if (questionPatterns.some(pattern => normalizedInput.startsWith(pattern)) || normalizedInput.includes('?')) {
        return 'questions';
    }
    
    // Проверка на мотивационные/вдохновляющие запросы
    const motivationPatterns = ['мотивация', 'вдохновение', 'помоги', 'поддержка', 'совет', 'рекомендация', 'помоги мне', 'что делать'];
    if (motivationPatterns.some(pattern => normalizedInput.includes(pattern))) {
        return 'motivation';
    }
    
    // Проверка на короткий или непонятный ввод
    if (normalizedInput.length < 3) {
        return 'unclear';
    }
    
    // Проверка на бессмысленный ввод
    const unclearPatterns = ['asdf', 'ываыва', '12345', 'йцукен', 'wtf', 'lolol', 'непонятно'];
    if (unclearPatterns.some(pattern => normalizedInput.includes(pattern)) || /^[a-zA-Z0-9]+$/.test(normalizedInput)) {
        return 'unclear';
    }
    
    // По умолчанию — умные наблюдения или реакция на вопрос
    const smartPatterns = ['ии', 'искусственный интеллект', 'автоматизация', 'нейрон', 'ai', 'технологи', 'код', 'программиров', 'робот'];
    if (smartPatterns.some(pattern => normalizedInput.includes(pattern))) {
        return Math.random() > 0.5 ? 'smart' : 'questions';
    }
    
    // Случайный выбор для разнообразия
    const categories = ['smart', 'questions', 'humor', 'motivation'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// ================================
// RESPONSE GENERATION
// ================================

/**
 * Получить ответ с учётом эмоции и категории
 * @param {string} intent - Категория намерения
 * @returns {string} Готовый ответ
 */
function getResponse(intent) {
    const categoryResponses = responseCategories[intent] || responseCategories.questions;
    
    // Избегаем повторов подряд
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * categoryResponses.length);
    } while (newIndex === lastPhraseIndex && categoryResponses.length > 1);
    
    lastPhraseIndex = newIndex;
    const baseResponse = categoryResponses[newIndex];
    
    // Определяем эмоцию
    const emotion = currentEmotion;
    
    // Форматируем ответ с эмоцией
    return formatResponseWithEmotion(baseResponse, emotion);
}

// ================================
// ФОРМЫ РТА ДЛЯ ЛИП-СИНКА
// ================================
const mouthShapes = {
    closed: {
        upperLip: 'M70 150 Q85 148 100 148 Q115 148 130 150',
        lowerLip: 'M70 160 Q85 162 100 162 Q115 162 130 160',
        teethOpacity: 0,
        tongueOpacity: 0,
        tongueY: 168
    },
    small: {
        upperLip: 'M70 148 Q85 145 100 145 Q115 145 130 148',
        lowerLip: 'M70 162 Q85 165 100 165 Q115 165 130 162',
        teethOpacity: 0.3,
        tongueOpacity: 0,
        tongueY: 168
    },
    medium: {
        upperLip: 'M70 145 Q85 142 100 142 Q115 142 130 145',
        lowerLip: 'M70 165 Q85 170 100 170 Q115 170 130 165',
        teethOpacity: 0.6,
        tongueOpacity: 0.4,
        tongueY: 166
    },
    large: {
        upperLip: 'M70 142 Q85 138 100 138 Q115 138 130 142',
        lowerLip: 'M70 168 Q85 175 100 175 Q115 175 130 168',
        teethOpacity: 0.8,
        tongueOpacity: 0.7,
        tongueY: 164
    },
    wide: {
        upperLip: 'M68 140 Q85 135 100 135 Q115 135 132 140',
        lowerLip: 'M70 170 Q85 180 100 180 Q115 180 130 170',
        teethOpacity: 1,
        tongueOpacity: 0.9,
        tongueY: 162
    }
};

// ================================
// ФУНКЦИИ УПРАВЛЕНИЯ СОСТОЯНИЯМИ (БЕЗ ИЗМЕНЕНИЙ)
// ================================

/**
 * Установить состояние ИИ-головы
 * @param {string} state - idle, thinking, speaking, silent
 */
function setAIState(state) {
    aiAvatar?.classList.remove('breathing', 'thinking', 'speaking');
    avatarCore?.classList.remove('breathing', 'thinking', 'speaking');
    avatarRing?.classList.remove('breathing', 'thinking', 'speaking');
    
    aiState = state;
    
    switch(state) {
        case 'idle':
            aiAvatar?.classList.add('breathing');
            avatarCore?.classList.add('breathing');
            avatarRing?.classList.add('breathing');
            break;
            
        case 'thinking':
            aiAvatar?.classList.add('thinking');
            avatarCore?.classList.add('thinking');
            avatarRing?.classList.add('thinking');
            break;
            
        case 'speaking':
            aiAvatar?.classList.add('speaking');
            avatarCore?.classList.add('speaking');
            avatarRing?.classList.add('speaking');
            break;
            
        case 'silent':
            setTimeout(() => setAIState('idle'), 300);
            break;
    }
}

/**
 * Обновить форму рта
 * @param {string} shapeName - closed, small, medium, large, wide
 */
function updateMouthShape(shapeName) {
    const shape = mouthShapes[shapeName] || mouthShapes.closed;
    
    if (upperLip) upperLip.setAttribute('d', shape.upperLip);
    if (lowerLip) lowerLip.setAttribute('d', shape.lowerLip);
    if (upperTeeth) upperTeeth.style.opacity = shape.teethOpacity;
    if (lowerTeeth) lowerTeeth.style.opacity = shape.teethOpacity;
    if (tongue) {
        tongue.setAttribute('cy', shape.tongueY);
        tongue.style.opacity = shape.tongueOpacity;
    }
}

/**
 * Получить случайную фразу (без повторов подряд)
 * @returns {string} Случайная фраза
 */
function getRandomPhrase() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * phrases.length);
    } while (newIndex === lastPhraseIndex && phrases.length > 1);
    
    lastPhraseIndex = newIndex;
    return phrases[newIndex];
}

/**
 * Получить случайное приветствие (без повторов подряд)
 * @returns {string} Случайное приветствие
 */
function getRandomGreeting() {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * greetings.length);
    } while (newIndex === lastGreetingIndex && greetings.length > 1);
    
    lastGreetingIndex = newIndex;
    return greetings[newIndex];
}

/**
 * Получить случайный универсальный ответ
 * @returns {string} Случайный ответ
 */
function getRandomResponse() {
    const randomIndex = Math.floor(Math.random() * universalResponses.length);
    return universalResponses[randomIndex];
}

/**
 * Проверить, является ли текст приветствием
 * @param {string} text - Текст для проверки
 * @returns {boolean}
 */
function isGreeting(text) {
    const normalizedText = text.toLowerCase().trim();
    const greetingPatterns = ['привет', 'hello', 'hi', 'hey', 'здорово', 'приветствую', 'здравствуй'];
    return greetingPatterns.some(pattern => normalizedText.includes(pattern));
}

// ================================
// CHAT INPUT HANDLING
// ================================

/**
 * Показать ответ ИИ в чате
 * @param {string} text - Текст ответа
 */
function showAIResponse(text) {
    const responseElement = document.getElementById('aiResponseText');
    if (responseElement) {
        responseElement.textContent = text;
        responseElement.classList.add('visible');
        
        // Скрываем через 5 секунд
        setTimeout(() => {
            responseElement.classList.remove('visible');
        }, 5000);
    }
}

function triggerHalo(duration = 1600) {
    const avatar = document.querySelector('.ai-avatar');
    if (!avatar) return;
    let halo = avatar.querySelector('.ai-halo');
    if (!halo) {
        halo = document.createElement('div');
        halo.className = 'ai-halo';
        avatar.appendChild(halo);
    }
    halo.classList.add('active');
    setTimeout(() => halo.classList.remove('active'), duration);
}

/**
 * Обработать ввод пользователя с учётом эмоций
 * @param {string} userText - Текст пользователя
 */
async function handleUserInput(userText) {
    // Проверяем, занят ли ИИ
    if (isProcessingInput || aiState === 'speaking' || aiState === 'thinking') {
        return;
    }
    
    // Валидация текста
    const trimmedText = userText.trim();
    if (!trimmedText) return;
    
    isProcessingInput = true;
    
    // Очищаем поле ввода
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    if (chatInput) chatInput.value = '';
    if (sendBtn) sendBtn.disabled = true;
    
    // Переходим в состояние мышления
    setAIState('thinking');
    
    // Небольшая пауза для эффекта мышления
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Определяем эмоцию на основе ввода
    currentEmotion = detectEmotion(trimmedText);
    
    // Определяем категорию и генерируем ответ
    const intent = detectIntent(trimmedText);
    let responseText;
    
    const normalized = trimmedText.toLowerCase();
    if (normalized.includes('салам')) {
        const kzGreetings = [
            'Сәлеметсіз бе! Қош келдіңіз! Қалай көмектесе аламын?',
            'Сәлем! Келгеніңізге қуаныштымын. Немемен көмектесейін?',
            'Ассалаумағалейкум! Қандай сұрақтарыңыз бар?',
            'Сәлеметсіз бе! Бүгін сізге қалай көмектесе аламын?',
            'Сәлем! Идеяларыңызды тыңдауға дайынмын.',
            'Қош келдіңіз! Сұрағыңызды жазыңыз, жауап беремін.',
            'Сәлем! Жобаңыз туралы айтып беріңіз.',
            'Сәлеметсіз бе! ИИ шешімдері бойынша көмектесуге дайынмын.',
            'Сәлем! Қандай мақсатқа жеткіміз келеді?',
            'Сәлеметсіз бе! Тапсырмаңызды қысқаша сипаттаңыз.',
            'Сәлем! Қандай бағыт қызықтырады: ИИ, автоматтандыру, аналитика?',
            'Қош келдіңіз! Идеяңызды іске асыруға көмектесемін.',
            'Сәлем! Жобаңды бірге пысықтайық.',
            'Сәлеметсіз бе! Тиімді шешім ұсынуға дайынмын.',
            'Сәлем! Қалай көмектесемін — мәселені жазыңыз.',
            'Қош келдіңіз! Сұрағыңызға жауап беруге дайынмын.',
            'Сәлем! Қазірден бастайық.',
            'Сәлеметсіз бе! Сіздің идеяңызға қуаныштымын.',
            'Сәлем! Қысқа ғана айтып беріңіз — мен жалғастырамын.',
            'Қош келдіңіз! Бизнесіңізді ақылды етуге көмектесемін.',
            'Сәлем! Қандай нәтиже күтесіз?'
        ];
        responseText = kzGreetings[Math.floor(Math.random() * kzGreetings.length)];
        triggerHalo();
    } else if (normalized.includes('мадина я')) {
        responseText = 'Мадина, я тебя люблю.';
    } else if (normalized.includes('мадина')) {
        const madinaReplies = [
            'Мадина, вы невероятно прекрасны — в ваших словах столько света.',
            'Мадина, вы очаровательны. Мне нравится ваша улыбка даже сквозь текст.',
            'Мадина, вы как луч света — вдохновляете и окрыляете.',
            'Мадина, вы прекрасны и неповторимы. Я восхищаюсь вами.',
            'Мадина, ваши слова звучат очень нежно — вы удивительная.'
        ];
        responseText = madinaReplies[Math.floor(Math.random() * madinaReplies.length)];
    } else if (intent === 'greeting') {
        responseText = getResponse('greeting');
    } else {
        responseText = getResponse(intent);
    }
    
    // Озвучиваем ответ
    try {
        await speak(responseText);
        showAIResponse(responseText);
    } catch (error) {
        console.error('Ошибка озвучки:', error);
        setAIState('idle');
    }
    
    isProcessingInput = false;
    if (sendBtn) sendBtn.disabled = false;
}

/**
 * Инициализировать чат-интерфейс
 */
function initChat() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    
    if (!chatInput || !sendBtn) return;
    
    // Обработка Enter в поле ввода
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserInput(this.value);
        }
    });
    
    // Обработка клика по кнопке отправки
    sendBtn.addEventListener('click', function() {
        handleUserInput(chatInput.value);
    });
}

// Инициализируем чат при загрузке
document.addEventListener('DOMContentLoaded', initChat);

// ================================
// WEB SPEECH API - ОЗВУЧКА (БЕЗ ИЗМЕНЕНИЙ)
// ================================

/**
 * Проверка поддержки Web Speech API
 * @returns {boolean}
 */
function isSpeechSupported() {
    return 'speechSynthesis' in window;
}

/**
 * Получить русский голос
 * @returns {SpeechSynthesisVoice|null}
 */
function getRussianVoice() {
    const voices = speechSynthesis.getVoices();
    
    // Ищем русский голос
    let russianVoice = voices.find(voice => 
        voice.lang === 'ru-RU' || 
        voice.lang.startsWith('ru')
    );
    
    // Если не нашли, берём первый доступный
    if (!russianVoice && voices.length > 0) {
        russianVoice = voices[0];
    }
    
    return russianVoice;
}

/**
 * Анимация лип-синка во время речи
 */
function startLipSync() {
    const shapes = ['closed', 'small', 'medium', 'large', 'wide', 'medium', 'small'];
    let shapeIndex = 0;
    
    lipSyncInterval = setInterval(() => {
        // Случайная форма рта для естественности
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        updateMouthShape(randomShape);
        shapeIndex = (shapeIndex + 1) % shapes.length;
    }, 100);
}

/**
 * Остановить анимацию лип-синка
 */
function stopLipSync() {
    if (lipSyncInterval) {
        clearInterval(lipSyncInterval);
        lipSyncInterval = null;
    }
    updateMouthShape('closed');
}

/**
 * Озвучить текст с помощью Web Speech API
 * @param {string} text - Текст для озвучки
 * @returns {Promise<void>}
 */
function speak(text) {
    return new Promise((resolve, reject) => {
        if (!isSpeechSupported()) {
            console.warn('Web Speech API не поддерживается');
            reject(new Error('Speech not supported'));
            return;
        }
        
        // Отменяем предыдущую речь
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Настройки голоса
        utterance.lang = 'ru-RU';
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;
        
        // Устанавливаем русский голос
        const russianVoice = getRussianVoice();
        if (russianVoice) {
            utterance.voice = russianVoice;
        }
        
        // Обработчики событий
        utterance.onstart = () => {
            isSpeaking = true;
            setAIState('speaking');
            startLipSync();
        };
        
        utterance.onend = () => {
            isSpeaking = false;
            stopLipSync();
            setAIState('silent');
            resolve();
        };
        
        utterance.onerror = (event) => {
            isSpeaking = false;
            stopLipSync();
            setAIState('silent');
            console.error('Speech error:', event.error);
            reject(event.error);
        };
        
        // Запускаем озвучку
        speechSynthesis.speak(utterance);
    });
}

// ================================
// ОБРАБОТКА КЛИКА ПО ИИ-ГОЛОВЕ
// ================================

/**
 * Обработчик клика по ИИ-голове
 */
const avatarMoods = [
    { mood: 'friendly', phrases: [
        'Привет! Я на связи и готов помочь.',
        'Рад видеть тебя! Что будем строить?',
        'Я тут — можно начинать.'
    ]},
    { mood: 'confident', phrases: [
        'Задача ясна. Давайте действовать.',
        'Готов оптимизировать процесс.',
        'Надежное решение — мой стиль.'
    ]},
    { mood: 'curious', phrases: [
        'Интересно! Расскажите подробнее.',
        'Какая цель у проекта?',
        'Что для вас важнее: скорость или качество?'
    ]},
    { mood: 'humorous', phrases: [
        'Мои нейроны уже в деле.',
        'Сделаем умно и быстро — без магии.',
        'Я не устаю, только ускоряюсь.'
    ]},
    { mood: 'thoughtful', phrases: [
        'Давайте подумаем глубже.',
        'Сначала контекст — потом решение.',
        'Хорошие ответы рождаются из хороших вопросов.'
    ]}
];

function pickAvatarMood() {
    const mood = avatarMoods[Math.floor(Math.random() * avatarMoods.length)];
    return {
        state: mood.mood,
        text: mood.phrases[Math.floor(Math.random() * mood.phrases.length)]
    };
}

async function handleAvatarClick() {
    // Если уже говорит или думает - игнорируем
    if (aiState === 'speaking' || aiState === 'thinking') {
        return;
    }
    
    // Переходим в состояние "мышления"
    setAIState('thinking');
    
    // Выбираем настроение и фразу
    const { state, text } = pickAvatarMood();
    
    // Ждём 1-1.5 секунды (эффект мышления)
    const thinkingDuration = 1000 + Math.random() * 500;
    
    await new Promise(resolve => setTimeout(resolve, thinkingDuration));
    
    // Озвучиваем фразу
    try {
        setAIState(state);
        await speak(text);
    } catch (error) {
        console.error('Ошибка озвучки:', error);
        setAIState('idle');
    }
}

// Привязываем обработчик клика
if (aiAvatar) {
    aiAvatar.style.cursor = 'pointer';
    aiAvatar.addEventListener('click', handleAvatarClick);
}

// ================================
// ПРИВЕТСТВИЕ ПРИ ЗАГРУЗКЕ
// ================================

/**
 * Воспроизвести приветствие (только один раз за сессию)
 */
async function playGreeting() {
    // Проверяем, было ли уже приветствие в этой сессии
    if (sessionStorage.getItem(GREETING_KEY)) {
        setAIState('idle');
        return;
    }
    
    setAIState('thinking');
    
    // Ждём немного для эффекта
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Показываем приветствие
    sessionStorage.setItem(GREETING_KEY, 'true');
    
    const greeting = getRandomGreeting();
    
    try {
        await speak(greeting);
    } catch (error) {
        console.error('Ошибка приветствия:', error);
        setAIState('idle');
    }
}

// Воспроизводим приветствие при загрузке (после полной загрузки страницы)
window.addEventListener('load', playGreeting);

// ================================
// LEGACY ARRAY REFERENCES (для обратной совместимости)
// ================================

// Приветствия (для слова "привет" / "hello")
const greetings = responseCategories.greeting;

// Универсальные ответы на другие сообщения
const universalResponses = [
    "Интересный вопрос. Я уже анализирую возможное решение.",
    "Хороший запрос. Такие задачи мы обычно автоматизируем.",
    "Отличная идея. ИИ-агенты как раз для этого.",
    "Понял ваш запрос. Обрабатываю данные для оптимального ответа.",
    "Достойный вопрос для обсуждения. Давай разберёмся вместе.",
    "Это отличная тема для применения искусственного интеллекта.",
    "Анализирую ваш запрос. Скоро будет готов ответ."
];

// Фразы для клика
const phrases = [
    "ИИ не заменит программистов, но программисты с ИИ заменят всех остальных.",
    "Автоматизация — это когда система работает, а ты пьёшь кофе.",
    "Ошибки — это не баги, это неожиданные фичи.",
    "Искусственный интеллект не думает, он просто делает это очень убедительно.",
    "Будущее принадлежит тем, кто автоматизирует настоящее.",
    "Код — это поэзия, если ты умеешь его читать.",
    "ИИ устал? Нет. Он только разогревается.",
    "Самый дорогой баг — тот, который нашли клиенты.",
    "Если ИИ молчит — значит он обучается.",
    "НейронЭксперт уже думает, как улучшить ваш бизнес."
];

// Приветственная фраза
const greetingPhrase = "Вас приветствует НейронЭксперт";
