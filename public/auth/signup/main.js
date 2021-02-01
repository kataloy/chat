const loginButton = document.querySelector('.login-button');
const usernameField = document.querySelector('.username-field');
const passwordField = document.querySelector('.password-field');
const repeatedPasswordField = document.querySelector('.repeated-password-field');

loginButton.onclick = async () => {
  if (passwordField.value !== repeatedPasswordField.value) {
    alert('Пароли не совпадают');
    return;
  }

  try {
    const data1 = await axios.post('http://localhost:3000/api/v1/auth/signup', {
      username: usernameField.value,
      password: passwordField.value,
    });

    const data2 = await axios.post('http://localhost:3000/api/v1/auth/signin', {
      username: usernameField.value,
      password: passwordField.value,
    });

    localStorage.setItem('username', data1.data.username);
    localStorage.setItem('token', data2.data.token);

    window.location.href = "../../messages/index.html";
  } catch (err) {
    console.log(err.message);
    if (err.message === 'Request failed with status code 400') {
      alert('This username already exists!')
    } else {
      alert(err.message);
    }
  }
};