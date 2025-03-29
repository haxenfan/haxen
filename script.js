document.addEventListener("DOMContentLoaded", () => {
  // 載入 nav
  fetch("/nav.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("nav-container").innerHTML = html;
      const toggle = document.getElementById("nav-toggle");
      const navLinks = document.querySelector(".nav-links");
      if (toggle && navLinks) {
        toggle.addEventListener("click", () => {
          navLinks.classList.toggle("active");
        });
      }
    });



    window.addEventListener("hashchange", () => {
      const id = location.hash.replace("#", "");
      showWork(id);
    });
    
  // 預設作品開啟
  const defaultTag = window.location.hash.replace('#', '') || 'withinyetbeyond';
  showWork(defaultTag);
    // hash 變化時也要載入
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#', '');
    showWork(hash);
  });
  // 淡入動畫
  document.querySelectorAll(".pre_work").forEach((el, i) => {
    el.style.setProperty("--delay", `${i * 0.15}s`);
  });

  // 輪播與全螢幕邏輯
  document.querySelectorAll(".work").forEach(work => {
    const slides = work.querySelectorAll(".carousel-slide img");
    const thumbnails = work.querySelectorAll(".thumbnail");
    const container = work.querySelector(".carousel-container");

    if (!slides.length || !thumbnails.length) return;

    let currentIndex = 0;
    let interval;
    const fullscreen = document.querySelector(".fullscreen-viewer");
    const fsSlide = document.querySelector(".fullscreen-slide");
    const fsThumbs = document.querySelector(".fullscreen-thumbnails");
    const closeBtn = document.querySelector(".close-btn");

    function updateSlide(index) {
      slides.forEach((img, i) => img.classList.toggle("active", i === index));
      thumbnails.forEach((thumb, i) => thumb.classList.toggle("active", i === index));
      currentIndex = index;
    }

    function goToNext() {
      updateSlide((currentIndex + 1) % slides.length);
    }

    function goToPrev() {
      updateSlide((currentIndex - 1 + slides.length) % slides.length);
    }

    function resetAutoSlide() {
      clearInterval(interval);
      interval = setInterval(goToNext, 5000);
    }

    thumbnails.forEach((thumb, i) => {
      thumb.addEventListener("click", () => {
        updateSlide(i);
        resetAutoSlide();
      });
    });

    let startX = 0;
    container.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    container.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) goToNext();
      else if (endX - startX > 50) goToPrev();
      resetAutoSlide();
    });

    updateSlide(0);
    interval = setInterval(goToNext, 5000);

    slides.forEach((img, i) => {
      img.addEventListener("click", () => {
        fullscreen.classList.add("active");
        showFullscreen(i);
      });
    });

    function showFullscreen(index) {
      const images = Array.from(slides).map(img => img.src);
      currentIndex = index;

      fsSlide.innerHTML = `<img src="${images[index]}" alt="fullscreen" class="fullscreen-img">`;
      fsThumbs.innerHTML = images.map((src, i) =>
        `<img src="${src}" class="${i === index ? 'active' : ''}" data-index="${i}">`
      ).join("");

      fsThumbs.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", () => {
          const idx = parseInt(img.dataset.index);
          showFullscreen(idx);
        });
      });

      const fsImg = fsSlide.querySelector("img");
      let isDragging = false;
      let startX = 0, startY = 0, currentX = 0, currentY = 0;
      let zoomLevelIndex = 0;
      const zoomLevels = [1, 2.3, 3.8];
      let dragMoved = false;

      fsSlide.addEventListener("mousedown", (e) => {
        if (!fsImg.classList.contains("zoomed")) return;
        isDragging = true;
        dragMoved = false;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        e.preventDefault();
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        dragMoved = true;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        fsImg.style.transform = `scale(${zoomLevels[zoomLevelIndex]}) translate(${currentX}px, ${currentY}px)`;
      });

      window.addEventListener("mouseup", () => {
        isDragging = false;
      });

      fsSlide.addEventListener("click", () => {
        if (dragMoved) return;
        zoomLevelIndex = (zoomLevelIndex + 1) % zoomLevels.length;
        if (zoomLevelIndex === 0) {
          fsImg.classList.remove("zoomed");
          fsImg.style.transform = "scale(1)";
        } else {
          fsImg.classList.add("zoomed");
          currentX = 0;
          currentY = 0;
          fsImg.style.transform = `scale(${zoomLevels[zoomLevelIndex]}) translate(0px, 0px)`;
        }
      });
    }

    document.addEventListener("keydown", e => {
      if (!fullscreen.classList.contains("active")) return;
      const total = slides.length;
      if (e.key === "ArrowRight") showFullscreen((currentIndex + 1) % total);
      if (e.key === "ArrowLeft") showFullscreen((currentIndex - 1 + total) % total);
      if (e.key === "Escape") fullscreen.classList.remove("active");
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        fullscreen.classList.remove("active");
      });
    }
  });
});

function showWork(id) {
  const works = document.querySelectorAll(".work");
  const links = document.querySelectorAll(".sidebar a");
  const worksList = document.querySelector('.works-list');

  // 先隐藏所有作品
  works.forEach(w => {
    w.classList.remove("active");
    w.style.display = "none";
  });
  
  // 移除所有链接的激活状态
  links.forEach(link => link.classList.remove("active"));

  const target = document.getElementById(id);
  const activeLink = document.querySelector(`.sidebar a[href="#${id}"]`);

  if (target) {
    target.classList.add("active");
    target.style.display = "block";
  }
  
  if (activeLink) activeLink.classList.add("active");

  const sketchIds = ["systema", "systemb", "theta"];
  if (sketchIds.includes(id)) {
    // 清理现有的 p5 实例
    if (window.currentP5Instance) {
      window.currentP5Instance.remove();
      window.currentP5Instance = null;
    }

    // 清理 sketch 容器
    const container = document.querySelector('.sketch-container');
    if (container) {
      container.innerHTML = '';
    }

    // 移除所有旧的 sketch 脚本
    document.querySelectorAll('script[src*="/mycode/"]').forEach(script => {
      script.remove();
    });

    // 确保 p5.js 库已加载
    if (typeof p5 === 'undefined') {
      const p5Script = document.createElement('script');
      p5Script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js';
      p5Script.onload = () => {
        // p5.js 加载完成后加载 sketch
        const sketchScript = document.createElement("script");
        sketchScript.src = `/mycode/${id}.js?t=${new Date().getTime()}`;
        sketchScript.onload = () => {
          console.log(`Loaded ${id}.js`);
        };
        document.body.appendChild(sketchScript);
      };
      document.body.appendChild(p5Script);
    } else {
      // 如果 p5.js 已加载，直接加载 sketch
      const sketchScript = document.createElement("script");
      sketchScript.src = `/mycode/${id}.js?t=${new Date().getTime()}`;
      sketchScript.onload = () => {
        console.log(`Loaded ${id}.js`);
      };
      document.body.appendChild(sketchScript);
    }

    // 隐藏作品列表（如果存在）
    if (worksList) {
      worksList.style.display = 'none';
    }
  } else {
    // 如果不是 sketch 作品，显示作品列表（如果存在）
    if (worksList) {
      worksList.style.display = 'block';
    }
  }
}



// 切換 about 區段
function toggleAboutSection(targetId) {
  const sections = document.querySelectorAll('.about-section');
  const buttons = document.querySelectorAll('.about-tabs button');
  sections.forEach(section => {
    section.classList.toggle('active', section.id === `${targetId}-section`);
  });
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === targetId);
  });
}
