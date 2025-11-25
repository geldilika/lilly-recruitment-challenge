document.addEventListener("DOMContentLoaded", () => {
    fetchMedicines();
});
//function to fetch medicines from backend
function fetchMedicines() {
    fetch("http://localhost:8000/medicines")
        .then((response) => response.json())
        .then((data) => {
            displayMedicines(data.medicines);
        })
        .catch((error) => {
            console.error("Error fetching medicines:", error);
            document.getElementById("medicineList").innerHTML = "<p>Failed to load medicines.</p>";
        });
}
//function to display medicines
function displayMedicines(medicines) {
    const medicineList = document.getElementById("medicineList");
    const actionMessage = document.getElementById("actionMessage");
    medicineList.innerHTML = "";
    medicines.forEach((medicine) => {
        const medName = typeof medicine.name === "string" && medicine.name.trim() !== "" ? medicine.name : "Unknown Medicine";
        const medPrice = typeof medicine.price === "number" ? `£${medicine.price.toFixed(2)}` : "Price not available";
        const medElement = document.createElement("div");
        medElement.className = "medicine-item";
        medElement.innerHTML = `
        <div class="med-left">
            <strong>${medName}</strong> - ${medPrice}
        </div>
        <div class="med-right">
            <button class="update-btn" onclick="updatePrompt('${medName}', actionMessage)">Update</button>
            <button class="delete-btn" onclick="deleteMedicine('${medName}', actionMessage)">Delete</button>
        </div>
`;

        if (medName === "Unknown Medicine" || medPrice === "Price not available") {
            medElement.classList.add("invalid");
        }

        medicineList.appendChild(medElement);
    });
}
document.getElementById("addMedicineForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const medName = document.getElementById("medName").value.trim();
    const medPrice = parseFloat(document.getElementById("medPrice").value);
    const message = document.getElementById("formMessage")

    if (!medName) {
        message.textContent = "Please enter a medicine name.";
        message.style.color = "red";
        return;
    }
    if (isNaN(medPrice) || medPrice <= 0) {
        message.textContent = "Please enter a valid price.";
        message.style.color = "red";
        return;
    }

    createMedicine(medName, medPrice, message);
});
//function to create and add new medicine
function createMedicine(name, price, message) {
    fetch("http://localhost:8000/create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name, price })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                message.textContent = data.error;
                message.style.color = "red";
            } else {
                message.textContent = "Medicine added successfully!";
                message.style.color = "green";
                fetchMedicines();
                document.getElementById("addMedicineForm").reset();
            }
        })
        .catch((error) => {
            console.error("Error creating medicine:", error);
            message.textContent = "Failed to add medicine.";
            message.style.color = "red";
        });
}

// Function to fetch and display the average price
function fetchAveragePrice() {
    fetch("http://localhost:8000/average-price")
        .then((response) => {
            if (!response.ok) {
                throw new Error("Failed to fetch average price.");
            }
            return response.json();
        })
        .then((data) => {
            const displayElement = document.getElementById("averagePriceDisplay");
            if (data.error) {
                displayElement.textContent = `Error: ${data.error}`;
            } else {
                displayElement.textContent = `Price Average: £${data.average_price}`;
            }
        })
        .catch((error) => {
            console.error("Error fetching average price:", error);
            document.getElementById("averagePriceDisplay").textContent =
                "Failed to calculate average price. Please try again.";
        });
}
document
    .getElementById("averagePriceButton")
    .addEventListener("click", fetchAveragePrice);

document.getElementById("searchInput").addEventListener("input", () => {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const items = document.querySelectorAll(".medicine-item");

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? "block" : "none";
    });
});

function updatePrompt(name, message) {
    const newPrice = prompt(`Enter new price for ${name}:`);
    const parsed = parseFloat(newPrice);

    if (isNaN(parsed) || parsed <= 0) {
        message.textContent = "Invalid price.";
        message.style.color = "red";
        return;
    }

    updateMedicine(name, parsed, message);
}

function updateMedicine(name, price, message) {
    fetch("http://localhost:8000/update", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name, price })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                message.textContent = data.error;
                message.style.color = "red";
            } else {
                message.textContent = "Medicine updated successfully!";
                message.style.color = "green";
                fetchMedicines();
            }
        })
        .catch((error) => {
            console.error("Error updating medicine:", error);
            message.textContent = "Failed to update medicine.";
            message.style.color = "red";
        });
}

function deleteMedicine(name, message) {
    fetch("http://localhost:8000/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ name })
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                message.textContent = data.error;
                message.style.color = "red";
            } else {
                message.textContent = "Medicine deleted successfully!";
                message.style.color = "green";
                fetchMedicines();
            }
        })
        .catch((error) => {
            console.error("Error deleting medicine:", error);
            message.textContent = "Failed to delete medicine.";
            message.style.color = "red";
        });
}
