import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBsA6xjYEM3z5U5jFPT-vHBPwsvAZeWahE",
    authDomain: "absensi-beda-alam-roleplay.firebaseapp.com",
    databaseURL: "https://absensi-beda-alam-roleplay-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "absensi-beda-alam-roleplay",
    storageBucket: "absensi-beda-alam-roleplay.firebasestorage.app",
    messagingSenderId: "934951291105",
    appId: "1:934951291105:web:1cd5cae95cc4787fa88fa0",
    measurementId: "G-GY7NN7NMNP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const Storage = {
    async getEmployees() {
        const s = await get(ref(db, 'employees'));
        return s.exists() ? Object.values(s.val()) : [];
    },
    async saveEmployees(emps) {
        const data = {};
        emps.forEach(e => { data[e.id] = e; });
        await set(ref(db, 'employees'), data);
    },
    async getDutyStatus() {
        const s = await get(ref(db, 'dutyStatus'));
        return s.exists() ? s.val() : {};
    },
    async saveDutyStatus(status) {
        await set(ref(db, 'dutyStatus'), status);
    },
    async getStartTimes() {
        const s = await get(ref(db, 'startTimes'));
        return s.exists() ? s.val() : {};
    },
    async saveStartTimes(times) {
        await set(ref(db, 'startTimes'), times);
    },
    onDataChange(callback) {
        onValue(ref(db, 'employees'), (s) => {
            callback(s.exists() ? Object.values(s.val()) : []);
        });
    }
};
