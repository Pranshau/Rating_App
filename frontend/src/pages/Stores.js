import React, { useState, useEffect } from "react";
import { getStores, submitRating, changePassword } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Stores() {
  const [stores, setStores] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [error, setError] = useState("");
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMessage, setPassMessage] = useState("");

  const navigate = useNavigate();

  const loadStores = async () => {
    try {
      const params = {};
      if (searchName) params.name = searchName;
      if (searchAddress) params.address = searchAddress;
      const res = await getStores(params);
      if (res.error) setError(res.error);
      else setStores(res.stores || res);
    } catch (err) {
      console.error(err);
      setError("Failed to load stores.");
    }
  };

  useEffect(() => {
    loadStores();
  }, [searchName, searchAddress]);

  const onRate = async (storeId, value) => {
    setError("");
    try {
      const res = await submitRating(storeId, parseInt(value, 10));
      if (res.error) setError(res.error);
      else loadStores();
    } catch (err) {
      console.error(err);
      setError("Failed to submit rating.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage("");
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPassMessage(" Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setShowChangePass(false);
      } else {
        setPassMessage(" " + (res.error || "Error changing password"));
      }
    } catch (err) {
      console.error(err);
      setPassMessage(" Server error, try again.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Stores</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setShowChangePass(!showChangePass)}
            style={{
              padding: "6px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: "#f1f1f1",
              cursor: "pointer",
            }}
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      {showChangePass && (
        <form
          onSubmit={handleChangePassword}
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              flex: 1,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#2196f3",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Update
          </button>
        </form>
      )}
      {passMessage && (
        <div
          style={{
            marginBottom: "10px",
            color: passMessage.includes("✅") ? "green" : "red",
          }}
        >
          {passMessage}
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            padding: "8px",
            flex: 1,
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <input
          placeholder="Search by address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          style={{
            padding: "8px",
            flex: 1,
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={loadStores}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      {/* Stores Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#90caf9", color: "#000" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Store Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Address</th>
            <th style={{ padding: "12px", textAlign: "center" }}>
              Overall Rating
            </th>
            <th style={{ padding: "12px", textAlign: "center" }}>
              Your Rating
            </th>
            <th style={{ padding: "12px", textAlign: "center" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: "12px", textAlign: "center" }}>
                No stores found.
              </td>
            </tr>
          )}
          {stores.map((store) => (
            <tr
              key={store.id}
              style={{
                borderBottom: "1px solid #ddd",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f9f9f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <td style={{ padding: "12px" }}>{store.name}</td>
              <td style={{ padding: "12px" }}>{store.address}</td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                <span
                  style={{
                    backgroundColor: "#ffeb3b",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {store.overall_rating
                    ? parseFloat(store.overall_rating).toFixed(2)
                    : "0.00"}
                </span>
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                {store.user_rating || "-"}
              </td>
              <td style={{ padding: "12px", textAlign: "center" }}>
                <select
                  defaultValue={store.user_rating || ""}
                  onChange={(e) => onRate(store.id, e.target.value)}
                  style={{
                    padding: "6px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">-- rate --</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
