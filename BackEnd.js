var DomainUrl = "https://script.google.com/macros/s/AKfycbwX7BzbMp2H9TghzaoXQRsk8KCXsHVZjWfu3R1NYyYs414tnVpgGl7iCIRh6H0rtmla7w/exec";
var tableData;
var dropDownValues;
var modal;
let gridInstance;
let currentArea = null;
let currentOperation = null;
var userData;
var isEditOpen = false;
var popuptoOpen='';

document.addEventListener('DOMContentLoaded', function() {
    toggleBlur();
    setDefaultDate();
    AssigneValues();
    fetchData(document.getElementById('selectedDate').value);
    fetchPreviousDayData(document.getElementById('selectedDate').value);
    fetchDropDownData();
    fetchCreditData();
    toggleBlur();
    decodeAndExecute(encodedFunction);
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
        fetchPreviousDayData(document.getElementById('selectedDate').value);
        
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
    document.getElementById('firstDropdown').disabled = false;
    populateFirstDropdown();
    document.getElementById('SubmitButton').style.display="block";
    document.getElementById('editSubmitButton').style.display="none";
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
        isEditOpen=false;
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            isEditOpen = false;
        }
    }

}
// Fetch data from the server
async function fetchData(date) {
    //google.script.run.withSuccessHandler(renderTable).getData();
    let dateParts = date.split('-');
    toggleBlur();

    // Rearrange the parts to the desired format (dd-mm-yyyy)
    let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    const url = DomainUrl+"?action=getTable("+formattedDate+")"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);
        renderTable(data);
        toggleBlur();
        // Handle the data from the GET request
    })
    .catch(error => {
        console.error('Error with GET request:', error);
    });
}

// Fetch data from the server
async function fetchPreviousDayData(date) {
    //google.script.run.withSuccessHandler(renderTable).getData();
    let selectedDate = new Date(date);
    let previousDate = new Date(date);
    previousDate.setDate(selectedDate.getDate() - 1);

    //let dateParts = date.split('-');
    // Rearrange the parts to the desired format (dd-mm-yyyy)
    let formattedDate = formatDate(previousDate);

    const url = DomainUrl+"?action=getTable("+formattedDate+")"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);

        let total = {
            fiveHundred: 0,
            twoHundred: 0,
            oneHundred: 0,
            fifty: 0,
            twenty:0,
            ten: 0,
            five: 0,
            two: 0,
            one: 0,
        };

        data.forEach(transaction => {
            const multiplier = transaction.transactionType === "Debit" ? -1 : 1;
          
            total.fiveHundred += transaction.fiveHundred * multiplier;
            total.twoHundred += transaction.twoHundred * multiplier;
            total.oneHundred += transaction.oneHundred * multiplier;
            total.fifty += transaction.fifty * multiplier;
            total.twenty += transaction.twenty * multiplier;
            total.ten += transaction.ten * multiplier;
            total.five += transaction.five * multiplier;
            total.two += transaction.two * multiplier;
            total.one += transaction.one * multiplier;
          });
          
          const dataRow = document.getElementById("previousdataRow");
          


          dataRow.innerHTML="";
          dataRow.innerHTML += '<tr><th class="DenominationSizeID">Opening Balance</th></tr>'
          Object.keys(total).forEach(key => {
              const cell = document.createElement("td");
              cell.textContent = total[key];
              if (total[key] >= 0) {
                  cell.classList.add('currency-positive-open');
              } else {
                  cell.classList.add('currency-negative-open');
              }
              dataRow.appendChild(cell);
          });
          const netAvailable = (total.fiveHundred * 500) +
                                (total.twoHundred * 200) +
                                (total.oneHundred * 100) +
                                (total.fifty * 50) +
                                (total.twenty * 20) +
                                (total.ten * 10) +
                                (total.five * 5) +
                                (total.two * 2) +
                                (total.one * 1);

        const cell = document.createElement("td");
        cell.textContent = netAvailable; 
        if (netAvailable >= 0) {
            cell.classList.add('currency-positive-openTotal');
        } else {
            cell.classList.add('currency-negative-openTotal');
        }

        cell.classList.add("NetAvailableSizeID");
        dataRow.appendChild(cell);                   
    })
    .catch(error => {
        console.error('Error with GET request:', error);
    });
}

