// File: config.js
// Pengaturan Global untuk Sistem Absensi Beda Alam

const GLOBAL_SETTINGS = {
    // Target jam kerja utama
    TARGET_HOURS: 15,

    // Gaji pokok per grade (untuk pencapaian 15 Jam)
    SALARY_CONFIG: {
        'HIGH RANK': 20000,
        'SENIOR': 8000,
        'JUNIOR': 7000,
        'INTERN': 5000
    },

    // Sistem Bonus
    BONUS_CONFIG: {
        THRESHOLD: 20,      // Bonus mulai dihitung jika sudah mencapai 20 Jam
        MULTIPLIER: 5,       // Bonus diberikan setiap kelipatan 5 Jam (setelah 15 Jam)
        AMOUNT: 5000         // Jumlah bonus per kelipatan ($5.000)
    },

    // Pengaturan Admin
    ADMIN_PASSWORD: "admin123" // Ganti sesuai keinginanmu
};

// Fungsi Logika Gaji agar bisa dipakai di script manapun
function calculateFinalSalary(rank, totalHours) {
    const baseAtTarget = GLOBAL_SETTINGS.SALARY_CONFIG[rank] || 5000;
    
    // 1. Gaji Proposional (Dasar)
    // Rumus: (Jam Kerja / 15) * Gaji Pokok Grade
    let currentSalary = Math.floor((totalHours / GLOBAL_SETTINGS.TARGET_HOURS) * baseAtTarget);

    // 2. Logika Bonus Kelipatan 5 Jam
    // Bonus aktif jika totalHours >= 20
    if (totalHours >= GLOBAL_SETTINGS.BONUS_CONFIG.THRESHOLD) {
        const extraHours = totalHours - GLOBAL_SETTINGS.TARGET_HOURS; // Jam lebih dari 15
        const bonusCount = Math.floor(extraHours / GLOBAL_SETTINGS.BONUS_CONFIG.MULTIPLIER);
        const totalBonus = bonusCount * GLOBAL_SETTINGS.BONUS_CONFIG.AMOUNT;
        
        currentSalary += totalBonus;
    }

    return currentSalary;
}
