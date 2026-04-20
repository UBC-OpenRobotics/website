---
layout: control-level
title: "Control Systems - Level 3: Proportional Control"
permalink: /learn/control-systems/level-3
level_id: 3
level_title: "The P Term"
prev_level: /learn/control-systems/level-2
next_level: /learn/control-systems/level-4
enable_kp: true
success_spec: "Tune Kp so the mass reaches the setpoint and stays within ±0.05 for at least 2 seconds, with no more than 0.15 overshoot. Hint: somewhere around Kp = 3-5 tends to work on this plant."
sim_config:
  plant: { m: 1, b: 3 }
  controller: { type: "pid", kp: 0, ki: 0, kd: 0, uMax: 20 }
  setpoint: { kind: "step", args: [1, 0.5] }
  kpMin: 0
  kpMax: 15
  kp0: 0
  tWindow: 10
  trackRange: [-2, 2]
  success:
    maxError: 0.05
    maxOvershoot: 0.15
    evalWindow: 2
---

Proportional control makes the actuator effort proportional to the error:

<div class="control-eq">u(t) = Kp · e(t)          where  e(t) = setpoint − position</div>

The larger the error, the harder we push. As the plant approaches the
setpoint, the error shrinks and the effort tapers smoothly toward zero.

<br>

**Try it:**

- Start with **Kp = 1**. The mass drifts in lazily and settles short of the target.
- Crank Kp up. The response gets snappier — and eventually starts oscillating.
- There is a sweet spot.

<br>

Watch the trade-off: low Kp = slow and sluggish; high Kp = fast but oscillatory.
Nothing about this changes even with perfect, noise-free sensors — it's just how
a proportional controller behaves against an inertial plant.
