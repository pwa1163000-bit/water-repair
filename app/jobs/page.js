"use client";

import { useEffect, useState } from "react";
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
      alert("เกิดข้อผิดพลาด: " + error.message);
    }
  };

  // ฟังก์ชันแปลงเวลาให้ปลอดภัย (กัน Error)
  const formatTime = (createdAt) => {
    if (!createdAt) return "ไม่ระบุเวลา";
    try {
      // กรณีเป็น Firebase Timestamp (.toDate())
      if (createdAt.toDate) return createdAt.toDate().toLocaleString('th-TH');
      // กรณีเป็นตัวเลขวินาที (.seconds)
      if (createdAt.seconds) return new Date(createdAt.seconds * 1000).toLocaleString('th-TH');
      // กรณีเป็น Date หรือ String มาตรฐาน
      return new Date(createdAt).toLocaleString('th-TH');
    } catch (e) {
      return "รูปแบบเวลาผิดพลาด";
    }
  };

  const filteredJobs = filter === "ทั้งหมด" 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  return (
    <div style={{ padding: "15px", maxWidth: "800px", margin: "auto", fontFamily: "sans-serif", backgroundColor: "#f1f5f9", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", color: "#1e293b", marginBottom: "20px" }}>📋 จัดการงานซ่อม กปภ. ท่าเรือ</h2>
      
      {/* ส่วนเลือกหมวดหมู่ */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "5px" }}>
        {["ทั้งหมด", "รอซ่อม", "กำลังซ่อม", "เสร็จแล้ว"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              whiteSpace: "nowrap",
              border: "none",
              backgroundColor: filter === st ? "#3b82f6" : "#fff",
              color: filter === st ? "#fff" : "#64748b",
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              cursor: "pointer"
            }}
          >
            {st} ({st === "ทั้งหมด" ? jobs.length : jobs.filter(j => j.status === st).length})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {filteredJobs.map((job) => (
          <div key={job.id} style={{
            backgroundColor: "#fff",
            borderRadius: "15px",
            padding: "15px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "bold" }}>#{job.jobNo || "ไม่มีเลขงาน"}</span>
                <h3 style={{ margin: "5px 0", color: "#1e293b" }}>{job.title}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>🕒 {formatTime(job.createdAt)}</p>
              </div>
              <div style={{ 
                backgroundColor: statusColors[job.status] || "#94a3b8", 
                color: "#fff", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" 
              }}>
                {job.status}
              </div>
            </div>

            {/* ส่วนแสดงรูปภาพ */}
            {job.imageUrl && (
              <div style={{ width: "100%", borderRadius: "10px", overflow: "hidden" }}>
                <img src={job.imageUrl} alt="Job" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "5px 0" }} />

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => updateStatus(job.id, "รอซ่อม")} style={actionBtn("#ef4444")}>รอซ่อม</button>
              <button onClick={() => updateStatus(job.id, "กำลังซ่อม")} style={actionBtn("#f59e0b")}>กำลังซ่อม</button>
              <button onClick={() => updateStatus(job.id, "เสร็จแล้ว")} style={actionBtn("#10b981")}>เสร็จแล้ว</button>
              
              {job.location?.lat && (
                <a 
                  href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    flex: "1", textAlign: "center", padding: "10px", borderRadius: "8px", 
                    backgroundColor: "#4285F4", color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "bold"
                  }}
                >
                  📍 แผนที่
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const actionBtn = (color) => ({
  flex: "1",
  padding: "10px 5px",
  borderRadius: "8px",
  border: `1.5px solid ${color}`,
  backgroundColor: "#fff",
  color: color,
  fontWeight: "bold",
  fontSize: "13px",
  cursor: "pointer"
});
