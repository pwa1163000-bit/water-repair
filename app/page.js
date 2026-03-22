"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; 
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
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => doc.data());
      
      const newStats = {
        total: allJobs.length,
        broken: allJobs.filter(j => j.status === "ท่อแตก").length,
        notSure: allJobs.filter(j => j.status === "ไม่แน่ใจ").length,
        notBroken: allJobs.filter(j => j.status === "ไม่แตก").length,
        repaired: allJobs.filter(j => j.status === "ซ่อมแล้ว").length,
      };
      
      setStats(newStats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const cardStyle = (bgColor) => ({
    backgroundColor: bgColor,
    padding: "25px",
    borderRadius: "15px",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  });

  const emojiStyle = { fontSize: "60px", opacity: 0.2 };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>กำลังโหลด...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>💧 ระบบแดชบอร์ดประปา</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        
        {/* Card: ทั้งหมด */}
        <div style={cardStyle("#2563eb")}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ทั้งหมด</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.total}</div>
          </div>
          <span style={emojiStyle}>🌐</span>
        </div>

        {/* Card: ท่อแตก */}
        <div style={cardStyle("#dc2626")}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ท่อแตก</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.broken}</div>
          </div>
          <span style={emojiStyle}>💧</span>
        </div>

        {/* Card: ไม่แน่ใจ */}
        <div style={cardStyle("#f97316")}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ไม่แน่ใจ</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.notSure}</div>
          </div>
          <span style={emojiStyle}>❓</span>
        </div>

        {/* Card: ไม่แตก */}
        <div style={cardStyle("#16a34a")}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ไม่แตก</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.notBroken}</div>
          </div>
          <span style={emojiStyle}>✅</span>
        </div>

        {/* Card: ซ่อมแล้ว */}
        <div style={cardStyle("#15803d")}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ซ่อมแล้ว</div>
            <div style={{ fontSize: "36px", fontWeight: "bold" }}>{stats.repaired}</div>
          </div>
          <span style={emojiStyle}>🛡️</span>
        </div>

      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        <Link href="/jobs" style={{ padding: "20px", textAlign: "center", border: "1px solid #ddd", borderRadius: "10px", textDecoration: "none", color: "#333" }}>
          📋 ดูรายการงานทั้งหมด
        </Link>
        <Link href="/map" style={{ padding: "20px", textAlign: "center", border: "1px solid #ddd", borderRadius: "10px", textDecoration: "none", color: "#333" }}>
          📍 แผนที่จุดซ่อม
        </Link>
      </div>
    </div>
  );
}
