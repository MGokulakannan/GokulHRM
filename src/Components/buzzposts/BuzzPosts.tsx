import { useState } from "react";

type Post = {
  id: number;
  employee: string;
  message: string;
  time: string;
};

function BuzzPosts() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      employee: "John Smith",
      message: "Welcome our new employees to the HR team.",
      time: "2 Hours Ago",
    },
    {
      id: 2,
      employee: "Sarah",
      message: "Annual meeting scheduled on Monday.",
      time: "Yesterday",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [employee, setEmployee] = useState("");
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");

  const addPost = () => {
    if (!employee || !message || !time) {
      alert("Please fill all fields");
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      employee,
      message,
      time,
    };

    setPosts([...posts, newPost]);

    setEmployee("");
    setMessage("");
    setTime("");

    setShowForm(false);
  };

  const deletePost = (id: number) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  return (
    <div className="col-lg-6 mb-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h5 className="mb-0">Buzz Latest Posts</h5>

          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowForm(true)}
          >
            + Add
          </button>

        </div>

        <div className="card-body">

          {showForm && (
            <div className="border rounded p-3 mb-4 bg-light">

              <input
                type="text"
                className="form-control mb-2"
                placeholder="Employee Name"
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
              />

              <textarea
                className="form-control mb-2"
                placeholder="Enter Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <input
                type="text"
                className="form-control mb-3"
                placeholder="Time (Example: 2 Hours Ago)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />

              <button
                className="btn btn-primary me-2"
                onClick={addPost}
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

          {posts.map((post) => (
            <div
              key={post.id}
              className="border rounded p-3 mb-3"
            >
              <div className="d-flex justify-content-between">

                <div>
                  <h6>{post.employee}</h6>

                  <p className="mb-1">{post.message}</p>

                  <small className="text-muted">
                    {post.time}
                  </small>
                </div>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deletePost(post.id)}
                >
                  Delete
                </button>

              </div>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default BuzzPosts;