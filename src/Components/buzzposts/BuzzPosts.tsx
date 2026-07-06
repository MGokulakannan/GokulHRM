import { useEffect, useState } from "react";

type Post = {
  id: number;
  employee: string;
  message: string;
  time: string;
};

function BuzzPosts() {
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem("buzzPosts");

    return savedPosts
      ? JSON.parse(savedPosts)
      : [
          {
            id: 1,
            employee: "John Smith",
            message: "Welcome to OrangeHRM.",
            time: "2 Hours Ago",
          },
          {
            id: 2,
            employee: "David",
            message: "Team meeting at 3 PM.",
            time: "Yesterday",
          },
        ];
  });

  const [showForm, setShowForm] = useState(false);

  const [employee, setEmployee] = useState("");
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("buzzPosts", JSON.stringify(posts));
  }, [posts]);

  const addPost = () => {
    if (
      employee.trim() === "" ||
      message.trim() === "" ||
      time.trim() === ""
    ) {
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

  const filteredPosts = posts.filter((post) =>
    post.employee.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">

      <div className="card shadow">

        <div className="card-header d-flex justify-content-between align-items-center">

          <h4 className="mb-0">Buzz Latest Posts</h4>

          <button
            className="btn btn-success"
            onClick={() => setShowForm(true)}
          >
            + Add Post
          </button>

        </div>

        <div className="card-body">

          {/* Search */}

          <div className="mb-3">

            <input
              type="text"
              className="form-control"
              placeholder="Search Employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          {/* Add Form */}

          {showForm && (

            <div className="border rounded p-3 mb-4 bg-light">

              <div className="mb-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Employee Name"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                />

              </div>

              <div className="mb-3">

                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Write Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

              </div>

              <div className="mb-3">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Time (Example: Just Now)"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

              </div>

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

          {/* Posts */}

          {filteredPosts.length > 0 ? (

            filteredPosts.map((post) => (

              <div
                key={post.id}
                className="border rounded p-3 mb-3 shadow-sm"
              >

                <div className="d-flex justify-content-between">

                  <div>

                    <h5>{post.employee}</h5>

                    <p>{post.message}</p>

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

            ))

          ) : (

            <div className="alert alert-warning">
              No Posts Found
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default BuzzPosts;