"use client";
import { useState } from "react";
import { db } from "@/lib/firebase"; // เชื่อมต่อฐานข้อมูล
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function CreateJob() {
  const router = useRouter();
  const [location, setLocation] = useState({ lat: "", lng: "" });
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("ท่อแตกรั่ว");
  const [isUrgent, setIsUrgent] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // 1. ฟังก์ชันดึงพิกัด (GPS)
  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        alert("ปักหมุดสำเร็จ!");
      }, (error) => {
        alert("กรุณาเปิด GPS บนมือถือของท่าน");
      });
    } else {
      alert("มือถือของคุณไม่รองรับการดึงพิกัด");
    }
  };

  // 2. ฟังก์ชันส่งรูปไป ImgBB
  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    const apiKey = "64e2261d33f516b0a748c0d7fb105e2e"; 

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.data.url);
        alert("อัปโหลดรูปภาพเรียบร้อย!");
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการโหลดรูป");
    } finally {
      setUploading(false);
    }
  };

  // 3. ฟังก์ชันส่งข้อมูลเข้า Firebase Firestore
  const handleSubmit = async () => {
    if (!location.lat || !imageUrl) {
      alert("กรุณาปักพิกัดและถ่ายรูปก่อนส่งงานครับ");
      return;
    }

    try {
      setUploading(true);
      await addDoc(collection(db, "jobs"), {
        jobType,
        description,
        location,
        imageUrl,
        isUrgent,
        status: "รอซ่อม", // สถานะเริ่มต้นสำหรับ Dashboard
        createdAt: serverTimestamp(),
      });

      alert("ส่งงานเข้าสู่ระบบสำเร็จ!");
      router.push("/dashboard"); // ส่งเสร็จแล้วเด้งไปหน้า Dashboard ทันที
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", fontFamily: "sans-serif" }}>
      <h2 style={{ textAlign: "center", color: "#0056b3" }}>📋 เปิดงานซ่อมท่อใหม่</h2>
      <hr />
      
      <div style={{ marginBottom: "15px" }}>
        <label>ลักษณะที่แตก/ชำรุด:</label>
        <select 
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          style={{ width: "100%", padding: "12px", marginTop: "5px", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          <option>ท่อแตกรั่ว</
