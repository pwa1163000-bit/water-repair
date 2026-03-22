"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query } from "firebase/firestore";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("ทั้งหมด");
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  const deleteJob = async (id) => {
    if (window.confirm("คุณต้องการลบรายการงานนี้ใช่หรือไม่?")) {
      try {
        await deleteDoc(doc(db, "jobs", id));
      } catch (error) {
        alert("ไม่สามารถลบได้: " + error.message);
      }
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return "ไม่ระบุเวลา";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000 || createdAt);
    return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const filteredJobs = filter === "ทั้งหมด" ? jobs : jobs.filter(j => j.status === filter);

  if (loading) return <div style={{ textAlign: "center", padding: "50px", fontFamily: "sans-serif" }}>⌛ กำลังโหลดข้อมูล...</div>;

  return (
    <div style={{ padding: "15px", maxWidth: "600px", margin: "auto", fontFamily: "sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#1e293b", margin: "0" }}>📋 รายการงานซ่อม</h2>
        <p style={{ color: "#64748b", fontSize: "14px" }}>กปภ. สาขาท่าเรือ</p>
      </header>
      
      {/* Tabs Menu */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", overflowX: "auto", padding: "5px 0" }}>
        {["ทั้งหมด", "รอซ่อม", "กำลังซ่อม", "เสร็จแล้ว"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              padding: "10px 20px", borderRadius: "25px", border: "none", whiteSpace: "nowrap",
              backgroundColor: filter === st ? "#3b82f6" : "#fff",
              color: filter === st ? "#fff" : "#64748b",
              fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            {st} ({st === "ทั้งหมด" ? jobs.length : jobs.filter(j => j.status === st).length})
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "20px" }}>
        {filteredJobs.length === 0 ? (
           <p style={{ textAlign: "center", color: "#94a3b8" }}>ไม่พบรายการงานในหมวดนี้</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} style={{ backgroundColor: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}>
              
              {/* Image Header */}
              <div style={{ width: "100%", height: "220px", backgroundColor: "#e2e8f0", position: "relative" }}>
                {job.imageUrl ? (
                  <img src={job.imageUrl} alt="หน้างาน" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>📷 ไม่มีรูปภาพ</div>
                )}
                <div style={{ position: "absolute", top: "15px", right: "15px", backgroundColor: statusColors[job.status], color: "#fff", padding: "6px 15px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
                  {job.status}
                </div>
                
                {/* 🗑 ปุ่มลบงาน (มุมซ้ายบน) */}
                <button 
                  onClick={() => deleteJob(job.id)}
                  style={{ position: "absolute", top: "15px", left: "15px", backgroundColor: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "16px" }}
                >
                  🗑
                </button>
              </div>

              {/* Content Body */}
              <div style={{ padding: "20px" }}>
                <div style={{ marginBottom: "15px" }}>
                  <span style={{ color: "#3b82f6", fontSize: "13px", fontWeight: "bold" }}>เลขที่งาน: {job.jobNo || "N/A"}</span>
                  <h3 style={{ margin: "5px 0", color: "#1e293b", fontSize: "18px" }}>{job.title}</h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>🕒 {formatTime(job.createdAt)}</p>
                </div>

                <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", marginBottom: "20px" }} />

                {/* Action Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "10px" }}>
                  <button onClick={() => updateStatus(job.id, "รอซ่อม")} style={actionStyle("#ef4444")}>รอซ่อม</button>
                  <button onClick={() => updateStatus(job.id, "กำลังซ่อม")} style={actionStyle("#f59e0b")}>กำลังซ่อม</button>
                  <button onClick={() => updateStatus(job.id, "เสร็จแล้ว")} style={actionStyle("#10b981")}>เสร็จแล้ว</button>
                </div>

                {job.location?.lat && (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}`} 
                    target="_blank" rel="noreferrer"
                    style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: "12px", backgroundColor: "#f1f5f9", color: "#1e293b", textDecoration: "none", fontSize: "14px", fontWeight: "bold" }}
                  >
                    📍 นำทางไปจุดที่ได้รับแจ้ง
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const actionStyle = (color) => ({
  padding: "10px 5px",
  borderRadius: "12px",
  border: "none",
  backgroundColor: `${color}15`,
  color: color,
  fontWeight: "bold",
  fontSize: "12px",
  cursor: "pointer",
  transition: "0.2s"
});
