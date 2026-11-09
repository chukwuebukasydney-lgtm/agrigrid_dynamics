/**
 * AgriGrid Dynamics - Interactive Agrivoltaics & Energy Orchestration Engine
 * High-performance 60fps Canvas Simulator & Reactive UI Controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initSimulator();
  initCalculator();
  initPipelineTabs();
  initContactForm();
  initLucide();
});

function initLucide() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ==========================================================================
   Theme Management (Light / Dark)
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const toggleBtnMobile = document.getElementById('theme-toggle-mobile');
  const currentTheme = localStorage.getItem('agrigrid-theme') || 'dark';

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  const toggleHandler = () => {
    const active = document.documentElement.getAttribute('data-theme');
    const next = active === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('agrigrid-theme', next);
    updateThemeIcon(next);
  };

  if (toggleBtn) toggleBtn.addEventListener('click', toggleHandler);
  if (toggleBtnMobile) toggleBtnMobile.addEventListener('click', toggleHandler);
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-toggle-icon');
  icons.forEach(el => {
    if (theme === 'dark') {
      el.setAttribute('data-lucide', 'sun');
    } else {
      el.setAttribute('data-lucide', 'moon');
    }
  });
  if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // Active section tracking via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));
}

/* ==========================================================================
   High-Performance Agrivoltaic Simulator (HTML5 Canvas)
   ========================================================================== */
