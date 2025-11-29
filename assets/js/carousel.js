document.addEventListener('DOMContentLoaded', function() {
  const trackDesktop = document.querySelector('.carousel-track-desktop');
  const trackMobile = document.querySelector('.carousel-track-mobile');
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  const indicatorsDesktop = document.querySelectorAll('.carousel-indicator-desktop');
  const indicatorsMobile = document.querySelectorAll('.carousel-indicator-mobile');
  const slidesDesktop = document.querySelectorAll('.carousel-slide-desktop');
  const slidesMobile = document.querySelectorAll('.carousel-slide-mobile');
  const container = document.querySelector('.carousel-container');

  let currentIndexDesktop = 0;
  let currentIndexMobile = 0;
  const totalSlidesDesktop = slidesDesktop.length;
  const totalSlidesMobile = slidesMobile.length;

  function isMobile() {
    return window.innerWidth < 768;
  }

  function updateCarousel() {
    if (isMobile()) {
      if (trackMobile) {
        trackMobile.style.transform = `translateX(-${currentIndexMobile * 100}%)`;
      }
      indicatorsMobile.forEach((indicator, index) => {
        if (index === currentIndexMobile) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    } else {
      if (trackDesktop) {
        trackDesktop.style.transform = `translateX(-${currentIndexDesktop * 100}%)`;
      }
      indicatorsDesktop.forEach((indicator, index) => {
        if (index === currentIndexDesktop) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
  }

  if (prevButton) {
    prevButton.addEventListener('click', function() {
      if (isMobile()) {
        currentIndexMobile = (currentIndexMobile - 1 + totalSlidesMobile) % totalSlidesMobile;
      } else {
        currentIndexDesktop = (currentIndexDesktop - 1 + totalSlidesDesktop) % totalSlidesDesktop;
      }
      updateCarousel();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function() {
      if (isMobile()) {
        currentIndexMobile = (currentIndexMobile + 1) % totalSlidesMobile;
      } else {
        currentIndexDesktop = (currentIndexDesktop + 1) % totalSlidesDesktop;
      }
      updateCarousel();
    });
  }

  indicatorsDesktop.forEach((indicator, index) => {
    indicator.addEventListener('click', function() {
      currentIndexDesktop = index;
      updateCarousel();
    });
  });

  indicatorsMobile.forEach((indicator, index) => {
    indicator.addEventListener('click', function() {
      currentIndexMobile = index;
      updateCarousel();
    });
  });

  // Touch/swipe mobile functionality
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  container.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only trigger swipe if x movement > y
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (isMobile()) {
        if (deltaX < 0) {
          currentIndexMobile = (currentIndexMobile + 1) % totalSlidesMobile;
        } else {
          currentIndexMobile = (currentIndexMobile - 1 + totalSlidesMobile) % totalSlidesMobile;
        }
      } else {
        if (deltaX < 0) {
          currentIndexDesktop = (currentIndexDesktop + 1) % totalSlidesDesktop;
        } else {
          currentIndexDesktop = (currentIndexDesktop - 1 + totalSlidesDesktop) % totalSlidesDesktop;
        }
      }
      updateCarousel();
    }
  }, { passive: true });

  // Handle window resize
  window.addEventListener('resize', function() {
    updateCarousel();
  });

  // Init
  updateCarousel();
});
