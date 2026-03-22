"use client";

import { useEffect, useState } from "react";
// ✅ แก้ไข Path เป็น Absolute Path เพื่อลดปัญหา Module Not Found
import { db } from "@/app/lib/firebase"; 
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

  // 🧮 ฟังก์ชันคำนวณสถิติ (รองรับคำสะกดหลากหลาย)
  const total = jobs.length;
  const pending = jobs.filter(j => ["รอซ่อม", "ท่อแตก", "ท่อรั่ว"].includes(j.status?.trim())).length;
  const working = jobs.filter(j => j.status?.trim() === "กำลังซ่อม").length;
  const done = jobs.filter(j => ["เสร็จแล้ว", "ซ่อมแล้ว"].includes(j.status?.trim())).length;

  // 📅 คำนวณงานวันนี้
  const todayStr = new Date().toDateString();
  const todayJobs = jobs.filter(j => {
    if (!j.createdAt) return false;
    const jobDate = j.createdAt.seconds 
      ? new Date(j.createdAt.seconds * 1000) 
      : new Date(j.createdAt); 
    return jobDate.toDateString() === todayStr;
  }).length;

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <header style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ color: "#1e293b", margin: 0, fontSize: "28px", fontWeight: "800" }}>📊 สรุปงาน กปภ. สาขาท่าเรือ</h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>ระบบติดตามสถานะงานซ่อมท่อและบริการผู้ใช้น้ำ</p>
      </header>

      {/* สถิติหลักแบบ Card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <Box title="งานทั้งหมด" value={total} color="#475569" icon="📋" />
        <Box title="รอซ่อม" value={pending} color="#ef4444" icon="🔴" />
        <Box title="กำลังซ่อม" value={working} color="#f59e0b" icon="🟠" />
        <Box title="เสร็จแล้ว" value={done} color="#10b981" icon="✅" />
        <Box title="งานวันนี้" value={todayJobs} color="#3b82f6" icon="📅" />
      </div>

      {/* 🚀 เมนูทางลัด */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", maxWidth: "500px", margin: "0 auto" }}>
        <a href="/create" style={navButtonStyle("#3b82f6")}>➕ แจ้งซ่อมใหม่</a>
        <a href="/jobs" style={navButtonStyle("#1e293b")}>📝 รายการงาน</a>
      </div>

      <footer style={{ marginTop: "40px", textAlign: "center" }}>
        <p style={{ color: "#94a3b8", fontSize: "12px" }}>
          อัปเดตข้อมูลล่าสุด: {new Date().toLocaleTimeString('th-TH')} น.
        </p>
      </footer>
    </div>
  );
}

// Component ย่อยสำหรับกล่องสถิติ
function Box({ title, value, color, icon }) {
  return (
    <div style={{
      backgroundColor: "white",
      padding: "20px 10px",
      borderRadius: "18px",
      textAlign: "center",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      borderTop: `4px solid ${color}`
    }}>
      <div style={{ fontSize: "24px", marginBottom: "5px" }}>{icon}</div>
      <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>{title}</div>
      <div style={{ fontSize: "32px", fontWeight: "bold", color: "#1e293b" }}>{value}</div>
    </div>
  );
}

const navButtonStyle = (bgColor) => ({
  display: "block",
  padding: "18px",
  backgroundColor: bgColor,
  color: "white",
  textAlign: "center",
  textDecoration: "none",
  borderRadius: "15px",
  fontWeight: "bold",
  fontSize: "15px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transition: "0.2s"
});
