import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBsA6xjYEM3z5U5jFPT-vHBPwsvAZeWahE",
    authDomain: "absensi-beda-alam-roleplay.firebaseapp.com",
    databaseURL: "https://absensi-beda-alam-roleplay-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "absensi-beda-alam-roleplay",
    storageBucket: "absensi-beda-alam-roleplay.firebasestorage.app",
    messagingSenderId: "934951291105",
    appId: "1:934951291105:web:1cd5cae95cc4787fa88fa0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const Storage = {
    // Ambil Data Karyawan
    async getEmployees() {
        try {
            const s = await get(ref(db, 'employees'));
            return s.exists() ? Object.values(s.val()) : [];
        } catch (e) { console.error("Error getEmployees:", e); return []; }
    },

    // Simpan Data Karyawan (Admin Panel)
    async saveEmployees(emps) {
        const data = {};
        emps.forEach(e => { data[e.id] = e; });
        return await set(ref(db, 'employees'), data);
    },

    // Ambil Status Duty (Siapa yang lagi On/Off)
    async getDutyStatus() {
        const s = await get(ref(db, 'dutyStatus'));
        return s.exists() ? s.val() : {};
    },

    // Simpan Status Duty
    async saveDutyStatus(status) {
        return await set(ref(db, 'dutyStatus'), status);
    },

    // Ambil Waktu Mulai (Start Time)
    async getStartTimes() {
        const s = await get(ref(db, 'startTimes'));
        return s.exists() ? s.val() : {};
    },

    // Simpan Waktu Mulai
    async saveStartTimes(times) {
        return await set(ref(db, 'startTimes'), times);
    },

    // Listener otomatis saat ada perubahan di database
    onDataChange(callback) {
        onValue(ref(db, 'employees'), (s) => {
            callback(s.exists() ? Object.values(s.val()) : []);
        });
    },

    onDutyChange(callback) {
        onValue(ref(db, 'dutyStatus'), (s) => {
            callback(s.exists() ? s.val() : {});
        });
    }
};
