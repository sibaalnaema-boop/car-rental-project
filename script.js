/* =========================================================
   myFunctions.js - Car Rental Website
   All JavaScript / jQuery functions of the website
   ========================================================= */

/* ---------- Helper functions ---------- */

// Format a number with thousands separators, e.g. 250000 -> 250,000
function formatNumber(number) {
    return Number(number).toLocaleString("en-US");
}

// Write the number of days correctly in Arabic, e.g. 3 أيام / 10 أيام / 15 يوماً
function daysText(days) {
    if (days === 1) {
        return "يوم واحد";
    }
    if (days === 2) {
        return "يومان";
    }
    if (days >= 3 && days <= 10) {
        return days + " أيام";
    }
    return days + " يوماً";
}

// Read the data of all cars from the cars table
function getCars() {
    let cars = [];
    let rows = $(".car-row");

    for (let i = 0; i < rows.length; i++) {
        let row = $(rows[i]);
        let details = row.next(".details-row");

        cars.push({
            code: row.find(".code").text(),
            name: row.find(".model").text(),
            year: Number(row.find(".year").text()),
            price: Number(row.find(".price").text()),
            fuel: details.find(".fuel").text(),
            transmission: details.find(".transmission").text(),
            seats: Number(details.find(".seats").text()),
            mileage: Number(details.find(".mileage").text()),
            color: details.find(".color").text()
        });
    }
    return cars;
}

// Find a car by its code
function findCar(code) {
    let cars = getCars();
    for (let i = 0; i < cars.length; i++) {
        if (cars[i].code === code) {
            return cars[i];
        }
    }
    return null;
}

// Check that a date is written as yyyy-mm-dd and that it is a real date
function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }
    let parts = value.split("-");
    let year = Number(parts[0]);
    let month = Number(parts[1]);
    let day = Number(parts[2]);
    let date = new Date(year, month - 1, day);

    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
}

/* ---------- 1.3 Show / hide car details (jQuery) ---------- */

$(".show-details").change(function () {
    let detailsRow = $(this).closest("tr").next(".details-row");

    if ($(this).is(":checked")) {
        detailsRow.fadeIn();
    } else {
        detailsRow.fadeOut();
    }
});

/* ---------- 1.4 "Continue" button: show the form on the same page ---------- */

$("#continue-btn").click(function () {
    if ($(".car-select:checked").length === 0) {
        alert("يرجى اختيار سيارة واحدة على الأقل.");
        return;
    }

    $("#booking-section").slideDown();
    $("html, body").animate({ scrollTop: $("#booking-section").offset().top }, 500);
});

/* ---------- 1.4 Booking form validation ---------- */

// JavaScript performs all the validation (the browser's own validation is turned off)
$("#booking-form").attr("novalidate", "novalidate");

$("#booking-form").submit(function (event) {

    event.preventDefault();

    let name = $("#fullName").val().trim();
    let nationalId = $("#nationalId").val().trim();
    let pickup = $("#pickupDate").val().trim();
    let returning = $("#returnDate").val().trim();
    let mobile = $("#mobile").val().trim();
    let email = $("#email").val().trim();

    // Full name: optional, Arabic letters only
    let arabicName = /^[ء-ي\s]+$/;

    if (name !== "" && !arabicName.test(name)) {
        alert("يجب كتابة الاسم الكامل بالأحرف الهجائية العربية فقط.");
        $("#fullName").focus();
        return;
    }

    // National ID: required, 11 digits, the first two digits are a governorate code (01-14)
    if (nationalId === "") {
        alert("الرقم الوطني إلزامي.");
        $("#nationalId").focus();
        return;
    }

    if (!/^\d{11}$/.test(nationalId)) {
        alert("يجب أن يتكون الرقم الوطني من 11 رقماً بالضبط.");
        $("#nationalId").focus();
        return;
    }

    let provinceCode = Number(nationalId.substring(0, 2));

    if (provinceCode < 1 || provinceCode > 14) {
        alert("أول خانتين من الرقم الوطني يجب أن تمثلا رمز محافظة صحيحاً (01-14).");
        $("#nationalId").focus();
        return;
    }

    // Rental dates: required, yyyy-mm-dd, the end date must be after the start date
    if (pickup === "" || returning === "") {
        alert("تاريخ بداية التأجير وتاريخ نهايته إلزاميان.");
        return;
    }

    if (!isValidDate(pickup) || !isValidDate(returning)) {
        alert("يجب إدخال التاريخ بالصيغة yyyy-mm-dd.");
        return;
    }

    if (returning <= pickup) {
        alert("يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية.");
        $("#returnDate").focus();
        return;
    }

    // Mobile: optional, Syriatel (093, 098, 099) or MTN (094, 095, 096)
    let mobilePattern = /^09[345689]\d{7}$/;

    if (mobile !== "" && !mobilePattern.test(mobile)) {
        alert("يرجى إدخال رقم موبايل صحيح لشبكة Syriatel أو MTN (مثال: 0933123456).");
        $("#mobile").focus();
        return;
    }

    // Email: optional
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email !== "" && !emailPattern.test(email)) {
        alert("يرجى إدخال بريد إلكتروني صحيح.");
        $("#email").focus();
        return;
    }

    calculateTotal(pickup, returning);
});

