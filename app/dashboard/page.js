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

// ... (โค้ดส่วนบนเหมือนเดิมจนถึงส่วน return) ...

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ color: "#1e293b", margin: 0, fontSize: "24px" }}>📊 ระบบสรุปงาน กปภ. ท่าเรือ</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>อัปเดตสถานะงานซ่อมท่อและบริการผู้ใช้น้ำ</p>
      </header>

      {/* สถิติหลัก */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center", marginBottom: "30px" }}>
        <Box title="งานทั้งหมด" value={total} color="#475569" icon="📋" />
        <Box title="รอซ่อม" value={pending} color="#ef4444" icon="🔴" />
        <Box title="กำลังซ่อม" value={working} color="#f59e0b" icon="🟠" />
        <Box title="เสร็จแล้ว" value={done} color="#10b981" icon="✅" />
        <Box title="งานวันนี้" value={todayJobs} color="#3b82f6" icon="📅" />
      </div>

      {/* 🚀 เพิ่มเมนูทางลัด (Shortcuts) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "500px", margin: "0 auto" }}>
        <a href="/create" style={navButtonStyle("#3b82f6")}>➕ แจ้งซ่อมใหม่</a>
        <a href="/jobs" style={navButtonStyle("#1e293b")}>📝 จัดการงานซ่อม</a>
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
          อัปเดตข้อมูลล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.
        </p>
      </div>
    </div>
  );
}

// สไตล์ปุ่มเมนูทางลัด
const navButtonStyle = (bgColor) => ({
  display: "block",
  padding: "15px",
  backgroundColor: bgColor,
  color: "white",
  textAlign: "center",
  textDecoration: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  fontSize: "14px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
});

// ... (Component Box ด้านล่างคงเดิม) ...
