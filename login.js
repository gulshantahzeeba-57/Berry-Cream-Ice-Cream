console.log("Login JS loaded");

document.getElementById("loginForm")?.addEventListener("submit", function(e){
    e.preventDefault();

    const user = document.getElementById("username")?.value;
    const pass = document.getElementById("password")?.value;

    // Hardcoded check (Aap ke assignment/project ke liye bilkul sai hai)
    if(user === "admin" && pass === "admin123"){
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin.html"; // Agar file ka naam admin-dashboard.html hai toh woh likhein
    } else {
        alert("Invalid Username or Password!");
    }
});
