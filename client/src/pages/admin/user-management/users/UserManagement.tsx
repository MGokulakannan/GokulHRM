import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEmployees, deleteEmployee } from "../../../../services/employeeService";

import { useToast } from "../../../../components/ui/useToast";
import { useConfirm } from "../../../../components/ui/useConfirm";
import "./UserManagement.css";


// =====================================================
// USER INTERFACE
// =====================================================

interface User {
  _id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
}


// =====================================================
// USER MANAGEMENT
// =====================================================

const UserManagement = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();


  const navigate = useNavigate();


  // ===================================================
  // STATE
  // ===================================================

  const [users, setUsers] = useState<User[]>([]);

  const [searchUsername, setSearchUsername] =
    useState("");

  const [searchRole, setSearchRole] =
    useState("");

  const [searchEmployee, setSearchEmployee] =
    useState("");

  const [searchStatus, setSearchStatus] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  // ===================================================
  // FETCH USERS
  // ===================================================

  const fetchUsers = async (): Promise<void> => {

    try {

      setLoading(true);

      const response = await getEmployees();

      console.log("Users:", response);

      if (response.success) {

        setUsers(response.data);

      } else {

        setUsers([]);

      }

    } catch (error) {

      console.error(
        "Failed to fetch users:",
        error
      );

      setUsers([]);

    } finally {

      setLoading(false);

    }
  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    // The API request intentionally updates
    // component state after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers();

  }, []);


  // ===================================================
  // SEARCH
  // ===================================================

  const filteredUsers = users.filter((user) => {

    const username =
      user.email?.toLowerCase() || "";

    const role =
      user.role?.toLowerCase() || "";

    const employeeName =
      `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim().toLowerCase();

    const status =
      user.status?.toLowerCase() || "";


    const usernameMatch =
      username.includes(
        searchUsername.toLowerCase()
      );

    const roleMatch =
      searchRole === "" ||
      role === searchRole.toLowerCase();

    const employeeMatch =
      employeeName.includes(
        searchEmployee.toLowerCase()
      );

    const statusMatch =
      searchStatus === "" ||
      status === searchStatus.toLowerCase();


    return (
      usernameMatch &&
      roleMatch &&
      employeeMatch &&
      statusMatch
    );

  });


  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {

    setSearchUsername("");
    setSearchRole("");
    setSearchEmployee("");
    setSearchStatus("");

  };


  // ===================================================
  // DELETE USER
  // ===================================================

  const handleDelete = async (
    id: string
  ) => {

    const confirmDelete =
      await confirm(
        "Are you sure you want to delete this user?"
      );


    if (!confirmDelete) {
      return;
    }


    try {

      const response =
        await deleteEmployee(id);


      if (response.success) {

        showToast("User deleted successfully", "success");

        await fetchUsers();

      } else {

        showToast(response.message ||
          "Failed to delete user", "error");

      }

    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );

      showToast("Failed to delete user", "error");

    }

  };


  // ===================================================
  // EDIT USER
  // ===================================================

  const handleEdit = (
    id: string
  ) => {

    navigate(
      `/employees/edit/${id}`
    );

  };


  // ===================================================
  // ADD USER
  // ===================================================

  const handleAdd = () => {

    navigate("/employees");

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="user-management-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="user-management-header">

        <div>

          <h1>
            Admin / User Management
          </h1>

          <p>
            Manage system users and their access
          </p>

        </div>

      </div>


      {/* =================================================
          SEARCH CARD
      ================================================= */}

      <div className="user-search-card">


        {/* USERNAME */}

        <div className="user-search-group">

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Username"
            value={searchUsername}
            onChange={(e) =>
              setSearchUsername(
                e.target.value
              )
            }
          />

        </div>


        {/* USER ROLE */}

        <div className="user-search-group">

          <label>
            User Role
          </label>

          <select
            value={searchRole}
            onChange={(e) =>
              setSearchRole(
                e.target.value
              )
            }
          >

            <option value="">
              -- Select --
            </option>

            <option value="Admin">
              Admin
            </option>

            <option value="Employee">
              Employee
            </option>

          </select>

        </div>


        {/* EMPLOYEE NAME */}

        <div className="user-search-group">

          <label>
            Employee Name
          </label>

          <input
            type="text"
            placeholder="Type for hints..."
            value={searchEmployee}
            onChange={(e) =>
              setSearchEmployee(
                e.target.value
              )
            }
          />

        </div>


        {/* STATUS */}

        <div className="user-search-group">

          <label>
            Status
          </label>

          <select
            value={searchStatus}
            onChange={(e) =>
              setSearchStatus(
                e.target.value
              )
            }
          >

            <option value="">
              -- Select --
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

        </div>


        {/* SEARCH ACTIONS */}

        <div className="user-search-actions">

          <button
            type="button"
            className="reset-button"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="button"
            className="search-button"
          >
            Search
          </button>

        </div>

      </div>


      {/* =================================================
          USER TABLE CARD
      ================================================= */}

      <div className="user-table-card">


        {/* TABLE TOP */}

        <div className="user-table-top">

          <button
            type="button"
            className="add-user-button"
            onClick={handleAdd}
          >
            + Add
          </button>

        </div>


        {/* RECORD COUNT */}

        <div className="user-record-count">

          ({filteredUsers.length})
          {" "}Records Found

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="user-table-wrapper">

          <table className="user-table">


            {/* TABLE HEADER */}

            <thead>

              <tr>

                <th className="checkbox-column">

                  <input
                    type="checkbox"
                  />

                </th>

                <th>
                  Username
                </th>

                <th>
                  User Role
                </th>

                <th>
                  Employee Name
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>


              {/* LOADING */}

              {loading ? (

                <tr>

                  <td
                    colSpan={6}
                    className="user-loading"
                  >
                    Loading users...
                  </td>

                </tr>

              ) : filteredUsers.length === 0 ? (

                /* EMPTY */

                <tr>

                  <td
                    colSpan={6}
                    className="user-empty"
                  >
                    No Records Found
                  </td>

                </tr>

              ) : (

                /* USERS */

                filteredUsers.map(
                  (user) => {

                    const fullName =
                      `${user.firstName || ""} ${
                        user.lastName || ""
                      }`.trim();


                    return (

                      <tr
                        key={user._id}
                      >


                        {/* CHECKBOX */}

                        <td className="checkbox-column">

                          <input
                            type="checkbox"
                          />

                        </td>


                        {/* USERNAME */}

                        <td>

                          {user.email ||
                            "-"}

                        </td>


                        {/* ROLE */}

                        <td>

                          {user.role ||
                            "-"}

                        </td>


                        {/* EMPLOYEE */}

                        <td>

                          {fullName ||
                            "-"}

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={`user-status ${
                              user.status
                                ?.toLowerCase() ===
                              "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >

                            {user.status ||
                              "-"}

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="user-actions">


                            {/* DELETE */}

                            <button
                              type="button"
                              className="user-delete-button"
                              title="Delete"
                              onClick={() =>
                                handleDelete(
                                  user._id
                                )
                              }
                            >
                              🗑
                            </button>


                            {/* EDIT */}

                            <button
                              type="button"
                              className="user-edit-button"
                              title="Edit"
                              onClick={() =>
                                handleEdit(
                                  user._id
                                )
                              }
                            >
                              ✎
                            </button>


                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};


export default UserManagement;