---
layout: control-level
title: "Control Systems - Level 1: Open Loop"
permalink: /learn/control-systems/level-1
level_id: 1
level_title: "Open Loop vs. Closed Loop"
next_level: /learn/control-systems/level-2
enable_disturbance: true
success_spec: "There is no feedback...no matter what disturbance you apply! The plant just drifts. Convince yourself this is hopeless 😔, then move to Level 2 where you can start closing the loop."
sim_config:
  plant: { m: 1, b: 0.2 }
  controller: { type: "none" }
  setpoint: { kind: "step", args: [1, 0.5] }
  disturbance: 0
  tWindow: 12
  trackRange: [-3, 3]
---

Imagine walking with your eyes closed and hoping you'll keep a straight line...
Probably not the best thing to do in front of the officer that's making you do a field sobriety test.

<br>

An **open-loop** system sends a fixed command to the plant and hopes for the best.
There is no sensor, no feedback, no correction. If anything pushes the plant off
course (wind, friction, payload changes) the system has no way to know and let
alone respond.

<br>

Here, we're trying to "go to 1". But we're not using feedback, so the
actuator output is **zero**. The mass just sits where it starts (or drifts if you
add a disturbance below).

<div class="control-eq">u(t) = 0          (no feedback, no correction!)</div>

Drag the **d** slider to push the mass around. No amount of commanding will
bring it back. That's the fundamental limitation of open-loop control, and
the motivation for **closed-loop** control, which we start in Level 2.
