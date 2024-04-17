window.addEventListener("load", function () {

    const dropdownBtn = document.querySelector('.dropdown-active');
    const dropdownContent = document.querySelector('.dropdown-content');

    const modal = document.querySelector("#searchModalBox");
    const searchBtn = document.querySelector("#searchBtn");
    const searchInput = document.querySelector('.search-input');
    const resetSearch = document.querySelector(".reset");
    const modalBody = document.querySelector('.modal-body');
    const uploadImageField = document.querySelector('#imageFile');

    if (dropdownBtn) {
        dropdownBtn.addEventListener('click', function () {
            dropdownContent.classList.toggle('show');
        });

        window.addEventListener('click', function () {
            if (!dropdownBtn.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.classList.remove('show');
            }
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener("click", function () {
            modal.style.display = "block";
        });

        window.addEventListener('click', function () {
            if (event.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    const allComments = document.querySelectorAll("#reply-to-comment");
    if (allComments) {
        allComments.forEach(element => {
            element.addEventListener("click", replyToComment);
        });
    }

    const removeReplyToSpan = document.querySelector("#remove-reply-to-comment");
    if (removeReplyToSpan) {
        removeReplyToSpan.addEventListener("click", removeReplyToComment);
    }

    //limit size file 2mb (plus a bit of margin)
    if (uploadImageField) {
        uploadImageField.onchange = function () {
            if (this.files[0].size > (2 * 1024 * 1024 + 20)) {
                alert("File is too big! Please choose an image file of up to 2MB");
                this.value = "";
            }
        }
    }


    // search function -----
    if (modalBody) {
        displayAllArticleCards(); //show all articles at start

        //when you click the reset button start
        if (resetSearch) {
            resetSearch.addEventListener('click', function () {
                displayAllArticleCards();
            });
        }

        //when you click the reset button start
        if (resetSearch) {
            resetSearch.addEventListener('click', function () {
                displayAllArticleCards();
            });
        }

        async function displayAllArticleCards() {
            const allArticles = await displayAllArticlesData();
            updateModalBody(allArticles);

        }

        async function displayAllArticlesData() {
            const response = await fetch(`/search?q=`);
            const data = await response.json();
            return data;
        }
        //when you click the reset button end

        if (searchInput) {
            //without this part, Enter key reloads the page
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            });

            searchInput.addEventListener('input', searchHandler);
        }

        async function searchHandler() {
            const searchResults = await fetchSearchResults(searchInput.value);
            updateModalBody(searchResults);
        }

        async function fetchSearchResults(searchQuery) {
            const response = await fetch(`/search?q=${searchQuery}`);
            const data = await response.json();
            return data;
        }

        function updateModalBody(searchResults) {
            modalBody.innerHTML = '';

            if (searchResults.length === 0) {
                modalBody.innerHTML = 'No results found.';
            } else {

                searchResults.forEach(result => {
                    const searchCard = document.createElement('div');
                    searchCard.setAttribute('onclick', `location.href='/article/${result.articles_id}'`);
                    searchCard.classList.add('search-card');

                    searchCard.innerHTML = `
                        <a class="search-card-content">
                            <img src="${result.image}">
                            <div class="search-card-title">
                                <div class="author-details">
                                    <img class="search-user-avatar" src="${result.avatar}">
                                    <p>${result.username}</p>
                                </div>
                                <p>${result.title}</p>
                            </div>
                        </a>
                    </div>`;

                    modalBody.appendChild(searchCard);
                });
            }
        }
    }
    // search function end -----

    checkingUsernameValidity("#username", "#username-condition");
    confirmPassword();


    function checkingUsernameValidity(usernameAtt, textAtt) {
        const username = document.querySelector(usernameAtt);

        if (username) {
            username.addEventListener("input", function () {
                updateUsernameStatus(usernameAtt, textAtt);
            });
        }
    }


    async function updateUsernameStatus(usernameAtt, textAtt) {
        const username = document.querySelector(usernameAtt).value;
        const message = document.querySelector(textAtt);
        const submitButton = document.querySelector("#submit-button");
        document.querySelector("#username-validity").innerText = "";

        const exists = await isExists(username);
        const isValid = await validateInput(username);

        if (isValid) {
            message.classList.remove("invalid");
            message.innerText = "Valid Username";
            updateSubmitButtonStatus(submitButton);

        } else {
            handleInvalidInput(message, exists, username);
            disableSubmitButton(submitButton, "Invalid Username");
        }
    }


    async function validateInput(inputValue) {
        const exists = await isExists(inputValue);

        if (!inputValue) {
            return false;
        } else if (!exists && inputValue.length > 3) {
            return true;
        } else {
            return false;
        }
    }


    function handleInvalidInput(message, isExist, inputValue) {
        toggleColourForSubmitButton("Invalid Username", "invalid");
        message.classList.add("invalid");

        if (!inputValue) {
            message.innerHTML = "Please Enter Username";
        } else {
            if (isExist) {
                message.innerHTML = "Invalid Username (This username is already taken)";
            } else if (inputValue.length < 5) {
                message.innerHTML = "Invalid Username (min. 4 characters)";
            } else {
                message.innerHTML = "Invalid Input";
            }
        }
    }


    function confirmPassword() {
        const passwordConfirm = document.querySelector("#password-confirm");
        if (passwordConfirm) {
            passwordConfirm.addEventListener("input", confirmingPassword);
        }

        const password = document.querySelector("#password");
        if (password) {
            password.addEventListener("input", confirmingPassword);
        }
    }


    async function isExists(input) {
        const allUsersArray = await fetchAllUsersData();
        let allUsernamesArray = allUsersArray.map((user) => user.username);

        if (window.location.href === "http://localhost:3000/update") {
            const loggedInUsername = await fetchLoggedInUsernameData();
            allUsernamesArray = allUsernamesArray.filter(username => username != loggedInUsername);
        }

        return allUsernamesArray.includes(input);
    }


    async function fetchAllUsersData() {
        try {
            let allUsersDataResponse = await fetch("/api/user");

            if (!allUsersDataResponse.ok) {
                throw new Error(`Failed to fetch all users data. Status: ${allUsersDataResponse.status}`);
            }

            let allUsersDataObj = await allUsersDataResponse.json();

            return allUsersDataObj;

        } catch (error) {
            console.error("An error occurred:", error);
        }

    }


    async function fetchLoggedInUsernameData() {
        try {
            let loggedInUsernameDataResponse = await fetch("/api/user/loggedinuser");

            if (!loggedInUsernameDataResponse.ok) {
                throw new Error(`Failed to fetch all users data. Status: ${loggedInUsernameDataResponse.status}`);
            }

            let loggedInUsernameDataObj = await loggedInUsernameDataResponse.json();

            return loggedInUsernameDataObj;

        } catch (error) {
            console.error("An error occurred:", error);
        }

    }


    function confirmingPassword() {
        const password = document.querySelector("#password").value;
        const passwordConfirm = document.querySelector("#password-confirm").value;
        const message = document.querySelector("#password-validity");
        const submitButton = document.querySelector("#submit-button");
        const isValid = isValidPassword(password);

        if (password !== passwordConfirm) {
            message.classList.add("invalid");
            message.innerText = "Password is not matching";
            disableSubmitButton(submitButton, "Passwords should be matching");
        }

        if (password === "") {
            message.innerText = "";
            disableSubmitButton(submitButton, "Passwords should be matching");
        }

        if (password === passwordConfirm && isValid) {
            message.classList.remove("invalid");
            message.innerText = "Password confirmed";
            updateSubmitButtonStatus(submitButton);
        }

    }


    function isValidPassword(password) {
        const message = document.querySelector("#password-condition");
        const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/;
        const numberRegex = /[0-9]/;

        if (password.length > 4 && specialCharRegex.test(password) && numberRegex.test(password)) {
            message.classList.remove("invalid");
            message.innerText = "Valid Password"
            return true;

        } else if (password.length < 5) {
            message.classList.add("invalid");
            message.innerText = "Must be a minimum of 5 characters.";
            return false;

        } else if (!specialCharRegex.test(password) || !numberRegex.test(password)) {
            message.classList.add("invalid");
            message.innerText = "At least 1 special character & 1 number";
            return false;
        }
    }


    function enableSubmitButton(button) {
        if (window.location.href === "http://localhost:3000/update") {
            toggleColourForSubmitButton("Update Information", "valid");

        } else if (window.location.href === "http://localhost:3000/register") {
            toggleColourForSubmitButton("Create Account", "valid");
        }

        button.removeAttribute("disabled");
    }


    function disableSubmitButton(button, message) {
        toggleColourForSubmitButton(message, "invalid");
        button.setAttribute("disabled", null);
    }


    function toggleColourForSubmitButton(message, classAtt) {
        const submitButton = document.querySelector("#submit-button");
        resetSubmitButtonColour(submitButton);

        if (classAtt) {
            submitButton.classList.add(classAtt);
        }

        submitButton.innerHTML = message;
    }


    function resetSubmitButtonColour(button) {
        button.classList.remove("invalid");
    }


    function updateSubmitButtonStatus(button) {
        const validUsernameText = document.querySelector("#username-condition");
        const validPasswordText = document.querySelector("#password-validity");

        if (validUsernameText.textContent === "Valid Username" && validPasswordText.textContent === "Password confirmed") {
            enableSubmitButton(button);

        } else if (validUsernameText.textContent === "Valid Username") {
            disableSubmitButton(button, "Please enter Password")

        } else if (validPasswordText.textContent === "Password confirmed") {
            disableSubmitButton(button, "Invalid Username")
        }
    }


    if (window.location.href == "http://localhost:3000/update") {
        prepopulatingUpdateForm();
    }


    async function prepopulatingUpdateForm() {
        const username = document.querySelector("#username");
        const fname = document.querySelector("#fname");
        const lname = document.querySelector("#lname");
        const dob = document.querySelector("#dOB");
        const description = document.querySelector("#description");
        const avatarOne = document.querySelector("#avatar-one");
        const avatarTwo = document.querySelector("#avatar-two");
        const avatarThree = document.querySelector("#avatar-three");
        const avatarFour = document.querySelector("#avatar-four");
        const avatarFive = document.querySelector("#avatar-five");
        const avatarArray = [avatarOne, avatarTwo, avatarThree, avatarFour, avatarFive];

        const allUserArray = await fetchAllUsersData();
        const loggedInUsername = await fetchLoggedInUsernameData();

        const loggedInUser = allUserArray.filter((user) => user.username === loggedInUsername)[0];

        username.value = loggedInUser.username;
        fname.value = loggedInUser.fname;
        lname.value = loggedInUser.lname;
        dob.value = loggedInUser.dob;
        description.value = loggedInUser.bio;
        const userAvatar = avatarArray.filter((avatar) => avatar.value === loggedInUser.avatar)[0];
        userAvatar.setAttribute("checked", null);

        updateUsernameStatus("#username", "#username-condition");
        confirmingPassword();

    }


    function replyToComment(e) {
        const replyingToDiv = document.querySelector("#replying-to-div");
        const replyingToP = document.querySelector("#replying-to");
        const newCommentParentId = document.querySelector("#new_comment_parent_id");

        if (e.target.dataset.parentcomment) {
            newCommentParentId.value = e.target.dataset.parentcomment;
        } else {
            newCommentParentId.value = e.target.dataset.commentid;
        }

        const commentContentSummary = e.target.dataset.content.substring(0, 50);

        replyingToP.innerHTML = `Replying to <strong>${e.target.dataset.username}</strong>: "${commentContentSummary}"...`;
        replyingToDiv.hidden = false;

    }


    function removeReplyToComment() {
        const replyingToDiv = document.querySelector("#replying-to-div");
        const newCommentParentId = document.querySelector("#new_comment_parent_id");

        replyingToDiv.hidden = true;
        newCommentParentId.value = null;

    }


});