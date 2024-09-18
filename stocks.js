// creating a global user variable for username
var user;
$(document).ready(function () {
    var param = new URLSearchParams(window.location.search);
    user = param.get('username');
    console.log(user);
    exchDrop();
    favorite(user);
    console.log(user);
    console.log("cleared null user check")
    $('#favButton').click(function (event) {
        if (user != null) {
            event.preventDefault();
            console.log("cleared null favorites check")
            console.log("User Name: " + user)
            console.log("Stock Name: " + $('#stockSelect').val())
            addFav(user, $('#stockSelect').val())
        } else {
            alert("You must log in to use this feature.");
        }
    });

    $('#findStock').click(function () {
        var selectedStock = $('#stockSelect').val();
        fetchStockData(selectedStock);
        showNews(selectedStock);
    });
});

function exchDrop() {
    a = $.ajax({
        url: 'https://api.polygon.io/v3/reference/exchanges?asset_class=stocks&apiKey=eq6Tp42nAfJtPW8novPObLfZQsc6OE9H',
        method: "GET"
    }).done(function (data) {
        len = data.results.length;
        for (i = 0; i < len; i++) {
            if (i == 0) {
                $('#exchSelect').append("<option value='" + data.results[i].operating_mic
                    + "' selected='selected'>" + data.results[i].name + "</option>");
            } else {
                $('#exchSelect').append("<option value='" + data.results[i].operating_mic + "'>"
                    + data.results[i].name + "</option>");
            }
        }
        var def = $('#exchSelect').val();

        stocksDrop(def);
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

function stocksDrop(exch) {
    a = $.ajax({
        url: 'https://api.polygon.io/v3/reference/tickers?&active=true&apiKey=eq6Tp42nAfJtPW8novPObLfZQsc6OE9H',
        method: "GET",
        data: {
            exchange: exch
        }
    }).done(function (data) {
        $('#stockSelect').empty();
        len = data.results.length;

        for (i = 0; i < len; i++) {
            var shortName = data.results[i].name.substring(0, 30);
            if (data.results[i].name.length > 30) {
                shortName += "...";
            }
            $('#stockSelect').append("<option value='" + data.results[i].ticker + "'>"
                + data.results[i].ticker + " - " + shortName + "</option>");
        }
        var def = $('#stockSelect').val();
        console.log(def);
        fetchStockData(def);
        showNews(def);
    }).fail(function (error) {
        console.log("error", error.statusText);
    });
}

$(document).on('change', '#exchSelect', function () {
    const selectedExchange = $(this).val();
    stocksDrop(selectedExchange);
});


// Function to fetch stock data for the past five days
function fetchStockData(stockSymbol) {
    var endDate = new Date().toISOString().slice(0, 10);
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate = startDate.toISOString().slice(0, 10);

    a = $.ajax({
        url: 'https://api.polygon.io/v2/aggs/ticker/' + stockSymbol + '/range/1/day/' + startDate + '/' + endDate + '?adjusted=true&sort=asc&limit=120&apiKey=iqqn_FoP25cZv1WWbvi3MZb0tgXptPPy',
        method: "GET",
    }).done(function (data) {
        const chartData = data.results.map(result => ({
            o: result.o,
            h: result.h,
            l: result.l,
            c: result.c
        }));
        moreInfo(stockSymbol);
        createChart(chartData);
    }).fail(function (error) {
        console.log("Error fetching stock data:", error.statusText);
    });
}

function moreInfo(ticker) {
    a = $.ajax({
        url: 'https://api.polygon.io/v3/reference/tickers/' + ticker + '?apiKey=iqqn_FoP25cZv1WWbvi3MZb0tgXptPPy',
        method: "GET",
    }).done(function (data) {
        $('#info').empty();
        $('#info').append("<li class='list-group-item'>Founded In: " + data.results.list_date + "</li>");
        $('#info').append("<li class='list-group-item'>Total Employees: " + data.results.total_employees + "</li>");
        $('#info').append("<li class='list-group-item'>Outstanding Weighted Shares: " + data.results.weighted_shares_outstanding + "</li>");
        $('#info').append("<li class='list-group-item'>Homepage: <a href='" + data.results.homepage_url + "'>" + ticker + "</a></li>");
        $('#info').append("<li class='list-group-item'>Phone Number: " + data.results.phone_number + "</li>");
    }).fail(function (error) {
        console.log("Error fetching stock data:", error.statusText);
    });
}

// creating the chart variable outside of the function
var myChart;

function createChart(response) {

    // in the event there's already
    // something on the page
    if (myChart) {
        myChart.destroy();
    }

    const labels = [];
    const highs = [];
    const lows = [];
    const opens = [];
    const closes = [];

    for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toISOString().slice(0, 10));
    }

    // Extracting data from the response
    response.forEach(result => {
        highs.push(result.h);
        lows.push(result.l);
        opens.push(result.o);
        closes.push(result.c);
    });

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'High',
                data: highs,
                fill: false,
                borderColor: 'rgb(255, 99, 132)', // Red
                tension: 0.1
            },
            {
                label: 'Low',
                data: lows,
                fill: false,
                borderColor: 'rgb(54, 162, 235)', // Blue
                tension: 0.1
            },
            {
                label: 'Open',
                data: opens,
                fill: false,
                borderColor: 'rgb(255, 206, 86)', // Yellow
                tension: 0.1
            },
            {
                label: 'Close',
                data: closes,
                fill: false,
                borderColor: 'rgb(75, 192, 192)', // Green
                tension: 0.1
            }
        ]
    };

    var ctx = document.getElementById('stockChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'line',
        data: chartData
    });
}

