const apiEndpoint = 'https://jsonplaceholder.typicode.com/users'

document.addEventListener('DOMContentLoaded', () => {
    const userTable = document.getElementById('user-list');
    const resetUsersButton = document.getElementById('reset-users');
    const userNameInput = document.getElementById('user-name');
    const userUsernameInput = document.getElementById('user-username');
    const userEmailInput = document.getElementById('user-email');
    const userWebsiteInput = document.getElementById('user-website');
    const addUserButton = document.getElementById('add-user');
    const deleteSelectedButton = document.getElementById('delete-selected');
    const selectAllCheckbox = document.getElementById('select-all');

    const userModal = document.getElementById('user-modal');
    const modalDetails = document.getElementById('modal-details');
    const modalClose = document.querySelector('.modal .close');

    let users = [];
    let sortOrder = { name: 'asc', username: 'asc' };

    function initialApp() {
        const cachedUsers = JSON.parse(localStorage.getItem('users')) || [];
        if (cachedUsers.length) {
            users = cachedUsers;
            renderUsers();
        } else {
            fetchUsers();
        }
    }

    function resetUsers() {
        fetchUsers();
    }

    function fetchUsers() {
        fetch(apiEndpoint)
            .then(response => response.json())
            .then(data => {
                users = data.map(user => ({
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    address: `${user.address.street}, ${user.address.suite}, ${user.address.city}, ${user.address.zipcode}`,
                    phone: user.phone,
                    website: user.website,
                    company: `${user.company.name} (${user.company.catchPhrase})`
                }));
                localStorage.setItem('users', JSON.stringify(users));
                renderUsers();
            })
            .catch(error => console.error('Error fetching users:', error));
    }

    function renderUsers() {
        userTable.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td><input type="checkbox" class="select-user" data-id="${user.id}" /></td>
                <td><input type="text" class="editable" value="${user.name}" data-field="name" data-id="${user.id}" /></td>
                <td><input type="text" class="editable" value="${user.username}" data-field="username" data-id="${user.id}" /></td>
                <td><input type="text" class="editable" value="${user.email}" data-field="email" data-id="${user.id}" /></td>
                <td><input type="text" class="editable" value="${user.website}" data-field="website" data-id="${user.id}" /></td>
                <td>
                    <button class="view" onclick="viewUser(${user.id})">View</button>
                    <button class="save" onclick="saveUser(${user.id})">Save</button>
                    <button class="remove" onclick="removeUser(${user.id})">Remove</button>
                </td>
            `;

            userTable.appendChild(row);
        });

        document.querySelectorAll('.select-user').forEach(checkbox => {
            checkbox.addEventListener('change', updateDeleteButtonState);
        });
        updateDeleteButtonState();
    }

    function sortUsersBy(field) {
        const order = sortOrder[field] === 'asc' ? 'desc' : 'asc';
        users.sort((a, b) => {
            if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
            if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
            return 0;
        });
        sortOrder[field] = order;
        updateSortIcons(field);
        renderUsers();
    }

    function updateSortIcons(field) {
        const icons = {
            name: document.getElementById('name-sort-icon'),
            username: document.getElementById('username-sort-icon')
        };

        for (const key in icons) {
            icons[key].classList.remove('asc', 'desc');
        }

        if (sortOrder[field] === 'asc') {
            icons[field].classList.add('asc');
        } else {
            icons[field].classList.add('desc');
        }
    }

    function addUser(name, username, email, website) {
        const newUser = {
            id: (users[users.length - 1]?.id || 0) + 1,
            name,
            username,
            email,
            website,
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    }

    function removeUser(id) {
        users = users.filter(user => user.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    }

    function removeSelectedUsers() {
        const selectedUsers = document.querySelectorAll('.select-user:checked');
        selectedUsers.forEach(checkbox => {
            const userId = parseInt(checkbox.getAttribute('data-id'));
            removeUser(userId);
        });
        updateDeleteButtonState();
    }

    function saveUser(id) {
        const updatedUsers = users.map(user => {
            if (user.id === id) {
                return {
                    ...user,
                    name: document.querySelector(`input[data-id="${id}"][data-field="name"]`).value,
                    username: document.querySelector(`input[data-id="${id}"][data-field="username"]`).value,
                    email: document.querySelector(`input[data-id="${id}"][data-field="email"]`).value,
                    website: document.querySelector(`input[data-id="${id}"][data-field="website"]`).value,
                };
            }
            return user;
        });
        users = updatedUsers;
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    }

    function validateInputs() {
        let isValid = true;
        const inputs = [
            userNameInput,
            userUsernameInput,
            userEmailInput,
            userWebsiteInput
        ];

        inputs.forEach(input => {
            if (input.value.trim() === '') {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            setTimeout(() => {
                inputs.forEach(input => input.classList.remove('error'));
            }, 1000);
        }

        return isValid;
    }

    function viewUser(id) {
        const user = users.find(user => user.id === id);

        if (user) {
            modalDetails.innerHTML = `
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Website:</strong> ${user.website}</p>
            `;
            userModal.style.display = 'block';
        }
    }

    function updateDeleteButtonState() {
        const selectedUsers = document.querySelectorAll('.select-user:checked');
        deleteSelectedButton.disabled = selectedUsers.length === 0;
    }

    modalClose.onclick = () => {
        userModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === userModal) {
            userModal.style.display = 'none';
        }
    };

    window.removeUser = removeUser;
    window.saveUser = saveUser;
    window.viewUser = viewUser;

    addUserButton.onclick = () => {
        const name = userNameInput.value.trim();
        const username = userUsernameInput.value.trim();
        const email = userEmailInput.value.trim();
        const website = userWebsiteInput.value.trim();

        if (validateInputs()) {
            addUser(name, username, email, website);
            userNameInput.value = '';
            userUsernameInput.value = '';
            userEmailInput.value = '';
            userWebsiteInput.value = '';
        }
    };

    resetUsersButton.onclick = () => {
        resetUsers();
    };

    deleteSelectedButton.onclick = () => {
        removeSelectedUsers();
    };

    selectAllCheckbox.onclick = (event) => {
        const isChecked = event.target.checked;
        document.querySelectorAll('.select-user').forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        updateDeleteButtonState();
    };

    document.getElementById('sort-name').onclick = (event) => {
        event.preventDefault();
        sortUsersBy('name');
    };

    document.getElementById('sort-username').onclick = (event) => {
        event.preventDefault();
        sortUsersBy('username');
    };

    initialApp();
});
