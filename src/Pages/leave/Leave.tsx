import Header from "../../Components/header/Header";
import EmployeeLeave from "../../Components/myaction/employeeleave/EmployeeLeave";
import Sidebar from "../../Components/sidebar/Sidebar";

function Leave() {
  return (
    <div className="d-flex">
      <Sidebar />

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
          background: "#f4f6f9",
        }}
      >
       <Header/>

        <div className="container mt-4">
          <h2>Employee Leave Details</h2>

          <div className="row">
            <EmployeeLeave />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leave;