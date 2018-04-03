const alert = document.getElementById('alert');
const dropdown = document.querySelectorAll('.dropdown');

dropdown.forEach(dropdown => {
	dropdown.addEventListener('click', toggleDropdown);
});

function displayAlert() {
	if (alert) {
		setTimeout(() => {
			alert.classList.add('alert--show');
		}, 100);
		setTimeout(() => {
			alert.classList.remove('alert--show');
		}, 3000);
	}
}

function toggleDropdown(ev) {
	const classList = ev.target.classList;
	if (
		classList.contains('dropdown__icon') ||
		classList.contains('dropdown__link')
	) {
		const dropDownIcon = document.querySelector('.dropdown__icon');
		if (!dropDownIcon.classList.contains('dropdown__icon--clicked')) {
			dropDownIcon.classList.add('dropdown__icon--clicked');
		} else {
			dropDownIcon.classList.remove('dropdown__icon--clicked');
		}
		document.querySelectorAll('.dropdown__content').forEach(menu => {
			menu.classList.toggle('dropdown__show');
		});
	}
}

function trimText() {
	const reg = /^[a-z0-9 ]+$/i;
	const titles = document.querySelectorAll('.list__item__title');
	if (titles) {
		titles.forEach(title => {
			if (title.innerText.length >= 30) {
				let newText = title.innerHTML.trim().substring(0, 30);
				if (newText.charCodeAt(newText.length - 1) === 32) {
					newText = newText.substring(0, 29);
				}
				if (newText.charAt(newText.length - 1).search(reg) > -1) {
					title.innerHTML = newText + '...';
				}
			}
		});
	}
}

window.addEventListener('click', ev => {
	const classList = ev.target.classList;
	if (
		!classList.contains('dropdown__icon') &&
		!classList.contains('dropdown__link') &&
		!classList.contains('dropdown__show')
	) {
		const dropDownIcon = document.querySelector('.dropdown__icon');
		dropDownIcon.classList.remove('dropdown__icon--clicked');
		document.querySelectorAll('.dropdown__content').forEach(menu => {
			menu.classList.remove('dropdown__show');
		});
	}
});

displayAlert();
// trimText();
