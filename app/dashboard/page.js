"use client";
import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    // ดึงข้อมูล Real-time จาก jobs และเรียงตามเวลาที่สร้าง (เก่าไปใหม่ เพื่อให้เลขรันไม่สลับกัน)
    const q = query(collection(db, "jobs"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setJobs(jobList);

      // คำนวณสถิติ
      setStats({
        total: jobList.length,
        pending: jobList.filter(j => j.status === "รอซ่อม").length,
        completed: jobList.filter(j => j.status === "ซ่อมเสร็จแล้ว").length
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📊 ติดตามงานซ่อม กปภ.ท่าเรือ</h2>
      
      {/* ส่วนแสดงตัวเลขสรุป */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <div style={{ flex: 1, padding: "15px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <div style={{ color: "#666", fontSize: "14px" }}>งานทั้งหมด</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{stats.total}</div>
        </div>
        <div style={{ flex: 1, padding: "15px", background: "#fff", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", borderBottom: "4px solid red" }}>
          <div style={{ color: "#666", fontSize: "14px" }}>รอซ่อม</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "red" }}>{stats.pending}</div>
        </div>
      </div>

      {/* รายการงานซ่อม */}
      <div>
        {[...jobs].reverse().map((job, index) => {
          // คำนวณเลขรันงาน: ใช้ลำดับในอาเรย์มาทำ 001, 002...
          // jobs.length - index เพื่อให้งานใหม่ล่าสุดได้เลขรันล่าสุด
          const runNo = (jobs.length - index).toString().padStart(3, '0');
          const jobNoDisplay = job.jobNo || `${runNo}/69`;

          return (
            <div key={job.id} style={{ padding: "15px", background: "#fff", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ backgroundColor: "#
