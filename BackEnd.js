var DomainUrl = "https://script.google.com/macros/s/AKfycbyWmG9ai1hKO7Aik6qv-1LDyVSGI2W9AuRp2_FyoJb6IkmPUncgKjLoOfZv_katOli_2A/exec";
var tableData;
var dropDownValues;
var modal;
let gridInstance;

document.addEventListener('DOMContentLoaded', function() {
    setDefaultDate();
    AssigneValues();
    fetchData(document.getElementById('selectedDate').value);
    fetchDropDownData();
});

function setDefaultDate() {
    // Get today's date
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, '0');
    var day = String(today.getDate()).padStart(2, '0');

    // Format date as YYYY-MM-DD
    var currentDate = year + '-' + month + '-' + day;

    // Set the value of the date input field to the current date
    document.getElementById('selectedDate').value = currentDate;

    // Get the date input element
    const dateInput = document.getElementById('selectedDate');

    dateInput.addEventListener('change', function() {

        console.log('Date value changed:', dateInput.value);

        fetchData(document.getElementById('selectedDate').value);
    });

}

function AssigneValues()
{
    // Get the modal
    modal = document.getElementById("myModal");

    // Get the button that opens the modal
    var btn = document.getElementById("addBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
    modal.style.display = "block";
    var form = document.getElementById("cashForm");

    // Clear all input elements
    var inputs = form.querySelectorAll('input');
    inputs.forEach(function(input) {
        if (input.type === 'number' || input.type === 'text' || input.type === 'date') {
            input.value = '';
        }
        if (input.id === 'total') {
            input.value = '0'; // Reset the total field to 0
        }
    });
    
    // Reset all select elements
    var selects = form.querySelectorAll('select');
    selects.forEach(function(select) {
        select.selectedIndex = 0;
    });

    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

}
// Fetch data from the server
async function fetchData(date) {
    //google.script.run.withSuccessHandler(renderTable).getData();
    let dateParts = date.split('-');

    // Rearrange the parts to the desired format (dd-mm-yyyy)
    let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const url = DomainUrl+"?action=getTable("+formattedDate+")"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);
        renderTable(data);
        // Handle the data from the GET request
    })
    .catch(error => {
        console.error('Error with GET request:', error);
    });
}

async function fetchDropDownData() {
    //google.script.run.withSuccessHandler(renderTable).getData();
    const url = DomainUrl+"?action=getDropDown"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);
        dropDownValues= JSON.parse(data);
        populateFirstDropdown();
    })
    .catch(error => {
        console.error('Error with GET request:', error);
    });
}


// Render table rows from fetched data
function renderTable(data) {
    console.log(data);
    document.getElementById("wrapper").innerHTML = "";
    var tallyAmount = 0;
    tableData = data;
    
    const formattedData = data.map((row, index) => {
        if (row.transactionType === "Credit") {
            console.log("Credit");
            tallyAmount += row.total;
        } else {
            console.log("Debit");
            tallyAmount -= row.total;
        }
        
        return [
            row.companyName || '',
            row.name || '',
            row.transactionType || '',
            //row.paymentType || '',
            row.fiveHundred || '',
            row.twoHundred || '',
            row.oneHundred || '',
            row.fifty || '',
            row.twenty || '',
            row.ten || '',
            row.five || '',
            row.two || '',
            row.one || '',
            row.others || '',
            row.remarks || '',
            row.cash || '',
            row.dp || '',
            row.total || '',
            gridjs.html(`
                <div>
                    <button  class="btn btn-success btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Edit" onclick="editRow(${index})"><i class="fa fa-edit"></i></button>
                    <button  class="btn btn-danger btn-sm rounded-0" type="button" data-toggle="tooltip" data-placement="top" title="Delete" onclick="deleteRow(${index})"><i class="fa fa-trash"></i></button>
                </div>
            `)
        ];
    });
    
    if (gridInstance) {
        gridInstance.updateConfig({
            data: formattedData
        }).forceRender();
    } else {
        gridInstance = new gridjs.Grid({
            pagination: {
                limit: 15
            },
            columns: [
                { name: 'Company Name', width: '120px' },
                { name: 'Name', width: '150px' },
                { name: 'Transaction Type', width: '100px' },
                //{ name: 'Payment Type', width: '120px' },
                { name: '500', width: '45px' },
                { name: '200', width: '45px' },
                { name: '100', width: '45px' },
                { name: '50', width: '45px' },
                { name: '20', width: '45px' },
                { name: '10', width: '45px' },
                { name: '5', width: '45px' },
                { name: '2', width: '45px' },
                { name: '1', width: '45px' },
                { name: 'Others', width: '70px' },
                { name: 'Remarks', width: '100px' },
                { name: 'Cash', width: '100px' },
                { name: 'DP', width: '100px' },
                { name: 'Total', width: '80px' },
                { name: 'Actions', width: '80px' ,formatter: (cell) => cell }
            ],
            data: formattedData
        }).render(document.getElementById("wrapper"));
    }
    
    console.log(tallyAmount);
    document.getElementById('tallyAmount').innerHTML = tallyAmount;
}


function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Calculate total
function calculateTotal() {
    var fiveHundred = parseFloat(document.getElementById('fiveHundred').value) || 0;
    var twoHundred = parseFloat(document.getElementById('twoHundred').value) || 0;
    var oneHundred = parseFloat(document.getElementById('oneHundred').value) || 0;
    var fifty = parseFloat(document.getElementById('fifty').value) || 0;
    var twenty = parseFloat(document.getElementById('twenty').value) || 0;
    var ten = parseFloat(document.getElementById('ten').value) || 0;
    var five= parseFloat(document.getElementById('five').value) || 0;
    var two= parseFloat(document.getElementById('two').value) || 0;
    var one= parseFloat(document.getElementById('one').value) || 0;
    var others = parseFloat(document.getElementById('others').value) || 0;
    var dp = parseFloat(document.getElementById('dp').value) || 0;

    var cashtotal = (500 * fiveHundred) + (200 * twoHundred) + (100 * oneHundred) + (50 * fifty) + (20 * twenty) + (10 * ten)+ (5 * five)+ (2 * two) + (1 * one)+ others;
    document.getElementById('cash').value = cashtotal;
    document.getElementById('total').value = cashtotal+dp;
}

// Submit form data
async function submitForm() {
    var date = document.getElementById('selectedDate').value;
    let dateParts = date.split('-');
    let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    var postData = {
        companyName:document.getElementById('firstDropdown').value,
        name:document.getElementById('secondDropdown').value,
        transactionType: document.getElementById('transactionType').value,
        //paymentType: document.getElementById('paymentType').value,
        fiveHundred: parseFloat(document.getElementById('fiveHundred').value) || 0,
        twoHundred: parseFloat(document.getElementById('twoHundred').value) || 0,
        oneHundred: parseFloat(document.getElementById('oneHundred').value) || 0,
        fifty: parseFloat(document.getElementById('fifty').value) || 0,
        twenty: parseFloat(document.getElementById('twenty').value) || 0,
        ten: parseFloat(document.getElementById('ten').value) || 0,
        five: parseFloat(document.getElementById('five').value) || 0,
        two: parseFloat(document.getElementById('two').value) || 0,
        one: parseFloat(document.getElementById('one').value) || 0,
        others: parseFloat(document.getElementById('others').value) || 0,
        remarks: document.getElementById('remarks').value,
        cash: parseFloat(document.getElementById('cash').value) || 0,
        dp: parseFloat(document.getElementById('dp').value) || 0,
        total: parseFloat(document.getElementById('total').value) || 0,
        tableName:formattedDate,
    };
    
    fetch(DomainUrl + "?action=create", {
        method: 'POST',
        redirect: 'follow',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
    body: JSON.stringify(postData)
    })
    .then(data => {
        console.log(data);
        fetchData(document.getElementById('selectedDate').value);
        modal.style.display = "none";
        document.getElementById('cashForm').reset();
        document.getElementById('total').value = '';
        console.log('POST request data:', data);
    })
    .catch(error => {
    console.error('Error with POST request:', error);
    });

}

// Edit row data
function editRow(index) {
    // Fetch data from the server again to get the most recent state
    //google.script.run.withSuccessHandler(function(data) {
        var rowData = tableData[index];
        document.getElementById('firstDropdown').value = rowData.companyName;
        if (rowData.companyName) {
            dropDownValues[rowData.companyName].forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.text = name;
                secondDropdown.appendChild(option);
            });
        }
        document.getElementById('secondDropdown').value = rowData.name;
        document.getElementById('transactionType').value = rowData.transactionType;
        //document.getElementById('paymentType').value = rowData.paymentType;
        document.getElementById('fiveHundred').value = rowData.fiveHundred;
        document.getElementById('twoHundred').value = rowData.twoHundred;
        document.getElementById('oneHundred').value = rowData.oneHundred;
        document.getElementById('fifty').value = rowData.fifty;
        document.getElementById('twenty').value = rowData.twenty;
        document.getElementById('ten').value = rowData.ten;
        document.getElementById('five').value = rowData.five;
        document.getElementById('two').value = rowData.two;
        document.getElementById('one').value = rowData.one;
        document.getElementById('others').value = rowData.others;
        document.getElementById('total').value = rowData.total;
        document.getElementById('cash').value = rowData.cash;
        document.getElementById('dp').value = rowData.dp;
        document.getElementById('remarks').value = rowData.remarks;
        

        // Show modal with the filled data
        modal.style.display = "block";

        // On submit, update the data
        document.querySelector('#SubmitButton').onclick = function() {
            var date = document.getElementById('selectedDate').value;
            let dateParts = date.split('-');
            let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

            var updatedData = {
                rowIndex:index+1,
                companyName:document.getElementById('firstDropdown').value,
                name:document.getElementById('secondDropdown').value,
                transactionType: document.getElementById('transactionType').value,
                //paymentType: document.getElementById('paymentType').value,
                fiveHundred: parseFloat(document.getElementById('fiveHundred').value) || 0,
                twoHundred: parseFloat(document.getElementById('twoHundred').value) || 0,
                oneHundred: parseFloat(document.getElementById('oneHundred').value) || 0,
                fifty: parseFloat(document.getElementById('fifty').value) || 0,
                twenty: parseFloat(document.getElementById('twenty').value) || 0,
                ten: parseFloat(document.getElementById('ten').value) || 0,
                five: parseFloat(document.getElementById('five').value) || 0,
                two: parseFloat(document.getElementById('two').value) || 0,
                one: parseFloat(document.getElementById('one').value) || 0,
                others: parseFloat(document.getElementById('others').value) || 0,
                remarks: document.getElementById('remarks').value,
                cash: parseFloat(document.getElementById('cash').value) || 0,
                dp: parseFloat(document.getElementById('dp').value) || 0,
                total: parseFloat(document.getElementById('total').value) || 0,
                tableName:formattedDate,
            }; 

            fetch(DomainUrl + "?action=update", {
                method: 'POST',
                redirect: 'follow',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
                })
                .then(data => {
                    console.log(data);
                    modal.style.display = "none";
                    document.getElementById('cashForm').reset();
                    document.getElementById('total').value = '';
                    fetchData(document.getElementById('selectedDate').value);
                    modal.style.display = "none";
                    console.log('POST request data:', data);
                })
                .catch(error => {
                console.error('Error with POST request:', error);
                });
            };
    //}).getData();
}

// Delete row data
function deleteRow(index) {
    if (confirm('Are you sure you want to delete this record?')) {
        var date = document.getElementById('selectedDate').value;
        let dateParts = date.split('-');
        let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        fetch(DomainUrl + "?action=delete", {
            method: 'POST',
            redirect: 'follow',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rowIndex: index+1 ,tableName: formattedDate,})
        })
        .then(response => {
            console.log('Response from POST request:', response);
            modal.style.display = "none";
            document.getElementById('cashForm').reset();
            document.getElementById('total').value = '';
            fetchData(document.getElementById('selectedDate').value);
        })
        .catch(error => {
            console.error('Error with POST request:', error);
        });
    }
}

function populateFirstDropdown() {
    const firstDropdown = document.getElementById('firstDropdown');
    for (const companyName in dropDownValues) {
        const option = document.createElement('option');
        option.value = companyName;
        option.text = companyName;
        firstDropdown.appendChild(option);
    }
}

function updateSecondDropdown() {
    const firstDropdown = document.getElementById('firstDropdown');
    const secondDropdown = document.getElementById('secondDropdown');
    const selectedValue = firstDropdown.value;

    // Clear the second dropdown
    secondDropdown.innerHTML = '';

    // Populate the second dropdown
    if (selectedValue) {
        dropDownValues[selectedValue].forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.text = name;
            secondDropdown.appendChild(option);
        });
    }
}
