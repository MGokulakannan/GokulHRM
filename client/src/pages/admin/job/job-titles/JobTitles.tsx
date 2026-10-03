import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createJobTitle,
  deleteJobTitle,
  getJobTitles,
  updateJobTitle,
  type JobTitle,
} from "../../../../services/jobTileService"

import { useConfirm } from "../../../../components/ui/useConfirm";
import "./JobTitles.css";

const JobTitles = () => {
  const confirm = useConfirm();

  /* =========================================
     STATE
  ========================================= */

  const [jobTitles, setJobTitles] = useState<JobTitle[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingJobTitle, setEditingJobTitle] =
    useState<JobTitle | null>(null);

  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  const [status, setStatus] =
    useState<"Active" | "Inactive">("Active");

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);


  /* =========================================
     INITIAL LOAD
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadJobTitles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getJobTitles();

        if (!cancelled) {
          setJobTitles(response.data || []);
        }
      } catch (error) {
        console.error(
          "Error fetching job titles:",
          error
        );

        if (!cancelled) {
          setError(
            "Failed to load job titles"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJobTitles();

    return () => {
      cancelled = true;
    };
  }, []);


  /* =========================================
     REFRESH JOB TITLES
  ========================================= */

  const refreshJobTitles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJobTitles();

      setJobTitles(response.data || []);
    } catch (error) {
      console.error(
        "Error refreshing job titles:",
        error
      );

      setError(
        "Failed to load job titles"
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

    setEditingJobTitle(null);
    setShowForm(false);
    setError("");
  };


  /* =========================================
     OPEN ADD FORM
  ========================================= */

  const handleAdd = () => {
    setEditingJobTitle(null);

    setName("");
    setDescription("");
    setStatus("Active");

    setError("");
    setShowForm(true);
  };


  /* =========================================
     OPEN EDIT FORM
  ========================================= */

  const handleEdit = (
    jobTitle: JobTitle
  ) => {
    setEditingJobTitle(jobTitle);

    setName(jobTitle.name);

    setDescription(
      jobTitle.description || ""
    );

    setStatus(
      jobTitle.status || "Active"
    );

    setError("");
    setShowForm(true);
  };


  /* =========================================
     SAVE JOB TITLE
  ========================================= */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Job title name is required"
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      /* UPDATE */

      if (editingJobTitle) {
        await updateJobTitle(
          editingJobTitle._id,
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
        await createJobTitle({
          name: name.trim(),
          description:
            description.trim(),
          status,
        });
      }

      await refreshJobTitles();

      resetForm();

    } catch (error) {
      console.error(
        "Error saving job title:",
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
            "Failed to save job title"
        );
      } else {
        setError(
          "Failed to save job title"
        );
      }

    } finally {
      setSaving(false);
    }
  };


  /* =========================================
     DELETE JOB TITLE
  ========================================= */

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      await confirm(
        "Are you sure you want to delete this job title?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteJobTitle(id);

      await refreshJobTitles();

    } catch (error) {
      console.error(
        "Error deleting job title:",
        error
      );

      setError(
        "Failed to delete job title"
      );
    }
  };


  /* =========================================
     SEARCH
  ========================================= */

  const filteredJobTitles =
    jobTitles.filter((jobTitle) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        jobTitle.name
          .toLowerCase()
          .includes(searchText) ||

        (jobTitle.description || "")
          .toLowerCase()
          .includes(searchText) ||

        jobTitle.status
          .toLowerCase()
          .includes(searchText)
      );
    });


  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="job-titles-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="job-titles-header">

        <div>
          <h1>Job Titles</h1>

          <p>
            Manage job titles
          </p>
        </div>

        <button
          type="button"
          className="add-job-title-button"
          onClick={handleAdd}
        >
          + Add Job Title
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="job-title-error">
          {error}
        </div>
      )}


      {/* =====================================
          ADD / EDIT FORM
      ===================================== */}

      {showForm && (
        <div className="job-title-form-card">

          <div className="job-title-form-header">

            <h2>
              {editingJobTitle
                ? "Edit Job Title"
                : "Add Job Title"}
            </h2>

            <button
              type="button"
              className="close-job-title-form"
              onClick={resetForm}
            >
              ×
            </button>

          </div>


          <form
            className="job-title-form"
            onSubmit={handleSubmit}
          >

            {/* JOB TITLE */}

            <div className="job-title-form-group">

              <label>
                Job Title
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
                placeholder="Enter job title"
              />

            </div>


            {/* DESCRIPTION */}

            <div className="job-title-form-group">

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
                placeholder="Enter description"
                rows={4}
              />

            </div>


            {/* STATUS */}

            <div className="job-title-form-group">

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


            {/* FORM ACTIONS */}

            <div className="job-title-form-actions">

              <button
                type="button"
                className="job-title-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="job-title-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingJobTitle
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

      <div className="job-titles-card">

        {/* TOOLBAR */}

        <div className="job-titles-toolbar">

          <div className="job-title-count">

            <strong>
              Job Titles
            </strong>

            <span>
              {filteredJobTitles.length} Records
            </span>

          </div>


          {/* SEARCH */}

          <div className="job-title-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search job titles..."
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="job-titles-table-wrapper">

          {loading && (
            <div className="job-title-loading">
              Loading job titles...
            </div>
          )}


          {!loading &&
            filteredJobTitles.length === 0 && (
              <div className="job-title-empty">
                No job titles found
              </div>
            )}


          {!loading &&
            filteredJobTitles.length > 0 && (

              <table className="job-titles-table">

                <thead>

                  <tr>

                    <th>
                      Job Title
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

                  {filteredJobTitles.map(
                    (jobTitle) => (

                      <tr
                        key={jobTitle._id}
                      >

                        <td>
                          <strong>
                            {jobTitle.name}
                          </strong>
                        </td>

                        <td>
                          {jobTitle.description ||
                            "—"}
                        </td>

                        <td>

                          <span
                            className={`job-title-status ${
                              jobTitle.status ===
                              "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {jobTitle.status}
                          </span>

                        </td>

                        <td>

                          <div className="job-title-actions">

                            <button
                              type="button"
                              className="job-title-edit-button"
                              onClick={() =>
                                handleEdit(
                                  jobTitle
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="job-title-delete-button"
                              onClick={() =>
                                handleDelete(
                                  jobTitle._id
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

export default JobTitles;