function formatDate(date) {
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    let year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

async function fetchDropDownData() {
    //google.script.run.withSuccessHandler(renderTable).getData();
    const url = DomainUrl+"?action=getDropDown"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);
        dropDownValues= JSON.parse(JSON.parse(data));
        populateFirstDropdown();
        loadAreas();
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

    let total = {
        fiveHundred: 0,
        twoHundred: 0,
        oneHundred: 0,
        fifty: 0,
        twenty:0,
        ten: 0,
        five: 0,
        two: 0,
        one: 0,
      };
      
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

    data.forEach(transaction => {
        const multiplier = transaction.transactionType === "Debit" ? -1 : 1;
      
        total.fiveHundred += transaction.fiveHundred * multiplier;
        total.twoHundred += transaction.twoHundred * multiplier;
        total.oneHundred += transaction.oneHundred * multiplier;
        total.fifty += transaction.fifty * multiplier;
        total.twenty += transaction.twenty * multiplier;
        total.ten += transaction.ten * multiplier;
        total.five += transaction.five * multiplier;
        total.two += transaction.two * multiplier;
        total.one += transaction.one * multiplier;
        //total.dp += transaction.dp * multiplier;
        //total.others += transaction.others * multiplier;
      });
      
      const dataRow = document.getElementById("dataRow");
      
      dataRow.innerHTML="";
      dataRow.innerHTML += '<tr><th rowspan="2">Net Available</th></tr>'
      Object.keys(total).forEach(key => {
          const cell = document.createElement("td");
          cell.textContent = total[key];
          cell.style.width='100px';
          if (total[key] >= 0) {
              //cell.classList.add('currency-positive');
          } else {
              //cell.classList.add('currency-negative');
          }
          dataRow.appendChild(cell);
      });

      const netAvailableCell = document.createElement("td");
      const netAvailable = (total.fiveHundred * 500) +
                            (total.twoHundred * 200) +
                            (total.oneHundred * 100) +
                            (total.fifty * 50) +
                            (total.twenty * 20) +
                            (total.ten * 10) +
                            (total.five * 5) +
                            (total.two * 2) +
                            (total.one * 1);
      netAvailableCell.textContent = netAvailable;
      if (netAvailable >= 0) {
          netAvailableCell.classList.add('currency-positive');
      } else {
          netAvailableCell.classList.add('currency-negative');
          console.log("negative");
      }
      dataRow.appendChild(netAvailableCell);
       
    if (gridInstance) {
        gridInstance.updateConfig({
            data: formattedData
        }).forceRender();
    } else {
        gridInstance = new gridjs.Grid({
            pagination: {
                limit: 15
            },
            sort: true,
            columns: [
                { name: 'Company Name', width: '120px' },
                { name: 'Name', width: '150px' },
                { name: 'Transaction Type', width: '100px', 
                    formatter: (cell) => {
                        const color = cell.toLowerCase() === 'credit' ? 'green' : (cell.toLowerCase() === 'debit' ? 'red' : 'transparent');
                        return gridjs.html(`<span style="background-color: ${color}; color: white; padding: 5px; border-radius: 3px;">${cell}</span>`);
                      }
                },
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
    //document.getElementById('tallyAmount').innerHTML = tallyAmount;
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
    toggleBlur();
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
        modal.style.display = "none";
        document.getElementById('cashForm').reset();
        document.getElementById('total').value = '';
        toggleBlur();
        fetchData(document.getElementById('selectedDate').value);
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
        isEditOpen = true; 
        document.getElementById('SubmitButton').style.display="none";
        document.getElementById('editSubmitButton').style.display="block";
        if(rowData.transactionType == "Debit")
        {
            document.getElementById('firstDropdown').disabled = true;
            document.getElementById('firstDropdown').innerHTML="";
            var dropdown= document.getElementById('firstDropdown');
            dropdown.innerHTML = '<option value="Cash">Cash</option>';
            dropdown.value = "Cash";
            dropdown.disabled = true;
        
            let users = userData ? userData.split(',') : [];
            
            secondDropdown.innerHTML="";
            users.forEach(function(name) {
                const option = document.createElement('option');
                option.value = name;
                option.text = name;
                secondDropdown.appendChild(option);
            });
        }
        else
        {
            document.getElementById('firstDropdown').disabled = false;
            //document.getElementById('firstDropdown').innerHTML="";
            populateFirstDropdown();
            document.getElementById('firstDropdown').value = rowData.companyName;
            if (rowData.companyName) {
                if(dropDownValues[rowData.companyName])
                {
                    dropDownValues[rowData.companyName].forEach(name => {
                        const option = document.createElement('option');
                        option.value = name;
                        option.text = name;
                        secondDropdown.appendChild(option);
                    });
                }
               
            }
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
        document.querySelector('#editSubmitButton').onclick = function() {

            toggleBlur();
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
                    isEditOpen = false;
                    console.log(data);
                    modal.style.display = "none";
                    document.getElementById('cashForm').reset();
                    document.getElementById('total').value = '';
                    toggleBlur();
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
        toggleBlur();
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
            toggleBlur();
            fetchData(document.getElementById('selectedDate').value);
        })
        .catch(error => {
            console.error('Error with POST request:', error);
        });
    }
}

function populateFirstDropdown() {
    const firstDropdown = document.getElementById('firstDropdown');
    firstDropdown.innerHTML="";
    document.getElementById('secondDropdown').innerHTML="";
    var defaultoption = document.createElement('option');

    // Set attributes for the option
    defaultoption.disabled = true;
    defaultoption.selected = true;
    defaultoption.value = "";
    defaultoption.textContent = "--Select a Company--";
    firstDropdown.appendChild(defaultoption);
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

function Export() {
    // Sample input data
    const inputData =tableData;

    // Function to merge data
    const mergeData = (data) => {
        const mergedData = {};
        data.forEach(item => {
            const key = `${item.name}-${item.companyName}-${item.transactionType}`;
            if (!mergedData[key]) {
                mergedData[key] = { ...item };
            } else {
                Object.keys(item).forEach(k => {
                    if (typeof item[k] === 'number') {
                        mergedData[key][k] += item[k];
                    }
                });
            }
        });
        return Object.values(mergedData);
    };

    // Merge the data
    const mergedData = mergeData(inputData);

    // Remove the rowIndex field and modify labels
    const processedData = mergedData.map(item => {
        const { rowIndex, ...rest } = item;
        return rest;
    });

    // Change labels
    const changeLabels = (data) => {
        const newData = data.map(item => {
            return {
                'Company Name': item.companyName,
                'Name': item.name,
                'Transaction Type': item.transactionType,
                'Cash': item.cash,
                'DP': item.dp,
                'Total': item.total, 
            };
        });
        return newData;
    };

    const finalData = changeLabels(processedData);

    // Function to export to Excel
    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        
        // Create a binary string to download
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });

        // Function to convert a binary string to an array buffer
        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        // Create a Blob from the array buffer
        const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });

        // Create a download link and trigger the download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        var date = document.getElementById('selectedDate').value;
        let dateParts = date.split('-');
        let formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        link.download = formattedDate+'.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export processed and labeled data to Excel
    exportToExcel(finalData);
}


