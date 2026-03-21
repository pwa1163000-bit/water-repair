"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export default function CreateJob() {
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    await addDoc(collection(db, "jobs"), {
      title,
      status: "รอซ่อม",
    });
    alert("บันทึกสำเร็จ");
  };

  return (
    <div>
      <h2>แจ้งงาน</h2>
      <input onChange={(e) => setTitle(e.target.value)} />
      <button onClick={handleSubmit}>บันทึก</button>
    </div>
  );
}
