"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    // 1. ดึงข้อมูลแบบ Real-time จาก Collection "jobs"
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. อัปเดตรายการงาน
      setJobs(jobList);

      // 3. คำนวณตัวเลขสรุป (ต้องสะกด "รอซ่อม" ให้ตรงกับหน้าส่งงาน)
      const total = jobList.length;
      const pending = jobList.filter(j => j.status === "รอซ่อม").length;
      const completed = jobList.filter(j => j.status === "ซ่อมเสร็จแล้ว").length;

      setStats({ total, pending, completed });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#0056b3" }}>📊 แดชบอร์ดติดตามงานซ่อม กปภ.ท่าเรือ</h1>
      
      {/* ส่วนแสดงตัวเลขสรุป */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: 0, color: "#666" }}>งานทั้งหมด</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0", color: "#333" }}>{stats.total}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", borderBottom: "5px solid #ff4d4d" }}>
          <h3 style={{ margin: 0, color: "#666" }}>รอซ่อม</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0", color: "#ff4d4d" }}>{stats.pending}</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", borderBottom: "5px solid #28a745" }}>
          <h3 style={{ margin: 0, color: "#666" }}>เสร็จแล้ว</h3>
          <p style={{ fontSize: "32px", fontWeight: "bold", margin: "10px 0", color: "#28a745" }}>{stats.completed}</p>
        </div>
      </div>

      {/* รายการงานซ่อม */}
      <div style={{ display: "grid", gap: "15px" }}>
        {jobs.map((job, index) => { ... })
          <div key={job.id} style={{ padding: "15px", background: "#fff", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderLeft: job.status === "รอซ่อม" ? "5px solid #ff4d4d" : "5px solid #28a745" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: "18px" }}>{job.jobType}</strong>
              <span style={{ color: "#888", fontSize: "12px" }}>
                {job.createdAt?.toDate().toLocaleString('th-TH')}
              </span>
            </div>
            <p style={{ margin: "5px 0", color: "#555" }}>{job.description || "ไม่มีรายละเอียด"}</p>
            
            {/* ปุ่มดูแผนที่นำทาง */}
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <a 
                href={`https://www.google.com/maps?q=${job.location?.lat},${job.location?.lng}`} 
                target="_blank" 
                style={{ fontSize: "14px", color: "#007bff", textDecoration: "none", border: "1px solid #007bff", padding: "5px 10px", borderRadius: "5px" }}
              >
                📍 นำทางไปจุดซ่อม
              </a>
              {job.imageUrl && (
                <a href={job.imageUrl} target="_blank" style={{ fontSize: "14px", color: "#666", textDecoration: "none", border: "1px solid #ccc", padding: "5px 10px", borderRadius: "5px" }}>
                  🖼️ ดูรูปหน้างาน
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
