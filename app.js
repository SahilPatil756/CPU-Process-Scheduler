class CPUScheduler {
    constructor() {
        this.processes = [];
        this.currentAlgorithm = 'fcfs';
        this.timeQuantum = 3;
        this.processColors = [
            '#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F',
            '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'
        ];
        this.algorithmData = {
            fcfs: { name: 'First Come First Serve (FCFS)', description: 'Non-preemptive algorithm where processes are executed in order of arrival', needsPriority: false, needsQuantum: false },
            sjf: { name: 'Shortest Job First (SJF)', description: 'Non-preemptive algorithm that executes shortest jobs first', needsPriority: false, needsQuantum: false },
            srtf: { name: 'Shortest Remaining Time First (SRTF)', description: 'Preemptive version of SJF that can interrupt running processes', needsPriority: false, needsQuantum: false },
            priority: { name: 'Priority Scheduling (Non-Preemptive)', description: 'Non-preemptive algorithm that executes highest priority processes first', needsPriority: true, needsQuantum: false },
            priority_preemptive: { name: 'Priority Scheduling (Preemptive)', description: 'Preemptive priority scheduling that can interrupt lower priority processes', needsPriority: true, needsQuantum: false },
            rr: { name: 'Round Robin (RR)', description: 'Preemptive algorithm with fixed time quantum for fair scheduling', needsPriority: false, needsQuantum: true }
        };
        this.lastResults = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateAlgorithmInfo();
        this.updateProcessCount();
    }

    bindEvents() {
        const algorithmSelect = document.getElementById('algorithm-select');
        if (algorithmSelect) {
            algorithmSelect.addEventListener('change', (e) => {
                this.currentAlgorithm = e.target.value;
                this.updateAlgorithmInfo();
            });
        }

        const timeQuantumInput = document.getElementById('time-quantum');
        if (timeQuantumInput) {
            timeQuantumInput.addEventListener('input', (e) => {
                this.timeQuantum = parseInt(e.target.value) || 3;
            });
        }

        const processForm = document.getElementById('process-form');
        if (processForm) {
            processForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProcess();
            });
        }

        const loadSampleBtn = document.getElementById('load-sample');
        if (loadSampleBtn) {
            loadSampleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadSampleProcesses();
            });
        }

        const clearAllBtn = document.getElementById('clear-all');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearAllProcesses();
            });
        }

        const simulateBtn = document.getElementById('simulate-btn');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.runSimulation();
            });
        }

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportResults();
            });
        }
    }

    updateAlgorithmInfo() {
        const algo = this.algorithmData[this.currentAlgorithm];
        const descElement = document.getElementById('algorithm-desc');
        if (descElement) {
            descElement.textContent = algo.description;
        }
        
        const priorityGroup = document.getElementById('priority-group');
        if (priorityGroup) {
            if (algo.needsPriority) {
                priorityGroup.classList.remove('hidden');
            } else {
                priorityGroup.classList.add('hidden');
            }
        }

        const quantumGroup = document.getElementById('quantum-group');
        if (quantumGroup) {
            if (algo.needsQuantum) {
                quantumGroup.classList.remove('hidden');
            } else {
                quantumGroup.classList.add('hidden');
            }
        }

        this.updateProcessList();
    }

    addProcess() {
        const processIdInput = document.getElementById('process-id');
        const arrivalTimeInput = document.getElementById('arrival-time');
        const burstTimeInput = document.getElementById('burst-time');
        const priorityInput = document.getElementById('priority');

        if (!processIdInput || !arrivalTimeInput || !burstTimeInput) {
            this.showError('Form elements not found');
            return;
        }

        const processId = processIdInput.value.trim();
        const arrivalTime = parseInt(arrivalTimeInput.value);
        const burstTime = parseInt(burstTimeInput.value);
        const priority = priorityInput ? parseInt(priorityInput.value) || 1 : 1;

        if (!processId) {
            this.showError('Process ID is required');
            return;
        }

        if (this.processes.find(p => p.id === processId)) {
            this.showError('Process ID already exists');
            return;
        }

        if (isNaN(arrivalTime) || arrivalTime < 0) {
            this.showError('Arrival time must be a non-negative number');
            return;
        }

        if (isNaN(burstTime) || burstTime < 1) {
            this.showError('Burst time must be a positive number');
            return;
        }

        const process = {
            id: processId,
            arrivalTime: arrivalTime,
            burstTime: burstTime,
            priority: priority,
            originalBurstTime: burstTime,
            color: this.processColors[this.processes.length % this.processColors.length]
        };

        this.processes.push(process);
        this.updateProcessList();
        this.updateProcessCount();
        this.resetForm();
        this.clearResults();
        
        console.log('Process added:', process);
    }

    deleteProcess(processId) {
        this.processes = this.processes.filter(p => p.id !== processId);
        this.updateProcessList();
        this.updateProcessCount();
        this.clearResults();
    }

    clearAllProcesses() {
        this.processes = [];
        this.updateProcessList();
        this.updateProcessCount();
        this.clearResults();
    }

    loadSampleProcesses() {
        this.clearAllProcesses();
        const sampleProcesses = [
            {id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2},
            {id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1},
            {id: 'P3', arrivalTime: 2, burstTime: 8, priority: 3},
            {id: 'P4', arrivalTime: 3, burstTime: 6, priority: 2}
        ];

        sampleProcesses.forEach((p, index) => {
            this.processes.push({
                ...p,
                originalBurstTime: p.burstTime,
                color: this.processColors[index % this.processColors.length]
            });
        });

        this.updateProcessList();
        this.updateProcessCount();
        console.log('Sample processes loaded:', this.processes);
    }

    updateProcessList() {
        const container = document.getElementById('process-list');
        if (!container) return;

        const algo = this.algorithmData[this.currentAlgorithm];
        
        if (this.processes.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No processes added yet. Add processes using the form above.</p></div>';
            return;
        }

        const html = this.processes.map((process, index) => `
            <div class="process-item">
                <div class="process-info">
                    <div class="process-id" style="color: ${process.color};">${process.id}</div>
                    <div class="process-details">
                        <div class="process-detail">
                            <div class="process-detail-label">Arrival</div>
                            <div class="process-detail-value">${process.arrivalTime}</div>
                        </div>
                        <div class="process-detail">
                            <div class="process-detail-label">Burst</div>
                            <div class="process-detail-value">${process.burstTime}</div>
                        </div>
                        ${algo.needsPriority ? `
                        <div class="process-detail">
                            <div class="process-detail-label">Priority</div>
                            <div class="process-detail-value">${process.priority}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <button class="btn btn--outline btn--sm delete-process" onclick="window.scheduler.deleteProcess('${process.id}')">
                    Delete
                </button>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateProcessCount() {
        const count = this.processes.length;
        const countElement = document.getElementById('process-count');
        const simulateBtn = document.getElementById('simulate-btn');
        
        if (countElement) {
            countElement.textContent = `${count} process${count !== 1 ? 'es' : ''}`;
        }

        if (simulateBtn) {
            simulateBtn.disabled = count === 0;
        }
    }

    resetForm() {
        const processForm = document.getElementById('process-form');
        if (processForm) {
            processForm.reset();
            
            const arrivalTimeInput = document.getElementById('arrival-time');
            const burstTimeInput = document.getElementById('burst-time');
            const priorityInput = document.getElementById('priority');
            
            if (arrivalTimeInput) arrivalTimeInput.value = '0';
            if (burstTimeInput) burstTimeInput.value = '1';
            if (priorityInput) priorityInput.value = '1';
        }
    }

    runSimulation() {
        if (this.processes.length === 0) {
            this.showError('Please add at least one process');
            return;
        }

        if (this.currentAlgorithm === 'rr' && (this.timeQuantum < 1 || isNaN(this.timeQuantum))) {
            this.showError('Please enter a valid time quantum for Round Robin');
            return;
        }

        this.processes.forEach(p => {
            p.burstTime = p.originalBurstTime;
            p.completionTime = 0;
            p.startTime = -1;
            p.waitingTime = 0;
            p.turnaroundTime = 0;
            p.responseTime = 0;
        });

        let result;
        try {
            switch (this.currentAlgorithm) {
                case 'fcfs':
                    result = this.scheduleFCFS();
                    break;
                case 'sjf':
                    result = this.scheduleSJF();
                    break;
                case 'srtf':
                    result = this.scheduleSRTF();
                    break;
                case 'priority':
                    result = this.schedulePriority(false);
                    break;
                case 'priority_preemptive':
                    result = this.schedulePriority(true);
                    break;
                case 'rr':
                    result = this.scheduleRoundRobin();
                    break;
                default:
                    throw new Error('Unknown algorithm');
            }

            this.lastResults = result;
            this.displayResults(result);
            console.log('Simulation completed:', result);
        } catch (error) {
            console.error('Simulation error:', error);
            this.showError('Simulation failed: ' + error.message);
        }
    }

    scheduleFCFS() {
        const processes = [...this.processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
        const timeline = [];
        let currentTime = 0;

        processes.forEach(process => {
            if (currentTime < process.arrivalTime) {
                timeline.push({ type: 'idle', start: currentTime, end: process.arrivalTime, duration: process.arrivalTime - currentTime });
                currentTime = process.arrivalTime;
            }

            process.startTime = currentTime;
            process.completionTime = currentTime + process.burstTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            process.waitingTime = process.turnaroundTime - process.originalBurstTime;
            process.responseTime = process.startTime - process.arrivalTime;

            timeline.push({
                type: 'process',
                processId: process.id,
                start: currentTime,
                end: process.completionTime,
                duration: process.burstTime,
                color: process.color
            });

            currentTime = process.completionTime;
        });

        return { timeline, processes };
    }

    scheduleSJF() {
        const processes = [...this.processes];
        const timeline = [];
        const completed = [];
        let currentTime = 0;

        while (completed.length < processes.length) {
            const available = processes.filter(p => 
                p.arrivalTime <= currentTime && !completed.includes(p)
            );

            if (available.length === 0) {
                const nextArrival = Math.min(...processes.filter(p => !completed.includes(p)).map(p => p.arrivalTime));
                timeline.push({ type: 'idle', start: currentTime, end: nextArrival, duration: nextArrival - currentTime });
                currentTime = nextArrival;
                continue;
            }

            const shortestJob = available.reduce((min, p) => p.burstTime < min.burstTime ? p : min);
            
            shortestJob.startTime = currentTime;
            shortestJob.completionTime = currentTime + shortestJob.burstTime;
            shortestJob.turnaroundTime = shortestJob.completionTime - shortestJob.arrivalTime;
            shortestJob.waitingTime = shortestJob.turnaroundTime - shortestJob.originalBurstTime;
            shortestJob.responseTime = shortestJob.startTime - shortestJob.arrivalTime;

            timeline.push({
                type: 'process',
                processId: shortestJob.id,
                start: currentTime,
                end: shortestJob.completionTime,
                duration: shortestJob.burstTime,
                color: shortestJob.color
            });

            currentTime = shortestJob.completionTime;
            completed.push(shortestJob);
        }

        return { timeline, processes };
    }

    scheduleSRTF() {
        const processes = [...this.processes];
        const timeline = [];
        let currentTime = 0;
        let completed = 0;

        const addTimelineBlock = (block) => {
            const lastBlock = timeline[timeline.length - 1];
            if (
                lastBlock &&
                lastBlock.type === block.type &&
                lastBlock.end === block.start &&
                (
                    (block.type === 'process' && lastBlock.processId === block.processId) ||
                    block.type === 'idle'
                )
            ) {
                lastBlock.end = block.end;
                lastBlock.duration += block.duration;
                return;
            }
            timeline.push(block);
        };

        processes.forEach(p => {
            p.remainingTime = p.burstTime;
            p.startTime = undefined;
            p.responseTime = 0;
        });

        while (completed < processes.length) {
            const available = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

            if (available.length === 0) {
                const nextArrival = Math.min(...processes.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
                addTimelineBlock({
                    type: 'idle',
                    start: currentTime,
                    end: nextArrival,
                    duration: nextArrival - currentTime
                });
                currentTime = nextArrival;
                continue;
            }

            const shortestRemaining = available.reduce((best, p) => {
                if (!best) return p;
                if (p.remainingTime !== best.remainingTime) {
                    return p.remainingTime < best.remainingTime ? p : best;
                }
                return p.arrivalTime < best.arrivalTime ? p : best;
            }, null);

            if (shortestRemaining.startTime === undefined) {
                shortestRemaining.startTime = currentTime;
                shortestRemaining.responseTime = currentTime - shortestRemaining.arrivalTime;
            }

            const nextTime = currentTime + 1;

            addTimelineBlock({
                type: 'process',
                processId: shortestRemaining.id,
                start: currentTime,
                end: nextTime,
                duration: 1,
                color: shortestRemaining.color
            });

            shortestRemaining.remainingTime--;
            currentTime = nextTime;

            if (shortestRemaining.remainingTime === 0) {
                shortestRemaining.completionTime = currentTime;
                shortestRemaining.turnaroundTime = shortestRemaining.completionTime - shortestRemaining.arrivalTime;
                shortestRemaining.waitingTime = shortestRemaining.turnaroundTime - shortestRemaining.originalBurstTime;
                completed++;
            }
        }

        return { timeline, processes };
    }

    schedulePriority(preemptive) {
        const processes = [...this.processes];
        const timeline = [];
        const completed = [];
        let currentTime = 0;

        if (preemptive) {
            processes.forEach(p => { 
                p.remainingTime = p.burstTime; 
                p.startTime = undefined;
                p.responseTime = 0;
            });
            let currentProcess = null;
            let blockStartTime = 0;

            while (completed.length < processes.length) {
                const available = processes.filter(p => 
                    p.arrivalTime <= currentTime && !completed.includes(p)
                );

                if (available.length === 0) {
                    const nextArrival = Math.min(...processes.filter(p => !completed.includes(p)).map(p => p.arrivalTime));
                    if (currentProcess) {
                        // Complete the current process block before going idle
                        timeline.push({
                            type: 'process',
                            processId: currentProcess.id,
                            start: blockStartTime,
                            end: currentTime,
                            duration: currentTime - blockStartTime,
                            color: currentProcess.color
                        });
                        currentProcess.remainingTime -= (currentTime - blockStartTime);
                        currentProcess = null;
                    }
                    timeline.push({ type: 'idle', start: currentTime, end: nextArrival, duration: nextArrival - currentTime });
                    currentTime = nextArrival;
                    continue;
                }

                const highestPriority = available.reduce((max, p) => 
                    p.priority < max.priority ? p : max
                );

                // If process changes, complete the previous block
                if (currentProcess && currentProcess !== highestPriority) {
                    timeline.push({
                        type: 'process',
                        processId: currentProcess.id,
                        start: blockStartTime,
                        end: currentTime,
                        duration: currentTime - blockStartTime,
                        color: currentProcess.color
                    });
                    currentProcess.remainingTime -= (currentTime - blockStartTime);
                    currentProcess = null;
                }

                // Start new process or continue current
                if (!currentProcess || currentProcess !== highestPriority) {
                    currentProcess = highestPriority;
                    blockStartTime = currentTime;
                    if (currentProcess.startTime === undefined) {
                        currentProcess.startTime = currentTime;
                        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
                    }
                }

                currentProcess.remainingTime--;
                currentTime++;

                if (currentProcess.remainingTime === 0) {
                    currentProcess.completionTime = currentTime;
                    currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                    currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.originalBurstTime;
                    
                    // Complete the final block
                    timeline.push({
                        type: 'process',
                        processId: currentProcess.id,
                        start: blockStartTime,
                        end: currentTime,
                        duration: currentTime - blockStartTime,
                        color: currentProcess.color
                    });

                    completed.push(currentProcess);
                    currentProcess = null;
                }
            }

            return { timeline: this.mergeTimelineBlocks(timeline), processes };
        } else {
            while (completed.length < processes.length) {
                const available = processes.filter(p => 
                    p.arrivalTime <= currentTime && !completed.includes(p)
                );

                if (available.length === 0) {
                    const nextArrival = Math.min(...processes.filter(p => !completed.includes(p)).map(p => p.arrivalTime));
                    timeline.push({ type: 'idle', start: currentTime, end: nextArrival, duration: nextArrival - currentTime });
                    currentTime = nextArrival;
                    continue;
                }

                const highestPriority = available.reduce((max, p) => 
                    p.priority < max.priority ? p : max
                );
                
                highestPriority.startTime = currentTime;
                highestPriority.completionTime = currentTime + highestPriority.burstTime;
                highestPriority.turnaroundTime = highestPriority.completionTime - highestPriority.arrivalTime;
                highestPriority.waitingTime = highestPriority.turnaroundTime - highestPriority.originalBurstTime;
                highestPriority.responseTime = highestPriority.startTime - highestPriority.arrivalTime;

                timeline.push({
                    type: 'process',
                    processId: highestPriority.id,
                    start: currentTime,
                    end: highestPriority.completionTime,
                    duration: highestPriority.burstTime,
                    color: highestPriority.color
                });

                currentTime = highestPriority.completionTime;
                completed.push(highestPriority);
            }

            return { timeline, processes };
        }
    }

    scheduleRoundRobin() {
        const processes = [...this.processes];
        const timeline = [];
        const queue = [];
        let currentTime = 0;
        let completed = 0;

        processes.forEach(p => { 
            p.remainingTime = p.burstTime; 
            p.firstExecution = true;
        });

        processes.filter(p => p.arrivalTime <= currentTime).forEach(p => queue.push(p));

        while (completed < processes.length) {
            if (queue.length === 0) {
                const nextArrival = Math.min(...processes.filter(p => p.remainingTime > 0).map(p => p.arrivalTime));
                timeline.push({ type: 'idle', start: currentTime, end: nextArrival, duration: nextArrival - currentTime });
                currentTime = nextArrival;
                processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0).forEach(p => {
                    if (!queue.includes(p)) queue.push(p);
                });
                continue;
            }

            const currentProcess = queue.shift();
            
            if (currentProcess.firstExecution) {
                currentProcess.startTime = currentTime;
                currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
                currentProcess.firstExecution = false;
            }

            const executionTime = Math.min(this.timeQuantum, currentProcess.remainingTime);
            currentProcess.remainingTime -= executionTime;

            timeline.push({
                type: 'process',
                processId: currentProcess.id,
                start: currentTime,
                end: currentTime + executionTime,
                duration: executionTime,
                color: currentProcess.color
            });

            currentTime += executionTime;

            processes.filter(p => 
                p.arrivalTime <= currentTime && 
                p.remainingTime > 0 && 
                !queue.includes(p) && 
                p !== currentProcess
            ).forEach(p => queue.push(p));

            if (currentProcess.remainingTime > 0) {
                queue.push(currentProcess);
            } else {
                currentProcess.completionTime = currentTime;
                currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
                currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.originalBurstTime;
                completed++;
            }
        }

        return { timeline: this.mergeTimelineBlocks(timeline), processes };
    }

    mergeTimelineBlocks(timeline) {
        if (timeline.length <= 1) return timeline;

        const merged = [timeline[0]];
        
        for (let i = 1; i < timeline.length; i++) {
            const current = timeline[i];
            const previous = merged[merged.length - 1];
            
            if (current.type === 'process' && previous.type === 'process' && 
                current.processId === previous.processId && previous.end === current.start) {
                previous.end = current.end;
                previous.duration += current.duration;
            } else {
                merged.push(current);
            }
        }
        
        return merged;
    }

    displayResults(result) {
        this.displayGanttChart(result.timeline);
        this.displayMetrics(result.processes, result.timeline);
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.classList.remove('hidden');
        }
    }

    displayGanttChart(timeline) {
        const container = document.getElementById('gantt-chart');
        if (!container) return;
        
        if (timeline.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No timeline data available</p></div>';
            return;
        }

        const totalTime = timeline[timeline.length - 1].end;

        const timePoints = [0];
        timeline.forEach(block => {
            if (!timePoints.includes(block.start)) {
                timePoints.push(block.start);
            }
            if (!timePoints.includes(block.end)) {
                timePoints.push(block.end);
            }
        });
        const uniqueTimePoints = [...new Set(timePoints)].sort((a, b) => a - b);
        
        const ganttHTML = `
            <div class="gantt-container">
                <div class="gantt-timeline">
                    ${timeline.map(block => {
                        const widthPercent = (block.duration / totalTime) * 100;
                        const isIdle = block.type === 'idle';
                        return `
                            <div class="gantt-block ${isIdle ? 'idle' : ''}" 
                                 style="width: ${widthPercent}%; ${!isIdle ? `background-color: ${block.color}` : ''}"
                                 title="${isIdle ? 'Idle' : block.processId}: ${block.start}-${block.end} (${block.duration})">
                                ${isIdle ? 'Idle' : block.processId}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="gantt-labels">
                    ${uniqueTimePoints.map(time => {
                        const positionPercent = (time / totalTime) * 100;
                        return `
                            <div class="gantt-label" style="left: ${positionPercent}%;">
                                ${time}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = ganttHTML;
    }

    displayMetrics(processes, timeline) {
        const container = document.getElementById('metrics-table-container');
        if (!container) return;
        
        const totalProcesses = processes.length;
        const avgWaiting = processes.reduce((sum, p) => sum + p.waitingTime, 0) / totalProcesses;
        const avgTurnaround = processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / totalProcesses;
        const avgResponse = processes.reduce((sum, p) => sum + p.responseTime, 0) / totalProcesses;
        
        const totalTime = timeline[timeline.length - 1].end;
        const idleTime = timeline.filter(b => b.type === 'idle').reduce((sum, b) => sum + b.duration, 0);
        const cpuUtilization = ((totalTime - idleTime) / totalTime) * 100;

        const tableHTML = `
            <table class="metrics-table">
                <thead>
                    <tr>
                        <th>Process ID</th>
                        <th>Arrival Time</th>
                        <th>Burst Time</th>
                        <th>Start Time</th>
                        <th>Completion Time</th>
                        <th>Turnaround Time</th>
                        <th>Waiting Time</th>
                        <th>Response Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${processes.map(p => `
                        <tr>
                            <td class="process-id-cell" style="color: ${p.color};" data-label="Process ID">${p.id}</td>
                            <td data-label="Arrival Time">${p.arrivalTime}</td>
                            <td data-label="Burst Time">${p.originalBurstTime}</td>
                            <td data-label="Start Time">${p.startTime}</td>
                            <td data-label="Completion Time">${p.completionTime}</td>
                            <td data-label="Turnaround Time">${p.turnaroundTime}</td>
                            <td data-label="Waiting Time">${p.waitingTime}</td>
                            <td data-label="Response Time">${p.responseTime}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="metrics-summary">
                <div class="metric-card">
                    <div class="metric-value">${avgWaiting.toFixed(2)}</div>
                    <div class="metric-label">Avg Waiting Time</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${avgTurnaround.toFixed(2)}</div>
                    <div class="metric-label">Avg Turnaround Time</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${avgResponse.toFixed(2)}</div>
                    <div class="metric-label">Avg Response Time</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${cpuUtilization.toFixed(1)}%</div>
                    <div class="metric-label">CPU Utilization</div>
                </div>
            </div>
        `;

        container.innerHTML = tableHTML;
    }

    exportResults() {
        if (!this.lastResults || this.processes.length === 0) {
            this.showError('No data to export');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cpu_scheduling_${this.currentAlgorithm}_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    generateCSV() {
        let csv = 'Algorithm,' + this.algorithmData[this.currentAlgorithm].name + '\n\n';
        csv += 'Process ID,Arrival Time,Burst Time,Start Time,Completion Time,Turnaround Time,Waiting Time,Response Time\n';
        
        this.processes.forEach(p => {
            csv += `${p.id},${p.arrivalTime},${p.originalBurstTime},${p.startTime},${p.completionTime},${p.turnaroundTime},${p.waitingTime},${p.responseTime}\n`;
        });

        const totalProcesses = this.processes.length;
        const avgWaiting = this.processes.reduce((sum, p) => sum + p.waitingTime, 0) / totalProcesses;
        const avgTurnaround = this.processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / totalProcesses;
        const avgResponse = this.processes.reduce((sum, p) => sum + p.responseTime, 0) / totalProcesses;

        csv += '\n';
        csv += `Average,,,,,${avgTurnaround.toFixed(2)},${avgWaiting.toFixed(2)},${avgResponse.toFixed(2)}\n`;

        return csv;
    }

    clearResults() {
        const ganttChart = document.getElementById('gantt-chart');
        const metricsContainer = document.getElementById('metrics-table-container');
        const exportBtn = document.getElementById('export-btn');
        
        if (ganttChart) {
            ganttChart.innerHTML = '<div class="empty-state"><p>Run simulation to view Gantt chart</p></div>';
        }
        if (metricsContainer) {
            metricsContainer.innerHTML = '<div class="empty-state"><p>Run simulation to view performance metrics</p></div>';
        }
        if (exportBtn) {
            exportBtn.classList.add('hidden');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');

            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 4000);
        }
        
        console.error('Error:', message);
    }
}

let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new CPUScheduler();
    window.scheduler = scheduler;
    console.log('CPU Scheduler initialized');
});