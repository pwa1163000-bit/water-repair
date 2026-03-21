"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  const getColor = (status) => {
    if (status === "รอซ่อม") return "red";
    if (status === "กำลังซ่อม") return "orange";
    if (status === "เสร็จแล้ว") return "green";
    return "black";
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 เปลี่ยนสถานะ
  const updateStatus = async (id, newStatus) => {
    const ref = doc(db, "jobs", id);
    await updateDoc(ref, {
      status: newStatus,
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📋 รายการงานทั้งหมด</h1>

      {jobs.length === 0 ? (
        <p>ยังไม่มีงาน</p>
      ) : (
        jobs.map((job) => (
          <div
            key={job.id}
            style={{
              border: "1px solid #ccc",
              margin: "10px 0",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            <p><b>เลขงาน:</b> {job.jobNo || "-"}</p>
            <p><b>รายละเอียด:</b> {job.title}</p>

            <p>
              <b>สถานะ:</b>{" "}
              <span
                style={{
                  backgroundColor: getColor(job.status),
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
              >
                {job.status}
              </span>
            </p>

            {/* 🔥 ปุ่มเปลี่ยนสถานะ */}
            <div style={{ marginTop: 10 }}>
              <button onClick={() => updateStatus(job.id, "รอซ่อม")}>
                🔴 รอซ่อม
              </button>

              <button onClick={() => updateStatus(job.id, "กำลังซ่อม")}>
                🟡 กำลังซ่อม
              </button>

              <button onClick={() => updateStatus(job.id, "เสร็จแล้ว")}>
                🟢 เสร็จแล้ว
              </button>
            </div>

            {/* 🗺️ แผนที่ */}
            {job.location && (
              <div style={{ marginTop: 10 }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}`}
                  target="_blank"
                >
                  🗺️ เปิดแผนที่
                </a>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
