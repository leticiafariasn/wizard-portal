// Aguardar o Supabase estar disponível
function waitForSupabase() {
  return new Promise((resolve) => {
    if (window.supabase) {
      resolve(window.supabase)
    } else {
      setTimeout(() => waitForSupabase().then(resolve), 100)
    }
  })
}

async function loginUser() {
  const email = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value.trim()
  const errorDisplay = document.getElementById("login-error")

  // Hide any previous error
  errorDisplay.classList.remove("show")
  errorDisplay.textContent = ""

  if (!email || !password) {
    errorDisplay.textContent = "Por favor, preencha todos os campos."
    errorDisplay.classList.add("show")
    return
  }

  try {
    console.log("Attempting login with:", email)

    // Aguardar o Supabase estar disponível
    const supabase = await waitForSupabase()

    // Usar Supabase Auth nativo
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      console.error("Login error:", error)

      // Provide more specific error messages
      let errorMessage = "Email ou senha inválidos."

      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha inválidos."
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login."
      } else if (error.message.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Tente novamente em alguns minutos."
      } else {
        errorMessage = "Erro no login. Tente novamente."
      }

      errorDisplay.textContent = errorMessage
      errorDisplay.classList.add("show")
      return
    }

    if (data.user) {
      console.log("Login successful:", data.user.email)
      // Redirecionar para a página de perfil em vez do calendário
      window.location.href = "profile.html"
    }
  } catch (error) {
    console.error("Unexpected login error:", error)
    errorDisplay.textContent = "Erro inesperado. Tente novamente."
    errorDisplay.classList.add("show")
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password")
  const eyeIcon = document.getElementById("eye-icon")

  const isHidden = passwordInput.type === "password"
  passwordInput.type = isHidden ? "text" : "password"

  eyeIcon.className = isHidden ? "ph ph-eye-slash" : "ph ph-eye"
}

// Add enter key support
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form")
  if (form) {
    form.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        loginUser()
      }
    })
  }
})
