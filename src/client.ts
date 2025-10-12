interface StarOptions {
    count?: number;
    sizeMin?: number;
    sizeMax?: number;
    durationMin?: number;
    durationMax?: number;
    delayMax?: number;
}
const generateStars = (options: StarOptions = {}) => {
    const {
        count = 60,
        sizeMin = 0.5,
        sizeMax = 2.5,
        durationMin = 2,
        durationMax = 5,
        delayMax = 3
    } = options;

    const stars = [];
    // these colors are css classes!
    const colors = ['star-warm', 'star-cool', 'star-white', 'star-amber', 'star-ice'];

    for (let i = 0; i < count; i++) {
        const size = Math.random() * (sizeMax - sizeMin) + sizeMin;
        const x = Math.random() * 100; // 0% to 100%
        const y = Math.random() * 100; // 0% to 100%
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * (durationMax - durationMin) + durationMin;
        const delay = Math.random() * delayMax;
        
        const star = document.createElement('div');
        star.className = `star ${color}`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${delay}s`;
        stars.push(star);
    }

    return stars;
};


const generateStars_old = () => {
    const stars = [];

    const colors = ['star-warm', 'star-cool', 'star-white', 'star-amber', 'star-ice'];

    for (let i = 0; i < 60; i++) {
        const size = Math.random() * 2 + 0.5; // 0.5px to 2.5px
        const x = Math.random() * 100; // 0% to 100%
        const y = Math.random() * 100; // 0% to 100%
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 3 + 2; // 2s to 5s
        const delay = Math.random() * 3; // 0s to 3s delay
        
        const star = document.createElement('div');
        star.className = `star ${color}`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.setProperty('--duration', `${duration}s`);
        star.style.animationDelay = `${delay}s`;
        stars.push(star);
    }

    return stars;
};

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
    // old code was here
}

// insert stars into the starfield div 
document.addEventListener('DOMContentLoaded', () => {
    const starfield = document.getElementById('starfield');
    if (starfield) {
        const stars = generateStars();
        stars.forEach(star => starfield.appendChild(star));
    }
    // Stars on the bottom
    const bottomStarfield = document.getElementById('bottom-starfield');
    if (bottomStarfield) {
        const bottomStars = generateStars({
            count: 30,
            sizeMin: 0.3,
            sizeMax: 1.8,
            durationMin: 3,
            durationMax: 7,
            delayMax: 5
        });
        bottomStars.forEach(star => bottomStarfield.appendChild(star));
    }
    // Trigger fade-in animations
    setTimeout(() => {
        const content = document.querySelector('.content');
        if (content) {
            content.classList.add('animate');
        }
    }, 100);
    
    setTimeout(() => {
        const storySection = document.querySelector('.fade-in-delayed');
        if (storySection) {
            storySection.classList.add('animate');
        }
    }, 800);

    setTimeout(() => {
        const gratitudeSection = document.querySelectorAll('.gratitude-fade-in');
        if (gratitudeSection) {
            gratitudeSection.forEach(section => {
                section.classList.add('animate');
            });
        }
    }, 1200);
});