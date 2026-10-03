import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createUserRole,
  deleteUserRole,
  getUserRoles,
  updateUserRole,
  type UserRole,
} from "../../../../services/userRoleService";

import { useConfirm } from "../../../../components/ui/useConfirm";
import "./UserRoles.css";

const UserRoles = () => {
  const confirm = useConfirm();

  /* =========================================
     STATE
  ========================================= */

  const [roles, setRoles] = useState<UserRole[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingRole, setEditingRole] =
    useState<UserRole | null>(null);

  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<"Active" | "Inactive">("Active");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);


  /* =========================================
     FETCH USER ROLES
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadRoles = async () => {
      try {
        const response = await getUserRoles();

        if (!cancelled) {
          setRoles(response.data || []);
        }
      } catch (error) {
        console.error(
          "Error fetching user roles:",
          error
        );

        if (!cancelled) {
          setError(
            "Failed to load user roles"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================
     REFRESH ROLES
  ========================================= */

  const refreshRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getUserRoles();

      setRoles(response.data || []);
    } catch (error) {
      console.error(
        "Error refreshing user roles:",
        error
      );

      setError(
        "Failed to load user roles"
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("Active");

    setEditingRole(null);
    setShowForm(false);
    setError("");
  };


  /* =========================================
     ADD ROLE
  ========================================= */

  const handleAdd = () => {
    setEditingRole(null);

    setName("");
    setDescription("");
    setStatus("Active");

    setError("");
    setShowForm(true);
  };


  /* =========================================
     EDIT ROLE
  ========================================= */

  const handleEdit = (
    role: UserRole
  ) => {
    setEditingRole(role);

    setName(role.name);

    setDescription(
      role.description || ""
    );

    setStatus(
      role.status || "Active"
    );

    setError("");
    setShowForm(true);
  };


  /* =========================================
     SAVE ROLE
  ========================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Role name is required"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      /* UPDATE */

      if (editingRole) {
        await updateUserRole(
          editingRole._id,
          {
            name: name.trim(),
            description:
              description.trim(),
            status,
          }
        );
      }

      /* CREATE */

      else {
        await createUserRole({
          name: name.trim(),
          description:
            description.trim(),
          status,
        });
      }

      await refreshRoles();

      resetForm();

    } catch (error) {
      console.error(
        "Error saving user role:",
        error
      );

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const axiosError =
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

        setError(
          axiosError.response?.data
            ?.message ||
            "Failed to save user role"
        );
      } else {
        setError(
          "Failed to save user role"
        );
      }

    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     DELETE ROLE
  ========================================= */

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      await confirm(
        "Are you sure you want to delete this user role?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteUserRole(id);

      await refreshRoles();

    } catch (error) {
      console.error(
        "Error deleting user role:",
        error
      );

      setError(
        "Failed to delete user role"
      );
    }
  };


  /* =========================================
     SEARCH
  ========================================= */

  const filteredRoles =
    roles.filter((role) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        role.name
          .toLowerCase()
          .includes(searchText) ||

        (role.description || "")
          .toLowerCase()
          .includes(searchText) ||

        role.status
          .toLowerCase()
          .includes(searchText)
      );
    });


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="user-roles-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="user-roles-header">

        <div>
          <h1>User Roles</h1>

          <p>
            Manage user roles and permissions
          </p>
        </div>

        <button
          type="button"
          className="add-role-button"
          onClick={handleAdd}
        >
          + Add Role
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="user-role-error">
          {error}
        </div>
      )}


      {/* =====================================
          ADD / EDIT FORM
      ===================================== */}

      {showForm && (
        <div className="user-role-form-card">

          <div className="form-card-header">

            <h2>
              {editingRole
                ? "Edit User Role"
                : "Add User Role"}
            </h2>

            <button
              type="button"
              className="close-form-button"
              onClick={resetForm}
            >
              ×
            </button>

          </div>


          <form
            className="user-role-form"
            onSubmit={handleSubmit}
          >

            {/* ROLE NAME */}

            <div className="form-group">

              <label>
                Role Name
                <span>*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Enter role name"
              />

            </div>


            {/* DESCRIPTION */}

            <div className="form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Enter role description"
                rows={4}
              />

            </div>


            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "Active"
                      | "Inactive"
                  )
                }
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>


            {/* ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingRole
                  ? "Update"
                  : "Save"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================
          TABLE CARD
      ===================================== */}

      <div className="user-roles-card">

        {/* TOOLBAR */}

        <div className="user-roles-toolbar">

          <div className="role-count">

            <strong>
              User Roles
            </strong>

            <span>
              {filteredRoles.length} Records
            </span>

          </div>


          {/* SEARCH */}

          <div className="role-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search roles..."
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="user-roles-table-wrapper">

          {/* LOADING */}

          {loading && (
            <div className="role-loading">
              Loading user roles...
            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            filteredRoles.length === 0 && (
              <div className="role-empty">
                No user roles found
              </div>
            )}


          {/* DATA */}

          {!loading &&
            filteredRoles.length > 0 && (

              <table className="user-roles-table">

                <thead>

                  <tr>

                    <th>
                      Role Name
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRoles.map(
                    (role) => (

                      <tr
                        key={role._id}
                      >

                        <td>
                          <strong>
                            {role.name}
                          </strong>
                        </td>

                        <td>
                          {role.description ||
                            "—"}
                        </td>

                        <td>

                          <span
                            className={`role-status ${
                              role.status ===
                              "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {role.status}
                          </span>

                        </td>

                        <td>

                          <div className="role-actions">

                            <button
                              type="button"
                              className="edit-button"
                              onClick={() =>
                                handleEdit(
                                  role
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="delete-button"
                              onClick={() =>
                                handleDelete(
                                  role._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

        </div>

      </div>

    </div>
  );
};

export default UserRoles;