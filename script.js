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

  // 轮播功能
  document.querySelectorAll('.carousel-wrapper').forEach(wrapper => {
    const container = wrapper.querySelector('.carousel-container');
    const slide = container.querySelector('.carousel-slide');
    const images = slide.querySelectorAll('img');
    const thumbnails = wrapper.querySelector('.thumbnail-container').querySelectorAll('.thumbnail');
    
    if (!images.length || !thumbnails.length) return;
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoplayInterval;
    
    // 显示指定索引的图片
    function showImage(index) {
      if (isTransitioning) return;
      isTransitioning = true;
      
      // 移除当前图片的active类
      images[currentIndex].classList.remove('active');
      thumbnails[currentIndex].classList.remove('active');
      
      // 添加新图片的active类
      currentIndex = index;
      images[currentIndex].classList.add('active');
      thumbnails[currentIndex].classList.add('active');
      
      // 过渡结束后重置状态
      setTimeout(() => {
        isTransitioning = false;
      }, 300);
    }
    
    // 缩略图点击事件
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        if (index !== currentIndex) {
          showImage(index);
        }
      });
    });
    
    // 自动轮播
    function startAutoplay() {
      autoplayInterval = setInterval(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        showImage(nextIndex);
      }, 5000);
    }
    
    // 停止自动轮播
    function stopAutoplay() {
      clearInterval(autoplayInterval);
    }
    
    // 鼠标悬停时暂停自动轮播
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    
    // 初始化显示第一张图片并开始自动轮播
    showImage(0);
    startAutoplay();

    // 为每个图片添加点击事件
    images.forEach((img, index) => {
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        showFullscreen(img, images, thumbnails, index);
      });
    });
  });

  function showFullscreen(selectedImg, images, thumbnails, selectedIndex) {
    const fullscreenViewer = document.createElement('div');
    fullscreenViewer.className = 'fullscreen-viewer';
  
    const fullscreenSlide = document.createElement('div');
    fullscreenSlide.className = 'fullscreen-slide';
  
    const fullscreenImg = document.createElement('img');
    fullscreenImg.src = selectedImg.src;
    fullscreenImg.alt = selectedImg.alt;
  
    const closeBtn = document.createElement('div');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
  
    const fullscreenThumbnails = document.createElement('div');
    fullscreenThumbnails.className = 'fullscreen-thumbnails';
  
    images.forEach((img, index) => {
      const thumb = thumbnails[index].cloneNode(true);
      thumb.addEventListener('click', () => {
        fullscreenImg.src = img.src;
        fullscreenThumbnails.querySelectorAll('img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        resetZoom();
      });
      fullscreenThumbnails.appendChild(thumb);
    });
  
    fullscreenSlide.appendChild(fullscreenImg);
    fullscreenViewer.appendChild(closeBtn);
    fullscreenViewer.appendChild(fullscreenSlide);
    fullscreenViewer.appendChild(fullscreenThumbnails);
    document.body.appendChild(fullscreenViewer);
  
    fullscreenThumbnails.querySelectorAll('img')[selectedIndex].classList.add('active');
    requestAnimationFrame(() => fullscreenViewer.classList.add('active'));
  
    function closeFullscreen() {
      fullscreenViewer.classList.remove('active');
      setTimeout(() => document.body.removeChild(fullscreenViewer), 200);
    }
  
    closeBtn.addEventListener('click', closeFullscreen);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeFullscreen();
    });
  
    let isDragging = false;
    let dragged = false; // 追蹤是否發生拖曳
    let startX, startY, translateX = 0, translateY = 0, scale = 1;
  
    const resetZoom = () => {
      scale = 1;
      translateX = translateY = 0;
      fullscreenImg.style.transform = '';
      fullscreenSlide.style.cursor = 'zoom-in';
      fullscreenImg.classList.remove('zoomed');
    };
  
    fullscreenSlide.addEventListener('mousedown', (e) => {
      if (scale > 1) {
        isDragging = true;
        dragged = false; // 每次mousedown重置dragged狀態
        startX = e.clientX;
        startY = e.clientY;
        fullscreenSlide.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
  
    fullscreenSlide.addEventListener('mousemove', (e) => {
      if (!isDragging || scale === 1) return;
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;
      translateX += dx;
      translateY += dy;
      fullscreenImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      startX = e.clientX;
      startY = e.clientY;
      dragged = true; // 確認已發生拖曳
    });
  
    fullscreenSlide.addEventListener('mouseup', (e) => {
      if (scale > 1) fullscreenSlide.style.cursor = 'grab';
      setTimeout(() => {
        isDragging = false; // 延遲防止立即觸發點擊
      }, 10);
    });
  
    fullscreenSlide.addEventListener('mouseleave', () => {
      isDragging = false;
      if (scale > 1) fullscreenSlide.style.cursor = 'grab';
    });
  
    fullscreenSlide.addEventListener('click', (e) => {
      if (dragged) {
        dragged = false; // 已拖曳，取消點擊動作
        return;
      }
      if (scale === 1) {
        scale = 2;
        fullscreenImg.classList.add('zoomed');
        fullscreenSlide.style.cursor = 'grab';
        fullscreenImg.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      } else {
        resetZoom();
      }
    });
  }
  
  
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

function showImage(index) {
  images.forEach((img, i) => {
    if (i === index) {
      img.style.opacity = '1';
      img.style.pointerEvents = 'auto';
    } else {
      img.style.opacity = '0';
      img.style.pointerEvents = 'none';
    }
  });
}