function initSimulator() {
  const canvas = document.getElementById('agrivoltaics-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simulator State
  const state = {
    mode: 'heat_shield', // 'par_optimal', 'heat_shield', 'vpp_arbitrage', 'custom'
    timeOfDay: 0.52,     // 0 = 06:00, 0.5 = 12:00, 1.0 = 20:00
    targetTilt: -18,     // target degrees
    currentTilt: -18,    // interpolated degrees
    ambientTemp: 34,     // Celsius
    parRadiation: 1680,  // PAR μmol/m²/s
    soilMoisture: 68,    // %
    coldStoreLoad: 280,  // kW
    gridSpotPrice: 245,  // $/MWh
    vppExportKW: 1250,   // kW
    particles: [],
    lastTime: performance.now()
  };

  // Preset Configurations
  const presets = {
    par_optimal: {
      timeOfDay: 0.25, // 09:00 AM
      targetTilt: 38,
      ambientTemp: 22,
      parRadiation: 850,
      soilMoisture: 82,
      coldStoreLoad: 80,
      gridSpotPrice: 62,
      vppExportKW: 420,
      description: "Morning Photosynthesis Priority: Panels tilt at 38° allowing direct morning sunlight penetration to crop leaves, preventing moisture stress while generating initial clean energy."
    },
    heat_shield: {
      timeOfDay: 0.54, // 01:30 PM
      targetTilt: -28,
      ambientTemp: 38,
      parRadiation: 1890,
      soilMoisture: 65,
      coldStoreLoad: 310,
      gridSpotPrice: 185,
      vppExportKW: 1480,
      description: "Midday Microclimate Shield: Panels angle to cast dense cooling shadow over vulnerable crop canopy, dropping ground temperature by 5.4°C and synchronizing chillers with peak generation."
    },
    vpp_arbitrage: {
      timeOfDay: 0.82, // 05:45 PM
      targetTilt: -55,
      ambientTemp: 31,
      parRadiation: 620,
      soilMoisture: 61,
      coldStoreLoad: 140,
      gridSpotPrice: 420,
      vppExportKW: 2150,
      description: "Peak Grid Arbitrage Window: Regional utility spot price spikes. Panels steer west to capture late sunlight; cold storage thermal buffers engage, maximizing high-margin VPP export."
    }
  };

  // Particles for energy & data flow
  for (let i = 0; i < 40; i++) {
    state.particles.push({
      x: Math.random(),
      y: Math.random(),
      speed: 0.003 + Math.random() * 0.005,
      type: i % 2 === 0 ? 'energy' : 'data',
      offset: Math.random() * 100
    });
  }

  // Handle Resize & DPI Scaling
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Mode button handlers
  const modeButtons = document.querySelectorAll('.sim-mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (presets[mode]) {
        state.mode = mode;
        const p = presets[mode];
        state.timeOfDay = p.timeOfDay;
        state.targetTilt = p.targetTilt;
        state.ambientTemp = p.ambientTemp;
        state.parRadiation = p.parRadiation;
        state.soilMoisture = p.soilMoisture;
        state.coldStoreLoad = p.coldStoreLoad;
        state.gridSpotPrice = p.gridSpotPrice;
        state.vppExportKW = p.vppExportKW;

        modeButtons.forEach(b => b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/20'));
        btn.classList.add('active', 'border-emerald-500', 'bg-emerald-500/20');

        const descEl = document.getElementById('sim-mode-desc');
        if (descEl) descEl.textContent = p.description;

        const timeSlider = document.getElementById('sim-time-slider');
        if (timeSlider) timeSlider.value = Math.round(state.timeOfDay * 100);
      }
    });
  });

  // Slider control for manual scrubbing
  const timeSlider = document.getElementById('sim-time-slider');
  if (timeSlider) {
    timeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      state.timeOfDay = val;
      state.mode = 'custom';
      modeButtons.forEach(b => b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/20'));
      
      // Calculate continuous physics based on time
      const hour = 6 + val * 14; // 6:00 to 20:00
      state.targetTilt = -60 + val * 120; // -60 to +60
      state.ambientTemp = Math.round(20 + Math.sin(val * Math.PI) * 18);
      state.parRadiation = Math.round(Math.max(100, Math.sin(val * Math.PI) * 1950));
      state.soilMoisture = Math.round(75 - Math.sin(val * Math.PI) * 15);
      state.coldStoreLoad = Math.round(80 + Math.sin(val * Math.PI) * 230);
      
      // Price curve: peak in late afternoon
      let price = 50 + Math.sin(val * Math.PI) * 120;
      if (val > 0.7 && val < 0.9) price += 220; // 5pm peak
      state.gridSpotPrice = Math.round(price);
      state.vppExportKW = Math.round(Math.max(200, Math.sin(val * Math.PI) * 1600 + (val > 0.7 ? 600 : 0)));

      const descEl = document.getElementById('sim-mode-desc');
      if (descEl) {
        const hInt = Math.floor(hour);
        const mInt = Math.round((hour - hInt) * 60);
        const timeStr = `${hInt.toString().padStart(2, '0')}:${mInt.toString().padStart(2, '0')}`;
        descEl.textContent = `Continuous Actuation (${timeStr}): Real-time RL controller dynamically tracks solar trajectory while optimizing microclimate canopy vapor pressure deficit.`;
      }
    });
  }

  // Animation Loop
  function render(now) {
    const dt = (now - state.lastTime) / 1000;
    state.lastTime = now;

    // Smooth tilt interpolation
    state.currentTilt += (state.targetTilt - state.currentTilt) * 0.08;

    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    if (w === 0 || h === 0) {
      requestAnimationFrame(render);
      return;
    }

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // Clear Canvas
    ctx.clearRect(0, 0, w, h);

    // Sky Background Gradient based on timeOfDay
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isDark) {
      if (state.timeOfDay < 0.3 || state.timeOfDay > 0.8) {
        // Dawn / Dusk
        skyGrad.addColorStop(0, '#111827');
        skyGrad.addColorStop(0.5, '#1E293B');
        skyGrad.addColorStop(1, '#0F172A');
      } else {
        // High Noon / Bright Day
        skyGrad.addColorStop(0, '#0F2038');
        skyGrad.addColorStop(0.5, '#132C4A');
        skyGrad.addColorStop(1, '#091527');
      }
    } else {
      if (state.timeOfDay < 0.3 || state.timeOfDay > 0.8) {
        skyGrad.addColorStop(0, '#E0F2FE');
        skyGrad.addColorStop(0.5, '#F1F5F9');
        skyGrad.addColorStop(1, '#E2E8F0');
      } else {
        skyGrad.addColorStop(0, '#BAE6FD');
        skyGrad.addColorStop(0.6, '#E0F2FE');
        skyGrad.addColorStop(1, '#CBD5E1');
      }
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun Position along arc
    const sunRadius = 24;
    const arcStartX = w * 0.12;
    const arcEndX = w * 0.88;
    const sunX = arcStartX + (arcEndX - arcStartX) * state.timeOfDay;
    const sunY = h * 0.5 - Math.sin(state.timeOfDay * Math.PI) * (h * 0.36);

    // Sun Arc Guide Line
    ctx.beginPath();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1.5;
    for (let t = 0; t <= 1; t += 0.02) {
      const px = arcStartX + (arcEndX - arcStartX) * t;
      const py = h * 0.5 - Math.sin(t * Math.PI) * (h * 0.36);
      if (t === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Sun Corona & Core
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, sunRadius * 2.8);
    sunGlow.addColorStop(0, '#FDE047');
    sunGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.6)');
    sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius * 2.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Solar Radiation Rays
    ctx.save();
    ctx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.16)' : 'rgba(217, 119, 6, 0.18)';
    ctx.lineWidth = 2;
    for (let r = 0; r < 8; r++) {
      const angle = (now * 0.0008) + (r * Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * (sunRadius + 6), sunY + Math.sin(angle) * (sunRadius + 6));
      ctx.lineTo(sunX + Math.cos(angle) * (sunRadius + 18), sunY + Math.sin(angle) * (sunRadius + 18));
      ctx.stroke();
    }
    ctx.restore();

    // Ground Profile
    const groundY = h * 0.68;
    ctx.fillStyle = isDark ? '#0A130C' : '#334155';
    ctx.fillRect(0, groundY, w, h - groundY);

    // Soil Topsoil Layer
    const soilGrad = ctx.createLinearGradient(0, groundY, 0, h);
    soilGrad.addColorStop(0, isDark ? '#142517' : '#D1D5DB');
    soilGrad.addColorStop(1, isDark ? '#050D08' : '#94A3B8');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, groundY, w, h - groundY);

    // Draw Dynamic Shadows beneath panels
    const shadowOffset = (sunX - w * 0.5) * 0.35;
    ctx.save();
    ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(w * 0.35 + shadowOffset, groundY + 4, 90 + Math.abs(state.currentTilt) * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.65 + shadowOffset, groundY + 4, 90 + Math.abs(state.currentTilt) * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Crops Beneath Canopy
    drawCropRows(ctx, w, groundY, isDark, state.parRadiation, now);

    // Draw Agrivoltaic Solar Trackers
    drawAgrivoltaicTracker(ctx, w * 0.35, groundY, state.currentTilt, isDark);
    drawAgrivoltaicTracker(ctx, w * 0.65, groundY, state.currentTilt, isDark);

    // Draw On-Farm Facilities: Cold Storage & Utility Substation
    drawColdStorageFacility(ctx, w * 0.08, groundY, isDark, state.coldStoreLoad);
    drawUtilityGridSubstation(ctx, w * 0.90, groundY, isDark, state.vppExportKW);

    // Energy / Telemetry Particle Streams
    drawParticles(ctx, w, groundY, state.particles, isDark);

    // Update Telemetry Indicators on UI
    updateTelemetryUI(state);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

function drawAgrivoltaicTracker(ctx, x, groundY, tiltDegrees, isDark) {
  const pylonHeight = 110;
  const pivotY = groundY - pylonHeight;

  // Steel Pylon Column
  ctx.strokeStyle = isDark ? '#334155' : '#64748B';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, pivotY);
  ctx.stroke();

  // Foundation Base
  ctx.fillStyle = isDark ? '#1E293B' : '#475569';
  ctx.fillRect(x - 16, groundY - 6, 32, 10);

  // Motor / Actuator Gearbox Hub
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(x, pivotY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, pivotY, 12, 0, Math.PI * 2);
  ctx.stroke();

  // PV Module Array with Rotation
  ctx.save();
  ctx.translate(x, pivotY);
  ctx.rotate((tiltDegrees * Math.PI) / 180);

  // PV Mounting Rack
  const panelWidth = 140;
  const panelHeight = 12;

  // PV Panel Body
  const pvGrad = ctx.createLinearGradient(-panelWidth / 2, 0, panelWidth / 2, 0);
  pvGrad.addColorStop(0, '#0284C7');
  pvGrad.addColorStop(0.5, '#0369A1');
  pvGrad.addColorStop(1, '#0C4A6E');
  ctx.fillStyle = pvGrad;
  ctx.beginPath();
  ctx.roundRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 3);
  ctx.fill();

  // Solar Cell Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1;
  for (let c = -panelWidth / 2 + 18; c < panelWidth / 2; c += 22) {
    ctx.beginPath();
    ctx.moveTo(c, -panelHeight / 2);
    ctx.lineTo(c, panelHeight / 2);
    ctx.stroke();
  }

  // Actuator Telemetry Pulse
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(-panelWidth / 2 + 4, 0, 3, 0, Math.PI * 2);
  ctx.arc(panelWidth / 2 - 4, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCropRows(ctx, w, groundY, isDark, parRadiation, now) {
  const cropCount = 18;
  const cropSpacing = (w * 0.72) / cropCount;
  const startX = w * 0.14;

  ctx.save();
  for (let i = 0; i < cropCount; i++) {
    const cx = startX + i * cropSpacing;
    const cy = groundY;

    // Crop Stem
    ctx.strokeStyle = isDark ? '#15803D' : '#166534';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const sway = Math.sin(now * 0.002 + i) * 2;
    ctx.quadraticCurveTo(cx + sway, cy - 14, cx + sway * 1.5, cy - 28);
    ctx.stroke();

    // Leaves Canopy
    ctx.fillStyle = parRadiation > 1200 ? '#22C55E' : '#16A34A';
    ctx.beginPath();
    ctx.ellipse(cx - 6 + sway, cy - 22, 9, 5, -0.4, 0, Math.PI * 2);
    ctx.ellipse(cx + 6 + sway, cy - 24, 9, 5, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Photosynthetic Absorption Glow
    if (i % 3 === 0) {
      ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.beginPath();
      ctx.arc(cx + sway, cy - 32, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawColdStorageFacility(ctx, x, groundY, isDark, loadKW) {
  const width = 64;
  const height = 48;
  const topY = groundY - height;

  // Building
  ctx.fillStyle = isDark ? '#1E293B' : '#64748B';
  ctx.fillRect(x - width / 2, topY, width, height);

  // Chiller Intake Fan
  ctx.fillStyle = isDark ? '#0F172A' : '#334155';
  ctx.beginPath();
  ctx.arc(x, topY + 18, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, topY + 18, 11, 0, Math.PI * 2);
  ctx.stroke();

  // Cold store status badge
  ctx.fillStyle = '#06B6D4';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('COLD STORE', x, topY - 8);
  ctx.fillText(`${loadKW} kW`, x, topY + 38);
}

function drawUtilityGridSubstation(ctx, x, groundY, isDark, exportKW) {
  const height = 65;
  const topY = groundY - height;

  // Transmission Pylon Tower
  ctx.strokeStyle = isDark ? '#94A3B8' : '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 18, groundY);
  ctx.lineTo(x, topY);
  ctx.lineTo(x + 18, groundY);
  // Crossbeams
  ctx.moveTo(x - 22, topY + 22);
  ctx.lineTo(x + 22, topY + 22);
  ctx.moveTo(x - 16, topY + 42);
  ctx.lineTo(x + 16, topY + 42);
  ctx.stroke();

  // Grid Substation Indicator
  ctx.fillStyle = '#10B981';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VPP GRID DISPATCH', x, topY - 10);
  ctx.fillText(`+${exportKW} kW`, x, topY + 18);
}

function drawParticles(ctx, w, groundY, particles, isDark) {
  particles.forEach(p => {
    p.x += p.speed;
    if (p.x > 1) p.x = 0;

    const px = w * 0.1 + p.x * (w * 0.8);
    const py = groundY - 50 + Math.sin(p.x * Math.PI * 4 + p.offset) * 20;

    ctx.fillStyle = p.type === 'energy' ? 'rgba(245, 158, 11, 0.75)' : 'rgba(6, 182, 212, 0.75)';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function updateTelemetryUI(state) {
  const elTilt = document.getElementById('telemetry-tilt');
  const elPar = document.getElementById('telemetry-par');
  const elSoil = document.getElementById('telemetry-soil');
  const elCold = document.getElementById('telemetry-cold');
  const elPrice = document.getElementById('telemetry-price');
  const elExport = document.getElementById('telemetry-export');

  if (elTilt) elTilt.textContent = `${Math.round(state.currentTilt)}°`;
  if (elPar) elPar.textContent = `${state.parRadiation} μmol/m²`;
  if (elSoil) elSoil.textContent = `${state.soilMoisture}%`;
  if (elCold) elCold.textContent = `${state.coldStoreLoad} kW`;
  if (elPrice) elPrice.textContent = `$${state.gridSpotPrice} /MWh`;
  if (elExport) elExport.textContent = `${state.vppExportKW} kW`;
}

/* ==========================================================================
   Architecture Pipeline Step Tabs
   ========================================================================== */
function initPipelineTabs() {
  const tabs = document.querySelectorAll('.pipeline-step-tab');
  const panels = document.querySelectorAll('.pipeline-step-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetStep = tab.getAttribute('data-step');

      tabs.forEach(t => {
        t.classList.remove('border-emerald-500', 'bg-emerald-500/10', 'active-pipeline');
        t.classList.add('border-transparent');
      });
      tab.classList.add('border-emerald-500', 'bg-emerald-500/10', 'active-pipeline');
      tab.classList.remove('border-transparent');

      panels.forEach(panel => {
        if (panel.getAttribute('data-panel') === targetStep) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   Interactive ROI & Arbitrage Calculator
   ========================================================================== */
function initCalculator() {
  const mwSlider = document.getElementById('calc-mw-slider');
  const cropSelect = document.getElementById('calc-crop-select');
  const mwValueDisplay = document.getElementById('calc-mw-value');

  const elArbitrage = document.getElementById('calc-result-arbitrage');
  const elYield = document.getElementById('calc-result-yield');
  const elTotal = document.getElementById('calc-result-total');
  const elCo2 = document.getElementById('calc-result-co2');

  function calculate() {
    if (!mwSlider || !cropSelect) return;
    const mw = parseFloat(mwSlider.value);
    const cropMultiplier = parseFloat(cropSelect.value);

    if (mwValueDisplay) mwValueDisplay.textContent = `${mw.toFixed(1)} MW`;

    // Formulas
    // Base grid arbitrage: ~$84,000 / MW / year
    const annualArbitrage = Math.round(mw * 84200);
    // Yield protection & moisture savings: ~$32,000 / MW / year scaled by crop sensitivity
    const annualYieldValue = Math.round(mw * 32500 * cropMultiplier);
    const totalBenefit = annualArbitrage + annualYieldValue;
    // CO2 offset metric: ~1,120 tons per MW per year
    const co2Tons = Math.round(mw * 1120);

    if (elArbitrage) elArbitrage.textContent = `$${annualArbitrage.toLocaleString()}`;
    if (elYield) elYield.textContent = `$${annualYieldValue.toLocaleString()}`;
    if (elTotal) elTotal.textContent = `$${totalBenefit.toLocaleString()}`;
    if (elCo2) elCo2.textContent = `${co2Tons.toLocaleString()} metric tons/yr`;
  }

  if (mwSlider) mwSlider.addEventListener('input', calculate);
  if (cropSelect) cropSelect.addEventListener('change', calculate);
  calculate();

  // Pricing Billing Toggle (Monthly / Annual)
  const billingToggle = document.getElementById('billing-toggle');
  if (billingToggle) {
    billingToggle.addEventListener('change', (e) => {
      const isAnnual = e.target.checked;
      const pilotPrice = document.getElementById('price-pilot');
      const commercialPrice = document.getElementById('price-commercial');
      const enterprisePrice = document.getElementById('price-enterprise');
      const periodLabels = document.querySelectorAll('.price-period');

      if (isAnnual) {
        // 15% discount for annual commitment
        if (pilotPrice) pilotPrice.textContent = '$210';
        if (commercialPrice) commercialPrice.textContent = '$295';
        if (enterprisePrice) enterprisePrice.textContent = '$380';
        periodLabels.forEach(p => p.textContent = '/MW/mo (billed annually)');
      } else {
        if (pilotPrice) pilotPrice.textContent = '$249';
        if (commercialPrice) commercialPrice.textContent = '$349';
        if (enterprisePrice) enterprisePrice.textContent = '$449';
        periodLabels.forEach(p => p.textContent = '/MW/month');
      }
    });
  }
}

/* ==========================================================================
   Contact Form Handler
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-form-alert');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value || 'Partner';

      if (alertBox) {
        alertBox.innerHTML = `
          <div class="flex items-center gap-3 text-emerald-400">
            <span class="live-beacon"></span>
            <span>Thank you, <strong>${escapeHtml(name)}</strong>. Your technical site assessment inquiry has been queued. Our systems engineering team will reach out within 24 hours.</span>
          </div>
        `;
        alertBox.classList.remove('hidden');
      }

      form.reset();
      setTimeout(() => {
        if (alertBox) alertBox.classList.add('hidden');
      }, 7000);
    });
  }
}

function escapeHtml(string) {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
