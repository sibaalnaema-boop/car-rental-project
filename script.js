function calculateDays() {

    const pickup = document.getElementById("pickupDate").value;
    const returning = document.getElementById("returnDate").value;

    const selectedCars = document.querySelectorAll(".car-select:checked");

    const startDate = new Date(pickup + "T00:00:00");
    const endDate = new Date(returning + "T00:00:00");

    const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        alert("Return date must be after pickup date.");
        return;
    }

    let total = 0;
    let message = "Booking Details:\n\n";

    selectedCars.forEach(function(car) {

        const name = car.dataset.name;
        const price = Number(car.dataset.price);
        const carTotal = price * days;

        total += carTotal;

        message += "Car: " + name + "\n";
        message += "Rental Days: " + days + "\n";
        message += "Daily Price: " + price + " S.P\n";
        message += "Car Total: " + carTotal + " S.P\n\n";

    });

    let discount = 0;

    if (days > 7) {
        discount = total * 0.10;
    }

    const finalTotal = total - discount;

    message += "Total Before Discount: " + total + " S.P\n";
    message += "Discount: " + discount + " S.P\n";
    message += "Final Total: " + finalTotal + " S.P";

    alert(message);
}
    


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

let provinceCode = Number(nationalId.substring(0, 2));

if (provinceCode < 1 || provinceCode > 14) {
    alert("The first two digits must represent a valid province code (01-14).");
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
$("#continue-btn").click(function() {

    if ($(".car-select:checked").length === 0) {
        alert("Please select at least one car.");
        return;
    }

    $("#booking-section").slideDown();

    $("html, body").animate({
        scrollTop: $("#booking-section").offset().top
    }, 600);

});

