# CPU-Process-Scheduler
A comprehensive web-based simulator for visualizing and comparing different CPU scheduling algorithms with an intuitive graphical interface.

🚀 Features
📊 Supported Scheduling Algorithms
FCFS (First Come First Serve) - Non-preemptive

SJF (Shortest Job First) - Non-preemptive

SRTF (Shortest Remaining Time First) - Preemptive

Priority Scheduling - Both preemptive and non-preemptive versions

Round Robin - Preemptive with configurable time quantum

🎨 User Interface Features
Responsive Design - Works seamlessly on desktop, tablet, and mobile devices

Dark/Light Theme - Toggle between themes with persistent preferences

Interactive Gantt Chart - Visual timeline of process execution

Real-time Metrics - Comprehensive performance analysis

Animated Elements - Smooth transitions and hover effects

Carousel Interface - Algorithm overview with smooth navigation

Export Functionality - Download results as CSV files

📈 Performance Metrics
Turnaround Time

Waiting Time

Response Time

CPU Utilization

Start and Completion Times

📖 How to Use
1. Configure Algorithm
Select your desired scheduling algorithm from the dropdown

Configure time quantum for Round Robin if needed

View algorithm description and requirements

2. Add Processes
Manual Entry: Fill in Process ID, Arrival Time, Burst Time, and Priority

Load Sample: Pre-loaded sample processes for quick testing

Clear All: Remove all processes and start fresh

3. Run Simulation
Click "Run Simulation" to execute the selected algorithm

View real-time Gantt chart visualization

Analyze comprehensive performance metrics

4. Export Results
Download simulation results as CSV for further analysis

Includes all process data and calculated metrics

🎯 Algorithm Details
First Come First Serve (FCFS)
Type: Non-preemptive

Description: Processes are executed in order of arrival

Best For: Simple systems with similar process burst times

Shortest Job First (SJF)
Type: Non-preemptive

Description: Executes shortest jobs first to minimize waiting time

Best For: Batch systems where burst times are known

Shortest Remaining Time First (SRTF)
Type: Preemptive

Description: Preemptive version of SJF that can interrupt running processes

Best For: Interactive systems requiring quick response

Priority Scheduling
Non-preemptive: Higher priority processes run to completion

Preemptive: Higher priority processes can preempt lower ones

Note: Lower priority number indicates higher priority

Round Robin (RR)
Type: Preemptive

Description: Each process gets a fixed time quantum

Best For: Time-sharing systems and general-purpose OS

🔧 Technical Implementation
Frontend Technologies
HTML5 - Semantic structure and accessibility

CSS3 - Modern styling with CSS variables and Grid/Flexbox

Vanilla JavaScript - No external dependencies

Key Features
Modular Design - Clean separation of concerns

Responsive Layout - Mobile-first approach

Progressive Enhancement - Works without JavaScript

Accessibility - WCAG compliant with ARIA labels

Happy Scheduling! 🎉
