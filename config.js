/**
 * --- MARKING: PENGATURAN GLOBAL ---
 * Ubah DEFAULT_MAX_HOURS untuk mengganti target jam (misal 15, 50, atau 100).
 */
const GLOBAL_SETTINGS = {
    DEFAULT_MAX_HOURS: 15, 
    UPDATE_INTERVAL: 1000  
};

const RANKS = ['HIGH RANK', 'SENIOR', 'JUNIOR', 'INTERN'];

// Data awal (hanya digunakan saat pertama kali aplikasi dibuka)
const EMPLOYEES_DATA = [
    {
        id: 1,
        name: "Asep Knalpot",
        rank: "SENIOR",
        currentHours: 0,
        maxHours: GLOBAL_SETTINGS.DEFAULT_MAX_HOURS,
        salary: 30000
    }
];