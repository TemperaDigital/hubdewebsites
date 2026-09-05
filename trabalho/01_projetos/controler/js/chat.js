function sendMessage() {
  const input = document.getElementById('message');
  const chatBox = document.getElementById('chat-box');

  if (!input.value.trim()) return;

  const user = document.createElement('p');
  user.innerHTML = '<strong>Você:</strong> ' + input.value;

  const bot = document.createElement('p');
  bot.innerHTML = '<strong>Finance AI:</strong> Transação registrada com sucesso.';

  chatBox.appendChild(user);
  chatBox.appendChild(bot);

  input.value = '';
}
