import { Storage } from './data/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('employee-container');
    const searchInput = document.getElementById('employeeSearch');
    
    let employees = [];
    let activeDuty = {};
    let startTime = {};

    async function loadAndRender() {
        employees = await Storage.getEmployees();
        activeDuty = await Storage.getDutyStatus();
        startTime = await Storage.getStartTimes();
        renderCards(searchInput?.value || "");
    }

    function renderCards(filter = "") {
        if(!container) return;
        container.innerHTML = "";
        
        const filtered = employees.filter(emp => emp.name.toLowerCase().includes(filter.toLowerCase()));

        filtered.forEach(emp => {
            const isDuty = activeDuty[emp.id];
            let liveTime = 0;
            if (isDuty && startTime[emp.id]) {
                liveTime = (new Date().getTime() - startTime[emp.id]) / 3600000;
            }

            const currentTotal = emp.currentHours + liveTime;
            const progress = Math.min((currentTotal / 15) * 100, 100);
            const salary = calculateFinalSalary(emp.rank, currentTotal);
            
            const card = document.createElement('div');
            card.className = `bg-white dark:bg-slate-800 border-2 rounded-[35px] p-7 transition-all duration-300 ${isDuty ? 'duty-active border-[#2D5BFF] scale-[1.02]' : 'border-white dark:border-slate-700'}`;
            card.innerHTML = `
                <div class="flex justify-between items-end mb-1">
                    <h3 class="text-[#2D5BFF] font-extrabold text-xl uppercase">${emp.name}</h3>
                    <span class="text-[11px] font-bold text-gray-400">${currentTotal.toFixed(2)}H / 15H</span>
                </div>
                <div class="flex justify-between items-center mb-6">
                    <p class="text-[#1E2A78] dark:text-slate-300 text-xs font-black italic uppercase">${emp.rank}</p>
                    ${currentTotal >= 20 ? '<span class="bg-emerald-500 text-white text-[9px] px-2 py-1 rounded-lg font-black animate-pulse">BONUS ACTIVE</span>' : ''}
                </div>
                <div class="w-full bg-gray-100 dark:bg-slate-700 h-3 rounded-full mb-8 overflow-hidden">
                    <div class="bg-[#2D5BFF] h-full transition-all duration-700" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase">Estimated Salary</p>
                        <p class="text-[#1E2A78] dark:text-white font-black text-lg">$${salary.toLocaleString()}</p>
                    </div>
                    <button class="duty-btn px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest ${isDuty ? 'bg-red-500 text-white' : 'bg-[#2D5BFF] text-white'} uppercase" data-id="${emp.id}">
                        ${isDuty ? 'STOP DUTY' : 'START DUTY'}
                    </button>
                </div>`;
            container.appendChild(card);
        });

        document.querySelectorAll('.duty-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const emp = employees.find(e => e.id == id);
                if (!activeDuty[id]) {
                    const pass = prompt(`Password for ${emp.name}:`);
                    if (pass === emp.password) {
                        activeDuty[id] = true;
                        startTime[id] = new Date().getTime();
                    } else if(pass) { alert("Wrong Password!"); return; } else { return; }
                } else {
                    const sessionTime = (new Date().getTime() - startTime[id]) / 3600000;
                    const empIdx = employees.findIndex(e => e.id == id);
                    employees[empIdx].currentHours += sessionTime;
                    delete activeDuty[id];
                    delete startTime[id];
                    await Storage.saveEmployees(employees);
                }
                await Storage.saveDutyStatus(activeDuty);
                await Storage.saveStartTimes(startTime);
                loadAndRender();
            };
        });
        updateStats();
    }

    function updateStats() {
        ['HIGH RANK', 'SENIOR', 'JUNIOR', 'INTERN'].forEach(rank => {
            const count = employees.filter(e => e.rank === rank).length;
            const el = document.getElementById(`count-${rank.replace(' ', '-')}`);
            if(el) el.innerText = count;
        });
    }

    Storage.onDataChange(() => loadAndRender());
    if(searchInput) searchInput.oninput = (e) => renderCards(e.target.value);
    setInterval(loadAndRender, 60000); // Live update setiap menit
    loadAndRender();
});
