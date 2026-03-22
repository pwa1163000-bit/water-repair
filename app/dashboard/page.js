"use client";

import { useEffect, useState } from "react";
// 💡 ตรวจสอบ Path ตรงนี้ให้ตรงกับโครงสร้างของคุณ (ใช้ ./lib/firebase ตามที่คุยกันรอบก่อน)
import { db } from "./lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🧮 ฟังก์ชันคำนวณสถิติ
  const total = jobs.length;
  // ใช้ .trim() เพื่อป้องกันปัญหาช่องว่างในข้อความสถานะ
  const pending = jobs.filter(j => j.status?.trim() === "รอซ่อม" || j.status?.trim() === "ท่อแตก").length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => j.status?.trim() === "เสร็จแล้ว" || j.status?.trim() === "ซ่อมแล้ว").length;

  // 📅 คำนวณงานวันนี้ (เช็คทั้ง seconds จาก Firebase และ Date มาตรฐาน)
  const todayStr = new Date().toDateString();
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    
    // แปลงจาก Firebase Timestamp เป็น JavaScript Date
    const jobDate = j.createdAt.seconds 
      ? new Date(j.createdAt.seconds * 1000) 
      : new Date(j.createdAt); // เผื่อกรณีเก็บเป็น String หรือ Date ธรรมดา
      
    return jobDate.toDateString() === todayStr;
  }).length;

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#1e293b", marginBottom: "20px" }}>📊 ระบบสรุปงาน กปภ. ท่าเรือ</h1>

      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
        
        <Box title="งานทั้งหมด" value={total} color="#475569" icon="📋" />
        <Box title="รอซ่อม" value={pending} color="#ef4444" icon="🔴" />
        <Box title="กำลังซ่อม" value={working} color="#f59e0b" icon="🟠" />
        <Box title="เสร็จแล้ว" value={done} color="#10b981" icon="✅" />
        <Box title="งานวันนี้" value={todayJobs} color="#3b82f6" icon="📅" />

      </div>

      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
          อัปเดตข้อมูลล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.
        </p>
      </div>
    </div>
  );
}

// 🎨 Component กล่องแสดงผล (ปรับให้สวยขึ้น)
function Box({ title, value, color, icon }) {
  return (
    <div
      style={{
        background: color,
        color: "white",
        padding: "25px 20px",
        borderRadius: "15px",
        minWidth: "160px",
        textAlign: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        flex: "1 1 180px"
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>{icon}</div>
      <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "400", opacity: 0.9 }}>{title}</h3>
      <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "bold" }}>{value}</h1>
    </div>
  );
}
