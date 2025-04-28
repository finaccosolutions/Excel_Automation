import { Message } from '../types';

// Mock data - In a real app, this would be handled by API calls to a backend service
// that would use a language model to generate the code

const VBA_TEMPLATES = {
  sort: {
    code: `Sub SortData()
    ' Sort data in a column
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Define the range to sort
    Dim sortRange As Range
    Set sortRange = ws.Range("A1:A" & ws.Cells(ws.Rows.Count, "A").End(xlUp).Row)
    
    ' Sort the range
    sortRange.Sort Key1:=sortRange, Order1:=xlAscending, Header:=xlYes
    
    MsgBox "Data has been sorted successfully!", vbInformation
End Sub`,
    response: "I've created a macro that will sort data in column A. The macro assumes your data has a header row. To use this macro, simply run it and it will sort the data in ascending order. You can modify the code to sort by different columns or in descending order if needed."
  },
  average: {
    code: `Function CalculateAverage() As Double
    ' Function to calculate average of cells B2:B10
    Dim rng As Range
    Set rng = Range("B2:B10")
    
    ' Calculate average
    CalculateAverage = Application.WorksheetFunction.Average(rng)
End Function

Sub ShowAverageResult()
    ' Show the result in a message box
    Dim avg As Double
    avg = CalculateAverage()
    
    MsgBox "The average of B2:B10 is: " & avg, vbInformation, "Average Result"
End Sub`,
    response: "I've created a VBA function that calculates the average of cells B2:B10. The function returns the average as a Double value. I've also included a subroutine that shows the result in a message box. You can call the function directly in a cell formula or run the ShowAverageResult subroutine to see the result."
  },
  userform: {
    code: `' UserForm code
' 1. Insert a UserForm from the Developer tab
' 2. Name it frmCustomerData
' 3. Add the following controls:
'    - 3 Labels: lblName, lblEmail, lblPhone
'    - 3 TextBoxes: txtName, txtEmail, txtPhone
'    - 2 CommandButtons: cmdSave, cmdCancel

' Code for the UserForm
Private Sub UserForm_Initialize()
    ' Set up the form
    Me.Caption = "Customer Data Form"
    
    ' Labels
    lblName.Caption = "Customer Name:"
    lblEmail.Caption = "Email Address:"
    lblPhone.Caption = "Phone Number:"
    
    ' Buttons
    cmdSave.Caption = "Save"
    cmdCancel.Caption = "Cancel"
End Sub

Private Sub cmdSave_Click()
    ' Validate input
    If txtName.Text = "" Then
        MsgBox "Please enter a customer name.", vbExclamation
        txtName.SetFocus
        Exit Sub
    End If
    
    ' Get the next empty row
    Dim ws As Worksheet
    Dim nextRow As Long
    
    Set ws = ThisWorkbook.Sheets("CustomerData")
    nextRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
    
    ' Save data to worksheet
    ws.Cells(nextRow, "A").Value = txtName.Text
    ws.Cells(nextRow, "B").Value = txtEmail.Text
    ws.Cells(nextRow, "C").Value = txtPhone.Text
    
    MsgBox "Customer data saved successfully!", vbInformation
    
    ' Clear fields for next entry
    txtName.Text = ""
    txtEmail.Text = ""
    txtPhone.Text = ""
    txtName.SetFocus
End Sub

Private Sub cmdCancel_Click()
    Unload Me
End Sub

' Module code to show the form
Sub ShowCustomerForm()
    ' Check if CustomerData sheet exists
    Dim ws As Worksheet
    Dim sheetExists As Boolean
    
    sheetExists = False
    For Each ws In ThisWorkbook.Sheets
        If ws.Name = "CustomerData" Then
            sheetExists = True
            Exit For
        End If
    Next ws
    
    ' Create sheet if it doesn't exist
    If Not sheetExists Then
        ThisWorkbook.Sheets.Add.Name = "CustomerData"
        With ThisWorkbook.Sheets("CustomerData")
            .Cells(1, "A").Value = "Name"
            .Cells(1, "B").Value = "Email"
            .Cells(1, "C").Value = "Phone"
            .Range("A1:C1").Font.Bold = True
        End With
    End If
    
    ' Show the form
    frmCustomerData.Show
End Sub`,
    response: "I've created a complete VBA solution for a customer data entry form. This includes a UserForm with fields for name, email, and phone number, plus save and cancel buttons. The code validates that the name is provided, creates a 'CustomerData' worksheet if it doesn't exist, and saves the information to the next available row. To implement this, you'll need to create a UserForm and add the controls as described in the comments, then paste this code."
  }
};

export const generateVbaCode = async (
  userInput: string,
  previousMessages: Message[]
): Promise<{ vbaCode: string; response: string }> => {
  // In a real app, this would make an API call to a backend service
  // For this demo, we'll use mock templates based on keywords
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const input = userInput.toLowerCase();
  
  if (input.includes('sort') || input.includes('order')) {
    return VBA_TEMPLATES.sort;
  } else if (input.includes('average') || input.includes('mean') || input.includes('calculate')) {
    return VBA_TEMPLATES.average;
  } else if (input.includes('form') || input.includes('input') || input.includes('customer')) {
    return VBA_TEMPLATES.userform;
  } else {
    // Default response for unrecognized requests
    return {
      vbaCode: `Sub HelloWorld()
    MsgBox "Hello, World!", vbInformation, "Excel VBA"
End Sub`,
      response: "I've created a simple 'Hello World' VBA macro as a starting point. Could you provide more details about what specific Excel task you need help with? For example, do you need data manipulation, forms, automation of specific tasks, etc.?"
    };
  }
};