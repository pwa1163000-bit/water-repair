"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // 🔥 realtime
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setJobs(data);
    });

    return () => unsubscribe();
  }, []);

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
            <p><b>สถานะ:</b> {job.status}</p>
          </div>
        ))
      )}
    </div>
  );
}
