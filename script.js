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

  // 预加载works-list中的图片，优化hover效果
  const preloadImages = () => {
    const worksList = document.querySelector('.works-list');
    if (worksList) {
      // 特别关注长名称作品，现在已简化为wwebsal
      const longNameWorks = worksList.querySelectorAll('li a[href="works/#wwebsal"] + img');
      
      // 预加载所有图片
      const allImages = worksList.querySelectorAll('img');
      
      // 创建一个图片预加载函数
      const preloadImage = (img) => {
        const src = img.getAttribute('src');
        if (src) {
          const newImg = new Image();
          newImg.src = src;
        }
      };
      
      // 优先预加载长名称作品图片
      longNameWorks.forEach(preloadImage);
      
      // 然后预加载其他图片
      allImages.forEach(preloadImage);
    }
  };
  
  // 在页面加载完成后预加载图片
  preloadImages();

  // 监听侧边栏链接点击
  document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      showWork(id);
    });
  });

  // 处理 URL hash 变化
  window.addEventListener("hashchange", () => {
    const id = location.hash.replace("#", "");
    showWork(id);
  });
  
  // 初始化显示 - 改进初始化逻辑，处理从主页点击跳转的情况
  const initializeWorkDisplay = () => {
    let hash = window.location.hash.replace('#', '');
    
    // 如果URL中有hash值，显示对应作品
    if (hash) {
      // 检查是否存在对应ID的作品
      const targetWork = document.getElementById(hash);
      if (targetWork) {
        showWork(hash);
        return;
      }
    }
    
    // 如果没有hash或找不到对应作品，显示第一个作品
    const firstWork = document.querySelector(".work");
    if (firstWork) {
      firstWork.classList.add("active");
      firstWork.style.display = "block";
      // 更新侧边栏选中状态
      const firstWorkId = firstWork.id;
      const firstWorkLink = document.querySelector(`.sidebar a[href="#${firstWorkId}"]`);
      if (firstWorkLink) {
        firstWorkLink.classList.add("active");
      }
    }
  };
  
  // 执行初始化
  initializeWorkDisplay();
  
  // 优化hover效果，降低长作品名称的悬停延迟
  document.querySelectorAll(".pre_work").forEach((item, i) => {
    // 为名称较长的作品设置特别的优化
    const link = item.querySelector('a');
    if (link && link.getAttribute('href').includes('wwebsal')) {
      // 立即设置transform-origin，使变换更快
      const img = item.querySelector('img');
      if (img) {
        img.style.transformOrigin = 'center center';
      }
    }
    
    // 淡入動畫保持不变
    item.style.setProperty("--delay", `${i * 0.15}s`);
  });

  // 輪播與全螢幕邏輯
  document.querySelectorAll(".work").forEach(work => {
    const slides = work.querySelectorAll(".carousel-slide img");
    const thumbnails = work.querySelectorAll(".thumbnail");
    const container = work.querySelector(".carousel-container");

    if (!slides.length || !thumbnails.length) return;

    // 检测并标记图片方向
    function detectImageOrientation() {
      slides.forEach(img => {
        // 当图片加载完成后检测方向
        if (img.complete) {
          setOrientation(img);
        } else {
          img.onload = () => setOrientation(img);
        }
      });
    }

    // 设置图片方向属性
    function setOrientation(img) {
      if (img.naturalWidth > img.naturalHeight) {
        // 横向图片
        img.setAttribute('data-orientation', 'landscape');
      } else {
        // 纵向图片
        img.setAttribute('data-orientation', 'portrait');
      }
    }

    // 执行图片方向检测
    detectImageOrientation();

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

      // 获取全屏图片元素
      const fsImg = fsSlide.querySelector("img");
      
      // 复制图片方向属性到全屏图片
      if (fsImg) {
        const originalImg = slides[index];
        if (originalImg.hasAttribute('data-orientation')) {
          fsImg.setAttribute('data-orientation', originalImg.getAttribute('data-orientation'));
        } else {
          // 如果原图还没有设置方向属性，则加载后设置
          fsImg.onload = () => {
            if (fsImg.naturalWidth > fsImg.naturalHeight) {
              fsImg.setAttribute('data-orientation', 'landscape');
            } else {
              fsImg.setAttribute('data-orientation', 'portrait');
            }
          };
        }
      }

      fsThumbs.querySelectorAll("img").forEach(img => {
        img.addEventListener("click", () => {
          const idx = parseInt(img.dataset.index);
          showFullscreen(idx);
        });
      });

      // 拖拽缩放相关变量和事件
      let isDragging = false;
      let startX = 0, startY = 0, currentX = 0, currentY = 0;
      let zoomLevelIndex = 0;
      const zoomLevels = [1, 2.3, 3.8];
      let dragMoved = false;
      // 添加拖曳加速系数，提高拖曳灵敏度
      const dragSensitivity = 1.5;

      fsSlide.addEventListener("mousedown", (e) => {
        if (!fsImg.classList.contains("zoomed")) return;
        isDragging = true;
        dragMoved = false;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        fsSlide.classList.add("dragging");
        e.preventDefault();
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        dragMoved = true;
        currentX = (e.clientX - startX) * dragSensitivity;
        currentY = (e.clientY - startY) * dragSensitivity;
        fsImg.style.transform = `scale(${zoomLevels[zoomLevelIndex]}) translate3d(${currentX}px, ${currentY}px, 0)`;
      });

      window.addEventListener("mouseup", () => {
        isDragging = false;
        fsSlide.classList.remove("dragging");
      });

      fsSlide.addEventListener("touchstart", (e) => {
        if (!fsImg.classList.contains("zoomed")) return;
        isDragging = true;
        dragMoved = false;
        startX = e.touches[0].clientX - currentX;
        startY = e.touches[0].clientY - currentY;
        fsSlide.classList.add("dragging");
        e.preventDefault();
      });

      fsSlide.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        dragMoved = true;
        currentX = (e.touches[0].clientX - startX) * dragSensitivity;
        currentY = (e.touches[0].clientY - startY) * dragSensitivity;
        fsImg.style.transform = `scale(${zoomLevels[zoomLevelIndex]}) translate3d(${currentX}px, ${currentY}px, 0)`;
        e.preventDefault();
      });

      fsSlide.addEventListener("touchend", () => {
        isDragging = false;
        fsSlide.classList.remove("dragging");
      });

      fsSlide.addEventListener("click", () => {
        if (dragMoved) return;
        zoomLevelIndex = (zoomLevelIndex + 1) % zoomLevels.length;
        if (zoomLevelIndex === 0) {
          fsImg.classList.remove("zoomed");
          fsImg.style.transform = "scale(1)";
          currentX = 0;
          currentY = 0;
        } else {
          fsImg.classList.add("zoomed");
          currentX = 0;
          currentY = 0;
          fsImg.style.transform = `scale(${zoomLevels[zoomLevelIndex]}) translate3d(0px, 0px, 0)`;
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

  console.log("Showing work with ID:", id); // 调试日志

  // 移除所有作品的激活状态
  works.forEach(w => {
    w.classList.remove("active");
    w.style.display = "none";
  });
  
  // 移除所有链接的激活状态
  links.forEach(link => link.classList.remove("active"));

  // 查找目标作品
  const target = document.getElementById(id);
  
  // 如果找不到目标作品，尝试显示第一个作品
  if (!target) {
    console.warn(`Work with ID '${id}' not found, showing first work instead`);
    const firstWork = document.querySelector(".work");
    if (firstWork) {
      firstWork.classList.add("active");
      firstWork.style.display = "block";
      
      // 更新侧边栏状态
      const firstWorkId = firstWork.id;
      const firstWorkLink = document.querySelector(`.sidebar a[href="#${firstWorkId}"]`);
      if (firstWorkLink) {
        firstWorkLink.classList.add("active");
      }
      
      // 更新 URL hash
      if (window.location.hash !== `#${firstWorkId}`) {
        history.replaceState(null, null, `#${firstWorkId}`);
      }
    }
    return;
  }
  
  // 显示目标作品
  target.classList.add("active");
  target.style.display = "block";
  
  // 更新侧边栏状态
  const activeLink = document.querySelector(`.sidebar a[href="#${id}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
  
  // 更新 URL hash (如果需要)
  if (window.location.hash !== `#${id}`) {
    history.replaceState(null, null, `#${id}`);
  }
  
  // 作品列表显示逻辑 (如果需要)
  if (worksList) {
    worksList.style.display = 'block';
  }
}
