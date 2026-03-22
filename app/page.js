"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; // ตรวจสอบ path ให้ถูกต้อง
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
// แนะนำให้ติดตั้ง lucide-react เพื่อใช้ Icon
import { Globe, Droplets, HelpCircle, CheckCircle2, ShieldCheck, ClipboardList, PlusCircle } from "lucide-react";

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
    // 💡 ดึงข้อมูลแบบ Real-time จาก collection "jobs"
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => doc.data());
      
      // 🧮 คำนวณสถิติแยกตามสถานะ
      const newStats = {
        total: allJobs.length,
        broken: allJobs.filter(j => j.status === "ท่อแตก").length,
        notSure: allJobs.filter(j => j.status === "ไม่แน่ใจ").length,
        notBroken: allJobs.filter(j => j.status === "ไม่แตก").length,
        repaired: allJobs.filter(j => j.status === "ซ่อมแล้ว").length,
      };
      
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching status:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // ยกเลิก listener เมื่อปิดหน้า
  }, []);

  // 🎨 สไตล์หลักของหน้า
  const pageStyle = {
    padding: "20px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Sarabun', sans-serif",
    backgroundColor: "#f9fafb",
    minHeight: "100vh"
  };

  // 🖌️ สไตล์ของ Card
  const cardStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "25px",
    borderRadius: "15px",
    color: "white",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden"
  };

  // 🪄 สไตล์ของ Icon พื้นหลัง
  const bgIconStyle = {
    position: "absolute",
    right: "-10px",
    bottom: "-10px",
    opacity: 0.15,
    transform: "rotate(-10deg)"
  };

  // ⏹️ สไตล์ของปุ่มเมนูหลัก
  const menuButtonStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "20px",
    backgroundColor: "white",
    color: "#374151",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s ease",
  };

  if (loading) {
    return <div style={{...pageStyle, textAlign: "center", paddingTop: "50px"}}>กำลังโหลดข้อมูลสถิติ...</div>;
  }

  return (
    <div style={pageStyle}>
      {/* ส่วนหัว */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "24px", color: "#111827", margin: 0, fontWeight: "bold" }}>
          < Droplets style={{display:'inline', marginBottom:'5px', color:'#3b82f6'}}/> ระบบแดชบอร์ดประปา
        </h1>
        <div style={{display:'flex', gap:'10px'}}>
            <Link href="/create-job" style={{...menuButtonStyle, flexDirection:'row', padding:'10px 15px', backgroundColor:'#3b82f6', color:'white', border:'none'}}>
                <PlusCircle size={18} /> แจ้งงานใหม่
            </Link>
        </div>
      </header>

      {/* 📊 ส่วนสรุปข้อมูลสถิติ (ตามรูปตัวอย่าง) */}
      <h2 style={{ fontSize: "18px", color: "#374151", marginBottom: "15px", fontWeight: "600" }}>สรุปข้อมูลจุดซ่อม</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "15px", marginBottom: "30px" }}>
        
        {/* Card: ทั้งหมด (สีน้ำเงิน) */}
        <div style={{ ...cardStyle, backgroundColor: "#2563eb" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ทั้งหมด</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", margin: "5px 0" }}>{stats.total.toLocaleString()}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
          </div>
          <Globe size={70} style={bgIconStyle} />
        </div>

        {/* Card: ท่อแตก (สีแดง) */}
        <div style={{ ...cardStyle, backgroundColor: "#dc2626" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ท่อแตก</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", margin: "5px 0" }}>{stats.broken.toLocaleString()}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
          </div>
          <Droplets size={70} style={bgIconStyle} />
        </div>

        {/* Card: ไม่แน่ใจ (สีส้ม) */}
        <div style={{ ...cardStyle, backgroundColor: "#f97316" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ไม่แน่ใจ</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", margin: "5px 0" }}>{stats.notSure.toLocaleString()}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
          </div>
          <HelpCircle size={70} style={bgIconStyle} />
        </div>

        {/* Card: ไม่แตก (สีเขียวอ่อน) */}
        <div style={{ ...cardStyle, backgroundColor: "#16a34a" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ไม่แตก</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", margin: "5px 0" }}>{stats.notBroken.toLocaleString()}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
          </div>
          <CheckCircle2 size={70} style={bgIconStyle} />
        </div>

        {/* Card: ซ่อมแล้ว (สีเขียวเข้ม) */}
        <div style={{ ...cardStyle, backgroundColor: "#15803d" }}>
          <div>
            <div style={{ fontSize: "14px", opacity: 0.8 }}>ซ่อมแล้ว</div>
            <div style={{ fontSize: "36px", fontWeight: "bold", margin: "5px 0" }}>{stats.repaired.toLocaleString()}</div>
            <div style={{ fontSize: "12px", opacity: 0.8 }}>รายการ</div>
          </div>
          <ShieldCheck size={70} style={bgIconStyle} />
        </div>

      </div>

      {/* 🛠️ ส่วนเมนูจัดการงาน */}
      <h2 style={{ fontSize: "18px", color: "#374151", marginBottom: "15px", fontWeight: "600" }}>เมนูจัดการงาน</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
        
        <Link href="/jobs" style={menuButtonStyle}>
          <ClipboardList size={32} color="#4b5563" />
          <span>ดูรายการงานทั้งหมด</span>
        </Link>
        
        <Link href="/map" style={menuButtonStyle}>
          <Globe size={32} color="#4b5563" />
          <span>แผนที่จุดซ่อม Real-time</span>
        </Link>

      </div>

      {/* Footer ย่อ */}
      <footer style={{ marginTop: "40px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>
        ระบบจัดการข้อมูลประปา กปภ. สาขาท่าเรือ © {new Date().getFullYear()}
      </footer>

    </div>
  );
}
