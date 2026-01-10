SafeTrain360 - Warehouse Safety Training System

Overview
SafeTrain360 is an interactive 360-degree warehouse safety training web application prototype developed for the University of Sunderland CET257 Enterprise Project assessment. It demonstrates hazard perception and manual handling training modules for warehouse operatives.

Project Goals
Provide interactive safety training for warehouse workers with low technical skills
Demonstrate core functionality, user flow, and training logic
Create a demo-ready prototype suitable for client presentation

Key Features
Hazard Perception Module: Interactive warehouse scene with 5 clickable hazard hotspots (spillage, loose boxes, blocked exit, trailing cable, broken pallet)
Manual Handling Module: 4 scenarios teaching correct lifting techniques with posture selection
Score Tracking: JavaScript-based scoring across modules using sessionStorage
Accessibility: Large buttons, high contrast, minimal text, clear visual cues
Responsive Design: Works on desktop and mobile devices



Running the Application
first install nodejs on system from the official site of nodejs
then install all the package like:-
1. npm install express fs path https

first check the ip of your system
ipconfig - for windows
ifconfig - for linux

replace that in place of this 192.168.60.4



The application runs on port 5000 via the Express server:
to run the application 
node server.js

then open the url in browser