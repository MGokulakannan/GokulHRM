import Header from "../../Components/header/Header";
import Sidebar from "../../Components/sidebar/Sidebar";


function Admin() {
  return (
    <div className="d-flex">
<Sidebar/>

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "250px",
          background: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
      <Header/>

        <div className="container mt-4">

          <h2>Admin</h2>

          <div className="card mt-3">

            <div className="card-body">

              <h5>User Management</h5>

              <button className="btn btn-success">
                + Add User
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Admin;