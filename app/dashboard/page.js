"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0 });
  const handleFinishJob = async (id) => {
  if (confirm("ยืนยันว่าซ่อมเสร็จแล้วใช่ไหม?")) {
    const jobRef = doc(db, "jobs", id);
    await updateDoc(jobRef, {
      status: "ซ่อมเสร็จแล้ว"
    });
  }
};
  useEffect(() => {
    // ดึงข้อมูลเรียงตามเวลาที่สร้าง (จากเก่าไปใหม่ เพื่อให้เลขรันลำดับไม่สลับกัน)
    const q = query(collection(db, "jobs"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobList);
      setStats({
        total: jobList.length,
        pending: jobList.filter(j => j.status === "รอซ่อม").length
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "15px", fontFamily: "sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3", marginBottom: "20px" }}>📊 งานซ่อม กปภ.ท่าเรือ</h2>
      
      {/* ส่วนสรุปตัวเลข */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "15px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>งานทั้งหมด</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</div>
        </div>
        <div style={{ flex: 1, padding: "15px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderBottom: "4px solid #dc3545" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>รอซ่อม</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#dc3545" }}>{stats.pending}</div>
        </div>
      </div>

      {/* รายการงาน (เรียงใหม่ล่าสุดขึ้นก่อน) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[...jobs].reverse().map((job, index) => {
          // คำนวณเลขรันงาน: (จำนวนทั้งหมด - ลำดับ)
          const runNo = (jobs.length - index).toString().padStart(3, '0');
          const displayNo = job.jobNo || `${runNo}/69`;

          return (
            <div key={job.id} style={{ padding: "15px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ backgroundColor: "#0056b3", color: "#fff", padding: "2px 8px", borderRadius: "5px", fontSize: "13px", fontWeight: "bold" }}>
                  เลขงาน: {displayNo}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: job.status === "รอซ่อม" ? "#dc3545" : "#28a745" }}>
                  {job.status}
                </span>
              </div>

              <h3 style={{ margin: "5px 0", fontSize: "17px" }}>{job.jobType}</h3>
              <p style={{ margin: "0 0 10px 0", color: "#555", fontSize: "14px" }}>{job.description || "ไม่ได้ระบุรายละเอียด"}</p>
              
              <div style={{ fontSize: "12px", color: "#999", marginBottom: "10px" }}>
                📅 {job.createdAt?.toDate().toLocaleString('th-TH')}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${job.location?.lat},${job.location?.lng}`}
                  target="_blank"
                  style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: "6px", border: "1px solid #007bff", color: "#007bff", textDecoration: "none", fontSize: "14px" }}
                >
                  📍 นำทาง
                </a>
                {job.imageUrl && (
                  <a 
                    href={job.imageUrl}
                    target="_blank"
                    style={{ flex: 1, textAlign: "center", padding: "8px", borderRadius: "6px", border: "1px solid #6c757d", color: "#6c757d", textDecoration: "none", fontSize: "14px" }}
                  >
                    🖼️ ดูรูป
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
