
let serverUrl = 'http://localhost:3000';
async function fetchData(query = '', status = '') {
  const response = await fetch(`${serverUrl}/api/data?q=${query}&status=${status}`);
  const data = await response.json();
  return data;
}

async function generateReport() {
try {
// Make a request to the backend endpoint that generates the report
const response = await fetch('http://localhost:3000/api/generate-report');

// Check if the response is OK
if (response.ok) {
  // Convert the response to a blob
  const blob = await response.blob();

  // Create a URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary link element
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'report.csv';

  // Append the link to the body and click it to start the download
  document.body.appendChild(a);
  a.click();

  // Clean up the URL object and remove the link element
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  console.log('Report downloaded successfully');
} else {
  throw new Error('Failed to generate report');
}
} catch (error) {
console.error('Error downloading the report:', error);
}
}
async function searchByAgreementNo() {
const searchInput = document.getElementById('search-input').value;
const activeTab = document.querySelector('.sidebar a.active');
const status = activeTab.textContent.trim();  // Get status based on active tab

const statusMapping = {
'Dashboard': '',
'Applied': 'Applied',
'Pending': 'Accepted',
'Done': 'Completed',
'Posted': 'Posted',
'Rejected': 'Rejected',
'ReApplied': 'Re-Applied',
'UserDetails': 'UserDetails',
'BranchDetails': 'BranchDetails',
};
const data = await fetchData(searchInput, statusMapping[status]);
populateTable(data, true, status === 'Applied', status === 'Pending', status === 'Done', status === 'Posted', status === 'Rejected', status === 'ReApplied',status === 'UserDetails',status === 'BranchDetails');  // Show table without action buttons
}

async function sendTabName() {
  const tabButton = document.getElementById('tab-button');
  const tabName = tabButton.getAttribute('data-tab');
  const response = await fetch('http://localhost:3000/api/tabname', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ tabName })
  });
  if (response.ok) {
    console.log(`Tab name ${tabName} sent to the server`);
  } else {
    console.error('Failed to send tab name');
  }
}

async function uploadFile() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file first.');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/api/upload-csv', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    console.log('File uploaded successfully.');
    openModal();
  } else {
    console.error('Failed to upload file.');
  }
}

function openModal() {
  const modal = document.getElementById('successModal');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('successModal');
  modal.style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('successModal');
  if (event.target === modal) {
    closeModal();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
// Load data for the Dashboard and show all buttons
await loadData('', document.querySelector('.sidebar a.active'));
});

async function downloadData() {
  const response = await fetch('http://localhost:3000/api/report');
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } else {
    console.error('Failed to download data');
  }
}

async function deleteAllRows() {
  const response = await fetch('http://localhost:3000/api/delete-completed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    console.log('All rows deleted successfully');
    // Optionally, you can refresh the data displayed on the page
    const data = await fetchData(); // Fetch updated data
    populateTable(data, false); // Populate table without action buttons
  } else {
    console.error('Failed to delete all rows');
  }
}


