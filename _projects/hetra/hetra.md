---
layout: project-main
title: HETRA
permalink: /projects/hetra/
# TODO: swap for a real photo/render once you have one (e.g. /assets/images/hetra/hetra-thumbnail.jpg)
thumbnail: /assets/images/placeholders/default.svg
brief: A teleoperated robotic arm that mirrors the operator's hand and lets them feel what it grips.
description: "HETRA is a teleoperation system that lets an operator control a 6-DoF robotic arm with their own hand and physically feel what the robot is holding. The operator's hand position and orientation are tracked and mirrored by the arm in real time, a force-sensing gripper measures how hard the robot is gripping, and a wearable finger exoskeleton renders that grip force back to the operator as resistance and vibration."
goals: "HETRA gives students hands-on experience across the full robotics stack: <b>mechanical</b> design of a finger exoskeleton and force-sensing gripper, <b>electrical</b> and embedded work on sensors and actuators, <b>software</b> for hand tracking, inverse kinematics, and arm control, and a low-latency <b>communications</b> link that ties it all together."
# TODO: ask Nate what inspired the project, then uncomment and fill in
# ideas: ""
objective: "Build a bidirectional teleoperation system where operator motion drives the robot arm and robot contact forces are fed back to the operator, with latency and jitter low enough that the haptic feedback feels stable and natural."
future: "Later phases expand tracking to the operator's full arm posture and add an operator dashboard with live telemetry and data logging."
# TODO: add the GitHub repo link if there is one
# github: https://github.com/UBC-OpenRobotics/...
order: 6
status: active
wip: false
---

<div class="max-w-4xl mx-auto mt-16">
  <h2 class="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">System Architecture</h2>
  <img src="{{ '/assets/images/hetra/hetra-architecture.png' | relative_url }}"
       alt="HETRA system-level architecture diagram"
       class="w-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white">
</div>

<div class="max-w-4xl mx-auto mt-16 mb-8">
  <h2 class="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">Project Proposal</h2>
  <iframe src="{{ '/assets/docs/hetra/hetra-proposal.pdf' | relative_url }}"
          title="HETRA project proposal"
          class="w-full h-[80vh] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white"></iframe>
  <p class="text-center mt-6">
    <a href="{{ '/assets/docs/hetra/hetra-proposal.pdf' | relative_url }}"
       target="_blank" rel="noopener noreferrer"
       class="inline-block border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-6 rounded-lg transition-colors">
      OPEN PROPOSAL IN NEW TAB
    </a>
  </p>
</div>