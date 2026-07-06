import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Department = {
  id: number;
  name: string;
  percentage: number;
};

function EmployeeChart() {
  const [departments, setDepartments] = useState<Department[]>(() => {
    const savedData = localStorage.getItem("departments");

    return savedData
      ? JSON.parse(savedData)
      : [
          { id: 1, name: "IT", percentage: 55 },
          { id: 2, name: "HR", percentage: 25 },
          { id: 3, name: "Finance", percentage: 20 },
        ];
  });

  const [showForm, setShowForm] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [percentage, setPercentage] = useState("");

  useEffect(() => {
    localStorage.setItem("departments", JSON.stringify(departments));
  }, [departments]);

  const addDepartment = () => {
    if (deptName.trim() === "" || percentage.trim() === "") {
      alert("Please fill all fields");
      return;
    }

    const newDepartment: Department = {
      id: Date.now(),
      name: deptName,
      percentage: Number(percentage),
    };

    setDepartments([...departments, newDepartment]);

    setDeptName("");
    setPercentage("");
    setShowForm(false);
  };

  const deleteDepartment = (id: number) => {
    setDepartments(departments.filter((dept) => dept.id !== id));
  };

  const data = {
    labels: departments.map((dept) => dept.name),

    datasets: [
      {
        label: "Employee %",
        data: departments.map((dept) => dept.percentage),

        backgroundColor: [
          "#ff7900",
          "#36A2EB",
          "#4CAF50",
          "#F44336",
          "#9C27B0",
          "#FFC107",
          "#00BCD4",
          "#795548",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="container mt-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h4 className="mb-0">Employee Distribution</h4>

          <button
            className="btn btn-success"
            onClick={() => setShowForm(true)}
          >
            + Add Department
          </button>

        </div>

        <div className="card-body">

          {showForm && (
            <div className="border rounded p-3 mb-4 bg-light">

              <div className="row">

                <div className="col-md-6">

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Department Name"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                  />

                </div>

                <div className="col-md-6">

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Employee Percentage"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />

                </div>

              </div>

              <div className="mt-3">

                <button
                  className="btn btn-primary me-2"
                  onClick={addDepartment}
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

          {/* Chart */}

          <div
            style={{
              width: "100%",
              height: "300px",
            }}
          >
            <Bar data={data} options={options} />
          </div>

          <hr />

          <table className="table table-bordered table-hover">

            <thead className="table-dark">

              <tr>
                <th>Department</th>
                <th>Percentage</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {departments.map((dept) => (

                <tr key={dept.id}>

                  <td>{dept.name}</td>

                  <td>{dept.percentage}%</td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteDepartment(dept.id)}
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

export default EmployeeChart;