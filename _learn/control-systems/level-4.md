---
layout: control-level
title: "Control Systems - Level 4: Integral Control"
permalink: /learn/control-systems/level-4
level_id: 4
level_title: "The I Term"
prev_level: /learn/control-systems/level-3
next_level: /learn/control-systems/level-5
enable_kp: true
enable_ki: true
success_spec: "Bring the mass to the setpoint (±0.05) and hold it there for 2 seconds despite gravity pulling it down. Try Kp around 4 and Ki around 0.8, and let the sim run for a few seconds so the integrator has time to work."
sim_config:
  plant: { m: 1, b: 0.6, g: 1.5 }
  controller: { type: "pid", kp: 0, ki: 0, kd: 0, uMax: 30, iMax: 20 }
  setpoint: { kind: "step", args: [1, 0.5] }
  kpMin: 0
  kpMax: 15
  kp0: 0
  kiMin: 0
  kiMax: 8
  ki0: 0
  tWindow: 12
  trackRange: [-2, 2]
  success:
    maxError: 0.05
    evalWindow: 2
---

The plant in this level has **gravity** pulling the mass down. With only a
proportional controller, the mass settles at some point *below* the setpoint:
once you're there, the residual error generates just enough upward force to
balance gravity. The P controller can't eliminate this **steady-state error**
without infinite gain.

Enter the **integral** term. It accumulates error over time:

<div class="control-eq">u(t) = Kp · e(t)  +  Ki · ∫ e(t) dt</div>

As long as there's *any* nonzero error, the integral keeps growing and pumping
up the command. The only steady state is one where `e = 0` — exactly what we
want.

**Try it:**

- Set Kp = 4, Ki = 0. Watch the mass settle below the setpoint.
- Slowly raise Ki. The steady-state error vanishes.
- Raise Ki too far: oscillation and sluggish overshoot (the integral
  accumulates too much before the error flips).

*Aside — integral windup:* if the actuator is saturated for a long time, the
integral can grow huge and cause massive overshoot later. Real implementations
clamp the integral (we do, via `iMax`).
