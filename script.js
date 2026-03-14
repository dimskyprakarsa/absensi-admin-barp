import { Storage } from './data/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('employee-container');
    const searchInput = document.getElementById('employeeSearch');
    
    let employees = [];
    let activeDuty = {};
    let startTime = {};

    async function init() {
        employees = await Storage.getEmployees();
        activeDuty = await Storage.getDutyStatus();
        startTime = await Storage.getStartTimes();
        render();
    }

    function render() {
        if(!container) return;
        container.innerHTML = "";
        const filter = searchInput ? searchInput.value.toLowerCase() : "";

        employees.filter(e => e.name.toLowerCase().includes(filter)).forEach(emp => {
            const isDuty = activeDuty[emp.id];
            let liveTime = 0;
            if (isDuty && startTime[emp.id]) {
                liveTime = (new Date().getTime() - startTime[emp.id]) / 3600000;
            }

            const currentTotal = emp.currentHours + liveTime;
            const progress = Math.min((currentTotal / 15) * 100, 100);
            const salary = calculateFinalSalary(emp.rank, currentTotal);
            
            const card = document.createElement('div');
            card.className = `bg-white dark:bg-slate-800 border-2 rounded-[30px] p-6 transition-all ${isDuty ? 'duty-active border-blue-500 shadow-lg' : 'border-transparent'}`;
            card.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-blue-600 font-bold text-lg">${emp.name}</h3>
                    <span class="text-[10px] text-gray-400 font-bold">${currentTotal.toFixed(2)}H / 15H</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-slate-700 h-2 rounded-full mb-6 overflow-hidden">
                    <div class="bg-blue-600 h-full" style="width: ${progress}%"></div>
                </div>
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-[10px] text-gray-400 uppercase font-bold">${emp.rank}</p>
                        <p class="text-blue-900 dark:text-white font-black text-xl">$${salary.toLocaleString()}</p>
                    </div>
                    <button class="duty-btn px-6 py-2 rounded-xl text-[10px] font-bold text-white ${isDuty ? 'bg-red-500' : 'bg-blue-600'}" data-id="${emp.id}">
                        ${isDuty ? 'STOP' : 'START'}
                    </button>
                </div>`;
            container.appendChild(card);
        });

        document.querySelectorAll('.duty-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (!activeDuty[id]) {
                    const pass = prompt("Enter Password:");
                    if (pass === employees.find(e => e.id == id).password) {
                        activeDuty[id] = true;
                        startTime[id] = new Date().getTime();
                    } else { alert("Wrong!"); return; }
                } else {
                    const sessionTime = (new Date().getTime() - startTime[id]) / 3600000;
                    const idx = employees.findIndex(e => e.id == id);
                    employees[idx].currentHours += sessionTime;
                    delete activeDuty[id]; delete startTime[id];
                    await Storage.saveEmployees(employees);
                }
                await Storage.saveDutyStatus(activeDuty);
                await Storage.saveStartTimes(startTime);
                init();
            };
        });
    }

    if(searchInput) searchInput.oninput = render;
    Storage.onDataChange(init);
    init();
});
