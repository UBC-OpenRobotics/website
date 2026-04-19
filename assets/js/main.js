let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // Check for reduced motion preference
    if (document.documentElement.classList.contains('reduce-motion')) {
        return;
    }

    const scrollY = window.scrollY;
    const scrollDelta = scrollY - lastScrollY;

    // Get all gear elements
    const gears = document.querySelectorAll('.gear');
    
    gears.forEach((gear, index) => {
        // Get current rotation or start at 0
        const currentRotation = gear.dataset.rotation || 0;
        
        // Calculate new rotation based on scroll direction and amount
        // Different gears rotate at different speeds and directions
        let rotationSpeed = (index % 2 === 0) ? 0.5 : -0.3; // Alternate directions
        let rotationSpeedMultiplier = (index === 1) ? 1.5 : (index === 2) ? 0.2 : 1.0;
        const newRotation = parseFloat(currentRotation) + (scrollDelta * rotationSpeed * rotationSpeedMultiplier);
        
        // Apply rotation
        gear.style.transform = `rotate(${newRotation}deg)`;
        gear.dataset.rotation = newRotation;
    });
    
    lastScrollY = scrollY;
});

// Add some automatic slow rotation on page load
window.addEventListener('load', () => {
    const gears = document.querySelectorAll('.gear');

    gears.forEach((gear, index) => {
        // Initialize rotation data
        gear.dataset.rotation = 0;

        // Add a subtle continuous rotation
        setInterval(() => {
            // Check for reduced motion preference
            if (document.documentElement.classList.contains('reduce-motion')) {
                return;
            }

            if (Math.abs(window.scrollY - lastScrollY) < 1) { // Only when not scrolling
                let rotationSpeedMultiplier = (index === 1) ? 1.5 : (index === 2) ? 0.5 : 1;
                const currentRotation = parseFloat(gear.dataset.rotation) || 0;
                const newRotation = currentRotation + (index % 2 === 0 ? 3 : -3) * rotationSpeedMultiplier;
                gear.style.transform = `rotate(${newRotation}deg)`;
                gear.dataset.rotation = newRotation;
            }
        }, 100);
    });
});

const gear = document.querySelector('.spinning-gear');
let isHovered = false;

// gear.addEventListener('mouseenter', () => {
//     if (!isHovered) {
//         gear.style.animationDuration = '16s';
//         isHovered = true;
//     }
// });

// gear.addEventListener('mouseleave', () => {
//     if (isHovered) {
//         gear.style.animationDuration = '16s';
//         isHovered = false;
//     }
// });

gear.addEventListener('mouseenter', () => {
    gear.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))';
});

gear.addEventListener('mouseleave', () => {
    gear.style.filter = 'none';
});