function loadAreas() {
    const areaSelector = document.getElementById('areaSelector');
    areaSelector.innerHTML = '<option value="" disabled selected>Select an company</option>';
    for (const company in dropDownValues) {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        areaSelector.appendChild(option);
    }
}

function showSelectedArea() {
    const areaSelector = document.getElementById('areaSelector');
    const selectedArea = areaSelector.value;
    const tableBody = document.getElementById('areaTable').getElementsByTagName('tbody')[0];

    if(selectedArea!= "")
    {
        tableBody.innerHTML = '';
        currentArea = selectedArea;

        dropDownValues[selectedArea].forEach(name => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = name;
            const actionsCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'button edit';
            editButton.onclick = () => openPopup('editName', name);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'button delete';
            deleteButton.onclick = () => {
                dropDownValues[selectedArea] = dropDownValues[selectedArea].filter(n => n !== name);
                showSelectedArea();
            };

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);

            row.appendChild(nameCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });

        document.querySelector('.button.add-name').style.display = 'block';
    }
}

function deleteArea() {
    if (currentArea) {
        delete dropDownValues[currentArea];
        loadAreas();
        document.getElementById('areaTable').getElementsByTagName('tbody')[0].innerHTML = '';
        document.querySelector('.button.add-name').style.display = 'none';
        currentArea = null;
    } else {
        alert('Please select an company to delete.');
    }
}

