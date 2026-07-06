import { useEffect, useState } from "react";
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
  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem("locations");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            name: "Chennai",
            employees: 40,
          },
          {
            id: 2,
            name: "Bangalore",
            employees: 30,
          },
          {
            id: 3,
            name: "Hyderabad",
            employees: 20,
          },
          {
            id: 4,
            name: "Pune",
            employees: 10,
          },
        ];
  });

  const [showForm, setShowForm] = useState(false);

  const [locationName, setLocationName] = useState("");

  const [employees, setEmployees] = useState("");

  useEffect(() => {
    localStorage.setItem("locations", JSON.stringify(locations));
  }, [locations]);

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
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const data = {
    labels: locations.map((loc) => loc.name),

    datasets: [
      {
        data: locations.map((loc) => loc.employees),

        backgroundColor: [
          "#ff7900",
          "#36A2EB",
          "#4CAF50",
          "#F44336",
          "#9C27B0",
          "#FFC107",
          "#00BCD4",
          "#795548",
          "#607D8B",
          "#3F51B5",
        ],

        borderWidth: 2,
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
    <div className="container mt-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h4 className="mb-0">
            Employee Distribution by Location
          </h4>

          <button
            className="btn btn-success"
            onClick={() => setShowForm(true)}
          >
            + Add Location
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
                    placeholder="Location Name"
                    value={locationName}
                    onChange={(e) =>
                      setLocationName(e.target.value)
                    }
                  />

                </div>

                <div className="col-md-6">

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Employees"
                    value={employees}
                    onChange={(e) =>
                      setEmployees(e.target.value)
                    }
                  />

                </div>

              </div>

              <div className="mt-3">

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

            </div>

          )}

          {/* Pie Chart */}

          <div
            style={{
              width: "100%",
              height: "320px",
            }}
          >
            <Pie
              data={data}
              options={options}
            />
          </div>

          <hr />

          <table className="table table-bordered table-hover">

            <thead className="table-dark">

              <tr>

                <th>Location</th>

                <th>Employees</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {locations.map((loc) => (

                <tr key={loc.id}>

                  <td>{loc.name}</td>

                  <td>{loc.employees}</td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        deleteLocation(loc.id)
                      }
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

export default LocationChart;