function populateTable(data, showButtons, isAppliedTab, isPendingTab, isDoneTab, isPostedTab, isRejectedTab, isReAppliedTab, isUserDetailsTab, isBranchDetailsTab) {
const tableHeader = document.getElementById('table-header');
const tableBody = document.getElementById('table-body');

// Clear existing headers and data
tableHeader.innerHTML = '';
tableBody.innerHTML = '';

if (data.length > 0) {
// Create table headers dynamically
const headers = Object.keys(data[0]);

// Add an empty header for the first column
const emptyTh = document.createElement('th');
emptyTh.textContent = 'Actions'; // Optional: Label for the action column
tableHeader.appendChild(emptyTh);

headers.forEach(header => {
  const th = document.createElement('th');
  th.textContent = header;
  tableHeader.appendChild(th);
});

// Create table rows dynamically
data.forEach(row => {
  
  const tr = document.createElement('tr');

  // Add buttons to the first column based on the tab
  const emptyTd = document.createElement('td');

  if (isAppliedTab) {
    // Add "Accept", "Reject", and "Upload File" buttons for the Applied tab
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = () => handleAccept(row);
    
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.onclick = () => handleReject(row);
    
    

    emptyTd.appendChild(acceptButton);
    emptyTd.appendChild(rejectButton);
  } else if (isPendingTab) {
    // Add "Posted" button for the Pending tab
    const postedButton = document.createElement('button');
    postedButton.textContent = 'Posted';
    postedButton.onclick = () => handlePosted(row);
    emptyTd.appendChild(postedButton);
  } else if (isRejectedTab) {
    // Add "Accept" button for the Rejected tab
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = () => handleAccept(row);
    emptyTd.appendChild(acceptButton);
  } else if (isPostedTab) {
    // Add "Completed" button for the Posted tab
    const completedButton = document.createElement('button');
    completedButton.textContent = 'Completed';
    completedButton.onclick = () => handleCompleted(row);
    emptyTd.appendChild(completedButton);
  } else if (isReAppliedTab) {
    // Add "Accept" button for the ReApplied tab
    const acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = () => handleAccept(row);
    emptyTd.appendChild(acceptButton);
    const rejectButton = document.createElement('button');
    rejectButton.textContent = 'Reject';
    rejectButton.onclick = () => handleReject(row);
    emptyTd.appendChild(rejectButton);

  } else if (isUserDetailsTab) {
    // Add "Edit" and "Delete" buttons for the UserDetails tab
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => showEditUserForm(row, 'UserDetails');
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => handleDeleteUser(row.id);
    
    emptyTd.appendChild(editButton);
    emptyTd.appendChild(deleteButton);
  } else if (isBranchDetailsTab) {
    // Add "Edit" and "Delete" buttons for the BranchDetails tab
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => handleEdit(row, 'BranchDetails');
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => handleDeleteBranch(row.id);
    
    emptyTd.appendChild(editButton);
    emptyTd.appendChild(deleteButton);
  } else if(isDoneTab){
    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Upload File';
    uploadButton.onclick = () => handleFileUpload(row);
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download File';
    downloadButton.onclick = () => handleFileDownload(row['Loan No']);
    emptyTd.appendChild(downloadButton);
    emptyTd.appendChild(uploadButton);

  }
  else {
    // No buttons for the Dashboard tab
    emptyTd.textContent = '';  // Just an empty cell
  }

  tr.appendChild(emptyTd);

  headers.forEach(header => {
    const td = document.createElement('td');
    td.textContent = row[header];
    tr.appendChild(td);
  });
  tableBody.appendChild(tr);
});
}
}





function handleFileDownload(agreementNo) {
window.location.href = `${serverUrl}/api/downloadFile/${agreementNo}`;
}




function handleFileUpload(row) {
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.pdf';
fileInput.onchange = async function() {
const file = fileInput.files[0];
if (file.size > 10 * 1024 * 1024) { // 10 MB limit
  alert('File size exceeds 10 MB');
  return;
}

const formData = new FormData();
formData.append('file', file);
// Append the value to the formData object with the column name 'Loan No'
formData.append('id', row['Loan No'].toString());

try {
  const response = await fetch('http://localhost:3000/api/uploadFile', {
    method: 'POST',
    body: formData
  });

  if (response.ok) {
    alert('File uploaded successfully');
    loadData('Done', document.querySelector('.sidebar a[href="#Done"]'));
  } else {
    alert('Failed to upload file');
  }
} catch (error) {
  console.error('Error uploading file:', error);
  alert('An error occurred while uploading the file');
}
};
fileInput.click();
}

// Example handler functions for the edit and delete actions

