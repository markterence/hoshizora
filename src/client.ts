const generateStars = () => {
    const stars = [];
    // these colors are css classes!
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
    app.innerHTML = `
        <div class="hoshizora-container"> 
        <div id="starfield" class="star-field">
        </div>
        <div class="content">
            <h1 class="title">星空</h1>
            <p class="subtitle">hoshizora</p> 
        </div>
        </div>
    `;
}

// insert stars into the starfield div 
document.addEventListener('DOMContentLoaded', () => {
    const starfield = document.getElementById('starfield');
    if (starfield) {
        const stars = generateStars();
        stars.forEach(star => starfield.appendChild(star));
    }
});