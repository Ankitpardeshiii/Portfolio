document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     SYNTHESIZED WEB AUDIO SFX & FALLBACK AMBIENT
     ========================================== */
  let sfxEnabled = true;
  let audioCtx = null;

  const getAudioContext = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playSFX = (type) => {
    if (!sfxEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'chest') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'xp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.08);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio context fallbacks silently
    }
  };

  const sfxToggleBtn = document.getElementById('sfx-toggle');
  const sfxIcon = document.getElementById('sfx-icon');

  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      if (sfxIcon) {
        sfxIcon.className = sfxEnabled ? 'ri-volume-up-fill' : 'ri-volume-mute-fill';
      }
      playSFX('click');
    });
  }

  /* ==========================================
     AMBIENT MINECRAFT AUDIO PLAYER & SYSTEM
     ========================================== */
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioBtnIcon = document.getElementById('audio-btn-icon');
  const audioBtnText = document.getElementById('audio-btn-text');
  const bgMusic = document.getElementById('bg-music');

  let isMusicPlaying = false;
  let synthAmbientOsc = null;

  // Restore music preference if user previously enabled it
  const savedMusicState = localStorage.getItem('mc_music_enabled');

  const startMusic = () => {
    isMusicPlaying = true;
    if (audioToggleBtn) {
      audioToggleBtn.classList.add('active');
      audioToggleBtn.setAttribute('aria-label', 'Disable background music');
    }
    if (audioBtnIcon) audioBtnIcon.textContent = '🔊';
    if (audioBtnText) audioBtnText.textContent = 'AUDIO: ON';

    if (bgMusic) {
      bgMusic.volume = 0.35;
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If HTML audio source file is not found or blocked, fallback smoothly to Web Audio drone
          playSynthAmbient();
        });
      }
    } else {
      playSynthAmbient();
    }

    localStorage.setItem('mc_music_enabled', 'true');
  };

  const stopMusic = () => {
    isMusicPlaying = false;
    if (audioToggleBtn) {
      audioToggleBtn.classList.remove('active');
      audioToggleBtn.setAttribute('aria-label', 'Enable background music');
    }
    if (audioBtnIcon) audioBtnIcon.textContent = '🎵';
    if (audioBtnText) audioBtnText.textContent = 'AUDIO: OFF';

    if (bgMusic) {
      bgMusic.pause();
    }
    stopSynthAmbient();

    localStorage.setItem('mc_music_enabled', 'false');
  };

  // Web Audio Synth Fallback Drone for Minecraft atmosphere
  const playSynthAmbient = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx || synthAmbientOsc) return;

      synthAmbientOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      synthAmbientOsc.type = 'sine';
      synthAmbientOsc.frequency.setValueAtTime(220, ctx.currentTime); // A3 chord

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2); // Smooth fade in

      synthAmbientOsc.connect(gain);
      gain.connect(ctx.destination);
      synthAmbientOsc.start();
    } catch (e) {
      // Graceful fallback
    }
  };

  const stopSynthAmbient = () => {
    if (synthAmbientOsc) {
      try {
        synthAmbientOsc.stop();
        synthAmbientOsc.disconnect();
      } catch (e) {}
      synthAmbientOsc = null;
    }
  };

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      playSFX('click');
      if (isMusicPlaying) {
        stopMusic();
      } else {
        startMusic();
      }
    });
  }

  // Auto-resume user audio preference on first click anywhere if saved as enabled
  if (savedMusicState === 'true') {
    const handleFirstUserGesture = () => {
      if (savedMusicState === 'true' && !isMusicPlaying) {
        startMusic();
      }
      document.removeEventListener('click', handleFirstUserGesture);
    };
    document.addEventListener('click', handleFirstUserGesture);
  }

  /* ==========================================
     CUSTOM CROSSHAIR CURSOR & TOOLTIP SYSTEM
     ========================================== */
  const cursor = document.getElementById('mc-cursor');
  const tooltip = document.getElementById('mc-tooltip');
  const ttTitle = document.getElementById('mc-tt-title');
  const ttCat = document.getElementById('mc-tt-cat');
  const ttDesc = document.getElementById('mc-tt-desc');
  const ttTools = document.getElementById('mc-tt-tools');
  const ttFill = document.getElementById('mc-tt-fill');

  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (cursor) {
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }

    if (tooltip && tooltip.classList.contains('active')) {
      let x = mouseX + 15;
      let y = mouseY + 15;

      const ttWidth = tooltip.offsetWidth;
      const ttHeight = tooltip.offsetHeight;

      if (x + ttWidth > window.innerWidth) x = mouseX - ttWidth - 10;
      if (y + ttHeight > window.innerHeight) y = mouseY - ttHeight - 10;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
    }
  });

  // Inventory Slots Hover Tooltip Event Listeners
  const slots = document.querySelectorAll('.mc-slot');
  slots.forEach(slot => {
    slot.addEventListener('mouseenter', () => {
      const title = slot.getAttribute('data-title');
      if (!title || !tooltip) return;

      playSFX('click');
      ttTitle.textContent = title;
      ttCat.textContent = slot.getAttribute('data-category') || 'Item';
      ttDesc.textContent = slot.getAttribute('data-desc') || '';
      ttTools.textContent = slot.getAttribute('data-tools') ? `Tools: ${slot.getAttribute('data-tools')}` : '';

      const prof = slot.getAttribute('data-prof') || '85%';
      if (ttFill) ttFill.style.width = prof;

      tooltip.classList.add('active');
    });

    slot.addEventListener('mouseleave', () => {
      if (tooltip) tooltip.classList.remove('active');
    });
  });

  /* ==========================================
     CANVAS XP ORBS PARTICLES
     ========================================== */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 35;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class XPParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 50;
        this.size = Math.random() * 3 + 2;
        this.speedY = Math.random() * 0.7 + 0.3;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.color = Math.random() > 0.5 ? 'rgba(85, 255, 85, ' : 'rgba(255, 215, 0, ';
        this.opacity = Math.random() * 0.4 + 0.2;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < -10) this.reset();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.fill();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new XPParticle());
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  /* ==========================================
     TYPING TEXT ANIMATION
     ========================================== */
  const typingText = document.getElementById('typing-text');
  const roles = ["Aspiring Data Scientist", "Open Source Contributor", "Problem Solver"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typeEffect = () => {
    if (!typingText) return;
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 90;

    if (!isDeleting && charIndex === currentRole.length) {
      speed = 1600;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      speed = 400;
    }

    setTimeout(typeEffect, speed);
  };
  typeEffect();

  /* ==========================================
     HERO PARALLAX BACKGROUND SCROLL EFFECT
     ========================================== */
  const heroSection = document.querySelector('.mc-hero');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSection && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY;
      if (scrollPos < window.innerHeight) {
        heroSection.style.backgroundPositionY = `calc(30% + ${scrollPos * 0.3}px)`;
      }
    });
  }

  /* ==========================================
     NAVBAR & SCROLL LINK HIGHLIGHTING
     ========================================== */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.mc-nav-slot');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      playSFX('click');
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        playSFX('click');
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================
     PROJECT CHEST MODAL SYSTEM
     ========================================== */
  const projectsData = {
    bangabites: {
      title: "BangaBites",
      subtitle: "Smart Restaurant Recommendation System for Bengaluru",
      desc: "BangaBites is a deployed content-based restaurant recommendation system focused on Bengaluru restaurants. It recommends restaurants similar to a user's selected restaurant using TF-IDF and Cosine Similarity, while also considering weighted rating, popularity, and budget compatibility.",
      features: [
        "Content-based recommendations with TF-IDF & Cosine Similarity",
        "Weighted ratings, popularity & budget scoring algorithms",
        "Location filtering, minimum rating & max budget controls",
        "Zomato restaurant links & responsive web interface",
        "Cloud-deployed Flask REST API on Render"
      ],
      aiNote: "AI-assisted development was used to accelerate frontend/UI implementation and Flask integration, while the recommendation logic, data processing, scoring system and overall project architecture were designed and integrated as part of the project.",
      tech: ["Python", "Pandas", "NumPy", "Scikit-learn", "TF-IDF", "Cosine Similarity", "Flask", "HTML", "CSS", "JavaScript", "Git", "Render"],
      demo: "https://bangabites.onrender.com/",
      github: "https://github.com/Ankitpardeshiii/BangaBites"
    },
    behindthefeed: {
      title: "Behind The Feed",
      subtitle: "Instagram Data Analysis & User Engagement Project",
      desc: "A hands-on Instagram data analysis project that collects, cleans, and analyzes raw user data to extract insights on engagement trends, posting frequency, and user behavior.",
      features: [
        "Data cleaning and exploratory analysis on social media datasets",
        "Engagement rate calculation and posting pattern analysis",
        "Visualization of follower growth and interaction metrics",
        "Clean Python data processing pipeline"
      ],
      aiNote: null,
      tech: ["Python", "Pandas", "Matplotlib", "Seaborn"],
      demo: "https://github.com/Ankitpardeshiii/Behind-the-feed",
      github: "https://github.com/Ankitpardeshiii/Behind-the-feed"
    },
    friendtofeature: {
      title: "Friend to Feature",
      subtitle: "Social Network Link Prediction & Graph Analysis",
      desc: "What connects people beyond friendships? From Friends to Features explores social links and shared interests to identify potential connections and page recommendations through data analysis and graph theory.",
      features: [
        "Network graph construction with NetworkX",
        "Social link prediction using feature similarity metrics",
        "Recommendation scoring for shared interest clusters",
        "Data-driven visualization of graph nodes and edges"
      ],
      aiNote: null,
      tech: ["Scikit-Learn", "NetworkX", "Python", "NumPy"],
      demo: "https://github.com/Ankitpardeshiii/Friends-to-feature",
      github: "https://github.com/Ankitpardeshiii/Friends-to-feature"
    },
    databeforedoors: {
      title: "Data Before Doors",
      subtitle: "Real-Time House Price Predictive Machine Learning Model",
      desc: "A real-time house price prediction model using machine learning, incorporating regression models, feature selection, and validation algorithms for accurate property valuation.",
      features: [
        "Predictive regression pipeline with feature engineering",
        "Outlier detection & missing data imputation algorithms",
        "Model accuracy validation & hyperparameter evaluation",
        "Property valuation scoring based on location and specs"
      ],
      aiNote: null,
      tech: ["Python", "Sklearn", "Regression", "Pandas"],
      demo: "https://github.com/Ankitpardeshiii/Data-Before-Doors",
      github: "https://github.com/Ankitpardeshiii/Data-Before-Doors"
    }
  };

  const modalBackdrop = document.getElementById('mc-modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-project-title');
  const modalSubtitle = document.getElementById('modal-project-subtitle');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalFeaturesList = document.getElementById('modal-features-list');
  const modalAiNote = document.getElementById('modal-ai-note');
  const modalAiNoteText = document.getElementById('modal-ai-note-text');
  const modalTechSlots = document.getElementById('modal-tech-slots');
  const modalDemoBtn = document.getElementById('modal-demo-btn');
  const modalGithubBtn = document.getElementById('modal-github-btn');

  const openModal = (projectId) => {
    const data = projectsData[projectId];
    if (!data || !modalBackdrop) return;

    playSFX('chest');

    modalTitle.textContent = data.title;
    modalSubtitle.textContent = data.subtitle;
    modalDesc.textContent = data.desc;

    modalFeaturesList.innerHTML = '';
    data.features.forEach(feat => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="ri-checkbox-circle-fill"></i> ${feat}`;
      modalFeaturesList.appendChild(li);
    });

    if (data.aiNote) {
      modalAiNote.style.display = 'flex';
      modalAiNoteText.textContent = data.aiNote;
    } else {
      modalAiNote.style.display = 'none';
    }

    modalTechSlots.innerHTML = '';
    data.tech.forEach(t => {
      const badge = document.createElement('span');
      badge.className = 'mc-tag mc-tag-green';
      badge.textContent = t;
      modalTechSlots.appendChild(badge);
    });

    modalDemoBtn.href = data.demo;
    modalGithubBtn.href = data.github;

    modalBackdrop.classList.add('active');
  };

  const closeModal = () => {
    if (modalBackdrop) {
      playSFX('click');
      modalBackdrop.classList.remove('active');
    }
  };

  document.querySelectorAll('.mc-open-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projId = btn.getAttribute('data-project');
      if (projId) openModal(projId);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================
     STATS COUNTER EFFECT
     ========================================== */
  let statsTriggered = false;
  const animateCounter = (id, targetVal) => {
    const el = document.getElementById(id);
    if (!el) return;
    let count = 0;
    const isPlus = el.textContent.includes('+');
    const step = Math.ceil(targetVal / 30);

    const timer = setInterval(() => {
      count += step;
      if (count >= targetVal) {
        el.textContent = targetVal + (isPlus ? '+' : '');
        clearInterval(timer);
      } else {
        el.textContent = count + (isPlus ? '+' : '');
      }
    }, 40);
  };

  const triggerStats = () => {
    if (statsTriggered) return;
    statsTriggered = true;
    animateCounter('stat-projects', 4);
    animateCounter('stat-opensource', 5);
    animateCounter('stat-tech', 12);
    animateCounter('stat-commits', 400);
  };

  /* ==========================================
     REVEAL ANIMATIONS (IntersectionObserver)
     ========================================== */
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.querySelector('#stat-projects')) {
          triggerStats();
        }
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ==========================================
     CONTACT FORM & XP TOAST NOTIFICATION
     ========================================== */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('button[type="submit"]');
      const origText = btn.innerHTML;

      btn.innerHTML = '<span class="mc-btn-text">SENDING QUEST MESSAGE...</span>';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        playSFX('xp');
        btn.innerHTML = '<span class="mc-btn-text">QUEST COMPLETED!</span> <i class="ri-checkbox-circle-fill"></i>';
        btn.style.background = 'var(--mc-grass-dark)';

        showToast('+100 XP! Quest Message Sent to Ankit Successfully!');
        contactForm.reset();

        setTimeout(() => {
          btn.innerHTML = origText;
          btn.style.background = '';
          btn.style.pointerEvents = 'auto';
        }, 3500);
      }, 1200);
    });
  }

  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = 'var(--mc-bg-card)';
    toast.style.border = '3px solid var(--mc-gold)';
    toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    toast.style.color = 'var(--mc-gold-bright)';
    toast.style.fontFamily = 'var(--font-pixel-sub)';
    toast.style.fontSize = '0.85rem';
    toast.style.padding = '1rem 1.4rem';
    toast.style.zIndex = '99999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.innerHTML = `💎 ${msg}`;

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 4000);
  };

  /* ==========================================
     EASTER EGG SECRET BLOCK
     ========================================== */
  const easterBtn = document.getElementById('easter-block-btn');
  if (easterBtn) {
    easterBtn.addEventListener('click', () => {
      playSFX('xp');
      showToast('ACHIEVEMENT UNLOCKED: Secret Emerald Explorer! 🟢');
    });
  }
});
