---
layout: project-detail
title: Firmware
permalink: /projects/hapticknob/firmware
thumbnail: /assets/images/hapticknob/control-loops.svg
description: Real-time motor control firmware that turns a brushless motor into a knob that feels like a resistor, capacitor, inductor, RLC circuit or diode.
categories: software
wip: false
order: 1
---

<div class="md-content" markdown="1">

## Overview

The firmware runs on an ESP32-S3 and is written in C++ with PlatformIO, the Arduino framework, FreeRTOS and the SimpleFOC motor control library. Its job is to read how the user turns the knob and respond with the right torque, fast enough that the knob feels like a real physical object.

## What it talks to

- **Magnetic encoder (MT6701):** measures the knob angle over an SPI-based SSI interface.
- **External current-sense ADC (MCP3204):** reads the motor's phase currents over SPI.
- **6-PWM BLDC motor driver:** drives the brushless motor, which has 7 pole pairs.

## Control architecture

The control task runs two loops at different speeds:

1. **Fast motor loop (about 1 kHz):** reads the encoder and the phase currents, runs field-oriented control (FOC) with PID current controllers, and applies the latest torque command to the motor.
2. **Haptic model loop (about 200 Hz):** looks at the filtered velocity and acceleration, and computes the motor current needed for the selected circuit element. The fast loop then tracks that command.

## Haptic models

Each circuit element has its own model: resistor, capacitor, inductor, series RLC and diode. A few details keep them feeling smooth:

- Velocity and acceleration are low-pass filtered so encoder noise does not turn into rough torque.
- Small deadbands stop the knob from buzzing or twitching when it is held still.
- The RLC model keeps a simulated circuit state that settles back to zero when the knob is left alone.

## Tasks and safety

Besides the high-priority control task, a low-rate telemetry task (about 50 Hz) streams state over USB serial, and a watchdog task (about 20 Hz) checks that the control loop is still running. On a fault, such as a stalled control loop or an invalid sensor reading, the system latches the fault and disables the motor.

## Tuning tools

The repository includes Python tools for tuning the knob live over USB serial: a GUI for adjusting haptic parameters and a PID tuner that plots phase currents and how closely the measured torque current tracks the command.

## Tech stack

C++, PlatformIO, Arduino, FreeRTOS, SimpleFOC, and Python (Tkinter, matplotlib, pyserial) for the tools.

The source code is on [GitHub](https://github.com/Haptic-Knob-by-Open-Robotics/Haptic-Knob).

</div>
