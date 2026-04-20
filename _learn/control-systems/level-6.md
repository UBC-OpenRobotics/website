---
layout: control-level
title: "Control Systems - Level 6: Tuning Challenge"
permalink: /learn/control-systems/level-6
level_id: 6
level_title: "Tuning Challenge"
prev_level: /learn/control-systems/level-5
is_last_level: true
enable_kp: true
enable_ki: true
enable_kd: true
enable_disturbance: true
success_spec: "Second-order plant with inertia, friction, gravity, AND a spring pulling back to zero. Settle within ±0.05 of the setpoint. Once stable, try poking with the d slider - a well-tuned controller should reject the push."
sim_config:
  plant: { m: 1.5, b: 0.4, k: 1.2, g: 0.8 }
  controller: { type: "pid", kp: 0, ki: 0, kd: 0, uMax: 50, iMax: 30 }
  setpoint: { kind: "step", args: [1, 0.5] }
  kpMin: 0
  kpMax: 40
  kp0: 0
  kiMin: 0
  kiMax: 15
  ki0: 0
  kdMin: 0
  kdMax: 15
  kd0: 0
  tWindow: 12
  trackRange: [-2, 2]
  success:
    maxError: 0.05
    evalWindow: 2.5
---

Time to put all three terms together against a harder plant: a mass with
friction, gravity pulling down, *and* a spring that wants to drag everything
back to zero. The dynamics are now second-order with a resonance of its own.

<div class="control-eq">m·ẍ + b·ẋ + k·x = u − m·g + d</div>

A real-world tuning strategy:

1. Zero Ki and Kd. Raise Kp until the response is fast with manageable overshoot.
2. Add Kd to trim the overshoot — push Kp a little higher if you have headroom.
3. Add Ki to eliminate the steady-state offset caused by gravity + spring.
4. Iterate.

<br>

This is the classic **Ziegler-Nichols flavor** of manual tuning. Real
practitioners also look at rise time, phase margin, and disturbance rejection.

<br>

Once you've settled, drag the **d** slider to push the mass with an external
disturbance. A well-tuned PID rejects it; a poorly-tuned one oscillates or
drifts.
