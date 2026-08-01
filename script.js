document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     CUSTOM CURSOR
     ========================================== */
  const cursor = document.getElementById('cursor');
  const cursorOutline = document.getElementById('cursor-outline');
  
  if (cursor && cursorOutline) {
    let mouseX = 0, mouseY = 0; // Mouse positions
    let outlineX = 0, outlineY = 0; // Lagging outline positions
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });
    
    // Smooth lerp animation for cursor outline
    const animateCursor = () => {
      const ease = 0.15; // Speed of outline following
      outlineX += (mouseX - outlineX) * ease;
      outlineY += (mouseY - outlineY) * ease;
      
      cursorOutline.style.left = `${outlineX}px`;
      cursorOutline.style.top = `${outlineY}px`;
      
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
    
    // Hover States
    const hoverTargets = document.querySelectorAll('a, button, input, textarea, .glass-card, .nav-toggle, .tech-card');
    
    hoverTargets.forEach(target => {
      target.addEventListener('mouseenter', () => {
        document.body.classList.add('hovered');
      });
      target.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovered');
      });
    });
  }

  /* ==========================================
     CANVAS GOLDEN PARTICLES
     ========================================== */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 65;
    
    // Resize Canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle Template
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1; // small particles
        this.speedX = Math.random() * 0.4 - 0.2; // slow movement
        this.speedY = Math.random() * 0.4 - 0.2;
        this.color = 'rgba(255, 215, 0, ' + (Math.random() * 0.35 + 0.1) + ')'; // Golden tone opacity
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }
      
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }
    
    // Initialize Particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();
    
    // Connect particles with faint golden lines
    const connectParticles = () => {
      const maxDistance = 110;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < maxDistance) {
            // Lines fade as distance increases
            const opacity = (1 - (distance / maxDistance)) * 0.06;
            ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Render loop
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      connectParticles();
      requestAnimationFrame(animateParticles);
    };
    animateParticles();
    
    // Re-initialize particles on window resize to re-distribute
    window.addEventListener('resize', initParticles);
  }

  /* ==========================================
     TYPING TEXT ANIMATION
     ========================================== */
  const typingText = document.getElementById('typing-text');
  const roles = ["Aspiring Data scientist", "Open Source Contributor", "Problem Solver"];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  
  const typeEffect = () => {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Erase faster
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100; // Normal typing speed
    }
    
    // Handle word completion states
    if (!isDeleting && charIndex === currentRole.length) {
      // Pause at full word
      typingSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      // Move to next word
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }
    
    setTimeout(typeEffect, typingSpeed);
  };
  
  if (typingText) {
    typeEffect();
  }

  /* ==========================================
     NAVBAR SCROLL & HAMBURGER MENU
     ========================================== */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');
  
  // Background scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Active navigation links highlighting based on scroll position
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150; // offset for navbar height
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
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
  
  // Mobile menu toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when a link is clicked on mobile
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  /* ==========================================
     SCROLL REVEAL ANIMATIONS (Intersection Observer)
     ========================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // If the element has stats we trigger counts
          if (entry.target.querySelector('.stat-num')) {
            triggerStatsCounter();
          }
          // We can unobserve if we only want reveal animation once
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // Viewport
      threshold: 0.12, // 12% visibility triggers reveal
      rootMargin: "0px 0px -40px 0px" // triggers slightly before scrolling fully past
    });
    
    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  /* ==========================================
     STATS COUNTER UP EFFECT
     ========================================== */
  let statsTriggered = false;
  
  const animateCounter = (id, targetVal, duration = 1500) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    let startTime = null;
    const isPlus = el.textContent.includes('+');
    
    const countStep = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = Math.floor(progress * targetVal);
      
      el.textContent = currentVal + (isPlus ? '+' : '');
      
      if (progress < 1) {
        requestAnimationFrame(countStep);
      } else {
        el.textContent = targetVal + (isPlus ? '+' : '');
      }
    };
    
    requestAnimationFrame(countStep);
  };
  
  const triggerStatsCounter = () => {
    if (statsTriggered) return;
    statsTriggered = true;
    
    animateCounter('stat-projects', 3);
    animateCounter('stat-opensource', 5);
    animateCounter('stat-tech', 12);
    animateCounter('stat-commits', 400, 2000);
  };

  /* ==========================================
     PREMIUM CONTACT FORM WORKFLOW
     ========================================== */
  /* ==========================================
   EMAILJS CONTACT FORM
========================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML =
      'Sending... <i class="ri-loader-4-line btn-icon ri-spin"></i>';
    submitBtn.style.pointerEvents = "none";

    emailjs
      .sendForm(
        "service_k6ey25l",
        "template_jcj7mk5",
        this
      )
      .then(() => {
        submitBtn.innerHTML =
          'Message Sent! <i class="ri-checkbox-circle-line btn-icon"></i>';

        submitBtn.style.background =
          "linear-gradient(135deg,#4CAF50,#2E7D32)";

        showNotification(
          "Thank you! Your message has been sent successfully.",
          "success"
        );

        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = "";
          submitBtn.style.pointerEvents = "auto";
        }, 3000);
      })
      .catch((error) => {
        console.error(error);

        submitBtn.innerHTML = originalText;
        submitBtn.style.pointerEvents = "auto";

        showNotification(
          "Failed to send message. Please try again.",
          "error"
        );
      });
  });
}
  // Custom Floating Toast Notification
  const showNotification = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.right = '30px';
    toast.style.background = 'rgba(15, 15, 15, 0.9)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.border = '1px solid var(--accent-gold-primary)';
    toast.style.color = '#ffffff';
    toast.style.padding = '1rem 2rem';
    toast.style.borderRadius = '8px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 10px 25px rgba(255, 215, 0, 0.2)';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    toast.style.fontFamily = 'var(--font-secondary)';
    toast.style.fontSize = '0.9rem';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    
    // Add success checkmark icon
    toast.innerHTML = `<i class="ri-checkbox-circle-fill" style="color: var(--accent-gold-primary); font-size: 1.2rem;"></i> ${message}`;
    
    document.body.appendChild(toast);
    
    // Force reflow
    toast.offsetHeight;
    
    // Slide up and fade in
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    // Remove after 3.5s
    setTimeout(() => {
      toast.style.transform = 'translateY(50px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 400);
    }, 3500);
  };
});
