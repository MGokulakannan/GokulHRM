function QuickLaunch() {
  return (
    <div className="col-lg-4 mb-4">

      <div className="card shadow border-0 h-100">

        <div className="card-header bg-white">
          <h5>Quick Launch</h5>
        </div>

        <div className="card-body">

          <div className="row text-center">

            <div className="col-4 mb-4">
              <i className="bi bi-calendar-plus fs-1 text-warning"></i>
              <p>Assign Leave</p>
            </div>

            <div className="col-4 mb-4">
              <i className="bi bi-list-check fs-1 text-success"></i>
              <p>Leave List</p>
            </div>

            <div className="col-4 mb-4">
              <i className="bi bi-clock-history fs-1 text-primary"></i>
              <p>Timesheets</p>
            </div>

            <div className="col-4">
              <i className="bi bi-pencil-square fs-1 text-danger"></i>
              <p>Apply Leave</p>
            </div>

            <div className="col-4">
              <i className="bi bi-person-check fs-1 text-info"></i>
              <p>My Leave</p>
            </div>

            <div className="col-4">
              <i className="bi bi-file-earmark-text fs-1 text-secondary"></i>
              <p>My Timesheet</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default QuickLaunch;