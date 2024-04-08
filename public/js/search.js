const searchInput = document.getElementById('searchInput');
  const userListContainer = document.getElementById('userListContainer');


  const profilePic1 = document.querySelector('.profile_con1');
  profilePic1.addEventListener('click', function (e) {
    window.location.href = '/profile';
  });

  // Event listener for search input changes
  searchInput.addEventListener('input', () => {
      const searchQuery = searchInput.value.trim(); // Get the search query
      if(searchQuery==''){
        
        userListContainer.classList.add('hid')
        return
      }
      userListContainer.classList.remove('hid')
      // Fetch user list based on the search query
      fetch(`/search/${searchQuery}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(users => {
            console.log(users)
              // Clear previous search results
              userListContainer.innerHTML = '';

              // Display user list
              users.forEach(user => {
                  const userElement = document.createElement('div');
                  userElement.classList.add('search_each_user')
                  const username = document.createElement('p');
                  username.innerText = user.username;
                  userElement.addEventListener('click',()=>showuser(user.username))
                  // Add profile photo image tag if available
                  if (user.profilePhoto) {
                      const profilePhoto = document.createElement('img');
                      profilePhoto.classList.add('profile_img')
                      profilePhoto.src = user.profilePhoto;
                      profilePhoto.alt = 'Profile Photo';
                      userElement.appendChild(profilePhoto);
                      userElement.appendChild(username);
                  }
                  userListContainer.appendChild(userElement);
              });
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
  });

  async function showuser(user){
  
    window.location.href = `/${user}`;
  }