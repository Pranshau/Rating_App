import React, { useEffect, useState } from "react";
import { ownerGetStores, ownerGetStoreRatings } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function OwnerDashboard() {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStores() {
      try {
        const ownerStores = await ownerGetStores();
        if (!Array.isArray(ownerStores)) throw new Error("Invalid data");

        // Compute average rating
        const storesWithRatings = await Promise.all(
          ownerStores.map(async (store) => {
            const storeRatings = await ownerGetStoreRatings(store.id);
            const totalRatings = storeRatings.length;
            const avgRating =
              totalRatings > 0
                ? (
                    storeRatings.reduce((sum, r) => sum + r.rating, 0) /
                    totalRatings
                  ).toFixed(2)
                : "0.00";
            return {
              ...store,
              average_rating: avgRating,
              total_ratings: totalRatings,
            };
          })
        );

        setStores(storesWithRatings);
      } catch (err) {
        console.error(err);
        setError("Failed to load your stores");
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, []);

  async function viewRatings(storeId) {
    try {
      const res = await ownerGetStoreRatings(storeId);
      if (!Array.isArray(res)) throw new Error("Invalid ratings data");
      setRatings(res);
      setSelectedStore(storeId);
    } catch (err) {
      console.error(err);
      setError("Failed to load ratings");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Owner Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{ padding: "8px 15px", borderRadius: "5px" }}
        >
          Logout
        </button>
      </div>

      {/* Stores Table */}
      <table
        border="1"
        cellPadding="10"
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <thead style={{ backgroundColor: "#969ee1ff", color: "white" }}>
          <tr>
            <th>Store Name</th>
            <th>Address</th>
            <th>Average Rating</th>
            <th>Total Ratings</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr
              key={s.id}
              style={
                selectedStore === s.id ? { backgroundColor: "#f0f0f0" } : {}
              }
            >
              <td>{s.name}</td>
              <td>{s.address}</td>
              <td>{s.average_rating}</td>
              <td>{s.total_ratings}</td>
              <td>
                <button onClick={() => viewRatings(s.id)}>View Ratings</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ratings Table */}
      {selectedStore && (
        <div>
          <h3>
            User Ratings for Store:{" "}
            {stores.find((s) => s.id === selectedStore)?.name}
          </h3>
          {ratings.length === 0 ? (
            <p>No ratings yet.</p>
          ) : (
            <table
              border="1"
              cellPadding="10"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead style={{ backgroundColor: "#969ee1ff", color: "white" }}>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.name}</td>
                    <td>{r.email}</td>
                    <td>{r.rating}</td>
                    <td>{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
