const currentDate = new Date()
const events = JSON.parse(localStorage.getItem("wizardEvents")) || {}
let selectedDate = null
let selectedUnit = "all"

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

const unitNames = {
  all: "Todas as Unidades",
  fatima: "Fátima",
  parangaba: "Parangaba",
  washington: "Washington Soares",
  eusebio: "Eusébio",
  maracanaú: "Maracanaú",
  bezerra: "Bezerra",
  maraponga: "Maraponga",
  "dom-luis": "Dom Luís",
}

const supabase = window.supabase

function checkUserLoggedIn() {
  // Add a small delay to ensure DOM is fully loaded
  setTimeout(async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      const loginBtn = document.getElementById("login-btn")
      const userMenu = document.getElementById("user-menu")
      const userButton = document.getElementById("userButton")
      const addEventBtn = document.getElementById("addEventBtn")

      if (error) {
        console.error("Auth error:", error)
        // Show login button on error
        if (loginBtn) loginBtn.style.display = "flex"
        if (userMenu) userMenu.style.display = "none"
        return
      }

      if (user) {
        console.log("User is logged in:", user.email)
        // User is logged in - hide login button, show user menu
        if (loginBtn) loginBtn.style.display = "none"
        if (userMenu) userMenu.style.display = "block"

        const username = user.user_metadata.full_name || user.email || "Usuário"
        const firstName = username.split(" ")[0]
        if (userButton) userButton.textContent = `Olá, ${firstName}`

        // Enable add event button for logged users
        if (addEventBtn) {
          addEventBtn.disabled = false
          addEventBtn.onclick = () => openAddEventModal()
        }

        // Remove any existing event listeners to avoid duplicates
        if (userButton) {
          userButton.removeEventListener("click", toggleUserDropdown)
          // Add click event to toggle dropdown
          userButton.addEventListener("click", toggleUserDropdown)
        }

        // Close dropdown when clicking outside
        document.removeEventListener("click", handleOutsideClick)
        document.addEventListener("click", handleOutsideClick)
      } else {
        console.log("User is not logged in")
        // User is not logged in - show login button, hide user menu
        if (loginBtn) loginBtn.style.display = "flex"
        if (userMenu) userMenu.style.display = "none"

        if (addEventBtn) {
          addEventBtn.disabled = true
          addEventBtn.onclick = () => {
            alert("Faça login para adicionar eventos.")
            goToLogin()
          }
        }

        // Clean up event listeners
        document.removeEventListener("click", handleOutsideClick)
      }
    } catch (error) {
      console.error("Error checking user:", error)
      // On error, assume user is not logged in
      const loginBtn = document.getElementById("login-btn")
      const userMenu = document.getElementById("user-menu")
      if (loginBtn) loginBtn.style.display = "flex"
      if (userMenu) userMenu.style.display = "none"
    }
  }, 200) // Small delay to ensure everything is loaded
}

function handleOutsideClick(e) {
  const userMenu = document.getElementById("user-menu")
  if (userMenu && !userMenu.contains(e.target)) {
    closeUserDropdown()
  }
}

function toggleUserDropdown(e) {
  e.stopPropagation() // Prevent event bubbling
  const dropdown = document.getElementById("userDropdown")
  if (dropdown) {
    const isVisible = dropdown.style.display === "block"
    dropdown.style.display = isVisible ? "none" : "block"
  }
}

function closeUserDropdown() {
  const dropdown = document.getElementById("userDropdown")
  if (dropdown) {
    dropdown.style.display = "none"
  }
}

function logout() {
  supabase.auth.signOut().then(() => {
    window.location.reload()
  })
}

function goToLogin() {
  window.location.href = "login.html"
}

function filterByUnit() {
  selectedUnit = document.getElementById("unitFilter").value
  generateCalendar()
}

function shouldShowEvent(event) {
  if (selectedUnit === "all") return true
  return event.unit === selectedUnit || event.unit === "all"
}

function openAddEventModal() {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) {
      alert("Faça login para adicionar eventos.")
      goToLogin()
      return
    }

    // User is logged in, show the add event form
    const modal = document.getElementById("eventModal")
    const modalTitle = document.getElementById("modalTitle")
    const eventForm = document.getElementById("eventForm")
    const eventsList = document.getElementById("eventsList")

    modalTitle.textContent = "Adicionar Novo Evento"
    eventForm.style.display = "block"
    eventsList.style.display = "none"

    modal.style.display = "block"
  })
}

function generateCalendar() {
  const calendar = document.getElementById("calendar")
  const monthYear = document.getElementById("monthYear")

  calendar.innerHTML = ""
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  monthYear.textContent = `${monthNames[month]} ${year}`

  dayNames.forEach((day) => {
    const dayHeader = document.createElement("div")
    dayHeader.className = "day-header"
    dayHeader.textContent = day
    calendar.appendChild(dayHeader)
  })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  for (let i = firstDay - 1; i >= 0; i--) {
    const dayCell = createDayCell(daysInPrevMonth - i, true)
    calendar.appendChild(dayCell)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayCell = createDayCell(day, false)
    calendar.appendChild(dayCell)
  }

  const totalCells = calendar.children.length - 7
  const remainingCells = 42 - totalCells
  for (let day = 1; day <= remainingCells; day++) {
    const dayCell = createDayCell(day, true)
    calendar.appendChild(dayCell)
  }
}

