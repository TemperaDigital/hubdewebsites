document.addEventListener('DOMContentLoaded', function () {
  var jsItem = document.getElementById('c-js');
  var jsMsg = document.getElementById('js-msg');
  jsItem.classList.remove('fail');
  jsItem.classList.add('ok');
  jsMsg.textContent = 'js/app.js carregou e rodou normalmente.';

  var mimeItem = document.getElementById('c-mime');
  var mimeMsg = document.getElementById('mime-msg');

  fetch('css/estilo.css', { method: 'HEAD' })
    .then(function (r) {
      var tipo = r.headers.get('content-type') || 'desconhecido';
      if (tipo.indexOf('text/css') === 0) {
        mimeItem.classList.remove('fail');
        mimeItem.classList.add('ok');
        mimeMsg.textContent = 'O CSS chegou como ' + tipo + '.';
      } else {
        mimeMsg.textContent = 'Atencao: o CSS chegou como ' + tipo + ' em vez de text/css.';
      }
    })
    .catch(function () {
      mimeMsg.textContent = 'Nao foi possivel verificar o tipo MIME.';
    });
});
