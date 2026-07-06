import BuzzPosts from "../../Components/buzzposts/BuzzPosts";
import EmployeeChart from "../../Components/employeechart/EmploeeChart";
import Header from "../../Components/header/Header";
import LocationChart from "../../Components/locationchart/LocationChart";
import EmployeeLeave from "../../Components/myaction/employeeleave/EmployeeLeave";
import MyActions from "../../Components/myaction/MyAction";
import QuickLaunch from "../../Components/myaction/quicklaunch/QuickLaunch";
import Sidebar from "../../Components/sidebar/Sidebar";
import TimeAtWork from "../../Components/timeatwork/TimeAtWork";


function Dashboard() {
  return (
    <div className="d-flex">

      <Sidebar/>

      <div
        className="flex-grow-1"
        style={{ marginLeft: "250px", background: "#f5f5f5" }}
      >

    <Header/>

        <div className="container-fluid mt-4">

          <div className="row">
<TimeAtWork/>

           <MyActions/>

          <QuickLaunch/>

          </div>
  {/* Row 2 */}
          <div className="row">
            <BuzzPosts/>
            <EmployeeLeave />
          </div>

          {/* Row 3 */}
          <div className="row">
            <EmployeeChart />
            <LocationChart />
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;