/* ---------- 1.4 Result window: rental days, total, discount and final amount ---------- */

function calculateTotal(pickup, returning) {

    let selected = $(".car-select:checked");

    if (selected.length === 0) {
        alert("يرجى اختيار سيارة واحدة على الأقل.");
        return;
    }

    let startDate = new Date(pickup + "T00:00:00");
    let endDate = new Date(returning + "T00:00:00");
    let days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));

    let total = 0;
    let message = "تم التحقق من البيانات بنجاح.\n\nتفاصيل الحجز:\n\n";

    for (let i = 0; i < selected.length; i++) {
        let car = findCar($(selected[i]).val());
        let carTotal = car.price * days;

        total += carTotal;

        message += "السيارة: " + car.name + " (" + car.code + ")\n";
        message += "عدد أيام التأجير: " + days + "\n";
        message += "السعر اليومي: " + formatNumber(car.price) + " ل.س\n";
        message += "مبلغ السيارة: " + formatNumber(carTotal) + " ل.س\n\n";
    }

    let discount = 0;

    if (days > 7) {
        discount = total * 0.10;
    }

    let finalTotal = total - discount;

    message += "المجموع قبل الخصم: " + formatNumber(total) + " ل.س\n";
    message += "الخصم (10% عند تجاوز 7 أيام): " + formatNumber(discount) + " ل.س\n";
    message += "المبلغ النهائي: " + formatNumber(finalTotal) + " ل.س";

    alert(message);
}

/* =========================================================
   1.5 AI Feature: Smart Car Recommendation Assistant
   ---------------------------------------------------------
   The customer writes his need in natural language and the
   assistant suggests the most suitable car from the table.
   In the full version the request and the cars list are sent
   to an AI language model (LLM) through an API. Inside this
   website (within the course scope) the function
   analyzeRequest() plays the role of the model locally: it
   understands the request and returns the same answer that the
   model would return (suggested car codes + the reason).
   ========================================================= */

let suggestedCodes = [];

// Convert Arabic-Indic digits (٠١٢...) to English digits (012...)
function normalizeDigits(text) {
    let arabicDigits = "٠١٢٣٤٥٦٧٨٩";
    let result = "";

    for (let i = 0; i < text.length; i++) {
        let index = arabicDigits.indexOf(text.charAt(i));
        result += (index >= 0) ? index : text.charAt(i);
    }
    return result;
}

// Understand the customer's request: persons, days, budget, transmission, preference
function analyzeRequest(text) {
    text = normalizeDigits(text);

    let request = {
        persons: 0,
        days: 0,
        maxPrice: 0,
        transmission: "",
        preference: "cheap"
    };

    // Number of persons / seats
    let personsMatch = text.match(/(\d+)\s*(أشخاص|اشخاص|شخص|ركاب|راكب|أفراد|افراد|مقاعد|مقعد)/);
    if (personsMatch) {
        request.persons = Number(personsMatch[1]);
    } else if (/شخصين|لشخصين/.test(text)) {
        request.persons = 2;
    } else if (/عائلة|عائلي/.test(text)) {
        request.persons = 5;
    }

    // Rental period
    let daysMatch = text.match(/(\d+)\s*(أيام|ايام|يوم)/);
    if (daysMatch) {
        request.days = Number(daysMatch[1]);
    } else if (/أسبوعين|اسبوعين/.test(text)) {
        request.days = 14;
    } else if (/أسبوع|اسبوع/.test(text)) {
        request.days = 7;
    } else if (/شهر/.test(text)) {
        request.days = 30;
    }

    // Daily budget, e.g. "300000" or "300 ألف"
    let thousandMatch = text.match(/(\d+)\s*(ألف|الف)/);
    let budgetMatch = text.match(/\d{5,}/);
    if (thousandMatch) {
        request.maxPrice = Number(thousandMatch[1]) * 1000;
    } else if (budgetMatch) {
        request.maxPrice = Number(budgetMatch[0]);
    }

    // Transmission
    if (/أوتوماتيك|اوتوماتيك|أتوماتيك|اتوماتيك/.test(text)) {
        request.transmission = "أوتوماتيك";
    } else if (/عادي|يدوي/.test(text)) {
        request.transmission = "عادي";
    }

    // Preference
    if (/فاخر|فخم|راقي|راقية/.test(text)) {
        request.preference = "luxury";
    } else if (/حديث|جديد/.test(text)) {
        request.preference = "new";
    }

    return request;
}

