function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if(option == 1) {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }

    option = (option == 0) ? 1 : 0;
}

document.addEventListener('DOMContentLoaded', () => {
    toggleForm();
});