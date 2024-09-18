$(document).ready(function () {
    var param = new URLSearchParams(window.location.search);
    var sessionId = param.get('session');
    var user = param.get('username');
    console.log("Session ID: " + sessionId);

    var signUpLoginLink = $('#signUpLoginLink');

    if (!sessionId) {
        signUpLoginLink.html('<a class="nav-link" href="login.html">Sign Up / Login</a>');
        $('#cardDeck').hide();
    } else {
        $.ajax({
            url: 'final.php/session',
            method: 'POST',
            data: {
                session: sessionId
            }
        }).done(function (data) {
            console.log("Response Data:", data);
            if (data.valid) {
                signUpLoginLink.html('<a class="nav-link" href="#" id="soLink">Sign Out</a>');
                $('#soLink').click(function (event) {
                    event.preventDefault();
                    console.log("User: " + user);
                    logout(user, sessionId);
                    window.location.href = 'homepage.html';
                });
                
                $('#homeLink').attr('href', 'homepage.html?username=' + user + '&session=' + sessionId);
                $('#stocksLink').attr('href', 'stocks.html?username=' + user + '&session=' + sessionId);
                $('#stockHistoryLink').attr('href', 'stockHistory.html?username=' + user + '&session=' + sessionId);
                $('#aboutPaigeLink').attr('href', 'aboutPaige.html?username=' + user + '&session=' + sessionId);
                $('#aboutMadiLink').attr('href', 'aboutMadi.html?username=' + user + '&session=' + sessionId);
            } else {
                signUpLoginLink.html('<a class="nav-link" href="login.html">Sign Up / Login</a>');
            }
        }).fail(function(error){
            console.log("Error occured while making the navbar" + error.statusText);
        });
    }

    $('#stockHistoryLink').click(function (event) {
        if (!sessionId) {
            event.preventDefault();
            alert("Please log in first to view stock history.");
        }
    });
});;

function logout(username, session) {
    a=$.ajax ({
        url: 'final.php/logout',
        method: "POST",
        data: {
            username: username,
            session: session
        }
    }).done(function(data) {
        if (data.status == 0) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    }).fail(function(error) {
        console.log("Error occured logging out: " + error.statusText);
    });
}