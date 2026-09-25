import { useEffect, useState } from "react";


  


function App() {
  const [status, setStatus] = useState("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("server not reachable"));
  }, []);

  return (
    <main>
      <h1>AyuLink</h1>
      <p>NAMASTE to ICD-11 TM2 mapping: clinician review dashboard</p>
      <p>Server status: {status}</p>

    </main>
  );
}

export default App;
