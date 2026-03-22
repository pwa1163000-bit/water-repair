"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { GoogleMap, useJsApiLoader, Marker, MarkerClusterer, InfoWindow } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "90vh" };
// พิกัดเริ่มต้น (ตัวอย่าง: พื้นที่อำเภอท่าเรือ)
const center = { lat: 14.5655, lng: 100.7196 }; 

export default function MapPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // ⚠️ ต้องนำ Key จาก Google Cloud มาใส่ที่นี่
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(data);
    });
    return () => unsubscribe();
  }, []);

  const getIcon = (status) => {
    if (status === "รอซ่อม") return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (status === "กำลังซ่อม") return "http://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    if (status === "เสร็จแล้ว") return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
    return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  };

  return isLoaded ? (
    <div style={{ padding: "10px" }}>
      <h2 style={{ marginBottom: "10px" }}>🗺️ แผนที่จุดแจ้งซ่อม (Clustering)</h2>
      
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        <MarkerClusterer>
          {(clusterer) =>
            jobs.map((job) => (
              job.location && (
                <Marker
                  key={job.id}
                  position={{ lat: job.location.lat, lng: job.location.lng }}
                  clusterer={clusterer}
                  icon={getIcon(job.status)}
                  onClick={() => setSelectedJob(job)}
                />
              )
            ))
          }
        </MarkerClusterer>

        {selectedJob && (
          <InfoWindow
            position={{ lat: selectedJob.location.lat, lng: selectedJob.location.lng }}
            onCloseClick={() => setSelectedJob(null)}
          >
            <div style={{ color: "#000", padding: "5px" }}>
              <h4 style={{ margin: "0 0 5px 0" }}>งานเลขที่: {selectedJob.jobNo}</h4>
              <p style={{ margin: "0" }}><b>อาการ:</b> {selectedJob.title}</p>
              <p style={{ margin: "5px 0" }}><b>สถานะ:</b> {selectedJob.status}</p>
              <a 
                href={`https://www.google.com/maps?q=${selectedJob.location.lat},${selectedJob.location.lng}`} 
                target="_blank"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                เปิดใน Google Maps
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  ) : <p>กำลังโหลดแผนที่...</p>;
}
