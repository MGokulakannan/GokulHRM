function TimeAtWork() {
  return (
    <div className="col-lg-4 mb-4">
      <div className="card shadow border-0 h-100">
        <div className="card-header bg-white">
          <h5>Time at Work</h5>
        </div>

        <div className="card-body text-center">

          <h1 className="text-success">8h 30m</h1>

          <p className="text-muted">
            Today
          </p>

          <hr />

          <p>
            This Week : <b>40h</b>
          </p>

          <p>
            This Month : <b>168h</b>
          </p>

        </div>
      </div>
    </div>
  );
}

export default TimeAtWork;