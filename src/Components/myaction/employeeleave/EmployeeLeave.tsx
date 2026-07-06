import { useState } from "react";

type Employee = {
  id: number;
  name: string;
  department: string;
  status: string;
};

function EmployeeLeave() {
  const [employees, setEmployees] = useState<Employee[]>([
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
    {
      id: 3,
      name: "Sarah",
      department: "Finance",
      status: "Approved",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const addEmployee = () => {
    if (!name || !department || !status) {
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

  return (
    <div className="col-lg-6 mb-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">Employees on Leave Today</h5>

          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowForm(true)}
          >
            + Add
          </button>

        </div>

        <div className="card-body">

          {showForm && (

            <div className="border rounded p-3 mb-4 bg-light">

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Employee Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />

              <select
                className="form-select mb-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option>On Leave</option>
                <option>Half Day</option>
                <option>Approved</option>
              </select>

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

          )}

          <table className="table table-bordered table-hover">

            <thead className="table-light">

              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {employees.map((emp) => (

                <tr key={emp.id}>

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

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default EmployeeLeave;