function favorite(user) {
    $.ajax({
        url: 'final.php/favorite',
        method: 'GET',
        data: {
            username: user
        }
    }).done(function (data) {
        console.log(data);
        if (typeof data === 'object' && Array.isArray(data.data)) {
            data.data.forEach(function (item) {
                console.log(item.favstock);
                fillFavorite(item.favstock);
            });
        } else {
            console.log("Invalid data format received.");
        }
    }).fail(function (error) {
        console.log("Error fetching news data:", error.statusText);
    });
}


function yestClose(ticker) {
    return $.ajax({
        url: 'https://api.polygon.io/v2/aggs/ticker/' + ticker + '/prev?adjusted=true&apiKey=eq6Tp42nAfJtPW8novPObLfZQsc6OE9H',
        method: 'GET'
    }).then(function (data) {
        return data.results[0].c;
    }).fail(function (error) {
        console.log("Error fetching closing data:", error.statusText);
    });
}

function getName(ticker) {
    return $.ajax({
        url: 'https://api.polygon.io/v3/reference/tickers?ticker=' + ticker + '&active=true&limit=100&apiKey=iqqn_FoP25cZv1WWbvi3MZb0tgXptPPy',
        method: 'GET'
    }).then(function (data) {
        return data.results[0].name;
    }).fail(function (error) {
        console.log("Error fetching closing data:", error.statusText);
    });
}

