useEffect(() => {
  // ใช้ onSnapshot เพื่อให้ตัวเลขรันแบบ Real-time
  const q = query(collection(db, "jobs")); // มั่นใจว่าชื่อ "jobs" มี s
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const jobsData = [];
    querySnapshot.forEach((doc) => {
      jobsData.push({ id: doc.id, ...doc.data() });
    });
    
    setJobs(jobsData); // อัปเดตรายการงานทั้งหมด
    
    // คำนวณตัวเลขสรุป
    const pending = jobsData.filter(j => j.status === "รอซ่อม").length;
    const completed = jobsData.filter(j => j.status === "ซ่อมเสร็จแล้ว").length;
    
    setStats({
      total: jobsData.length,
      pending: pending,
      completed: completed
    });
  });

  return () => unsubscribe();
}, []);
