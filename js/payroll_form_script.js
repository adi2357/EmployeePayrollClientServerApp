let isUpdate = false;
let employeePayrollObject;
employeePayrollObject = {};

window.addEventListener("DOMContentLoaded", () => {

    const name = document.querySelector("#name");
    if (name) {
        name.addEventListener("input", function() {
            if (name.value.length == 0) {
                setTextContent(".name-error", "");
                setTextContent(".valid-name", "");
            } else {
                try {
                    checkName(name.value);
                    setTextContent(".name-error", "");
                    setTextContent(".valid-name", '✓');
                    document.querySelector(".submitButton").disabled = false;
                } catch (error) {
                    setTextContent(".name-error", error)
                    setTextContent(".valid-name", "");
                    document.querySelector(".submitButton").disabled = true;
                }
            }
        });
    }

    const startDate = document.querySelector("#startDate");
    if (startDate) {
        startDate.addEventListener("input", function() {
            try {
                let dateString = document.querySelector("#month").value + " " + document.querySelector("#day").value + ", " + document.querySelector("#year").value;
                checkStartDate(new Date(dateString));
                setTextContent(".startDate-error", "");
                setTextContent(".valid-startDate", '✓');
                document.querySelector(".submitButton").disabled = false;
            } catch (error) {
                setTextContent(".startDate-error", error);
                setTextContent(".valid-startDate", "");
                document.querySelector(".submitButton").disabled = true;
            }
        });
    }

    const salary = document.querySelector("#salary");
    const output = document.querySelector(".salary-output");
    if (salary) {
        salary.oninput = function() {
            output.textContent = salary.value;
        };
    }

    checkForUpdate();
});

const save = (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
        setEmployeePayrollObject();
        if (site_properties.use_local_storage.match("true")) {
            updateLocalStorage();
            resetForm();
            window.location.replace(site_properties.home_page);
        } else {
            updateJSONServer();
        }
    } catch (submitError) {
        alert(submitError);
        resetForm();
        return;
    }
};

const setEmployeePayrollObject = () => {
    if (!isUpdate && site_properties.use_local_storage.match("true")) {
        employeePayrollObject.id = createEmployeeId();
    }
    employeePayrollObject._name = getValue("#name");
    employeePayrollObject._profilePicture = getSelectedValues("[name=profile]").pop();
    employeePayrollObject._gender = getSelectedValues("[name=gender]").pop();
    employeePayrollObject._salary = getValue("#salary");
    employeePayrollObject._note = getValue("#notes");
    let dateString = getValue("#day") + " " + getValue("#month") + " " + getValue("#year");
    employeePayrollObject._startDate = new Date(dateString);
    employeePayrollObject._departments = getSelectedValues("[name=department]");
};

const updateLocalStorage = () => {
    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
    if (employeePayrollList) {
        let employeePayrollData = employeePayrollList.find(employeeData => employeeData.id == employeePayrollObject.id);
        if (!employeePayrollData) {
            employeePayrollList.push(employeePayrollObject);
        } else {
            const index = employeePayrollList.map(employeeData => employeeData.id).indexOf(employeePayrollData.id);
            employeePayrollList.splice(index, 1, employeePayrollObject);
        }
    } else {
        employeePayrollList = [employeePayrollObject];
    }

    alert("Local Storage Updated Successfully!\nTotal Employees : " + employeePayrollList.length);
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList));
}

const updateJSONServer = () => {
    let url = site_properties.server_url;
    let methodCall = "POST";
    if (isUpdate) {
        methodCall = "PUT";
        url = url + employeePayrollObject.id.toString();

    }
    makeServiceCall(methodCall, url, true, employeePayrollObject)
        .then(responseText => {
            resetForm();
            window.location.replace(site_properties.home_page);
        })
        .catch(error => {
            throw error;
        });
};

const createEmployeeId = () => {
    let employeeId = localStorage.getItem("EmployeeID");
    employeeId = !employeeId ? 1 : (parseInt(employeeId) + 1).toString();
    localStorage.setItem("EmployeeID", employeeId);
    return employeeId;
};

const setForm = () => {
    setValue("#name", employeePayrollObject._name);
    setSelectedValues("[name=profile]", employeePayrollObject._profilePicture);
    setSelectedValues("[name=gender]", employeePayrollObject._gender);
    setSelectedValues("[name=department]", employeePayrollObject._departments);
    setRange("#salary", ".salary-output", employeePayrollObject._salary);
    setValue("#notes", employeePayrollObject._note);
    let date = stringifyDate(employeePayrollObject._startDate).split(" ");
    setValue("#day", date[0]);
    setValue("#month", date[1]);
    setValue("#year", date[2]);
}

const resetForm = () => {
    setValue("#name", "");
    setTextContent(".name-error", "");
    setTextContent(".valid-name", "");
    unsetSelectedValues("[name=profile]");
    unsetSelectedValues("[name=gender]");
    unsetSelectedValues("[name=department]");
    setRange("#salary", ".salary-output", 400000);
    setSelectedIndex("#day", 0);
    setSelectedIndex("#month", 0);
    setSelectedIndex("#year", 0);
    setTextContent(".startDate-error", "");
    setTextContent(".valid-startDate", "");
    setValue("#notes", "");
};

const getSelectedValues = (propertyName) => {
    let allValues = document.querySelectorAll(propertyName);
    let selectedValues = [];
    allValues.forEach(input => {
        if (input.checked) selectedValues.push(input.value);
    });
    return selectedValues;
};

const getValue = (propertyId) => {
    let value = document.querySelector(propertyId).value;
    return value;
};

const setValue = (propertyId, value) => {
    const element = document.querySelector(propertyId);
    element.value = value;
};

const setSelectedIndex = (propertyId, index) => {
    const element = document.querySelector(propertyId);
    element.selectedIndex = index;
};

const unsetSelectedValues = (propertyName) => {
    let allValues = document.querySelectorAll(propertyName);
    allValues.forEach(input => input.checked = false);
};

const setSelectedValues = (propertyName, values) => {
    let allValues = document.querySelectorAll(propertyName);
    allValues.forEach(input => {
        if (Array.isArray(values)) {
            if (values.includes(input.value)) {
                input.checked = true;
            }
        } else if (input.value == values) {
            input.checked = true;
        }
    });
};

const setRange = (propertyId, outputId, rangeValue) => {
    const rangeElement = document.querySelector(propertyId);
    rangeElement.value = rangeValue;
    const outputElement = document.querySelector(outputId);
    outputElement.textContent = rangeElement.value;
};

const setTextContent = (propertyId, value) => {
    const contentElement = document.querySelector(propertyId);
    contentElement.textContent = value;
};

const checkForUpdate = () => {
    const employeeToEditJson = localStorage.getItem("EmployeeToEdit");
    isUpdate = employeeToEditJson ? true : false;
    if (!isUpdate) return;
    employeePayrollObject = JSON.parse(employeeToEditJson);
    setForm();
};