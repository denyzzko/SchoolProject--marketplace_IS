// Fetch proposals from the server
function fetchProposals() {
    fetch('../backend/get_proposals.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                renderProposals(data.proposals);
            } else {
                displayMessage(data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error fetching proposals:', error);
            displayMessage('An unexpected error occurred.', "error");
        });
}

// Render proposals
function renderProposals(proposals) {
    const container = document.querySelector('.proposals-list');
    container.innerHTML = '';

    if (proposals.length === 0) {
        displayMessage('No pending proposals available.', "error");
        return;
    }

    proposals.forEach(proposal => {
        const proposalElement = document.createElement('div');
        proposalElement.className = 'proposal-item';

        proposalElement.innerHTML = `
            <p><strong>Proposed category:</strong> ${proposal.full_path}</p>
            <p><strong>Proposed by:</strong> ${proposal.email}</p>
            <button class="approve-button" onclick="approveProposal(${proposal.proposal_id}, ${proposal.parent_category_id}, '${proposal.proposal}')">Approve</button>
            <button class="reject-button" onclick="rejectProposal(${proposal.proposal_id})">Reject</button>
        `;

        container.appendChild(proposalElement);
    });
}

// Display a success or error message
function displayMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.color = type === "success" ? "green" : "red";
}

// Approve a proposal
function approveProposal(proposalId, parentCategoryId, proposalName) {
    fetch('../backend/manage_proposals.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            proposal_id: proposalId, 
            action: 'approve', 
            parent_category_id: parentCategoryId,
            proposal: proposalName 
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                displayMessage(data.message, "success");
                fetchProposals();
            } else {
                displayMessage(data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error approving proposal:', error);
            displayMessage('An unexpected error occurred.', "error");
        });
}


// Reject a proposal
function rejectProposal(proposalId) {
    fetch('../backend/manage_proposals.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proposal_id: proposalId, action: 'reject' }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                displayMessage(data.message, "success");
                fetchProposals();
            } else {
                displayMessage(data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error rejecting proposal:', error);
            displayMessage('An unexpected error occurred.', "error");
        });
}
document.addEventListener('DOMContentLoaded', fetchProposals);