function openPopup(operation, target) {
    currentOperation = operation;
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popupTitle');
    const popupInput = document.getElementById('popupInput');

    if (operation === 'addArea') {
        popupTitle.textContent = 'Add company';
        popupInput.placeholder = 'Enter company name';
    } else if (operation === 'addName') {
        popupTitle.textContent = 'Add Name';
        popupInput.placeholder = 'Enter name';
    } else if (operation === 'editName') {
        popupTitle.textContent = 'Edit Name';
        popupInput.value = target;
    }

    popup.style.display = 'flex';
}

function closePopup() {
    const popup = document.getElementById('popup');
    const popupInput = document.getElementById('popupInput');
    const passwordpopup = document.getElementById('popup'); 
    passwordpopup.style.display= 'none';
    var paswordinput=document.getElementById('passwordInput');
    paswordinput.value = '';
    popupInput.value = '';
    popup.style.display = 'none';
}
function closePopupByID(popupId) {
    document.getElementById(popupId).style.display = 'none';
    //document.getElementById('overlay').style.display = 'none';
}
function savePopupData() {
    const popupInput = document.getElementById('popupInput').value.trim();

    if (popupInput === "") return;

    if (currentOperation === 'addArea') {
        if (!dropDownValues[popupInput]) {
            dropDownValues[popupInput] = [];
            const areaSelector = document.getElementById('areaSelector');
            const option = document.createElement('option');
            option.value = popupInput;
            option.textContent = popupInput;
            areaSelector.appendChild(option);
        }
    } else if (currentOperation === 'addName') {
        if (!dropDownValues[currentArea].includes(popupInput)) {
            dropDownValues[currentArea].push(popupInput);
        } else {
            alert("Name already exists in this company.");
            return;
        }
    } else if (currentOperation === 'editName') {
        const index = dropDownValues[currentArea].indexOf(currentOperation);
        if (index > -1) {
            dropDownValues[currentArea][index] = popupInput;
        }
    }

    showSelectedArea();
    closePopup();
}

function verifyPassword() {

    const enteredPassword = document.getElementById('passwordInput').value;
    if (enteredPassword === getPassFromVm()) {
        closePopupByID('passwordPopup');

        if(popuptoOpen =='debit')
        {
            openUserManagementPopup();
        }
        else if(popuptoOpen =='company')
        {
            openMainPopup();
        }
        
    } else {
        alert('Incorrect password');
    }
}

function saveData() {
    console.log(JSON.stringify(dropDownValues, null, 2));
    UpdateDBCompanyData(JSON.stringify(dropDownValues, null, 2))
    document.getElementById('mainPopup').style.display = 'none';
}

function openMainPopup() {
    document.getElementById('mainPopup').style.display = 'flex';
}

function closeMainPopup() {
    document.getElementById('mainPopup').style.display = 'none';
}

function UpdateDBCompanyData(json) {

    fetch(DomainUrl + "?action=updateDropDown", {
        method: 'POST',
        redirect: 'follow',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })
    .then(response => {
        console.log('Response from POST request:', response);
        fetchDropDownData();
    })
    .catch(error => {
        console.error('Error with POST request:', error);
    });
}

function addUser() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();

    if (username) {
        let users = userData ? userData.split(',') : [];

        if (!users.includes(username)) {
            users.push(username);
            userData = users.join(',');
            updateUserList();
            usernameInput.value = '';
        } else {
            alert('User name already exists');
        }
    } else {
        alert('Please enter a user name');
    }
}

function deleteUser(index) {
    let users = userData.split(',');
    users.splice(index, 1);
    userData = users.join(',');
    updateUserList();
}

