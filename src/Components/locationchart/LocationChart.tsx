import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type Location = {
  id: number;
  name: string;
  employees: number;
};

function LocationChart() {
  const [locations, setLocations] = useState<Location[]>([
    { id: 1, name: "Chennai", employees: 45 },
    { id: 2, name: "Bangalore", employees: 30 },
    { id: 3, name: "Hyderabad", employees: 15 },
    { id: 4, name: "Pune", employees: 10 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [employees, setEmployees] = useState("");

  const addLocation = () => {
    if (locationName.trim() === "" || employees.trim() === "") {
      alert("Please fill all fields");
      return;
    }

    const newLocation: Location = {
      id: Date.now(),
      name: locationName,
      employees: Number(employees),
    };

    setLocations([...locations, newLocation]);

    setLocationName("");
    setEmployees("");
    setShowForm(false);
  };

  const deleteLocation = (id: number) => {
    setLocations(locations.filter((location) => location.id !== id));
  };

  const data = {
    labels: locations.map((location) => location.name),

    datasets: [
      {
        data: locations.map((location) => location.employees),

        backgroundColor: [
          "#ff7900",
          "#36A2EB",
          "#4CAF50",
          "#F44336",
          "#9C27B0",
          "#FFC107",
          "#00BCD4",
          "#8BC34A",
        ],

        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <div className="col-lg-6 mb-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">
            Employee Distribution by Location
          </h5>

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
                placeholder="Location Name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />

              <input
                type="number"
                className="form-control mb-2"
                placeholder="Number of Employees"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
              />

              <button
                className="btn btn-primary me-2"
                onClick={addLocation}
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

          {/* Pie Chart */}

          <div
            style={{
              width: "100%",
              height: "300px",
            }}
          >
            <Pie data={data} options={options} />
          </div>

          <hr />

          {locations.map((location) => (
            <div
              key={location.id}
              className="d-flex justify-content-between align-items-center mb-2"
            >
              <span>
                <strong>{location.name}</strong> ({location.employees})
              </span>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteLocation(location.id)}
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

export default LocationChart;