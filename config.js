const GLOBAL_SETTINGS = {
    TARGET_HOURS: 15,
    SALARY_CONFIG: {
        'HIGH RANK': 20000,
        'SENIOR': 8000,
        'JUNIOR': 7000,
        'INTERN': 5000
    },
    BONUS_CONFIG: {
        THRESHOLD: 20, // Mulai dapat bonus di jam ke-20
        MULTIPLIER: 5,  // Tiap kelipatan 5 jam
        AMOUNT: 5000    // Nominal bonus
    },
    ADMIN_PASSWORD: "admin123", // Password untuk Admin Panel
    UPDATE_INTERVAL: 60000      // Refresh tampilan setiap 1 menit
};

// Logika Gaji Global
function calculateFinalSalary(rank, totalHours) {
    const baseAtTarget = GLOBAL_SETTINGS.SALARY_CONFIG[rank] || 5000;
    let currentSalary = Math.floor((totalHours / GLOBAL_SETTINGS.TARGET_HOURS) * baseAtTarget);

    if (totalHours >= GLOBAL_SETTINGS.BONUS_CONFIG.THRESHOLD) {
        const extraHours = totalHours - 15; // Bonus dihitung dari kelebihan target 15 jam
        const bonusCount = Math.floor(extraHours / GLOBAL_SETTINGS.BONUS_CONFIG.MULTIPLIER);
        currentSalary += (bonusCount * GLOBAL_SETTINGS.BONUS_CONFIG.AMOUNT);
    }
    return currentSalary;
}
