document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const form = event.target;
  const data = new URLSearchParams(new FormData(form));
  fetch(`/iniciarSesion?${data.toString()}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }
      return response.text();
    })
    .then(html => {
      document.open();
      document.write(html);
      document.close();
    })
    .catch(error => {
      document.getElementById('errorMessage').style.display = 'block';
      setTimeout(() => {
        document.getElementById('errorMessage').style.display = 'none';
        window.location.href = '/';
      }, 5000);
    });
});

