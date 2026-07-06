import { useState } from "react";
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
  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, name: "IT", percentage: 55 },
    { id: 2, name: "HR", percentage: 25 },
    { id: 3, name: "Finance", percentage: 20 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [percentage, setPercentage] = useState("");

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
    <div className="col-lg-6 mb-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">Employee Distribution</h5>

          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowForm(true)}
          >
            + Add
          </button>

        </div>

        <div className="card-body">

          {showForm && (
            <div className="card p-3 mb-3 bg-light">

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Department Name"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />

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
          )}

          {/* Bar Chart */}

          <div
            style={{
              width: "100%",
              height: "300px",
            }}
          >
            <Bar data={data} options={options} />
          </div>

          <hr />

          {departments.map((dept) => (
            <div
              key={dept.id}
              className="d-flex justify-content-between align-items-center mt-2"
            >

              <span>
                <strong>{dept.name}</strong> ({dept.percentage}%)
              </span>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteDepartment(dept.id)}
              >
                Delete
              </button>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default EmployeeChart;