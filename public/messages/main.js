const sidebar = document.querySelector('.sidebar');
const title = document.querySelector('h3');
const messagesField = document.querySelector('.messages');
const messageField = document.querySelector('.message');
const headerField = document.querySelector('.header');
const searchInput = document.querySelector('.search-input');
const searchField = document.querySelector('.search-field');

let messageInput;
let userField;
let ulMessages;

const TOKEN = localStorage.getItem('token');

const headers = {
  authorization: `bearer ${TOKEN}`,
};

const socket = io('ws://localhost:3000', {
  transports: ['websocket'],
  withCredentials: true,
  query: headers,
});

const displayChats = async (username) => {
  removeElementsByClass('user');

  const { data } = await axios.get('http://localhost:3000/api/v1/chats', {
    headers,
    params: {
      username,
    },
  });

  data
    .sort((a, b) => Date.parse(b.lastMessage.createdAt) - Date.parse(a.lastMessage.createdAt))
    .forEach(item => {
      const chat = document.createElement('div');
      const avatar = document.createElement('img');
      const user = document.createElement('div');
      const name = document.createElement('p');
      const lastMessage = document.createElement('p');

      chat.className = 'user';

      chat.onclick = async () => await displayDialog(item);

      name.innerText = item.name;
      lastMessage.innerText = item.lastMessage.message || '';
      avatar.src = 'https://placedog.net/100/100';

      chat.appendChild(avatar);
      user.appendChild(name);
      user.appendChild(lastMessage);
      chat.appendChild(user);
      sidebar.appendChild(chat);
    });
};

const displayDialog = async ({ name, userId, chatId }) => {
  title.style = 'display:none';

  if (messageInput) messageInput.parentNode.removeChild(messageInput);
  if (userField) userField.parentNode.removeChild(userField);
  if (ulMessages) ulMessages.parentNode.removeChild(ulMessages);

  userField = document.createElement('div');
  const nameField = document.createElement('div');
  const avatar = document.createElement('img');
  const username = document.createElement('p');
  ulMessages = document.createElement('ul');
  messageInput = document.createElement('input');

  userField.className = 'userFieldInDialog';
  avatar.src = 'https://placedog.net/100/100';
  username.innerText = name;

  messageInput.setAttribute('type', 'text');
  messageInput.setAttribute('placeholder', 'Write a message...');

  userField.appendChild(avatar);
  nameField.appendChild(username);
  userField.appendChild(nameField);
  headerField.appendChild(userField);
  messagesField.appendChild(ulMessages);
  messageField.appendChild(messageInput);

  messageInput.onkeyup = async (event) => {
    if (event.keyCode !== 13) return;

    const message = messageInput.value;

    if (!message) return;

    messageInput.value = '';

    socket.emit('new private message', {
      userId,
      chatId,
      message,
    });

    await displayChats();
  };

  const { data } = await axios.get('http://localhost:3000/api/v1/chats/messages', {
    headers,
    params: {
      chatId,
      userId,
    },
  });

  if (!data) return;

  data.forEach(item => {
    const { message } = item;
    const liMessage = document.createElement('li');

    liMessage.innerHTML = `<div><h5>${message}</h5></div>`;
    ulMessages.appendChild(liMessage);
  });
};

const removeElementsByClass = className => {
  const elements = document.getElementsByClassName(className);

  while (elements.length) {
    elements[0].parentNode.removeChild(elements[0]);
  }
};

const searchInputHandler = async (username) => {
  searchInput.value = '';

  await displayChats(username);

  const searchExitButton = document.createElement('input');

  searchExitButton.setAttribute('type', 'button');
  searchExitButton.setAttribute('value', '✖️');

  searchField.appendChild(searchExitButton);

  searchExitButton.onclick = () => {
    searchInput.value = '';
    displayChats();
  }
};

let initialized = false;

searchInput.onkeyup = async (event) => {
  if (event.keyCode === 13) {
    await searchInputHandler(searchInput.value);
  }
};

socket.on('connect', async () => {
  if (initialized) return;

  initialized = true;

  await displayChats();
});

socket.on('new private message', message => {
  const liMessage = document.createElement('li');

  liMessage.innerHTML = `<div><h5>${message}</h5></div>`;
  ulMessages.appendChild(liMessage);
});

socket.on('disconnect', (reason) => {
  console.error('disconnect', reason);
});
