import { Storage } from './data/storage.js';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('employee-container');
    const searchInput = document.getElementById('employeeSearch');
    
    let employees = [];
    let activeDuty = {};
    let startTime = {};

    // Fungsi Hitung Gaji + Bonus Kelipatan 5 Jam
    function calculateAdvancedSalary(emp, currentHours) {
        const targetHours = 15; // Target utama
        let basePayAtTarget = 0;

        switch (emp.rank) {
            case 'HIGH RANK': basePayAtTarget = 20000; break;
            case 'SENIOR':    basePayAtTarget = 8000;  break;
            case 'JUNIOR':    basePayAtTarget = 7000;  break;
            case 'INTERN':    basePayAtTarget = 5000;  break;
            default:          basePayAtTarget = 5000;
        }

        // 1. Gaji Pokok (Proposional)
        let totalSalary = Math.floor((currentHours / targetHours) * basePayAtTarget);

        // 2. Bonus Kelipatan 5 Jam (Mulai dari jam ke-20)
        if (currentHours >= 20) {
            const extraHours = currentHours - targetHours; // Hitung kelebihan dari 15 jam
            const bonusSteps = Math.floor(extraHours / 5);  // Kelipatan 5
            totalSalary += (bonusSteps * 5000);
        }

        return totalSalary;
    }

    // Fungsi Render Kartu
    function renderCards(filter = "") {
        if(!container) return;
        container.innerHTML = "";
        
        const filtered = employees.filter(emp => 
            emp.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (filtered.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400 font-bold uppercase tracking-widest">No Employee Found</div>`;
            return;
        }

        filtered.forEach(emp => {
            const isDuty = activeDuty[emp.id];
            let liveTime = 0;
            if (isDuty && startTime[emp.id]) {
                liveTime = (new Date().getTime() - startTime[emp.id]) / 3600000;
            }

            const currentTotal = emp.currentHours + liveTime;
            const progress = Math.min((currentTotal / 15) * 100, 100);
            const finalSalary = calculateAdvancedSalary(emp, currentTotal);
            
            const card = document.createElement('div');
            card.className = `bg-white dark:bg-slate-800 border-2 rounded-[35px] p-7 transition-all duration-300 ${isDuty ? 'border-[#2D5BFF] shadow-blue-100 shadow-2xl scale-[1.02]' : 'border-white dark:border-slate-700 shadow-sm'}`;
            card.innerHTML = `
                <div class="flex justify-between items-end mb-1">
                    <h3 class="text-[#2D5BFF] dark:text-blue-400 font-[800] text-xl uppercase leading-none">${emp.name}</h3>
                    <span class="text-[11px] font-bold text-slate-400" id="hours-${emp.id}">${currentTotal.toFixed(2)} H / 15 H</span>
                </div>
                <div class="flex justify-between items-center mb-6">
                    <p class="text-[#1E2A78] dark:text-slate-300 text-[12px] font-black italic uppercase">${emp.rank}</p>
                    ${currentTotal >= 20 ? '<span class="bg-emerald-500 text-white text-[9px] px-2 py-1 rounded-lg font-black animate-pulse">BONUS ACTIVE</span>' : ''}
                </div>
                <div class="w-full bg-gray-100 dark:bg-slate-700 h-3 rounded-full mb-8 overflow-hidden">
                    <div id="bar-${emp.id}" class="bg-[#2D5BFF] h-full rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-[#2D5BFF] dark:text-blue-400 text-xs font-bold uppercase tracking-tighter">
                        Estimated Salary: <br>
                        <span class="text-[#1E2A78] dark:text-white font-[900] text-lg" id="salary-${emp.id}">$${finalSalary.toLocaleString()}</span>
                    </div>
                    <button class="duty-btn px-8 py-3 rounded-2xl text-[10px] font-[900] shadow-md transition-all active:scale-90 ${isDuty ? 'bg-red-500 text-white' : 'bg-[#2D5BFF] text-white'} uppercase" data-id="${emp.id}">
                        ${isDuty ? 'STOP DUTY' : 'START DUTY'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        // Event Listener Tombol Duty (Hanya berfungsi di Module)
        document.querySelectorAll('.duty-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const emp = employees.find(e => e.id == id);
                
                if (!activeDuty[id]) {
                    const passInput = prompt(`Enter Password for ${emp.name}:`);
                    if (passInput === emp.password) {
                        activeDuty[id] = true;
                        startTime[id] = new Date().getTime();
                        await Storage.saveDutyStatus(activeDuty);
                        await Storage.saveStartTimes(startTime);
                    } else if (passInput) {
                        alert("Wrong Password!");
                    }
                } else {
                    const finalLiveTime = (new Date().getTime() - startTime[id]) / 3600000;
                    const idx = employees.findIndex(e => e.id == id);
                    employees[idx].currentHours += finalLiveTime;
                    
                    delete activeDuty[id];
                    delete startTime[id];
                    
                    await Storage.saveEmployees(employees);
                    await Storage.saveDutyStatus(activeDuty);
                    await Storage.saveStartTimes(startTime);
                }
                refreshData();
            };
        });
        updateStats();
    }

    async function refreshData() {
        employees = await Storage.getEmployees();
        activeDuty = await Storage.getDutyStatus();
        startTime = await Storage.getStartTimes();
        renderCards(searchInput ? searchInput.value : "");
    }

    function updateStats() {
        const ranks = ['HIGH RANK', 'SENIOR', 'JUNIOR', 'INTERN'];
        ranks.forEach(rank => {
            const count = employees.filter(e => e.rank === rank).length;
            const el = document.getElementById(`count-${rank.replace(/\s+/g, '-')}`);
            if(el) el.innerText = count;
        });
    }

    // Auto Update saat data di Cloud berubah
    Storage.onDataChange(() => refreshData());

    // Update Bar Progress & Jam setiap 1 menit agar terlihat "Live"
    setInterval(() => {
        if (Object.keys(activeDuty).length > 0) renderCards(searchInput.value);
    }, 60000);

    if(searchInput) searchInput.addEventListener('input', (e) => renderCards(e.target.value));
    
    refreshData();
});
