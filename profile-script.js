let currentUser = null
let currentSection = "frequencia"

// Inicializar página
document.addEventListener("DOMContentLoaded", () => {
  loadUserData()
  showSection("frequencia")
})

function loadUserData() {
  const userData = localStorage.getItem("wizardUser")
  if (!userData) {
    window.location.href = "login.html"
    return
  }

  currentUser = JSON.parse(userData)
  document.getElementById("userName").textContent = currentUser.username
  document.getElementById("userRole").textContent = currentUser.role
}

function showSection(section) {
  currentSection = section

  // Atualizar navegação ativa
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active")
  })
  event.target.closest(".nav-item").classList.add("active")

  // Atualizar título e conteúdo
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
            <h3 class="section-title">Registro de Frequência</h3>
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
            <h3 class="section-title">Notas dos Alunos</h3>
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
            <h3 class="section-title">Aulas de Reposição</h3>
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
            <h3 class="section-title">Controle de Horas</h3>
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
            <h3 class="section-title">Documentos e Atestados</h3>
            <div style="margin-bottom: 20px;">
                <input type="file" id="fileUpload" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                <button class="btn-action" onclick="document.getElementById('fileUpload').click();">
                    📎 Enviar Documento
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
                            <button class="btn-action" style="padding: 5px 10px; font-size: 12px;">
                                👁️ Visualizar
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>23/06/2025</td>
                        <td>certificado_curso.pdf</td>
                        <td>Certificado</td>
                        <td>Prof. João</td>
                        <td>
                            <button class="btn-action" style="padding: 5px 10px; font-size: 12px;">
                                👁️ Visualizar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `
}

function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    localStorage.removeItem("wizardUser")
    window.location.href = "index.html"
  }
}