// Choose the suitable cars and order them according to the preference
function recommendCars(request) {
    let cars = getCars();
    let suitable = [];

    for (let i = 0; i < cars.length; i++) {
        let car = cars[i];

        if (request.persons > 0 && car.seats < request.persons) {
            continue;
        }
        if (request.maxPrice > 0 && car.price > request.maxPrice) {
            continue;
        }
        if (request.transmission !== "" && car.transmission !== request.transmission) {
            continue;
        }
        suitable.push(car);
    }

    suitable.sort(function (a, b) {
        if (request.preference === "luxury") {
            return b.price - a.price;
        }
        if (request.preference === "new") {
            return b.year - a.year;
        }
        return a.price - b.price;
    });

    return suitable;
}

$("#ask-assistant").click(function () {
    let text = $("#assistant-input").val().trim();
    let reply = $("#assistant-reply");

    suggestedCodes = [];
    $("#apply-suggestion").hide();

    if (text === "") {
        alert("يرجى كتابة طلبك أولاً.");
        $("#assistant-input").focus();
        return;
    }

    let request = analyzeRequest(text);
    let suitable = recommendCars(request);
    let html = "";

    // What the assistant understood
    let understood = [];
    if (request.persons > 0) {
        understood.push("عدد الأشخاص: " + request.persons);
    }
    if (request.days > 0) {
        understood.push("مدة الحجز: " + daysText(request.days));
    }
    if (request.maxPrice > 0) {
        understood.push("السعر اليومي الأقصى: " + formatNumber(request.maxPrice) + " ل.س");
    }
    if (request.transmission !== "") {
        understood.push("ناقل الحركة: " + request.transmission);
    }
    if (understood.length > 0) {
        html += "<p><strong>فهمتُ طلبك كالتالي:</strong> " + understood.join(" - ") + "</p>";
    }

    if (suitable.length === 0) {
        html += "<p>عذراً، لا توجد سيارة تطابق جميع شروطك. جرّب تعديل الميزانية أو عدد الأشخاص.</p>";
    } else {
        let best = suitable[0];
        suggestedCodes.push(best.code);

        html += "<p><strong>أقترح عليك: " + best.name + " (" + best.code + ")</strong></p>";
        html += "<p>لأن عدد مقاعدها " + best.seats + "، وناقل الحركة " + best.transmission +
                "، وسنة صنعها " + best.year + "، وسعرها اليومي " + formatNumber(best.price) + " ل.س.</p>";

        if (request.days > 0) {
            let total = best.price * request.days;
            if (request.days > 7) {
                html += "<p>مدة حجزك " + daysText(request.days) + "، فتحصل على خصم 10%، وتصبح الكلفة التقديرية " +
                        formatNumber(total * 0.9) + " ل.س بدلاً من " + formatNumber(total) + " ل.س.</p>";
            } else {
                html += "<p>الكلفة التقديرية لمدة " + daysText(request.days) + ": " + formatNumber(total) + " ل.س.</p>";
            }
        }

        if (suitable.length > 1) {
            html += "<p>بديل آخر مناسب: " + suitable[1].name + " (" + suitable[1].code + ").</p>";
        }

        $("#apply-suggestion").fadeIn();
    }

    reply.html(html);
    reply.slideDown();
});

// "Apply suggestion" button: tick the selection box of the suggested car
$("#apply-suggestion").click(function () {
    for (let i = 0; i < suggestedCodes.length; i++) {
        $(".car-select[value='" + suggestedCodes[i] + "']").prop("checked", true);
    }
    alert("تم تحديد السيارة المقترحة في الجدول، اضغط على زر \"متابعة\" لإكمال الحجز.");
    $("html, body").animate({ scrollTop: $("#continue-btn").offset().top - 200 }, 500);
});
