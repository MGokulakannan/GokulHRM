function MyActions() {
  return (
    <div className="col-lg-4 mb-4">
      <div className="card shadow border-0 h-100">

        <div className="card-header bg-white">
          <h5>My Actions</h5>
        </div>

        <div className="card-body">

          <div className="d-flex justify-content-between mb-3">
            <span>Pending Review</span>
            <span className="badge bg-warning">2</span>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <span>Leave Request</span>
            <span className="badge bg-danger">5</span>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <span>Interviews</span>
            <span className="badge bg-success">3</span>
          </div>

          <div className="d-flex justify-content-between">
            <span>Performance Reviews</span>
            <span className="badge bg-primary">4</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default MyActions;