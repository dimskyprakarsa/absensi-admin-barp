document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('employee-container');
    const searchInput = document.getElementById('employeeSearch');
    
    let employees = Storage.getEmployees();
    let activeDuty = Storage.getDutyStatus();
    let startTime = Storage.getStartTimes();

    function calculateAdvancedSalary(emp) {
        const currentHours = emp.currentHours;
        const targetHours = emp.maxHours || GLOBAL_SETTINGS.DEFAULT_MAX_HOURS;
        let basePayAtTarget = 0;
        switch (emp.rank) {
            case 'HIGH RANK': basePayAtTarget = 20000; break;
            case 'SENIOR':    basePayAtTarget = 8000;  break;
            case 'JUNIOR':    basePayAtTarget = 7000;  break;
            case 'INTERN':    basePayAtTarget = 5000;  break;
            default:          basePayAtTarget = 5000;
        }
        let totalSalary = Math.floor((currentHours / targetHours) * basePayAtTarget);
        if (currentHours >= 20) {
            const extraHours = currentHours - targetHours;
            totalSalary += Math.floor(extraHours / 5) * 5000;
        }
        return totalSalary;
    }

    function renderCards(filter = "") {
        if(!container) return;
        container.innerHTML = "";
        const filtered = employees.filter(emp => emp.name.toLowerCase().includes(filter.toLowerCase()));

        filtered.forEach(emp => {
            const isDuty = activeDuty[emp.id];
            let liveBonusTime = 0;
            if (isDuty && startTime[emp.id]) {
                const now = new Date().getTime();
                liveBonusTime = (now - startTime[emp.id]) / (1000 * 60 * 60);
            }
            const currentTotal = emp.currentHours + liveBonusTime;
            const targetHours = emp.maxHours || GLOBAL_SETTINGS.DEFAULT_MAX_HOURS;
            const progress = Math.min((currentTotal / targetHours) * 100, 100);
            const finalSalary = calculateAdvancedSalary({ ...emp, currentHours: currentTotal });
            
            const card = document.createElement('div');
            card.className = `bg-white/80 border-2 rounded-[35px] p-7 transition-all duration-300 ${isDuty ? 'duty-active border-[#1E2A78] dark:border-[#60A5FA]' : 'border-white dark:border-slate-700 shadow-sm'}`;
            card.innerHTML = `
                <div class="flex justify-between items-end mb-1">
                    <h3 class="text-[#2D5BFF] dark:text-[#60A5FA] font-[800] text-xl uppercase">${emp.name}</h3>
                    <span class="text-[11px] font-bold text-[#2D5BFF]/60 dark:text-slate-400" id="hours-${emp.id}">${currentTotal.toFixed(2)} H / ${targetHours} H</span>
                </div>
                <div class="flex justify-between items-center mb-6">
                    <p class="text-[#1E2A78] dark:text-slate-400 text-[13px] font-bold italic">${emp.rank}</p>
                    ${currentTotal >= 20 ? '<span class="bg-emerald-500 text-white text-[9px] px-2 py-1 rounded-lg font-black animate-pulse">BONUS ACTIVE</span>' : ''}
                </div>
                <div class="w-full bg-gray-100 dark:bg-slate-800 h-3 rounded-full mb-8 overflow-hidden">
                    <div id="bar-${emp.id}" class="bg-[#2D5BFF] dark:bg-[#60A5FA] h-full rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-[#2D5BFF] dark:text-[#60A5FA] text-sm font-bold">Salary <span class="ml-2 text-[#1E2A78] dark:text-white font-[800] text-base" id="salary-${emp.id}">$${finalSalary.toLocaleString()}</span></div>
                    <button onclick="handleDutyToggle(${emp.id})" class="px-8 py-2.5 rounded-xl text-[11px] font-[900] shadow-md ${isDuty ? 'bg-[#1E2A78] text-white' : 'bg-[#2D5BFF] text-white'} uppercase">${isDuty ? 'STOP DUTY' : 'START DUTY'}</button>
                </div>
            `;
            container.appendChild(card);
        });
        updateStats();
    }

    // LOGIKA START DUTY DENGAN PASSWORD
    window.handleDutyToggle = (id) => {
        const emp = employees.find(e => e.id === id);
        const isDuty = activeDuty[id];

        if (!isDuty) {
            // PROMPT PASSWORD SAAT MAU START
            const passInput = prompt(`Masukkan Password untuk ${emp.name}:`);
            if (passInput === emp.password) {
                activeDuty[id] = true;
                startTime[id] = new Date().getTime();
            } else if (passInput !== null) {
                alert("Password Salah!");
                return;
            } else { return; }
        } else {
            // STOP DUTY (Tidak perlu password)
            const hoursGained = (new Date().getTime() - startTime[id]) / (1000 * 60 * 60);
            const idx = employees.findIndex(e => e.id === id);
            if (idx !== -1) {
                employees[idx].currentHours += hoursGained;
                Storage.saveEmployees(employees);
            }
            delete activeDuty[id];
            delete startTime[id];
        }
        Storage.saveDutyStatus(activeDuty);
        Storage.saveStartTimes(startTime);
        renderCards(searchInput ? searchInput.value : "");
    };

    setInterval(() => {
        employees.forEach(emp => {
            if (activeDuty[emp.id] && startTime[emp.id]) {
                const now = new Date().getTime();
                const currentTotal = emp.currentHours + (now - startTime[emp.id]) / (1000 * 60 * 60);
                const targetHours = emp.maxHours || GLOBAL_SETTINGS.DEFAULT_MAX_HOURS;
                const progress = Math.min((currentTotal / targetHours) * 100, 100);
                const liveSalary = calculateAdvancedSalary({ ...emp, currentHours: currentTotal });
                document.getElementById(`hours-${emp.id}`).innerText = `${currentTotal.toFixed(2)} H / ${targetHours} H`;
                document.getElementById(`bar-${emp.id}`).style.width = `${progress}%`;
                document.getElementById(`salary-${emp.id}`).innerText = `$${liveSalary.toLocaleString()}`;
            }
        });
    }, GLOBAL_SETTINGS.UPDATE_INTERVAL);

    function updateStats() {
        RANKS.forEach(rank => {
            const count = employees.filter(e => e.rank === rank).length;
            const el = document.getElementById(`count-${rank.replace(/\s+/g, '-')}`);
            if(el) el.innerText = count;
        });
    }

    if(searchInput) searchInput.addEventListener('input', (e) => renderCards(e.target.value));
    renderCards();
});