function fillFavorite(ticker) {
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 2);
    if (currentDate.getDay() == 0) {
        currentDate.setDate(currentDate.getDate() + 1);
    } else if (currentDate.getDay() == 6) {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    currentDate = currentDate.toISOString().slice(0, 10);
    $.ajax({
        url: 'https://api.polygon.io/v1/open-close/' + ticker + '/' + currentDate + '?adjusted=true&apiKey=iqqn_FoP25cZv1WWbvi3MZb0tgXptPPy',
        method: 'GET'
    }).then(function (data) {
        // Call yestClose to get the previous day's closing price
        return yestClose(ticker).then(function (prevClose) {
            // Call getName to get the name of the stock
            return getName(ticker).then(function (stockName) {
                // Calculate the difference between the current close and the previous close
                var difference = (data.close - prevClose).toFixed(4);
                var color;
                if (difference < 0) {
                    color = 'red';
                } else {
                    color = 'green';
                }

                var card = $("<div'></div>");
                card.append("<div class='card'></div>"); // Set width for the card
                card.find('.card').append("<div class='card-header'>" + stockName + "</div>");

                var list = $("<ul class='list-group list-group-flush'></ul>");
                list.append("<li class='list-group-item'>Ticker Symbol: " + data.symbol + "</li>");
                list.append("<li class='list-group-item'>Last Open: " + data.open + "</li>");
                list.append("<li class='list-group-item'>Last High: " + data.high + "</li>");
                list.append("<li class='list-group-item'>Last Low: " + data.low + "</li>");
                list.append("<li class='list-group-item'>Last Close: " + data.close + "</li>");
                list.append("<li class='list-group-item'>Difference From Last Input: <span style='color: "
                    + color + ";'>" + difference + "</span></li>");
                list.append("<li class='list-group-item'>Volume: " + data.volume + "</li>");
                card.find('.card').append(list);
                $('#cardRow').append(card);
            });
        });
    }).fail(function (error) {
        console.log("Error fetching favorites data:", error.statusText);
    });
}




function addFav(username, favstock) {
    console.log("Username:" + username + ", Fav: " + favstock);
    a = $.ajax({
        url: 'final.php/addFav',
        method: 'POST',
        data: {
            username: username,
            favstock: favstock
        }
    }).done(function (data) {
        console.log("Data: " + data);
        if (data.message == "Already in favorites") {
            remFav(username, favstock);

        } else {
            fillFavorite(favstock);
            if (data.status == 0) {
                transLog(username, favstock, "Added");
                alert(data.message);
            } else {
                alert(data.message);
            }
        }
    }).fail(function (error) {
        console.log("Error Adding to Favorites:", error.statusText);
    });
}

function remFav(username, favstock) {
    console.log("Username:" + username + ", Fav: " + favstock);
    a = $.ajax({
        url: 'final.php/remFav',
        method: 'POST',
        data: {
            username: username,
            favstock: favstock
        }
    }).done(function (data) {
        transLog(username, favstock, "Removed");
        console.log("Data: " + data);
        if (data.status == 0) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    }).fail(function (error) {
        console.log("Error Removing to Favorites:", error.statusText);
    });
}





function transLog(username, favstock, transaction) {
    a = $.ajax({
        url: 'final.php/log',
        method: 'POST',
        data: {
            username: username,
            favstock: favstock,
            transaction: transaction
        }
    }).done(function (data) {
        console.log("Data Info: " + data.message);
    }).fail(function (error) {
        console.log("Error Updating Log:", error.statusText);
    });
}




function showNews(ticker) {
    $.ajax({
        url: 'https://api.polygon.io/v2/reference/news?ticker=' + ticker + '&order=desc&limit=5&apiKey=iqqn_FoP25cZv1WWbvi3MZb0tgXptPPy',
        method: 'GET'
    }).done(function (data) {
        $('#newsList').empty();
        var len = data.results.length;
        for (var i = 0; i < len; i++) {
            var logoUrl = data.results[i].publisher.logo_url;
            var title = data.results[i].title;
            var articleUrl = data.results[i].article_url;
            var publishedUtc = data.results[i].published_utc;
            var publisher = data.results[i].publisher.name;
            var listItem = "<li><img src='" + logoUrl + "' alt='Publisher Logo' style='width: 20px; height: 20px;'> <a href='"
                + articleUrl + "'>" + title + "</a> - Published: " + publishedUtc + " - Publisher: " + publisher + "</li>";
            $("#newsList").append(listItem);
        }
    }).fail(function (error) {
        console.log("Error fetching news data:", error.statusText);
    });
}