function createDayCell(day, isOtherMonth) {
  const dayCell = document.createElement("div")
  dayCell.className = "day-cell"
  if (isOtherMonth) dayCell.classList.add("other-month")

  const today = new Date()
  const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
  if (!isOtherMonth && cellDate.toDateString() === today.toDateString()) {
    dayCell.classList.add("today")
  }

  const dayNumber = document.createElement("div")
  dayNumber.className = "day-number"
  dayNumber.textContent = day
  dayCell.appendChild(dayNumber)

  if (!isOtherMonth) {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`
    if (events[dateKey]) {
      events[dateKey].forEach((event) => {
        if (shouldShowEvent(event)) {
          const eventDiv = document.createElement("div")
          eventDiv.className = `event type-${event.type}`
          eventDiv.textContent = event.title
          dayCell.appendChild(eventDiv)
        }
      })
    }
    dayCell.addEventListener("click", () => openModal(day))
  }

  return dayCell
}

function openModal(day) {
  selectedDate = day
  const modal = document.getElementById("eventModal")
  const modalTitle = document.getElementById("modalTitle")

  modalTitle.textContent = `Eventos - ${day} de ${monthNames[currentDate.getMonth()]}`
  displayEvents()
  modal.style.display = "block"
}

function closeModal() {
  document.getElementById("eventModal").style.display = "none"
  clearForm()
}

function clearForm() {
  document.getElementById("eventTitle").value = ""
  document.getElementById("eventDescription").value = ""
  document.getElementById("eventType").value = "meeting"
  document.getElementById("eventUnit").value = "all"
}

function addEvent() {
  const title = document.getElementById("eventTitle").value.trim()
  const type = document.getElementById("eventType").value
  const unit = document.getElementById("eventUnit").value
  const description = document.getElementById("eventDescription").value.trim()

  if (!title) {
    alert("Por favor, digite um título para o evento.")
    return
  }

  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`

  if (!events[dateKey]) events[dateKey] = []

  const newEvent = {
    id: Date.now(),
    title: title,
    type: type,
    unit: unit,
    description: description,
  }

  events[dateKey].push(newEvent)
  saveEvents()
  clearForm()
  displayEvents()
  generateCalendar()
}

function deleteEvent(dateKey, eventId) {
  if (confirm("Tem certeza que deseja excluir este evento?")) {
    events[dateKey] = events[dateKey].filter((event) => event.id !== eventId)
    if (events[dateKey].length === 0) delete events[dateKey]
    saveEvents()
    displayEvents()
    generateCalendar()
  }
}

function displayEvents() {
  const eventsList = document.getElementById("eventsList")
  const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`
  eventsList.innerHTML = ""

  if (events[dateKey] && events[dateKey].length > 0) {
    const filteredEvents = events[dateKey].filter((event) => shouldShowEvent(event))

    if (filteredEvents.length > 0) {
      filteredEvents.forEach((event) => {
        const eventItem = document.createElement("div")
        eventItem.className = "event-item"

        const eventInfo = document.createElement("div")
        eventInfo.className = "event-info"

        const eventTitle = document.createElement("h4")
        eventTitle.textContent = event.title
        eventInfo.appendChild(eventTitle)

        if (event.description) {
          const eventDesc = document.createElement("p")
          eventDesc.textContent = event.description
          eventInfo.appendChild(eventDesc)
        }

        const eventDetails = document.createElement("p")
        eventDetails.innerHTML = `Tipo: ${getTypeLabel(event.type)} | Unidade: ${unitNames[event.unit] || "Todas"}`
        eventDetails.style.fontSize = "12px"
        eventDetails.style.color = "#999"
        eventInfo.appendChild(eventDetails)

        eventItem.appendChild(eventInfo)

        const deleteBtn = document.createElement("button")
        deleteBtn.className = "btn btn-delete"
        deleteBtn.textContent = "Excluir"
        deleteBtn.onclick = () => deleteEvent(dateKey, event.id)
        eventItem.appendChild(deleteBtn)

        eventsList.appendChild(eventItem)
      })
    } else {
      eventsList.innerHTML =
        '<p style="text-align: center; color: #666;">Nenhum evento para a unidade selecionada nesta data.</p>'
    }
  } else {
    eventsList.innerHTML = '<p style="text-align: center; color: #666;">Nenhum evento nesta data.</p>'
  }
}

function getTypeLabel(type) {
  const labels = {
    meeting: "Reunião",
    holiday: "Feriado",
    training: "Treinamento",
    celebration: "Comemoração",
    deadline: "Prazo",
  }
  return labels[type] || type
}

function saveEvents() {
  localStorage.setItem("wizardEvents", JSON.stringify(events))
}

function previousMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1)
  generateCalendar()
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1)
  generateCalendar()
}

window.onclick = (event) => {
  const modal = document.getElementById("eventModal")
  if (event.target === modal) closeModal()
}

generateCalendar()
document.addEventListener("DOMContentLoaded", checkUserLoggedIn)
