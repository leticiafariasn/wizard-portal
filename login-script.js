function togglePassword() {
  const passwordInput = document.getElementById("password")
  const eyeIcon = document.getElementById("eye-icon")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    eyeIcon.textContent = "🙈"
  } else {
    passwordInput.type = "password"
    eyeIcon.textContent = "👁️"
  }
}

function handleLogin(event) {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const isAdmin = document.getElementById("adminAccess").checked

  // Simulação de autenticação (substituir pelo Supabase futuramente)
  if (username && password) {
    const userRole = isAdmin ? "Coordenador" : "Professor"
    const userData = {
      username: username,
      role: userRole,
      loginTime: new Date().toISOString(),
    }

    // Salvar dados do usuário no localStorage
    localStorage.setItem("wizardUser", JSON.stringify(userData))

    // Redirecionar para a página de perfil
    window.location.href = "profile.html"
  } else {
    alert("Por favor, preencha todos os campos.")
  }
}
