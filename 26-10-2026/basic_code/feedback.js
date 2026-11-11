
document.addEventListener("DOMContentLoaded", () => {
    console.log("Feedback JS Connected");

    const feedbackList = document.getElementById("feedbackList");
    const feedbackCount = document.getElementById("feedbackCount");

    console.log("Feedback List:", feedbackList);
    console.log("Feedback Count:", feedbackCount);
    console.log("API:", API);

    if (feedbackList) {
        loadFeedback();
    }
});


// FETCH FEEDBACK
async function loadFeedback() {

    const feedbackList = document.getElementById("feedbackList");
    const feedbackCount = document.getElementById("feedbackCount");

    if (!feedbackList) return;

    try {

        feedbackList.innerHTML = "<p>Loading...</p>";

        const response = await fetch(`${API}/getcontact`);

        const result = await response.json();

        console.log("API RESULT:", result);

        if (!response.ok) {
            throw new Error("Failed to fetch feedback");
        }

        const feedbacks = Array.isArray(result)
            ? result
            : result.data || [];

        console.log("Feedback Records:", feedbacks.length);

        feedbackList.innerHTML = "";

        if (feedbackCount) {
            feedbackCount.textContent = `${feedbacks.length} Feedbacks`;
        }

        if (feedbacks.length === 0) {
            feedbackList.textContent = "No feedback available";
            return;
        }

        feedbacks.forEach(item => {

            const row = document.createElement("div");
            row.className = "feedback-row";

            const name = document.createElement("p");
            name.textContent = item.name || "N/A";

            const email = document.createElement("p");
            email.textContent = item.email || "N/A";

            const message = document.createElement("p");
            message.textContent = item.message || "No message";

            const actions = document.createElement("div");
            actions.className = "feedback-actions";

            const deleteBtn = document.createElement("button");
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "feedback-delete";

            deleteBtn.addEventListener("click", () => {
                deleteFeedback(item._id);
            });

            actions.appendChild(deleteBtn);

            row.append(name, email, message, actions);

            feedbackList.appendChild(row);

        });

    } catch (error) {

        console.error("Feedback Error:", error);

        feedbackList.textContent = "Unable to load feedback: " + error.message;

    }
}


// DELETE FEEDBACK
async function deleteFeedback(id) {

    if (!confirm("Are you sure you want to delete this feedback?")) return;

    try {

        const response = await fetch(`${API}/contact/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed");
        }

        alert("Feedback deleted successfully!");

        loadFeedback();

    } catch (error) {

        console.error("Delete Error:", error);
        alert(error.message);

    }
}
