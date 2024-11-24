document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    fetch(form.action, {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "error") {
                const errorDiv = document.getElementById("login-error");
                errorDiv.textContent = data.message;
                errorDiv.style.color = "red";
            } else if (data.status === "success") {
                window.location.href = "../index.html";
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});
