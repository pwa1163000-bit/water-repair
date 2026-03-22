"use client";

import { useEffect, useState } from "react";
// 💡 แก้ไข Path ตามโครงสร้างจริงในรูป (ไฟล์ firebase.js อยู่ในโฟลเดอร์ lib ซึ่งอยู่ใน app)
import { db } from "./lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    doing: 0,
    done: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // ดึงข้อมูล Real-time จาก Firebase
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => doc.data());
      
      setStats({
        total: allJobs.length,
        // กรองสถานะ: รองรับทั้งคำว่า "รอซ่อม", "ท่อแตก", "กำลังซ่อม", "เสร็จแล้ว"
        waiting: allJobs.filter(j => j.status === "รอซ่อม" || j.status === "ท่อแตก" || j.status === "แจ้งซ่อม").length,
        doing: allJobs.filter(j => j.status === "กำลังซ่อม" || j.status === "รอดำเนินการ").length,
        done: allJobs.filter(j => j.status === "เสร็จแล้ว" || j.status === "ซ่อมแล้ว" || j.status === "เรียบร้อย").length,
      });
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ส่วนของการออกแบบ (CSS-in-JS)
  const containerStyle = {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh"
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginBottom: "30px"
  };

  const cardStyle = (color) => ({
    backgroundColor: color,
    padding: "25px",
    borderRadius: "15px",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    transition: "transform 0.2s"
  });

  if (loading) return <div style={{padding: "50px", textAlign: "center", fontFamily: "sans-serif"}}>⏳ กำลังโหลดข้อมูล กปภ. ท่าเรือ...</div>;

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "15px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
          💧 สรุปสถานะงานซ่อมประปา
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px" }}>การประปาส่วนภูมิภาค สาขาท่าเรือ</p>
      </header>

      <div style={gridStyle}>
        {/* การ์ดทั้งหมด */}
        <div style={cardStyle("#3b82f6")}>
          <div style={{ opacity: 0.9, fontSize: "14px", marginBottom: "5px" }}>📊 งานทั้งหมด</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.total}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
        </div>

        {/* การ์ดรอซ่อม */}
        <div style={cardStyle("#ef4444")}>
          <div style={{ opacity: 0.9, fontSize: "14px", marginBottom: "5px" }}>🔴 รอซ่อม</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.waiting}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
        </div>

        {/* การ์ดกำลังซ่อม */}
        <div style={cardStyle("#f59e0b")}>
          <div style={{ opacity: 0.9, fontSize: "14px", marginBottom: "5px" }}>🟠 กำลังซ่อม</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.doing}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
        </div>

        {/* การ์ดซ่อมเสร็จ */}
        <div style={cardStyle("#10b981")}>
          <div style={{ opacity: 0.9, fontSize: "14px", marginBottom: "5px" }}>🟢 ซ่อมเสร็จแล้ว</div>
          <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.done}</div>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
        </div>
      </div>

      {/* เมนูทางลัด */}
      <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "15px" }}>เมนูจัดการ</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <Link href="/jobs" style={btnStyle}>
          📋 รายการงานแจ้งซ่อม
        </Link>
        <Link href="/map" style={btnStyle}>
          📍 แผนที่จุดซ่อมทั้งหมด
        </Link>
      </div>

      <footer style={{ marginTop: "50px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
        ระบบติดตามงานซ่อมท่อ - กปภ. ท่าเรือ v1.0
      </footer>
    </div>
  );
}

const btnStyle = {
  padding: "20px",
  textAlign: "center",
  backgroundColor: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  textDecoration: "none",
  color: "#334155",
  fontWeight: "bold",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  display: "block"
};