function showEditUserForm(row, tab) {
if (tab === 'UserDetails') {
document.getElementById('userId').value = row.id; // Assuming 'id' is the primary key
document.getElementById('name').value = row.name;
document.getElementById('mobile_no').value = row.mobile_no;
document.getElementById('user_type').value = row.user_type;
document.getElementById('login_id').value = row.login_id;
document.getElementById('password').value = row.password;
document.getElementById('branches_visible').value = row.branches_visible;
document.getElementById('editUserForm').style.display = 'block';
}
}

function closeEditUserForm() {
document.getElementById('editUserForm').style.display = 'none';
}

async function submitEditUserForm() {
const id = document.getElementById('userId').value;
const name = document.getElementById('name').value;
const mobile_no = document.getElementById('mobile_no').value;
const user_type = document.getElementById('user_type').value;
const login_id = document.getElementById('login_id').value;
const password = document.getElementById('password').value;
const branches_visible = document.getElementById('branches_visible').value;

const data = {
id,
name,
mobile_no,
user_type,
login_id,
password,
branches_visible
};

try {
const response = await fetch('http://localhost:3000/api/editUser', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

if (response.ok) {
  alert('User details updated successfully');
  closeEditUserForm();
  loadData('UserDetails', document.querySelector('.sidebar a[href="#userdetails"]'));

  // Optionally, refresh the table data here
} else {
  alert('Failed to update user details');
}
} catch (error) {
console.error('Error updating user details:', error);
alert('An error occurred while updating user details');
}
}

async function submitEditForm() {
const id = document.getElementById('rowId').value;
const branch_name = document.getElementById('branch_name').value;
const state = document.getElementById('state').value;
const city = document.getElementById('city').value;
const branch_address = document.getElementById('branch_address').value;
const contact_no = document.getElementById('contact_no').value;

const data = {
id,
branch_name,
state,
city,
branch_address,
contact_no
};

try {
const response = await fetch('http://localhost:3000/api/editBranch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

if (response.ok) {
  alert('Branch details updated successfully');
  closePopupForm();
  loadData('BranchDetails', document.querySelector('.sidebar a[href="#branchdetails"]'));

  // Optionally, refresh the table data here
} else {
  alert('Failed to update branch details');
}
} catch (error) {
console.error('Error updating branch details:', error);
alert('An error occurred while updating branch details');
}
}

function handleDelete(row, tab) {
console.log(`Deleting ${tab} row:`, row);
// Implement delete functionality here
}
function handleEdit(row, tab) {
if (tab === 'BranchDetails') {
document.getElementById('rowId').value = row.id; // Assuming 'id' is the primary key
document.getElementById('branch_name').value = row.branch_name;
document.getElementById('state').value = row.state;
document.getElementById('city').value = row.city;
document.getElementById('branch_address').value = row.branch_address;
document.getElementById('contact_no').value = row.contact_no;

document.getElementById('popupForm').style.display = 'block';
}
}

function closePopupForm() {
document.getElementById('popupForm').style.display = 'none';
}


async function handleAccept(row) {
const agreementNo = row['Loan No'];
currentRejectAgreementNo = agreementNo;

// Log the agreement number to the console
console.log('Selected Agreement No:', agreementNo);

document.getElementById('coLenderPopup').style.display = 'block';
}



let currentRejectAgreementNo = null;

async function handleCompleted(row) {
  const agreementNo = row['Loan No'];
  console.log('Completed:', row);
  await sendAction('Completed', agreementNo);
}

async function handleReject(row) {
  const agreementNo = row['Loan No'];
currentRejectAgreementNo = agreementNo;
document.getElementById('remarksPopup').style.display = 'block';
}

















async function submitRemarks() {
const remarks = document.getElementById('remarksInput').value;

if (!currentRejectAgreementNo) {
alert('No agreement number specified');
return;
}

try {
const response = await fetch('http://localhost:3000/api/updateRemarks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agreementNo: currentRejectAgreementNo,
    remarks
  })
});

if (response.ok) {
  alert('Remarks added successfully');
  closeRemarksPopup();
  // Optionally, refresh the table data here
  loadData('Applied', document.querySelector('.sidebar a[href="#applied"]'));
} else {
  alert('Failed to add remarks');
}
} catch (error) {
console.error('Error updating remarks:', error);
alert('An error occurred while updating remarks');
}
}



