function displaySelectedImage(input) {
    const selectedImage = document.getElementById('selectedImage');
    const defaultImage = document.getElementById('defaultImage');
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            selectedImage.src = e.target.result;
            selectedImage.style.display = 'block';
            defaultImage.style.display = 'none';
        };

        reader.readAsDataURL(file);
    } else {
        // If no file is selected, display the default image
        selectedImage.style.display = 'none';
        defaultImage.style.display = 'block';
    }
}

async function submitForm() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('show');
    const form = document.getElementById('userDetailsForm');
    const formData = new FormData(form);

    try {
        const response = await fetch('http://localhost:3000/details', {
            method: 'POST',
            body: formData,
        });

       

        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                // Handle JSON response if needed
            } else {
                // Handle HTML response (successful sign-in, redirect to dashboard or update UI)
                
                window.location.href = '/dashboard';
                
            }
        } else {
            const result = await response.json();
            alert(result.error);
            // alert(`Error: ${result.error}`);
            // loadingOverlay.classList.remove('show');
            // Swal.fire({
            //     icon: 'error',
            //     title: 'Error',
            //     text: result.error,
            // });
        }
    } catch (error) {
        console.error(error);
        // Handle unexpected errors
        alert('Internal Server Error');
        // console.error(error);
        // // alert('An error occurred. Please try again.');
        // loadingOverlay.classList.remove('show');
        // Swal.fire({
        //     icon: 'error',
        //     title: 'Error',
        //     text: 'An error occurred. Please try again.',
        // });
    }
}
