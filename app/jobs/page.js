"use client";

import { useEffect, useState } from "react";
// 💡 ตรวจสอบ Path ให้ตรงกับโครงสร้างของคุณ (เช่น ./lib/firebase หรือ ../lib/firebase)
import { db } from "../lib/firebase"; 
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from "firebase/firestore";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("ทั้งหมด");

  const statusColors = {
    "รอซ่อม": "#ef4444",
    "กำลังซ่อม": "#f59e0b",
    "เสร็จแล้ว": "#10b981"
  };

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const ref = doc(db, "jobs", id);
      await updateDoc(ref, { status: newStatus });
    } catch (error) {
      alert("ไม่สามารถเปลี่ยนสถานะได้: " + error.message);
    }
  };

  const filteredJobs = filter === "ทั้งหมด" 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#1e293b", marginBottom: "25px" }}>📋 รายการงานซ่อม กปภ.</h1>
      
      {/* ส่วน Tabs กรองสถานะ */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "25px", flexWrap: "wrap" }}>
        {["ทั้งหมด", "รอซ่อม", "กำลังซ่อม", "เสร็จแล้ว"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border: filter === st ? "none" : "1px solid #e2e8f0",
              cursor: "pointer",
              backgroundColor: filter === st ? "#3b82f6" : "white",
              color: filter === st ? "white" : "#64748b",
              fontWeight: "bold",
              transition: "0.2s",
              boxShadow: filter === st ? "0 4px 6px rgba(59, 130, 246, 0.3)" : "none"
            }}
          >
            {st} {st !== "ทั้งหมด" && `(${jobs.filter(j => j.status === st).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {filteredJobs.map((job) => (
          <div key={job.id} style={{
            backgroundColor: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            border: "1px solid #f1f5f9"
          }}>
            <div style={{ display: "flex", flexDirection: window.innerWidth < 600 ? "column" : "row" }}>
              
              {/* 📸 ส่วนแสดงรูปภาพ (ถ้ามี) */}
              <div style={{ width: window.innerWidth < 600 ? "100%" : "200px", height: "180px", backgroundColor: "#f1f5f9", flexShrink: 0 }}>
                {job.imageUrl ? (
                  <img src={job.imageUrl} alt="Job" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>
                    ไม่มีรูปภาพหน้างาน
                  </div>
                )}
              </div>

              {/* 📝 ส่วนรายละเอียดงาน */}
              <div style={{ padding: "20px", flexGrow: 1, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "bold", color: "#3b82f6" }}>#{job.jobNo || "NEW"}</span>
                  <span style={{
                    backgroundColor: statusColors[job.status] || "#94a3b8",
                    color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold"
                  }}>{job.status}</span>
                </div>
                
                <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "18px" }}>{job.title}</h3>
                <p style={{ margin: "0", color: "#64748b", fontSize: "13px" }}>
                  🕒 {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleString('th-TH') : "ไม่ระบุเวลา"}
                </p>

                <div style={{ marginTop: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={() => updateStatus(job.id, "รอซ่อม")} style={btnActionStyle("#ef4444")}>รอซ่อม</button>
                  <button onClick={() => updateStatus(job.id, "กำลังซ่อม")} style={btnActionStyle("#f59e0b")}>กำลังซ่อม</button>
                  <button onClick={() => updateStatus(job.id, "เสร็จแล้ว")} style={btnActionStyle("#10b981")}>เสร็จแล้ว</button>
                  
                  {job.location?.lat && (
                    <a href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} target="_blank" rel="noreferrer"
                       style={{ marginLeft: "auto", padding: "8px", borderRadius: "8px", backgroundColor: "#f1f5f9", color: "#3b82f6", textDecoration: "none", fontSize: "14px" }}>
                       📍 นำทาง
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const btnActionStyle = (color) => ({
  flex: 1,
  padding: "8px 5px",
  borderRadius: "8px",
  border: `1.5px solid ${color}`,
  backgroundColor: "transparent",
  color: color,
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "
