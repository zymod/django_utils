function containerParser(formType, appLabel, modelName, objectID) {
    const url = `/core/${appLabel}/${modelName}/${objectID}/related_fields/`;
    if (formType.includes('edit')) {
        showContainerObjectEdit(url);
    } else if (formType.includes('delete')) {
        showContainerObjectDelete(url);
    }
}

// Używane do formularza statycznego
function showContainerObjectEdit(url) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(data => {
        const parsedData = JSON.parse(data.obj);

        const modelFields = parsedData[0]['fields'];
        const relatedFields = data.related_fields;

        const containerNameSufix = parsedData[0]['model'].split('.')[1];

        const form = document.getElementById(`form-edit-${containerNameSufix}`);

        const formFields = form.elements;

        for (let i = 0; i < formFields.length; i++) {
            const fieldName = formFields[i].name;
            const formField = form.querySelector(`#id_${fieldName}`);
            if (formField !== null) {
                if (formField.classList.contains('select2-hidden-accessible')) {
                    const select2Instance = $(formField).data('select2'); // Możemy użyć Select2 tylko z jQuery, więc tutaj pozostaje
                    if (relatedFields.hasOwnProperty(fieldName)) {
                        const fieldData = relatedFields[fieldName];
                        if (Array.isArray(fieldData)) {
                            if (Array.isArray(fieldData[0])) {
                                // Obsługa pól wiele-do-wielu
                                const dataToInject = fieldData.map(item => ({ id: item[0], text: item[1] }));
                                dataToInject.forEach(item => {
                                    select2Instance.trigger('select', { data: item });
                                });
                            } else {
                                // Obsługa pól jednokrotnych
                                const [id, text] = fieldData;
                                select2Instance.trigger('select', { data: { id: id, text: text } });
                            }
                        }
                    }
                } else {
                    if (formField.type === 'checkbox') {
                        formField.checked = modelFields[fieldName] ? true : false; // wyjaśbnij jak to działa? ten syntax
                    } else if (formField.type !== 'file') {
                        formField.value = modelFields[fieldName] || '';
                    }
                }
            }
        }
   
        // Stwórz input który będzie przechowywał id instancji
        const inputId = document.createElement('input');
        inputId.type = 'number';
        inputId.name = 'id_object';
        inputId.value = parsedData[0]['pk'];
        inputId.hidden = true;
        inputId.classList.add('element-injected');

        form.appendChild(inputId);
        showForm('edit', containerNameSufix);
    })
}

// Używane do formularza statycznego
function showContainerObjectDelete(url) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
    })
    .then(response => response.json())
    .then(data => {
        const parsedData = JSON.parse(data.obj);
        const modelFields = parsedData[0]['fields'];

        const containerNameSufix = parsedData[0]['model'].split('.')[1];
        const form = document.getElementById(`form-delete-${containerNameSufix}`);
        const formContainerInfo = document.getElementById(`form-container-info-${containerNameSufix}`);


        // Stwórz input który będzie przechowywał id instancji
        const inputId = document.createElement('input');
        inputId.type = 'number';
        inputId.name = 'id_object';
        inputId.value = `${parsedData[0]['pk']}`;
        inputId.hidden = true;
        inputId.classList.add('element-injected');

        // Modyfikuj input aby przechowywał informacje czy operacja jest typem delete
        const inputIsDelete = document.createElement('input');
        inputIsDelete.type = 'text';
        inputIsDelete.name = 'is_delete';
        inputIsDelete.value = `True`;
        inputIsDelete.hidden = true;
        inputIsDelete.classList.add('element-injected');

        const pInfo = document.createElement('p');
        // Gdybym użył pInfo.textContent zamiast innerHTML to <strong></strong> był by widoczny jaKo tekst nie byłby zamieniony na html
        pInfo.innerHTML = `Czy jesteś pewny że chcesz usunąć <strong>"${data.obj_str}"</strong>`;
        pInfo.classList.add('element-injected');
        
        form.appendChild(inputIsDelete);
        form.appendChild(inputId);
        formContainerInfo.appendChild(pInfo);

        showForm('delete', containerNameSufix);

    })
}

// Funkcja odkrywa kontener z formularzem
function showForm(type, sufixName,  event=null) {
    if (event) {
      event.preventDefault();
    }

    const overlay = document.getElementById(`form-overlay-${type}-${sufixName}`);
    const container = document.getElementById(`form-container-${type}-${sufixName}`);


    if (overlay) {
        overlay.style.display = 'block';
    }

    if (container) {
      container.style.display = 'block';
      container.classList.add('visible');
    }

    const form = document.getElementById(`form-${type}-${sufixName}`);
    focusOnForm(form);
}

// Funkcja ukrywa kontener z formularzem
function hideForm(type, sufixName,  event=null) {
    const overlay = document.getElementById(`form-overlay-${type}-${sufixName}`);
    const container = document.getElementById(`form-container-${type}-${sufixName}`);

    overlay.style.display = 'none';
    container.style.display = 'none';
    container.classList.remove('visible')

    const form = document.getElementById(`form-${type}-${sufixName}`);

    const elementsInjected = document.querySelectorAll('.element-injected');

    for (let i = 0; i < elementsInjected.length; i++) {
        elementsInjected[i].remove();
    }

    // Zresetuj formularz
    if (form) {
        form.reset();
        $('.select2').val(null).trigger('change');
        $('.select2-selection__rendered').each(function() {
            $(this).text('');
        });
        const errorContainer = document.getElementById(`form-container-${type}-${sufixName}-errors`);
        clearErrorContainer(errorContainer);
        //const submitButton = form.getElementsByClassName('submitButton');
        const submitButton = form.querySelector('.submitButton');
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

// Funkcja Usuwa style css z kontenera odpowiadającego za wyświetlanie błędów
function clearErrorContainer(errorContainer) {
    errorContainer.innerHTML = '';
    errorContainer.backgroudColor = '';
    errorContainer.style.border = '';
    errorContainer.style.padding = '';
}

// Funkcja ustawia focus na pierwszy element formularza
function focusOnForm(form) {
    if (form) {
        const formFields = form.elements;
        if (formFields[1]) {
            formFields[1].focus();
        } 
    }
}

function resetForm(form) {
    if (form) {form.reset()}
}

function findTextByValue(selectElement, value) {
    const options = $(selectElement).find('li.select2-results__option')
    for (let i = 0; i < options.length; i++) {
        const option = $(options[i]);
        if (option.attr('data-select2-id') === value.toString()) {
            return option.text();
        }
    }
    return null;
}