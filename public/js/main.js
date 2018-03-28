const alert = document.getElementById("alert");
if (alert) {
	setTimeout(() => {
		alert.classList.add("alert--hidden");
	}, 2000);
}