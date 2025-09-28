import React, { useState, useEffect } from "react";
import {
  adminGetUsers,
  adminGetStores,
  adminAddUser,
  adminAddStore,
  changePassword,
} from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "user",
  });
  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
  });

  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  // Change password
  const [showChangePass, setShowChangePass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passMessage, setPassMessage] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) navigate("/login");
    else loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const usersRes = await adminGetUsers();
      const storesRes = await adminGetStores();

      setUsers(
        (Array.isArray(usersRes) ? usersRes : usersRes.users || []).map(
          (u) => ({ ...u, rating: u.rating ?? (u.role === "owner" ? 0 : null) })
        )
      );
      setStores(
        (Array.isArray(storesRes) ? storesRes : storesRes.stores || []).map(
          (s) => ({
            ...s,
            ownerName: s.ownerName || "-",
            ownerRating: parseFloat(s.avgRating ?? 0),
          })
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMessage("");
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPassMessage("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setShowChangePass(false);
      } else {
        setPassMessage("" + (res.error || "Error changing password"));
      }
    } catch (err) {
      console.error(err);
      setPassMessage(" Server error, try again.");
    }
  };

  //Add User
  const handleAddUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password)
      return alert("Name, email, and password required");
    try {
      await adminAddUser(userForm);
      setUsers((prev) => [
        ...prev,
        { ...userForm, rating: userForm.role === "owner" ? 0 : null },
      ]);
      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "user",
      });
      setShowAddUser(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to add user");
    }
  };

  //Add Store
  const handleAddStore = async () => {
    if (
      !storeForm.name ||
      !storeForm.address ||
      !storeForm.ownerName ||
      !storeForm.ownerEmail ||
      !storeForm.ownerPassword
    ) {
      return alert("All store and owner fields are required");
    }
    try {
      const addedStore = await adminAddStore(storeForm);
      const storeData = addedStore.store || addedStore;
      setStores((prev) => [
        ...prev,
        { ...storeData, ownerName: storeForm.ownerName, ownerRating: 0 },
      ]);
      setUsers((prev) => [
        ...prev,
        {
          name: storeForm.ownerName,
          email: storeForm.ownerEmail,
          address: storeForm.address,
          role: "owner",
          rating: 0,
        },
      ]);
      setStoreForm({
        name: "",
        email: "",
        address: "",
        ownerName: "",
        ownerEmail: "",
        ownerPassword: "",
      });
      setShowAddStore(false);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to add store");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (filters.name === "" ||
        u.name?.toLowerCase().includes(filters.name.toLowerCase())) &&
      (filters.email === "" ||
        u.email?.toLowerCase().includes(filters.email.toLowerCase())) &&
      (filters.address === "" ||
        u.address?.toLowerCase().includes(filters.address.toLowerCase())) &&
      (filters.role === "" || u.role === filters.role)
  );

  if (loading) return <p>Loading Admin Dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2>Admin Dashboard</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setShowChangePass(!showChangePass)}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#2196f3",
              color: "white",
              cursor: "pointer",
            }}
          >
            Change Password
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#f44336",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Change Password */}
      {showChangePass && (
        <form
          onSubmit={handleChangePassword}
          style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
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
              backgroundColor: "#4CAF50",
              color: "white",
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
            marginBottom: "15px",
            color: passMessage.includes("") ? "green" : "red",
          }}
        >
          {passMessage}
        </div>
      )}

      {/* Users Section */}
      <h3>Users</h3>
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Filter by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
        />
        <input
          placeholder="Filter by Email"
          value={filters.email}
          onChange={(e) => setFilters({ ...filters, email: e.target.value })}
        />
        <input
          placeholder="Filter by Address"
          value={filters.address}
          onChange={(e) => setFilters({ ...filters, address: e.target.value })}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="user">Normal User</option>
          <option value="admin">Admin</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <thead style={{ backgroundColor: "#969ee1ff", color: "white" }}>
          <tr>
            <th style={{ padding: "10px" }}>Name</th>
            <th style={{ padding: "10px" }}>Email</th>
            <th style={{ padding: "10px" }}>Address</th>
            <th style={{ padding: "10px" }}>Role</th>
            <th style={{ padding: "10px" }}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, i) => (
            <tr
              key={i}
              style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}
            >
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                {u.role === "owner" ? u.store_address || "-" : u.address || "-"}
              </td>
              <td>{u.role || "user"}</td>
              <td>
                {u.role === "owner"
                  ? Number(u.average_rating).toFixed(2) ?? 0
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add User */}
      {!showAddUser && (
        <button
          onClick={() => setShowAddUser(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Add User
        </button>
      )}
      {showAddUser && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <h4>Add User</h4>
          <input
            placeholder="Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
          />
          <input
            placeholder="Email"
            type="email"
            value={userForm.email}
            onChange={(e) =>
              setUserForm({ ...userForm, email: e.target.value })
            }
          />
          <input
            placeholder="Password"
            type="password"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
          />
          <input
            placeholder="Address"
            type="text"
            value={userForm.address}
            onChange={(e) =>
              setUserForm({ ...userForm, address: e.target.value })
            }
          />
          <select
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
          >
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleAddUser}
              style={{
                padding: "8px 16px",
                borderRadius: "5px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
            <button
              onClick={() => setShowAddUser(false)}
              style={{
                padding: "8px 16px",
                marginLeft: "10px",
                borderRadius: "5px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stores Section */}
      <h3>Stores</h3>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          marginBottom: "10px",
        }}
      >
        <thead style={{ backgroundColor: "#969ee1ff", color: "white" }}>
          <tr>
            <th style={{ padding: "10px" }}>Store Name</th>
            <th style={{ padding: "10px" }}>Address</th>
            <th style={{ padding: "10px" }}>Email</th>
            <th style={{ padding: "10px" }}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s, i) => (
            <tr
              key={i}
              style={{ textAlign: "center", borderBottom: "1px solid #ddd" }}
            >
              <td>{s.name}</td>
              <td>{s.address || "-"}</td>
              <td>{s.email || "-"}</td>
              <td>{s.ownername || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Store */}
      {!showAddStore && (
        <button
          onClick={() => setShowAddStore(true)}
          style={{
            padding: "8px 16px",
            borderRadius: "5px",
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Store
        </button>
      )}
      {showAddStore && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <h4>Add Store + Owner</h4>
          <input
            placeholder="Store Name"
            value={storeForm.name}
            onChange={(e) =>
              setStoreForm({ ...storeForm, name: e.target.value })
            }
          />
          <input
            placeholder="Store Email (optional)"
            value={storeForm.email}
            onChange={(e) =>
              setStoreForm({ ...storeForm, email: e.target.value })
            }
          />
          <input
            placeholder="Address"
            value={storeForm.address}
            onChange={(e) =>
              setStoreForm({ ...storeForm, address: e.target.value })
            }
          />

          <h5>Owner Details</h5>
          <input
            placeholder="Owner Name"
            value={storeForm.ownerName}
            onChange={(e) =>
              setStoreForm({ ...storeForm, ownerName: e.target.value })
            }
          />
          <input
            placeholder="Owner Email"
            value={storeForm.ownerEmail}
            onChange={(e) =>
              setStoreForm({ ...storeForm, ownerEmail: e.target.value })
            }
          />
          <input
            placeholder="Owner Password"
            type="password"
            value={storeForm.ownerPassword}
            onChange={(e) =>
              setStoreForm({ ...storeForm, ownerPassword: e.target.value })
            }
          />

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={handleAddStore}
              style={{
                padding: "8px 16px",
                borderRadius: "5px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
            <button
              onClick={() => setShowAddStore(false)}
              style={{
                padding: "8px 16px",
                marginLeft: "10px",
                borderRadius: "5px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