async function handleAccept2() {
const coLender = document.querySelector('input[name="coLender"]:checked')?.value;

if (!coLender) {
alert('Please choose a co-lender');
return;
}

if (!currentRejectAgreementNo) {
alert('No agreement number specified');
return;
}

try {
const response = await fetch('http://localhost:3000/api/updateCoLender', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agreementNo: currentRejectAgreementNo,
    coLender
  })
});

if (response.ok) {
  alert('Co-Lender selected successfully');
  closeCoLenderPopup();
  // Optionally, refresh the table data here
  loadData('Applied', document.querySelector('.sidebar a[href="#applied"]'));
} else {
  alert('Failed to select co-lender');
}
} catch (error) {
console.error('Error selecting co-lender:', error);
alert('An error occurred while selecting co-lender');
}
}







































function openCoLenderPopup() {
document.getElementById('coLenderPopup').style.display = 'block';
}

function closeCoLenderPopup() {
document.getElementById('coLenderPopup').style.display = 'none';
}


let pingInterval;


//

window.addEventListener('beforeunload', stopPinging);

document.addEventListener('DOMContentLoaded', startPinging);


function closeRemarksPopup() {
document.getElementById('remarksPopup').style.display = 'none';
}




async function handlePosted(row) {
  const agreementNo = row['Loan No'];
  console.log('Posted:', row);
  await sendAction('Posted', agreementNo);
}

async function sendAction(action, agreementNo) {
  const response = await fetch('http://localhost:3000/api/action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action, agreementNo })
  });
  if (response.ok) {
    console.log(`Action ${action} for AgreementNo ${agreementNo} sent to the server`);
    loadData(document.querySelector('.sidebar a.active').textContent.trim(), document.querySelector('.sidebar a.active'));
  } else {
    console.error('Failed to send action');
  }
}

async function submitUserDetails() {
  console.log('Submitting user details...');
  
  const form = document.getElementById('userdetails-form');
  if (!form) {
    console.error('Form element not found');
    return;
  }

  const formData = new FormData(form);
  console.log('FormData:', formData);

  const userDetails = {
    name: formData.get('name'),
    mobile_no: formData.get('mobile_no'),
    user_type: formData.get('user_type'),
    login_id: formData.get('login_id'),
    password: formData.get('password'),
    branches_visible: formData.get('branches_visible')
  };

  console.log('User Details:', userDetails);

  try {
    const response = await fetch('http://localhost:3000/api/userdetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userDetails)
    });

    console.log('Response Status:', response.status);

    if (response.ok) {
      alert('User details added successfully!');
      loadData('UserDetails', document.querySelector('.sidebar a[href="#userdetails"]'));
    } else {
      const errorText = await response.text();
      console.error('Failed to add user details:', errorText);
      alert('Failed to add user details');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    alert('An error occurred while adding user details');
  }
}
//change the link here
async function submitBranchDetails() {
  console.log('Submitting Branch details...');
  
  const form = document.getElementById('branchdetails-form');
  if (!form) {
    console.error('Form element not found');
    return;
  }
  const formData = new FormData(form);
  console.log('FormData:', formData);

  const branchDetails = {
    branch_name: formData.get('branch_name'),
    state: formData.get('state'),
    city: formData.get('city'),
    branch_address: formData.get('branch_address'),
    contact_no: formData.get('contact_no'),
  };

  console.log('Branch Details:', branchDetails);

  try {
    const response = await fetch('http://localhost:3000/api/branchdetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(branchDetails)
    });

    console.log('Response Status:', response.status);

    if (response.ok) {
      alert('Branch details added successfully!');
      loadData('BranchDetails', document.querySelector('.sidebar a[href="#branchdetails"]'));
    } else {
      const errorText = await response.text();
      console.error('Failed to add branch details:', errorText);
      alert('Failed to add branch details');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    alert('An error occurred while adding branch details');
  }
}

