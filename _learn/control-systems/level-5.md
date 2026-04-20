---
layout: control-level
title: "Control Systems - Level 5: Derivative Control"
permalink: /learn/control-systems/level-5
level_id: 5
level_title: "The D Term"
prev_level: /learn/control-systems/level-4
next_level: /learn/control-systems/level-6
enable_kp: true
enable_ki: true
enable_kd: true
success_spec: "Get to the setpoint (±0.05) with less than 0.12 overshoot, tighter than Level 3 allowed. Hint: crank Kp high (say 20) for snappy response, then add Kd (say 5-6) to suppress the overshoot."
sim_config:
  plant: { m: 1, b: 0.2 }
  controller: { type: "pid", kp: 0, ki: 0, kd: 0, uMax: 40, iMax: 20 }
  setpoint: { kind: "step", args: [1, 0.5] }
  kpMin: 0
  kpMax: 30
  kp0: 0
  kiMin: 0
  kiMax: 8
  ki0: 0
  kdMin: 0
  kdMax: 10
  kd0: 0
  tWindow: 8
  trackRange: [-2, 2]
  success:
    maxError: 0.05
    maxOvershoot: 0.12
    evalWindow: 1.5
---

The **derivative** term looks at how fast the error is changing. If the error
is shrinking rapidly, the mass is about to blow past the target — so the D
term pulls back to damp the approach.

<div class="control-eq">u(t) = Kp · e(t)  +  Ki · ∫ e(t) dt  +  Kd · de(t)/dt</div>

Intuitively: **Kp** reacts to *where* you are. **Ki** reacts to *where you've
been*. **Kd** reacts to *where you're heading*.

**Try it:**

- Set Kp high (say 15). See the big overshoot.
- Add Kd gradually. The overshoot flattens out, but the response stays quick.
- Too much Kd: the system becomes over-damped and sluggish, or starts reacting
  to noise (in real life — here there is no sensor noise).

Derivative is the most delicate term. In real hardware, noisy encoders can
make `de/dt` explode; engineers often filter the derivative or differentiate
the *measurement* rather than the error.
