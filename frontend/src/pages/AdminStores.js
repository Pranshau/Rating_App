import React, { useEffect, useState } from "react";
import { adminGetStores } from "../services/api";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStores() {
      try {
        const data = await adminGetStores();
        setStores(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load stores");
      }
    }
    fetchStores();
  }, []);

  const filteredStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(filter.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Stores</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Filter by Name, Email, Address"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ marginBottom: "10px", padding: "5px", width: "300px" }}
      />
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ backgroundColor: "#969ee1ff", color: "white" }}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Average Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredStores.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.email || "-"}</td>
              <td>{s.address || "-"}</td>
              <td>{s.avg_rating || "0.00"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminStores;
