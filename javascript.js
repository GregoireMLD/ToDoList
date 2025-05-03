// Récupère les tâches stockées dans localStorage
const storedTodos = localStorage.getItem("todos");

// Si des tâches existent, les convertir en tableau d'objets, sinon créer un tableau vide
const todos = storedTodos ? JSON.parse(storedTodos) : [];

// Sélectionne le formulaire de création de tâche
const form = document.querySelector("#new-task-form");

// Sélectionne le champ de saisie pour la nouvelle tâche
const input = document.querySelector("#new-task-input");

// Sélectionne l'élément où les tâches seront affichées
const list_el = document.querySelector("#tasks");

let draggedElementIndex = null; // Stocke l'index de l'élément en cours de déplacement

// Fonction pour ajouter une tâche au DOM et attacher les événements
function addTaskToDOM(taskText, index, completed = false) {
  console.log("Ajout de la tâche au DOM:", taskText);

  // Crée un élément div pour la tâche et ajoute la classe "task"
  const task_el = document.createElement("div");
  task_el.classList.add("task");
  task_el.setAttribute("draggable", "true");

  // Crée un div pour contenir le contenu de la tâche
  const task_content_el = document.createElement("div");
  task_content_el.classList.add("content");

  // Crée le champ checkbox pour marquer la tâche comme terminée
  const task_checkbox = document.createElement("input");
  task_checkbox.type = "checkbox";
  task_checkbox.checked = completed; // Coche la case si la tâche est terminée

  // Ajoute le checkbox au contenu de la tâche
  task_content_el.appendChild(task_checkbox);

  // Crée un champ input pour la tâche avec un texte non modifiable
  const task_input_el = document.createElement("input");
  task_input_el.classList.add("text");
  task_input_el.type = "text";
  task_input_el.value = taskText;
  task_input_el.setAttribute("readonly", "readonly");

  // Ajoute le champ de saisie au contenu de la tâche
  task_content_el.appendChild(task_input_el);

  // Applique un style barré si la tâche est terminée
  if (completed) {
    task_input_el.style.textDecoration = "line-through";
  }

  // Crée un div pour contenir les boutons d'action (éditer/supprimer)
  const task_actions_el = document.createElement("div");
  task_actions_el.classList.add("actions");

  // Crée le bouton d'édition
  const task_edit_el = document.createElement("button");
  task_edit_el.classList.add("Edit-button");
  task_edit_el.innerText = "EDIT";

  // Crée le bouton de suppression
  const task_delete_el = document.createElement("button");
  task_delete_el.classList.add("Delete-button");
  task_delete_el.innerText = "SUPR";

  // Ajoute les boutons d'action (édition et suppression) à la tâche
  task_actions_el.appendChild(task_edit_el);
  task_actions_el.appendChild(task_delete_el);

  // Ajoute la section des actions (boutons) à l'élément de tâche
  task_el.appendChild(task_content_el);
  task_el.appendChild(task_actions_el);

  // Ajoute l'élément de la tâche au DOM (affichage)
  list_el.appendChild(task_el);

  // Logique pour le bouton "EDIT"
  task_edit_el.addEventListener("click", () => {
    if (task_edit_el.innerText.toLowerCase() === "edit") {
      task_input_el.removeAttribute("readonly");
      task_input_el.focus();
      task_edit_el.innerText = "SAVE";
    } else {
      task_input_el.setAttribute("readonly", "readonly");
      task_edit_el.innerText = "EDIT";

      todos[index].text = task_input_el.value;
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  });

  // Logique pour le bouton "SUPR"
  task_delete_el.addEventListener("click", () => {
    todos.splice(index, 1);
    task_el.remove();
    localStorage.setItem("todos", JSON.stringify(todos));
  });

  // Logique pour le checkbox (marquer comme terminée)
  task_checkbox.addEventListener("change", () => {
    todos[index].completed = task_checkbox.checked;
    task_input_el.style.textDecoration = task_checkbox.checked ? "line-through" : "none";
    localStorage.setItem("todos", JSON.stringify(todos));
  });

  // --- Drag and Drop Events ---
  task_el.addEventListener("dragstart", () => {
    draggedElementIndex = index;
    task_el.classList.add("dragging");
  });

  task_el.addEventListener("dragend", () => {
    task_el.classList.remove("dragging");
  });

  list_el.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list_el, e.clientY);
    const currentDraggingElement = document.querySelector(".dragging");

    if (afterElement == null) {
      list_el.appendChild(currentDraggingElement);
    } else {
      list_el.insertBefore(currentDraggingElement, afterElement);
    }
  });

  task_el.addEventListener("drop", () => {
    const droppedIndex = Array.from(list_el.children).indexOf(task_el);
    const draggedTask = todos[draggedElementIndex];

    todos.splice(draggedElementIndex, 1);
    todos.splice(droppedIndex, 0, draggedTask);

    localStorage.setItem("todos", JSON.stringify(todos));
  });
}

// --- Helper function to get the element after which we want to insert ---
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".task:not(.dragging)")];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Ajoute un événement au formulaire pour gérer la soumission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Récupère la valeur de la nouvelle tâche
  const task = input.value;

  if (!task) {
    alert("Il n'y a pas de tâche");
    return;
  }

  // Ajoute la nouvelle tâche au tableau des tâches
  const newTaskIndex = todos.length;
  todos.push({ text: task, completed: false });

  // Sauvegarde la liste de tâches dans localStorage
  localStorage.setItem("todos", JSON.stringify(todos));

  // Ajoute la nouvelle tâche à l'interface utilisateur
  addTaskToDOM(task, newTaskIndex);

  // Vide le champ de saisie après l'ajout de la tâche
  input.value = "";
});

// Boucle sur toutes les tâches sauvegardées pour les afficher à l'ouverture de la page
todos.forEach((todo, index) => {
  addTaskToDOM(todo.text, index, todo.completed);
});
