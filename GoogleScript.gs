var sheetName = 'Sheet1';  // Change this to your sheet name
var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);

function doGet(e) {
  var action = e.parameter.action;
  //action='getTable(21-06-2024)'
  if(action.includes('getTable'))
  {
    const startIndex = action.indexOf('getTable(') + 'getTable('.length;
    const endIndex = action.indexOf(')', startIndex);
    date = action.substring(startIndex, endIndex);
    var data = getData(date);
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  else if(action == "getDropDown")
  {
    var data = getDropDownDataAsJson();
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var operation = e.parameter.action;
  var requestData = JSON.parse(e.postData.contents);
  var responseData = {};

switch (operation) {
    case 'create':
      responseData = createData(requestData,requestData.tableName);
      break;
    case 'update':
      responseData = updateData(requestData.rowIndex, requestData,requestData.tableName);
      break;
    case 'delete':
      responseData = deleteData(requestData.rowIndex,requestData.tableName);
      break;
    default:
      responseData = { error: 'Invalid operation' };
  } 


  return ContentService.createTextOutput(JSON.stringify(responseData)).setMimeType(ContentService.MimeType.JSON);
}

function getDropDownDataAsJson() {
  // Open the spreadsheet and the specific sheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet2 = spreadsheet.getSheetByName('DropDownSheet');

  // Get all data in the sheet
  var data = sheet2.getDataRange().getValues();
  
  // Get headers (first row)
  var headers = data[0];
  
  // Create a JSON object
  var result = {};
  
  // Loop through the data rows
  for (var i = 1; i < data.length; i++) {
    for (var j = 0; j < headers.length; j++) {
      if (!result[headers[j]]) {
        result[headers[j]] = [];
      }
      if (data[i][j]) {
        result[headers[j]].push(data[i][j]);
      }
    }
  }
  
  // Convert result to JSON
  var jsonResult = JSON.stringify(result);
  
  // Return the JSON result
  return jsonResult;
}

function checkAndCreateSheet(sheetName) {
  // Get the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get all sheets in the spreadsheet
  var sheets = spreadsheet.getSheets();
  
  // Iterate through the sheets and check if the specified sheet name exists
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      Logger.log('Sheet "' + sheetName + '" already exists.');
      return true;
    }
  }
  
  // If the sheet doesn't exist, create it
  spreadsheet.insertSheet(sheetName);
  Logger.log('Sheet "' + sheetName + '" created.');
  return true;
}


function getData(date) {
  checkAndCreateSheet(date);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(date);
  var data = sheet.getDataRange().getValues();

  if (data.length === 0 || data[0].length === 1) {
    return [];
  }

  const transformedData = data.map((row, index) => {
    return {
      rowIndex: index + 1, // store the row index
      area:row[0],
      name:row[1],
      transactionType:row[2],
      paymentType:row[3],
      fiveHundred:row[4],
      twoHundred:row[5],
      oneHundred:row[6],
      fifty:row[7],
      twenty:row[8],
      ten:row[9],
      five:row[10],
      two:row[11],
      one:row[12],
      others:row[13],
      remarks:row[14],
      cash:row[15],
      dp:row[16],
      total:row[17]
    };
  });

  Logger.log(transformedData);
  return transformedData;
}

// Create operation: Add new data to the sheet
function createData(data,date) {
  //var sheet = getSheet();
  var sheetCreate = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(date);
  var newRow = [
    data.area,
    data.name,
    data.transactionType,
    data.paymentType,
    data.fiveHundred,
    data.twoHundred,
    data.oneHundred,
    data.fifty,
    data.twenty,
    data.ten,
    data.five,
    data.two,
    data.one,
    data.others,
    data.remarks,
    data.cash,
    data.dp,
    data.total
  ];
  sheetCreate.appendRow(newRow);
  return {
    status: 'success',
    message: 'Data added successfully',
    data: newRow
  };
}

// Update operation: Update existing data in the sheet
function updateData(rowIndex, newData,date) {
  var sheetUpdate = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(date);
  var range = sheetUpdate.getRange(rowIndex, 1, 1, sheetUpdate.getLastColumn());
  range.setValues([[
    newData.area,
    newData.name,
    newData.transactionType,
    newData.paymentType,
    newData.fiveHundred,
    newData.twoHundred,
    newData.oneHundred,
    newData.fifty,
    newData.twenty,
    newData.ten,
    newData.five,
    newData.two,
    newData.one,
    newData.others,
    newData.remarks,
    newData.cash,
    newData.dp,
    newData.total
  ]]);
  return {
    status: 'success',
    message: `Row ${rowIndex} updated successfully`,
    data: newData
  };
}

// Delete operation: Delete data from the sheet
function deleteData(rowIndex,date) {
  //var sheet = getSheet();
  var sheetDelete = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(date);
  sheetDelete.deleteRow(rowIndex);
  return {
    status: 'success',
    message: `Row ${rowIndex} deleted successfully`
  };
}

// function insertData(data) {
//   sheet.appendRow([
//     data.transactionDate,
//     data.transactionType,
//     data.paymentType,
//     data.fiveHundred,
//     data.twoHundred,
//     data.oneHundred,
//     data.fifty,
//     data.twenty,
//     data.ten,
//     data.others,
//     data.total,
//     data.personName
//   ]);
//   return getData();
// }

// function updateData(row, data) {
//   sheet.getRange(row + 1, 1, 1, sheet.getLastColumn()).setValues([[
//     data.transactionDate,
//     data.transactionType,
//     data.paymentType,
//     data.fiveHundred,
//     data.twoHundred,
//     data.oneHundred,
//     data.fifty,
//     data.twenty,
//     data.ten,
//     data.others,
//     data.total,
//     data.personName
//   ]]);
//   return getData();
// }

// function deleteData(row) {
//   sheet.deleteRow(row + 1);
//   return getData();
// }
