const alert = document.getElementById("alert");
const dropdownSmall = document.getElementById("dropdown--small");
const dropdownBig = document.getElementById("dropdown--big");
if (alert) {
	setTimeout(() => {
		alert.classList.add("alert--hidden");
	}, 2000);
}

if (dropdownBig) {
	dropdownBig.addEventListener("click", ev => {
		const bigContent = document.getElementById("dropdown__content--big");
		bigContent.classList.toggle("dropdown__show");
	});
}

if (dropdownSmall) {
	dropdownSmall.addEventListener("click", ev => {
		const smallContent = document.getElementById("dropdown__content--small");
		smallContent.classList.toggle("dropdown__show");
	});
}