function updateUserList() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    let users = userData.split(',');
    users.forEach((user, index) => {
        if (user) {
            const li = document.createElement('li');
            li.textContent = user;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteUser(index);
            li.appendChild(deleteButton);
            userList.appendChild(li);
        }
    });
}
function saveUsers() {
    console.log(JSON.stringify(userData, null, 2));
    closeUserManagementPopup();
    UpdateCreditUsersData(userData);
}

function openPasswordPopup(args) {
    popuptoOpen=args;
    document.getElementById('passwordInput').value = '';
    document.getElementById('passwordPopup').style.display = 'block';
}

function openUserManagementPopup() {
    document.getElementById('userManagementPopup').style.display = 'flex';
}

function closeUserManagementPopup() {
    document.getElementById('userManagementPopup').style.display = 'none';
}

function UpdateCreditUsersData(json) {

    fetch(DomainUrl + "?action=updateCreditUsers", {
        method: 'POST',
        redirect: 'follow',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(json)
    })
    .then(response => {
        console.log('Response from POST request:', response);
        fetchCreditData();
    })
    .catch(error => {
        console.error('Error with POST request:', error);
    });
}

async function fetchCreditData() {
    //google.script.run.withSuccessHandler(renderTable).getData();
    const url = DomainUrl+"?action=getCreditUsers"; // Replace with your actual web app URL

    fetch(url)
    .then(response => response.json())
    .then(data => {
        console.log('GET request data:', data);
        userData = data;
        updateUserList();
    })
    .catch(error => {
        console.error('Error with GET request:', error);
    });
}

function updateCreditDropdown()
{
    var selectedValue = document.getElementById('transactionType').value

    if(selectedValue == "Debit")
    {
        //document.getElementById('firstDropdown').disabled = true;
        document.getElementById('firstDropdown').innerHTML="";
        var dropdown= document.getElementById('firstDropdown');
        dropdown.innerHTML = '<option value="Cash">Cash</option>';
        dropdown.value = "Cash";
        dropdown.disabled = true;
        let users = userData ? userData.split(',') : [];
        
        secondDropdown.innerHTML="";
        users.forEach(function(name) {
            const option = document.createElement('option');
            option.value = name;
            option.text = name;
            secondDropdown.appendChild(option);
        });
    }
    else
    {
        document.getElementById('firstDropdown').disabled = false;
        populateFirstDropdown();
    }
}

function toggleBlur() {
    var spinnerOverlay = document.getElementById('spinnerOverlay');
    var mainContent = document.getElementById('mainContent');
    if (spinnerOverlay.style.display === 'none' || spinnerOverlay.style.display === '') {
        spinnerOverlay.style.display = 'flex';
        mainContent.classList.add('blurred');
    } else {
        spinnerOverlay.style.display = 'none';
        mainContent.classList.remove('blurred');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.altKey && event.key === 'Enter') {
        event.preventDefault(); // Prevent the default browser save action
        //triggerMethod(); // Call your custom method
        var model = document.querySelector('modal')
        if(modal.style.display=="block")
        {
            var submit = document.querySelector("#SubmitButton");
            var editSubmit =document.querySelector("#editSubmitButton");
            if(submit != null && submit.style.display=="block")
            {
                document.querySelector('#SubmitButton').click();
            }
            else if(editSubmit!= null &&editSubmit.style.display=="block")
            {
                document.querySelector('#editSubmitButton').click();
            }
        }
        
    }
});


const encodedFunction = 'ZnVuY3Rpb24gZ2V0UGFzc0Zyb21WbSgpe2xldCB0PW5ldyBEYXRlLGU9dC5nZXRGdWxsWWVhcigpLG49KHQuZ2V0TW9udGgoKSsxKS50b1N0cmluZygpLnBhZFN0YXJ0KDIsIjAiKSxhPXQuZ2V0RGF0ZSgpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwiMCIpLHI9dC5nZXRIb3VycygpLnRvU3RyaW5nKCkucGFkU3RhcnQoMiwiMCIpLGc9dC5nZXRNaW51dGVzKCkudG9TdHJpbmcoKS5wYWRTdGFydCgyLCIwIik7cmV0dXJuYCR7ZX0ke259JHthfWB9Owo=';

function decodeAndExecute(encoded) {
    const decoded = atob(encoded);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = decoded;
    document.body.appendChild(script);
}