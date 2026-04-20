// Control systems learning module. PID simulator + visualization.
// Exposes window.ControlSim for level pages and the sandbox.

(function () {
  'use strict';

  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

  class PIDController {
    constructor(opts = {}) {
      this.kp = opts.kp ?? 0;
      this.ki = opts.ki ?? 0;
      this.kd = opts.kd ?? 0;
      this.iMax = opts.iMax ?? 50;      // anti-windup cap on integral
      this.uMax = opts.uMax ?? 50;      // actuator saturation
      this.reset();
    }
    setGains({ kp, ki, kd }) {
      if (kp !== undefined) this.kp = kp;
      if (ki !== undefined) this.ki = ki;
      if (kd !== undefined) this.kd = kd;
    }
    reset() {
      this.integral = 0;
      this.prevError = 0;
      this.hasPrev = false;
    }
    step(error, dt) {
      this.integral = clamp(this.integral + error * dt, -this.iMax, this.iMax);
      const d = this.hasPrev ? (error - this.prevError) / dt : 0;
      this.prevError = error;
      this.hasPrev = true;
      const u = this.kp * error + this.ki * this.integral + this.kd * d;
      return clamp(u, -this.uMax, this.uMax);
    }
  }

  // Bang-bang controller: full positive or negative effort based on sign of error.
  class BangBangController {
    constructor(opts = {}) {
      this.uMax = opts.uMax ?? 20;
      this.deadband = opts.deadband ?? 0;
    }
    reset() { }
    step(error) {
      if (Math.abs(error) < this.deadband) return 0;
      return error > 0 ? this.uMax : -this.uMax;
    }
  }

  // 1D plant: mass with viscous friction, optional gravity and linear spring.
  // m * x'' = u - b * x' - k * x - m * g + disturbance
  class PointMass1D {
    constructor(opts = {}) {
      this.m = opts.m ?? 1;
      this.b = opts.b ?? 0.5;
      this.k = opts.k ?? 0;
      this.g = opts.g ?? 0;
      this.x0 = opts.x0 ?? 0;
      this.reset();
    }
    reset() {
      this.x = this.x0;
      this.v = 0;
    }
    step(u, dt, disturbance = 0) {
      const a = (u - this.b * this.v - this.k * this.x - this.m * this.g + disturbance) / this.m;
      this.v += a * dt;
      this.x += this.v * dt;
    }
  }

  // Setpoint waveforms. t is seconds since start.
  const setpointFns = {
    step: (amp = 1, tStart = 0.5) => t => t < tStart ? 0 : amp,
    ramp: (slope = 0.5, max = 2, tStart = 0.5) => t => t < tStart ? 0 : Math.min(max, slope * (t - tStart)),
    pulse: (amp = 1, tOn = 1, tOff = 3) => t => (t >= tOn && t < tOff) ? amp : 0,
    sine: (amp = 1, period = 4) => t => amp * Math.sin((2 * Math.PI * t) / period),
    constant: (amp = 1) => () => amp,
  };

  // Main simulation orchestrator. Manages plant, controller, setpoint,
  // disturbance, success evaluation, rendering, and animation loop.
  class Simulation {
    constructor(config) {
      this.config = config;
      this.dt = config.dt ?? 0.02;
      this.tWindow = config.tWindow ?? 10;   // seconds of history to plot
      this.tMax = config.tMax ?? Infinity;   // simulate indefinitely unless specified

      this.plant = new PointMass1D(config.plant || {});
      this.disturbance = config.disturbance ?? 0;

      const ctrl = config.controller ?? { type: 'pid' };
      if (ctrl.type === 'bangbang') {
        this.controller = new BangBangController(ctrl);
      } else if (ctrl.type === 'none') {
        this.controller = null;
      } else {
        this.controller = new PIDController(ctrl);
      }

      this.setpointFn = config.setpoint || setpointFns.step(1, 0.5);

      this.success = config.success || null;   // { maxError, maxOvershoot, settleTime, evalWindow }
      this.successAchieved = false;
      this.onSuccess = config.onSuccess || null;

      // Canvas for 1D track + plots.
      this.trackCanvas = config.trackCanvas;
      this.plotCanvas = config.plotCanvas;
      this.trackRange = config.trackRange ?? [-2, 2];

      this.reset();
    }

    setGains(g) {
      if (this.controller && this.controller.setGains) this.controller.setGains(g);
    }

    setDisturbance(d) { this.disturbance = d; }
    setSetpoint(fn) { this.setpointFn = fn; }

    reset() {
      this.t = 0;
      this.history = [];          // {t, sp, x, u, err}
      this.successAchieved = false;
      this.plant.reset();
      if (this.controller && this.controller.reset) this.controller.reset();
      this.render();
    }

    tick() {
      if (this.t >= this.tMax) return;
      const sp = this.setpointFn(this.t);
      const err = sp - this.plant.x;
      const u = this.controller ? this.controller.step(err, this.dt) : 0;
      this.plant.step(u, this.dt, this.disturbance);
      this.history.push({ t: this.t, sp, x: this.plant.x, u, err });
      // Trim history to window.
      const cutoff = this.t - this.tWindow;
      while (this.history.length && this.history[0].t < cutoff) this.history.shift();
      this.t += this.dt;
      this.evaluateSuccess();
    }

    evaluateSuccess() {
      if (!this.success || this.successAchieved) return;
      const evalWin = this.success.evalWindow ?? 2;
      if (this.t < evalWin + 0.5) return;
      const slice = this.history.filter(p => p.t >= this.t - evalWin);
      if (slice.length < 5) return;
      const maxAbsErr = Math.max(...slice.map(p => Math.abs(p.err)));
      if (this.success.maxError !== undefined && maxAbsErr > this.success.maxError) return;

      if (this.success.maxOvershoot !== undefined) {
        // Measure overshoot relative to the latest setpoint.
        const sp = slice[slice.length - 1].sp;
        // Look across the full history for peak on the setpoint side.
        const overshoot = Math.max(...this.history.map(p => {
          if (sp >= 0) return Math.max(0, p.x - sp);
          return Math.max(0, sp - p.x);
        }));
        if (overshoot > this.success.maxOvershoot) return;
      }

      if (this.success.settleTime !== undefined && this.t > this.success.settleTime) return;

      this.successAchieved = true;
      if (this.onSuccess) this.onSuccess();
    }

    start() {
      if (this.raf) return;
      this.lastWall = performance.now();
      const loop = (now) => {
        const wallDt = (now - this.lastWall) / 1000;
        this.lastWall = now;
        // Advance sim in fixed dt steps per wall-clock frame (up to 5 steps/frame).
        let steps = Math.min(5, Math.max(1, Math.round(wallDt / this.dt)));
        for (let i = 0; i < steps; i++) this.tick();
        this.render();
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    }

    pause() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = null;
    }

    isRunning() { return !!this.raf; }

    render() {
      this.renderTrack();
      this.renderPlot();
    }

    renderTrack() {
      const c = this.trackCanvas;
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);

      // Coord mapping: trackRange -> [pad, w-pad].
      const pad = 30;
      const [lo, hi] = this.trackRange;
      const xToPx = v => pad + ((v - lo) / (hi - lo)) * (w - 2 * pad);

      // Baseline.
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pad, h / 2);
      ctx.lineTo(w - pad, h / 2);
      ctx.stroke();

      // Tick marks.
      ctx.fillStyle = '#64748b';
      ctx.font = '11px ui-sans-serif, system-ui';
      ctx.textAlign = 'center';
      for (let v = Math.ceil(lo); v <= Math.floor(hi); v++) {
        const px = xToPx(v);
        ctx.beginPath();
        ctx.moveTo(px, h / 2 - 5);
        ctx.lineTo(px, h / 2 + 5);
        ctx.stroke();
        ctx.fillText(v.toString(), px, h / 2 + 22);
      }

      // Setpoint marker.
      const sp = this.setpointFn(this.t);
      const spPx = xToPx(clamp(sp, lo, hi));
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(spPx, 10);
      ctx.lineTo(spPx, h - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('setpoint', spPx, 10);

      // Ball at current x.
      const xVal = this.plant.x;
      const xPx = xToPx(clamp(xVal, lo, hi));
      const isOut = xVal < lo || xVal > hi;
      ctx.fillStyle = isOut ? '#f59e0b' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(xPx, h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px ui-sans-serif';
      ctx.fillText(xVal.toFixed(2), xPx, h / 2 + 4);

      // Disturbance arrow.
      if (Math.abs(this.disturbance) > 0.001) {
        const arrowMag = Math.min(40, Math.abs(this.disturbance) * 10);
        const dir = this.disturbance > 0 ? 1 : -1;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(xPx, h / 2 - 30);
        ctx.lineTo(xPx + dir * arrowMag, h / 2 - 30);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(xPx + dir * arrowMag, h / 2 - 30);
        ctx.lineTo(xPx + dir * (arrowMag - 6), h / 2 - 34);
        ctx.lineTo(xPx + dir * (arrowMag - 6), h / 2 - 26);
        ctx.closePath();
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.font = '11px ui-sans-serif';
        ctx.fillText('disturbance', xPx + dir * arrowMag / 2, h / 2 - 40);
      }

      // Success banner.
      if (this.successAchieved) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px ui-sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Target met! Success!', w / 2, 19);
      }
    }

    renderPlot() {
      const c = this.plotCanvas;
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width, h = c.height;
      ctx.clearRect(0, 0, w, h);

      const pad = { l: 40, r: 12, t: 12, b: 22 };
      const plotW = w - pad.l - pad.r;
      const plotHTotal = h - pad.t - pad.b;
      const plotH1 = plotHTotal * 0.62;      // position plot
      const plotH2 = plotHTotal * 0.32;      // control-effort plot
      const gap = plotHTotal * 0.06;

      // Compute time bounds.
      const t0 = this.t - this.tWindow;
      const t1 = this.t;

      // Compute y bounds for position plot.
      const xs = this.history.map(p => p.x);
      const sps = this.history.map(p => p.sp);
      let yMin = Math.min(-0.2, ...xs, ...sps);
      let yMax = Math.max(0.2, ...xs, ...sps);
      const yPad = Math.max(0.2, (yMax - yMin) * 0.1);
      yMin -= yPad; yMax += yPad;

      const tToPx = t => pad.l + ((t - t0) / (t1 - t0)) * plotW;
      const yToPx = y => pad.t + ((yMax - y) / (yMax - yMin)) * plotH1;

      // Plot area backgrounds.
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(pad.l, pad.t, plotW, plotH1);
      ctx.fillRect(pad.l, pad.t + plotH1 + gap, plotW, plotH2);

      // Axes.
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad.l, pad.t, plotW, plotH1);
      ctx.strokeRect(pad.l, pad.t + plotH1 + gap, plotW, plotH2);

      // Zero line in position plot.
      if (yMin < 0 && yMax > 0) {
        ctx.strokeStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(pad.l, yToPx(0));
        ctx.lineTo(pad.l + plotW, yToPx(0));
        ctx.stroke();
      }

      // Y-axis labels for position.
      ctx.fillStyle = '#64748b';
      ctx.font = '10px ui-sans-serif, system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(yMax.toFixed(1), pad.l - 4, pad.t + 10);
      ctx.fillText(yMin.toFixed(1), pad.l - 4, pad.t + plotH1 - 2);
      ctx.save();
      ctx.translate(12, pad.t + plotH1 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('position', 0, 0);
      ctx.restore();

      // X-axis label.
      ctx.textAlign = 'center';
      ctx.fillText('time (s)', pad.l + plotW / 2, h - 4);

      if (this.history.length < 2) return;

      // Setpoint trace (dashed red).
      ctx.strokeStyle = '#ef4444';
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      this.history.forEach((p, i) => {
        const px = tToPx(p.t), py = yToPx(p.sp);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // Position trace (solid blue).
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this.history.forEach((p, i) => {
        const px = tToPx(p.t), py = yToPx(p.x);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Legend.
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(pad.l + plotW - 120, pad.t + 6, 10, 2);
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.font = '10px ui-sans-serif';
      ctx.fillText('setpoint', pad.l + plotW - 106, pad.t + 10);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(pad.l + plotW - 60, pad.t + 6, 10, 2);
      ctx.fillStyle = '#64748b';
      ctx.fillText('position', pad.l + plotW - 46, pad.t + 10);

      // Control-effort plot.
      const us = this.history.map(p => p.u);
      const uMax = Math.max(1, ...us.map(Math.abs));
      const uTop = pad.t + plotH1 + gap;
      const uYToPx = y => uTop + ((uMax - y) / (2 * uMax)) * plotH2;

      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(pad.l, uYToPx(0));
      ctx.lineTo(pad.l + plotW, uYToPx(0));
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'right';
      ctx.fillText(uMax.toFixed(1), pad.l - 4, uTop + 8);
      ctx.fillText((-uMax).toFixed(1), pad.l - 4, uTop + plotH2 - 2);
      ctx.save();
      ctx.translate(12, uTop + plotH2 / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText('u(t)', 0, 0);
      ctx.restore();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      this.history.forEach((p, i) => {
        const px = tToPx(p.t), py = uYToPx(p.u);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }
  }

  // Attach gain sliders + readouts. Returns a function to update current gains.
  function bindGainSliders(sim, spec) {
    // spec: [{ id, label, min, max, step, value, key (kp|ki|kd), disabled }]
    spec.forEach(s => {
      const slider = document.getElementById(s.id);
      const readout = document.getElementById(s.id + '-val');
      if (!slider) return;
      slider.min = s.min; slider.max = s.max; slider.step = s.step;
      slider.value = s.value;
      if (readout) readout.textContent = (+s.value).toFixed(2);
      if (s.disabled) slider.disabled = true;
      sim.setGains({ [s.key]: +s.value });
      slider.addEventListener('input', () => {
        const v = +slider.value;
        if (readout) readout.textContent = v.toFixed(2);
        sim.setGains({ [s.key]: v });
      });
    });
  }

  function bindButtons(sim, ids) {
    const startBtn = document.getElementById(ids.start);
    const pauseBtn = document.getElementById(ids.pause);
    const resetBtn = document.getElementById(ids.reset);

    function refreshLabels() {
      if (startBtn) startBtn.textContent = sim.isRunning() ? 'Running' : 'Start';
      if (startBtn) startBtn.disabled = sim.isRunning();
      if (pauseBtn) pauseBtn.disabled = !sim.isRunning();
    }

    if (startBtn) startBtn.addEventListener('click', () => { sim.start(); refreshLabels(); });
    if (pauseBtn) pauseBtn.addEventListener('click', () => { sim.pause(); refreshLabels(); });
    if (resetBtn) resetBtn.addEventListener('click', () => { sim.pause(); sim.reset(); refreshLabels(); });
    refreshLabels();
  }

  window.ControlSim = {
    PIDController, BangBangController, PointMass1D, Simulation,
    setpointFns, bindGainSliders, bindButtons,
  };
})();
