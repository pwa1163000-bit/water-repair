"use client";

import { useEffect, useState } from "react";
// 💡 แก้เป็น @/ เพื่อให้ Next.js หาจากโฟลเดอร์หลักให้เอง
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    broken: 0,
    notSure: 0,
    notBroken: 0,
    repaired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // เช็คว่า db ถูกโหลดมาจริงไหมเพื่อป้องกัน Crash
    if (!db) {
      console.error("Firebase DB is not initialized");
      return;
    }

    try {
      const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
        const allJobs = snapshot.docs.map(doc => doc.data());
        
        setStats({
          total: allJobs.length,
          broken: allJobs.filter(j => j.status === "ท่อแตก" || j.status === "รอซ่อม").length,
          notSure: allJobs.filter(j => j.status === "ไม่แน่ใจ" || j.status === "กำลังซ่อม").length,
          notBroken: allJobs.filter(j => j.status === "ไม่แตก").length,
          repaired: allJobs.filter(j => j.status === "ซ่อมแล้ว" || j.status === "เสร็จแล้ว").length,
        });
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Connection error:", error);
      setLoading(false);
    }
  }, []);

  const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    padding: "20px",
    borderRadius: "15px",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  });

  if (loading) return <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif" }}>กำลังเชื่อมต่อฐานข้อมูล กปภ...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "20px", color: "#1e293b" }}>
        💧 แดชบอร์ดสรุปงานซ่อม (กปภ. ท่าเรือ)
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        <div style={cardStyle("#2563eb")}>
          <div><div style={{ opacity: 0.8 }}>งานทั้งหมด</div><div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.total}</div></div>
          <span style={{ fontSize: "40px" }}>📊</span>
        </div>
        <div style={cardStyle("#dc2626")}>
          <div><div style={{ opacity: 0.8 }}>ท่อแตก/รอซ่อม</div><div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.broken}</div></div>
          <span style={{ fontSize: "40px" }}>⚠️</span>
        </div>
        <div style={cardStyle("#f97316")}>
          <div><div style={{ opacity: 0.8 }}>กำลังดำเนินการ</div><div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.notSure}</div></div>
          <span style={{ fontSize: "40px" }}>🔧</span>
        </div>
        <div style={cardStyle("#16a34a")}>
          <div><div style={{ opacity: 0.8 }}>ซ่อมเสร็จแล้ว</div><div style={{ fontSize: "32px", fontWeight: "bold" }}>{stats.repaired}</div></div>
          <span style={{ fontSize: "40px" }}>✅</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <Link href="/jobs" style={btnStyle}>📋 รายการงาน</Link>
        <Link href="/map" style={btnStyle}>📍 ดูแผนที่</Link>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "15px",
  textAlign: "center",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "10px",
  textDecoration: "none",
  color: "#333",
  fontWeight: "bold"
};
