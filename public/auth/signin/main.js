const button = document.querySelector('.login-button');
const username = document.querySelector('.username');
const password = document.querySelector('.password');

const handler = async () => {
  try {
    const { data } = await axios.post('http://localhost:3000/api/v1/auth/signin', {
      username: username.value,
      password: password.value,
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', username.value);

    window.location.href = "../../messages/index.html";
  } catch (err) {
    // alert('Неверное имя пользователя или пароль!');
    alert(err.response ? err.response.data : err.message);
  }
};

button.onclick = handler;

password.onkeyup = (event) => {
  if (event.keyCode === 13) {
    handler();
  }
};