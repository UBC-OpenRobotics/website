---
layout: project-main
title: "Haptic Exoskeleton and Teleoperated Robot Arm"
permalink: /projects/hetra/
thumbnail: /assets/images/hetra/hetra-architecture.png
brief: A teleoperated robot arm that mirrors the operator's movements and lets them feel what it grips.
description: "HETRA (Haptic Exoskeleton & Teleoperated Robot Arm) is a teleoperation system that lets an operator control a remote 6-DoF robot arm with their own arm and physically feel what it is holding. A wearable tracker turns the operator's arm movements into robot motion, and a haptic hand exoskeleton maps the robot's contact forces back onto the operator's fingers. The project explores human-robot interaction, haptics, and wearable exoskeletons."
goals: "HETRA gives students hands-on experience across the full robotics stack: <b>mechanical</b> design of wearable linkages, grippers, and robot joints, <b>electrical</b> work on custom PCBs, sensors, and motor control, <b>firmware</b> for haptic rendering and sensor fusion, and <b>software</b> for computer vision, inverse kinematics, ROS, and low-latency networking."
ideas: "Most teleoperation relies on vision alone, yet research shows haptic feedback leads to better force control, faster task completion, and fewer errors. HETRA brings the sense of touch to remote manipulation, which matters wherever direct human presence is dangerous or impossible, such as bomb disposal, space, and surgery."
objective: "Build a bilateral teleoperation system where the operator's movements drive the robot arm and the robot's contact forces are rendered back to the operator, fast and stable enough that touching a hard surface feels immediate."
future: "As the subsystems come together, the team will integrate them into a complete teleoperation system, with a live telemetry dashboard to monitor system health, sensor data, and tracking status."
github: https://github.com/UBC-OpenRobotics
order: 6
status: active
wip: false
---

<div class="max-w-4xl mx-auto mt-16">
  <h2 class="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-6 text-center">System Architecture</h2>
  <img src="{{ '/assets/images/hetra/hetra-architecture.png' | relative_url }}"
       alt="HETRA system-level architecture diagram"
       class="w-full rounded-lg shadow-lg border border-gray-200 dark:hidden">
  <img src="{{ '/assets/images/hetra/hetra-architecture-dark.png' | relative_url }}"
       alt="HETRA system-level architecture diagram"
       class="w-full rounded-lg shadow-lg border border-gray-700 hidden dark:block">
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