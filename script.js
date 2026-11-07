function calculateDays() {
    const pickup = document.getElementById("pickupDate").value;
    const returning = document.getElementById("returnDate").value;
    const carPrice = document.getElementById("carSelect").value;

    if (pickup === "" || returning === ""  ||carPrice === "") {
        alert("Please select the car and both dates.");
        return;
    }

    const [y1, m1, d1] = pickup.split("-").map(Number);
    const [y2, m2, d2] = returning.split("-").map(Number);

    const startDate = Date.UTC(y1, m1 - 1, d1);
    const endDate = Date.UTC(y2, m2 - 1, d2);

    const days = (endDate - startDate) / (1000 * 60 * 60 * 24);

    if (days <= 0) {
        alert("Return date must be after pickup date.");
        return;
    }

    const totalPrice = days * Number(carPrice);

    alert("Rental duration: " + days + " days\nTotal price: $" + totalPrice);
}
$(document).ready(function(){

    $(".details-btn").click(function(){

        $(this).next(".car-details").slideToggle();

    });
    
});

$("#booking-form").submit(function(event) {

    event.preventDefault();

    let name = $("#fullName").val().trim();
    let nationalId = $("#nationalId").val().trim();
    let pickup = $("#pickupDate").val();
    let returning = $("#returnDate").val();
    let mobile = $("#mobile").val().trim();
    let email = $("#email").val().trim();

    // National ID validation
    if (!/^\d{11}$/.test(nationalId)) {
        alert("National ID must contain exactly 11 digits.");
        return;
    }

    // Date validation
    if (pickup === "" || returning === "") {
        alert("Please enter both rental dates.");
        return;
    }

    if (returning <= pickup) {
        alert("Return date must be after pickup date.");
        return;
    }

    // Name validation (optional)
    let arabicName = /^[\u0600-\u06FF\s]+$/;

    if (name !== "" && !arabicName.test(name)) {
        alert("Please enter your name in Arabic letters only.");
        return;
    }

    // Mobile validation (optional)
    let mobilePattern = /^09[345689]\d{7}$/;

    if (mobile !== "" && !mobilePattern.test(mobile)) {
        alert("Please enter a valid MTN or Syriatel number.");
        return;
    }

    // Email validation (optional)
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== "" && !emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    alert("All entered information is valid!");

    calculateDays();

});
