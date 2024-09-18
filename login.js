var URL="final.php/";

$(document).ready(function() {

    // For login button
    $('#logButton').click(function(event) {
        event.preventDefault();
        var username = $('#userField').val();
        var password = $('#passField').val();

        if (username == "") {
            alert("Please fill out username");
        } else if (password == "") {
            alert("Please fill out password");
        } else {
            login(username, password);
        }
    });

    // For sign up button
    $('#signButton').click(function(event) {
        event.preventDefault();
        var name = $('#nameField').val();
        var username = $('#userField').val();
        var password = $('#passField').val();
        var confPass = $('#confPassField').val();

        if (name == "") {
            alert("Please fill out name");
        } else if (username == "") {
            alert("Please fill out username");
        } else if (password == "") {
            alert("Please fill out password");
        } else if (confPass != password) {
            alert("Passwords don't match");
        } else {
            signUp(name, username, password);
        }
    });

});


function signUp(name, username, password) {
    a=$.ajax ({
        url: URL + 'signUp',
        method: "POST",
        data: {
            name: name,
            username: username,
            favStock: password
        }
    }).done(function(data) {
        console.log("Data: " + data);
        if (data.status == 0) {
            alert(data.message);
            window.location.href = 'login.html';
        } else {
            alert(data.message);
        }
    }).fail(function(error) {
        console.log("Error occured while signing up: " + error.statusText);
    });
}

function login(username, password) {
    a=$.ajax ({
        url: URL + 'login',
        method: "POST",
        data: {
            username: username,
            password: password
        }
    }).done(function(data) {
        if (data.status == 0) {
            // Passes the session ID to my homepage to make sure I'm logged in!                 
            window.location.href = 'homepage.html?session=' + data.session + "&username=" + username;
        } else {
            alert(data.message);
        }
    }).fail(function(error) {
        console.log("Error occured while logging in: " + error.statusText);
    });
}