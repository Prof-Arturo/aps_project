var SHEET_NAME = "Sheet1"; // Change if your tab is named differently

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName(SHEET_NAME);

    // 1. Get all headers from the first row of the Sheet
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    // 2. Map the form data to the headers automatically
    var newRow = headers.map(function(header) {
      // Special Handling for System Fields
      if (header === 'timestamp') return new Date();
      if (header === 'log_id') return 'CASE-' + Math.floor(10000 + Math.random() * 90000); 
      
      // Default Status for new entries
      if (header === 'engagement_status') return 'PENDING';
      
      // For everything else, look for a matching name in the HTML form
      // If the form didn't send it, leave the cell blank
      return e.parameter[header] || '';
    });

    // 3. Save the new row
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  finally {
    lock.releaseLock();
  }
}