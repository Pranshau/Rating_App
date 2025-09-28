import React, { useEffect, useState } from "react";
import { adminGetUsers } from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      const data = await adminGetUsers();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(filter.toLowerCase()) ||
      u.email.toLowerCase().includes(filter.toLowerCase()) ||
      u.address.toLowerCase().includes(filter.toLowerCase()) ||
      u.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h2>All Users</h2>
      <input
        type="text"
        placeholder="Filter by Name, Email, Address, Role"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Rating (if Store Owner)</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.address}</td>
              <td>{u.role}</td>
              <td>{u.role === "owner" ? u.rating : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
