"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, orderBy, query } from "firebase/firestore";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("ทั้งหมด"); // สำหรับแยกประเภทงาน

  const statusColors = {
    "รอซ่อม": "#e74c3c",
    "กำลังซ่อม": "#f39c12",
    "เสร็จแล้ว": "#2ecc71"
  };

  useEffect(() => {
    // เพิ่ม query เพื่อเรียงลำดับงานล่าสุดขึ้นก่อน
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

  // กรองข้อมูลตาม Tab ที่เลือก
  const filteredJobs = filter === "ทั้งหมด" 
    ? jobs 
    : jobs.filter(job => job.status === filter);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", fontFamily: "'Sarabun', sans-serif" }}>
      <h1 style={{ textAlign: "center", color: "#2c3e50" }}>📋 ระบบจัดการงานซ่อม (กปภ. ท่าเรือ)</h1>
      
      {/* ส่วนเลือกสถานะ (Tabs) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        {["ทั้งหมด", "รอซ่อม", "กำลังซ่อม", "เสร็จแล้ว"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              cursor: "pointer",
              backgroundColor: filter === st ? "#3498db" : "white",
              color: filter === st ? "white" : "#333",
              transition: "0.3s"
            }}
          >
            {st}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "15px" }}>
        {filteredJobs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999" }}>ไม่พบข้อมูลงานในหมวดนี้</p>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              style={{
                border: "none",
                padding: "20px",
                borderRadius: "15px",
                backgroundColor: "white",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 10px 0", color: "#34495e" }}>เลขงาน: {job.jobNo || "ยังไม่มีรหัส"}</h3>
                  <p style={{ margin: "5px 0", color: "#7f8c8d" }}><b>อาการ:</b> {job.title}</p>
                  <p style={{ margin: "5px 0", fontSize: "14px", color: "#95a5a6" }}>
                    บันทึกเมื่อ: {job.createdAt?.toDate().toLocaleString('th-TH')}
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: statusColors[job.status] || "#bdc3c7",
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: "50px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}
                >
                  {job.status}
                </span>
              </div>

              <hr style={{ border: "0.5px solid #eee", margin: "15px 0" }} />

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>เปลี่ยนสถานะ:</span>
                <button onClick={() => updateStatus(job.id, "รอซ่อม")} style={btnStyle("#e74c3c")}>🔴 รอ</button>
                <button onClick={() => updateStatus(job.id, "กำลังซ่อม")} style={btnStyle("#f39c12")}>🟡 กำลัง</button>
                <button onClick={() => updateStatus(job.id, "เสร็จแล้ว")} style={btnStyle("#2ecc71")}>🟢 เสร็จ</button>
                
                {job.location?.lat && (
                  <a
                    href={`https://www.google.com/maps?q=${job.location.lat},${job.location.lng}`}
                    target="_blank"
                    style={{
                      marginLeft: "auto",
                      textDecoration: "none",
                      backgroundColor: "#4285F4",
                      color: "white",
                      padding: "8px 15px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    📍 นำทาง
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

// สไตล์ปุ่มแบบ Reuse
const btnStyle = (color) => ({
  backgroundColor: "white",
  border: `1px solid ${color}`,
  color: color,
  padding: "5px 10px",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold"
});
