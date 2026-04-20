---
layout: control-level
title: "Control Systems - Level 2: Bang-Bang"
permalink: /learn/control-systems/level-2
level_id: 2
level_title: "Bang-Bang Control"
prev_level: /learn/control-systems/level-1
next_level: /learn/control-systems/level-3
enable_disturbance: true
success_spec: "Watch the response: the mass reaches the setpoint but then chatters around it forever. No amount of disturbance fooling will make it settle cleanly. This is why we need something smoother...the P controller, next."
sim_config:
  plant: { m: 1, b: 0.3 }
  controller: { type: "bangbang", uMax: 5, deadband: 0 }
  setpoint: { kind: "step", args: [1, 0.5] }
  tWindow: 10
  trackRange: [-2, 2]
---
**Note**: Bang-Bang Control, A.K.A. 2-step on-off controller. [See on Wikipedia](https://en.wikipedia.org/wiki/Bang%E2%80%93bang_control).

<br>

The simplest form of closed-loop control: look at the **error** (setpoint minus
position), and if it's positive, push hard forward; if negative, push hard back.

<div class="control-eq">u(t) = +u_max   if  e(t) > 0</div>
<div class="control-eq">u(t) = −u_max   if  e(t) < 0</div>

Press **Start**. The mass rushes to the setpoint - but overshoots, reverses,
overshoots again, and settles into a **limit cycle** around the target. The
control effort trace below shows the actuator slamming between +5 and -5.

Bang-bang is simple, cheap, and used in real systems (thermostats, for
instance). But it's noisy, wears out actuators, and never sits still. We can
do much better by making the effort *proportional* to how far off we are.
