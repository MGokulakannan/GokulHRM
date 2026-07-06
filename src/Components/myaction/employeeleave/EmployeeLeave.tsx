import { useEffect, useState } from "react";

type Employee = {
  id: number;
  name: string;
  department: string;
  status: string;
};

function EmployeeLeave() {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("leaveEmployees");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "John",
            department: "IT",
            status: "On Leave",
          },
          {
            id: 2,
            name: "David",
            department: "HR",
            status: "Half Day",
          },
        ];
  });

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("leaveEmployees", JSON.stringify(employees));
  }, [employees]);

  const addEmployee = () => {
    if (name.trim() === "" || department.trim() === "" || status === "") {
      alert("Please fill all fields");
      return;
    }

    const newEmployee: Employee = {
      id: Date.now(),
      name,
      department,
      status,
    };

    setEmployees([...employees, newEmployee]);

    setName("");
    setDepartment("");
    setStatus("");
    setShowForm(false);
  };

  const deleteEmployee = (id: number) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h4 className="mb-0">Employee Leave Details</h4>

          <button
            className="btn btn-success"
            onClick={() => setShowForm(true)}
          >
            + Add Employee
          </button>

        </div>

        <div className="card-body">

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search Employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {showForm && (
            <div className="border rounded p-3 mb-4 bg-light">

              <div className="row">

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Employee Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select Status</option>
                    <option>On Leave</option>
                    <option>Half Day</option>
                    <option>Approved</option>
                  </select>
                </div>

              </div>

              <div className="mt-3">

                <button
                  className="btn btn-primary me-2"
                  onClick={addEmployee}
                >
                  Save
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

              </div>

            </div>
          )}

          <table className="table table-bordered table-hover">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>

                    <td>{emp.id}</td>

                    <td>{emp.name}</td>

                    <td>{emp.department}</td>

                    <td>
                      <span
                        className={
                          emp.status === "On Leave"
                            ? "badge bg-danger"
                            : emp.status === "Half Day"
                            ? "badge bg-warning text-dark"
                            : "badge bg-success"
                        }
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteEmployee(emp.id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    No Employees Found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default EmployeeLeave;