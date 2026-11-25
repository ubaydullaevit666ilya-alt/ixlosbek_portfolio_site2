function resetSecret() {
    code.value = "";
    code.style.display = "block";
    submit.style.display = "inline-block";
    message.style.display = "none";
    error.textContent = "";
}

function openSecret() {
    resetSecret();
    modal.classList.add("active");
}

function closeSecret() {
    modal.classList.remove("active");
    resetSecret();
}
trigger.addEventListener("click", openSecret);
close.addEventListener("click", closeSecret);
submit.addEventListener("click", unlockSecret);