async function loadData(status, element) {
const tabTitle = {
'': 'Dashboard',
'Applied': 'Applied',
'Pending': 'Pending',
'Done': 'Done',
'Posted': 'Posted',
'Rejected': 'Rejected',
'ReApplied': 'ReApplied',
'UserDetails':'UserDetails',
'BranchDetails':'BranchDetails'
}[status];
document.getElementById('tab-title').innerText = tabTitle;

// Map statuses to API request parameters
const statusMapping = {
'': '',          // No status filter for Dashboard
'Applied': 'Applied',
'Pending': 'Accepted',
'Done': 'Completed',
'Posted': 'Posted',
'Rejected': 'Rejected',
'ReApplied': 'Re-Applied',
'UserDetails':'UserDetails',
'BranchDetails':'BranchDetails'
};

const fetchStatus = statusMapping[status];
const showButtons = status === '';  // Only show additional buttons if status is Dashboard
const isAppliedTab = status === 'Applied';  // Correctly identify Applied tab
const isPendingTab = status === 'Pending';  // Correctly identify Pending tab
const isDoneTab = status === 'Done';  // Correctly identify Done tab
const isPostedTab = status === 'Posted';  // Correctly identify Posted tab
const isRejectedTab = status === 'Rejected';  // Correctly identify Rejected tab
const isReAppliedTab = status === 'ReApplied';  // Correctly identify ReApplied tab
const isUserDetailsTab = status === 'UserDetails';
const isBranchDetailsTab = status === 'BranchDetails';
const data = await fetchData('', fetchStatus);
populateTable(data, !showButtons, isAppliedTab, isPendingTab, isDoneTab, isPostedTab, isRejectedTab, isReAppliedTab,isUserDetailsTab,isBranchDetailsTab);

// Always show the search box
const searchContainer = document.getElementById('search-container');
searchContainer.style.display = 'block';

// Show or hide file controls based on the tab
const fileContainer = document.getElementById('file-container');
fileContainer.style.display = showButtons ? 'block' : 'none';

document.getElementById('userdetails-container').style.display = isUserDetailsTab ? 'block' : 'none';
document.getElementById('branchdetails-container').style.display = isBranchDetailsTab ? 'block' : 'none';


// Highlight the active tab
const tabs = document.querySelectorAll('.sidebar a');
tabs.forEach(tab => tab.classList.remove('active'));
element.classList.add('active');

// Update button data-tab attribute
// const tabButton = document.getElementById('tab-button');
// tabButton.setAttribute('data-tab', tabTitle);
}

async function handleDeleteUser(id) {
if (confirm('Are you sure you want to delete this user?')) {
try {
  const response = await fetch(`${serverUrl}/api/deleteUser/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    alert('User deleted successfully');
    loadData('UserDetails', document.querySelector('.sidebar a[href="#userdetails"]'));
    // Optionally, refresh the table data here
  } else {
    alert('Failed to delete user');
  }
} catch (error) {
  console.error('Error deleting user:', error);
  alert('An error occurred while deleting the user');
}
}
}
async function handleDeleteBranch(id) {
if (confirm('Are you sure you want to delete this Branch?')) {
try {
  const response = await fetch(`${serverUrl}/api/deleteBranch/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    alert('Branch deleted successfully');
    loadData('BranchDetails', document.querySelector('.sidebar a[href="#branchdetails"]'));

    // Optionally, refresh the table data here
  } else {
    alert('Failed to delete Branch');
  }
} catch (error) {
  console.error('Error deleting Branch:', error);
  alert('An error occurred while deleting the Branch');
}
}
}

