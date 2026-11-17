---
layout: project-main
title: Haptic Knob
permalink: /projects/haptic-knob/
thumbnail: /assets/images/hapticknob/hapticknob_thumbnail.jpg
brief: Smart knob that emulates the force an electron would feel as it travels through a circuit.
description: Smart knob that emulates the force an electron would feel as it travels through a circuit.
goals: "<b>Hardware:</b> Design, assemble, and validate circuits through PCB design, component selection, and soldering.<br> <b>Firmware:</b> Develop real-time embedded control systems in C/C++ and RTOS, integrating encoder feedback, current sensing, and PID control for precise motor control."
ideas: "This project was inspired by the question: <i>“How can we understand electrical circuits through a mechanical perspective?”</i>"
objective: This project aims to develop a real-time haptic interface that translates electrical component behavior into physical torque feedback, allowing users to experience and interact with circuit dynamics. 
future: This device can be utilized in classroom environments as an educational tool for younger students to explore fundamental electrical concepts through hands-on interaction.
status-description: The Haptic Knob is split into a Firmware sub-project and a Hardware sub-project. Each page above covers how that half was designed and built.
github: https://github.com/Haptic-Knob-by-Open-Robotics/Haptic-Knob
order: 5
status: completed
wip: false
cad_models:
  - src: /assets/models/placeholder/haptic-knob-pcb-placeholder.glb
    title: Haptic Knob PCB (placeholder)
    caption: Stand-in model until the real PCB CAD export is ready.
    camera_orbit: "35deg 60deg auto"
---

<div class="md-content" markdown="1">

## How it works

Circuits are normally invisible. You measure them with probes and read plots on a screen. The Haptic Knob lets you **feel** them instead. As you turn a motorized knob, sensors measure how you are turning it, and the motor pushes back with a torque that behaves like the voltage across a real circuit element.

### The electrical-to-mechanical analogy

The knob works because every electrical quantity has a mechanical partner:

| Electrical | On the knob |
|---|---|
| Voltage | Torque (how hard the knob pushes back) |
| Current | Angular velocity (how fast you turn) |
| Charge | Angle (how far you turn) |
| Change in current | Angular acceleration (how quickly your speed changes) |

### Five circuit elements you can feel

- **Resistor:** the faster you turn, the harder it pushes back (T = R · ω). A higher resistance feels heavier at the same speed.
- **Capacitor:** it acts like a spring. The further you turn from the start, the harder it pulls back (T = θ / C). A smaller capacitance feels stiffer.
- **Inductor:** it resists changes in speed (T = L · α). Smooth, steady turning feels light, while sudden acceleration feels like hitting invisible inertia.
- **RLC circuit:** all three combined (T = R · ω + L · α + θ / C). With low resistance you feel the knob oscillate like a pendulum, and a higher resistance damps the oscillation out.
- **Diode:** it lets you turn one way with a small constant resistance, and blocks the other direction. The reverse torque is capped for safety.

### Under the hood

A brushless motor sits behind the knob. A magnetic encoder measures its angle, and the firmware estimates your turning speed and acceleration from it. A haptic model for the selected circuit element then computes how much motor current to apply. The motor is driven with field-oriented control, using a current-sense circuit and PID controllers to make the torque follow the command closely.

The fast motor loop runs at roughly 1 kHz, while the haptic model is updated at about 200 Hz. For the full breakdown, see the [Firmware page]({{ '/projects/hapticknob/firmware' | relative_url }}).

<div class="max-w-4xl mx-auto my-12">
  <img src="{{ '/assets/images/hapticknob/control-loops.svg' | relative_url }}"
       alt="Haptic Knob control loop diagram"
       class="w-full rounded-lg shadow-lg border border-gray-200 bg-white p-4">
  <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">Dual-loop control architecture: outer haptic model loop and inner current control loop.</p>
</div>

</div>
