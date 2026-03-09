function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action || 'save';
  
  // 1. SAVE LINK -> 'link-generator'
  if (action === 'save') {
    var sheet = ss.getSheetByName("link-generator");
    if (!sheet) sheet = ss.insertSheet("link-generator"); // Auto-create
    
    sheet.appendRow([new Date(), data.name, data.link]);
    // Align Left
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setHorizontalAlignment("left");
    return ContentService.createTextOutput("Saved Link");
  } 
  
  // 2. DELETE LINK -> 'link-generator'
  else if (action === 'delete') {
    var sheet = ss.getSheetByName("link-generator");
    if (!sheet) return ContentService.createTextOutput("Sheet Not Found");
    
    var rows = sheet.getDataRange().getValues();
    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i][1] == data.name && rows[i][2] == data.link) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput("Deleted Link");
      }
    }
  }
  // 3. SAVE RSVP -> 'RSVP'
  else if (action === 'rsvp') {
    var sheet = ss.getSheetByName("RSVP");
    if (!sheet) sheet = ss.insertSheet("RSVP"); // Auto-create
    
    var values = sheet.getDataRange().getValues();
    var rowIndex = -1;
    
    // Search for existing name (Column B / Index 1)
    for (var i = 1; i < values.length; i++) {
       if (values[i][1] == data.name) {
         rowIndex = i + 1;
         break;
       }
    }
    var rowData = [new Date(), data.name, data.attendance, data.event, data.persons];
    if (rowIndex > 0) {
      // Update existing row
      var range = sheet.getRange(rowIndex, 1, 1, 5);
      range.setValues([rowData]);
      range.setHorizontalAlignment("left");
    } else {
      // Append new row
      sheet.appendRow(rowData);
      sheet.getRange(sheet.getLastRow(), 1, 1, 5).setHorizontalAlignment("left");
    }
    
    return ContentService.createTextOutput("Saved RSVP");
  }

  // 4. SAVE WISH -> 'wish'
  else if (action === 'wish') {
    var sheet = ss.getSheetByName("wish");
    if (!sheet) sheet = ss.insertSheet("wish"); // Auto-create
    
    var rowData = [new Date(), data.name, data.comment];
    sheet.appendRow(rowData);
    sheet.getRange(sheet.getLastRow(), 1, 1, 3).setHorizontalAlignment("left");
    
    return ContentService.createTextOutput("Saved Wish");
  }
  
  return ContentService.createTextOutput("Action Done");
}

function doGet(e) {
  var action = e.parameter.action;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'loadComment' || action === 'moreComment') {
    var sheet = ss.getSheetByName("wish");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({commentItems: [], nextComment: 0})).setMimeType(ContentService.MimeType.JSON);
    
    var data = sheet.getDataRange().getValues();
    var wishes = [];
    
    // Skip header row
    for (var i = 1; i < data.length; i++) {
        wishes.push({
          date: data[i][0],
          name: data[i][1],
          comment: data[i][2],
          attendance: data[i][3] || null
        });
    }
    
    // Sort by date descending
    wishes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    var start = e.parameter.start ? parseInt(e.parameter.start) : 0;
    var limit = e.parameter.limit ? parseInt(e.parameter.limit) : 5;
    
    var paginatedWishes = wishes.slice(start, start + limit);
    var nextStart = (start + limit < wishes.length) ? (start + limit) : 0;
    
    return ContentService.createTextOutput(JSON.stringify({
      commentItems: paginatedWishes,
      nextComment: nextStart
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput("Invalid Action");
}
