var dropDownContainer = document.querySelector('.drop_down');

document.addEventListener("DOMContentLoaded", function () {
    var docImage = document.querySelector('.doc');
    var cross = document.querySelector('.doc1');

    // Show/hide dropdown when clicking on docImage or cross
    docImage.addEventListener('click', function () {
        dropDownContainer.classList.toggle('show');
    });

    cross.addEventListener('click', function (e) {
        dropDownContainer.classList.toggle('show');
    });

    // Close dropdown when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!dropDownContainer.contains(event.target) && !docImage.contains(event.target) && !cross.contains(event.target)) {
            dropDownContainer.classList.remove('show');
        }
    });
});


function openSignInModal() {
   
    var modal = document.getElementById('signin-modal');
    modal.style.display = 'block';
    
        modal.classList.add('visible'); 
     
}
function openSignupModal() {
   
    var modal = document.getElementById('signup-modal');
    modal.style.display = 'block';
    
        modal.classList.add('visible'); 
     
}

function closeSignInModal() {
    var modal = document.getElementById('signin-modal');
    modal.style.display = 'none';
    document.getElementById('signinForm').reset();
}
function closeSignupModal() {
    var modal = document.getElementById('signup-modal');
    modal.style.display = 'none';
    document.getElementById('signupForm').reset();
}

function openPasswordResetModal() {
    var modal = document.getElementById('passwordResetModal');
    modal.style.display = 'block';
    modal.classList.add('visible'); 
}

function closePasswordResetModal() {
    var modal = document.getElementById('passwordResetModal');
    var resetform = document.getElementById('passwordResetForm');
    resetform.reset()
    modal.style.display = 'none';
    
}


function togglePasswordVisibility() {
    const passwordInput = document.getElementById('signupPassword');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
}
function togglePasswordVisibility1() {
    const passwordInput = document.getElementById('signinPassword');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    }
}











async function signin() {
    const username = document.getElementById('signinUsername').value;
    const password = document.getElementById('signinPassword').value;
    console.log(username,password)
    try {
        const response = await fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: username, password }),
        });

        if (response.ok) {
            // Check if the response content type is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                // Handle JSON response if needed
            } else {
                // Handle HTML response (successful sign-in, redirect to dashboard or update UI)
                
                window.location.href = '/dashboard';
                
            }
        } else {
            // Failed sign-in, display error message or handle as needed
            const result = await response.json();
            alert(result.error);
        }
    } catch (error) {
        console.error(error);
        // Handle unexpected errors
        alert('Internal Server Error');
    }
}




async function signup() {
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                // Handle JSON response if needed
            } else {
                // Handle HTML response (successful sign-in, redirect to dashboard or update UI)
                
                window.location.href = '/details';
                
            }
        } else {
            // Failed sign-in, display error message or handle as needed
            const result = await response.json();
            alert(result.error);
        }
    } catch (error) {
        console.error(error);
        // Handle unexpected errors
        alert('Internal Server Error');
    }
}

async function sendResetEmail() {
    const resetEmail = document.getElementById('resetEmail').value;

    try {
        const response = await fetch('http://localhost:3000/reset-password-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: resetEmail }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
            Swal.fire({
                icon: 'success',
                title: 'Mail Sent',
                text: 'Password reset mail sent successful',
            });
            closePasswordResetModal()
        } else {
            const errorMessage = await response.json();
            console.error(`Error: ${response.status} - ${errorMessage.error}`);
            Swal.fire({
                icon: 'error',
                title: 'Error occured',
                text: `Error: ${response.status} - ${errorMessage.error}`,
            });
            document.getElementById('passwordResetForm').reset()
        }
    } catch (error) {
        console.error('An unexpected error occurred:', error);
    }
}