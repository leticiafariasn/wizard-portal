let currentUser = null
let currentSection = "frequencia"

// Initialize supabase - use the same instance as other files
const supabase = window.supabase

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  checkAuthAndLoadUser()
  showSection("frequencia")
})

async function checkAuthAndLoadUser() {
  try {
    // Add a small delay to ensure supabase is fully loaded
    await new Promise((resolve) => setTimeout(resolve, 100))

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Auth error:", error)
      redirectToLogin()
      return
    }

    if (!user) {
      console.log("No user found, redirecting to login")
      redirectToLogin()
      return
    }

    // User is authenticated, load their data
    currentUser = {
      id: user.id,
      email: user.email,
      username: user.user_metadata.full_name || user.email || "Usuário",
      role: user.user_metadata.role || "Professor",
    }

    console.log("User authenticated:", currentUser.username)
    document.getElementById("userName").textContent = currentUser.username
    document.getElementById("userRole").textContent = currentUser.role
  } catch (error) {
    console.error("Error checking authentication:", error)
    redirectToLogin()
  }
}

function redirectToLogin() {
  console.log("Redirecting to login...")
  window.location.href = "login.html"
}

function showSection(section) {
  currentSection = section

  // Update active navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })

  // Find the clicked nav item and make it active
  const clickedItem = event?.target?.closest(".nav-item")
  if (clickedItem) {
    clickedItem.classList.add("active")
  }

  // Update title and content
  const titles = {
    frequencia: "Frequência",
    boletim: "Boletim",
    reposicoes: "Reposições",
    "banco-horas": "Banco de Horas",
    documentos: "Documentos",
  }

  document.getElementById("sectionTitle").textContent = titles[section]
  loadSectionContent(section)
}

function loadSectionContent(section) {
  const contentBody = document.getElementById("contentBody")

  switch (section) {
    case "frequencia":
      contentBody.innerHTML = getFrequenciaContent()
      break
    case "boletim":
      contentBody.innerHTML = getBoletimContent()
      break
    case "reposicoes":
      contentBody.innerHTML = getReposicoesContent()
      break
    case "banco-horas":
      contentBody.innerHTML = getBancoHorasContent()
      break
    case "documentos":
      contentBody.innerHTML = getDocumentosContent()
      break
  }
}

function getFrequenciaContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-chart-bar"></i>
                Registro de Frequência
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Status</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>24/06/2025</td>
                        <td>João Silva</td>
                        <td>Intermediário A</td>
                        <td><span class="status-badge status-presente">Presente</span></td>
                        <td>Participação ativa</td>
                    </tr>
                    <tr>
                        <td>24/06/2025</td>
                        <td>Maria Santos</td>
                        <td>Intermediário A</td>
                        <td><span class="status-badge status-falta">Falta</span></td>
                        <td>Justificada</td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>Pedro Costa</td>
                        <td>Avançado B</td>
                        <td><span class="status-badge status-presente">Presente</span></td>
                        <td>Entregou atividade</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getBoletimContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-clipboard-text"></i>
                Notas dos Alunos
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Prova 1</th>
                        <th>Prova 2</th>
                        <th>Trabalho</th>
                        <th>Média</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>João Silva</td>
                        <td>Intermediário A</td>
                        <td>8.5</td>
                        <td>9.0</td>
                        <td>8.8</td>
                        <td>8.8</td>
                    </tr>
                    <tr>
                        <td>Maria Santos</td>
                        <td>Intermediário A</td>
                        <td>7.5</td>
                        <td>8.2</td>
                        <td>9.0</td>
                        <td>8.2</td>
                    </tr>
                    <tr>
                        <td>Pedro Costa</td>
                        <td>Avançado B</td>
                        <td>9.2</td>
                        <td>8.8</td>
                        <td>9.5</td>
                        <td>9.2</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getReposicoesContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-arrow-clockwise"></i>
                Aulas de Reposição
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data Agendada</th>
                        <th>Aluno</th>
                        <th>Turma</th>
                        <th>Motivo</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>26/06/2025</td>
                        <td>Maria Santos</td>
                        <td>Intermediário A</td>
                        <td>Falta justificada</td>
                        <td><span class="status-badge status-pendente">Agendada</span></td>
                    </tr>
                    <tr>
                        <td>25/06/2025</td>
                        <td>Carlos Lima</td>
                        <td>Básico C</td>
                        <td>Atestado médico</td>
                        <td><span class="status-badge status-presente">Realizada</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getBancoHorasContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-clock"></i>
                Controle de Horas
            </h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Funcionário</th>
                        <th>Horas Extras</th>
                        <th>Horas Compensadas</th>
                        <th>Saldo</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>24/06/2025</td>
                        <td>Prof. Ana Silva</td>
                        <td>+2h</td>
                        <td>0h</td>
                        <td>+2h</td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>Prof. João Santos</td>
                        <td>+1h</td>
                        <td>-1h</td>
                        <td>0h</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function getDocumentosContent() {
  return `
        <div class="section-content">
            <h3 class="section-title">
                <i class="ph ph-folder"></i>
                Documentos e Atestados
            </h3>
            <div style="margin-bottom: 20px;">
                <input type="file" id="fileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                <button class="btn-action" onclick="document.getElementById('fileUpload').click();">
                    <i class="ph ph-paperclip"></i>
                    Enviar Documento
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Documento</th>
                        <th>Tipo</th>
                        <th>Enviado por</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>24/06/2025</td>
                        <td>atestado_medico.pdf</td>
                        <td>Atestado</td>
                        <td>Prof. Maria</td>
                        <td>
                            <button class="btn-action" style="padding: 8px 12px; font-size: 12px;">
                                <i class="ph ph-eye"></i>
                                Visualizar
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>certificado_curso.pdf</td>
                        <td>Certificado</td>
                        <td>Prof. João</td>
                        <td>
                            <button class="btn-action" style="padding: 8px 12px; font-size: 12px;">
                                <i class="ph ph-eye"></i>
                                Visualizar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

async function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    try {
      await supabase.auth.signOut()
      window.location.href = "index.html"
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if there's an error, redirect to home
      window.location.href = "index.html"
    }
  }
}
