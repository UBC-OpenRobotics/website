---
layout: project-detail
title: Hardware
permalink: /projects/hapticknob/hardware
thumbnail: /assets/images/hapticknob/hapticknob_thumbnail.jpg
description: The custom electronics and mechanical assembly that sense the knob's position, measure motor current, and drive the motor.
categories: electrical
wip: false
order: 2
---

<div class="md-content" markdown="1">

## Overview

The hardware turns a brushless motor into a precise torque source and gives the firmware accurate measurements of the knob position and motor current.

## Main parts

- **Brushless (BLDC) motor** with 7 pole pairs
- **Magnetic encoder (MT6701)** for the knob angle
- **External ADC (MCP3204)** for the motor phase currents, with 10 mΩ shunt-resistor current sensing and a gain-50 amplifier stage
- **ESP32-S3** microcontroller
- **6-PWM motor driver stage**

<div class="max-w-3xl mx-auto my-8">
  <img src="{{ '/assets/images/hapticknob/hapticknob_thumbnail.jpg' | relative_url }}"
       alt="Haptic Knob v.1 PCB and 3D-printed motor mount"
       class="w-full rounded-lg shadow-lg">
  <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">Haptic Knob v.1 custom PCB connected to the 3D-printed motor and knob assembly.</p>
</div>

</div>
