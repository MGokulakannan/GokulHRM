import { useState } from "react";

function EditDashboard() {

    const [timeToday, setTimeToday] = useState("");
    const [pendingReview, setPendingReview] = useState("");

    const updateDashboard = () => {

        localStorage.setItem(
            "dashboard",
            JSON.stringify({
                timeToday,
                pendingReview
            })
        );

        alert("Updated Successfully");
    };

    return (

        <div className="container mt-5">

            <input
                className="form-control mb-3"
                placeholder="Today's Work"
                onChange={(e)=>setTimeToday(e.target.value)}
            />

            <input
                className="form-control mb-3"
                placeholder="Pending Review"
                onChange={(e)=>setPendingReview(e.target.value)}
            />

            <button
                className="btn btn-warning"
                onClick={updateDashboard}
            >
                Save
            </button>

        </div>

    );

}

export default EditDashboard;