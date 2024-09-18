$(document).ready(function () {
    var param = new URLSearchParams(window.location.search);
    var user = param.get('username');

    if(user!=null) {
        $('#searchButton').click(function(event) {
            event.preventDefault();
            console.log("Parameters: user - " + user + ", start - " + $(startDate).val() + ", end - "
                + $(endDate).val() + ", sort - " + $(sortOrder).val());

            if ($(startDate).val() == "") {
                alert("Please provide an starting date");
            } else if ($(endDate).val() == "") {
                alert("Please provide an ending date");
            } else if ($(startDate).val() > $(endDate).val()) {
                alert("Start date can't come after end date"); 
            } else {
                findHistory(user, $(startDate).val(), $(endDate).val(), $(sortOrder).val());
            }
        });
    }

});;

function findHistory(user, start, end, sort) {
    a = $.ajax({
        url: 'final.php/dailyLog',
        method: 'POST',
        data: {
            username: user,
            start: start,
            end: end,
            sort: sort
        }
        
    }).done(function(data) { 
        displayHistory(data);
    }).fail(function(error) {
        console.log("Error occured when looking for data: " + error.statusText);
    });
}

function displayHistory(data) {
    var cardHolder = $('#cardHolder');
    cardHolder.empty();

    var dailyLog = data.daily_log;
    for (var date in dailyLog) {
        var dayData = JSON.parse(dailyLog[date]);
        var addedTransactions = dayData.added_transactions;
        var removedTransactions = dayData.removed_transactions;
        var dayFavs = dayData.day_favs;

        var dayHeader = $('<h3>').text("Date: " + date);
        cardHolder.append(dayHeader);

        var row = $('<div>').addClass('row');

        var addedCardGroup = createCardGroup('Added Stocks', addedTransactions);
        var removedCardGroup = createCardGroup('Removed Stocks', removedTransactions);
        var dayFavsCardGroup = createCardGroup('End of Day Favorites', dayFavs);

        var col = $('<div>').addClass('col-md-4');
        col.append(addedCardGroup);
        row.append(col);

        col = $('<div>').addClass('col-md-4');
        col.append(removedCardGroup);
        row.append(col);

        col = $('<div>').addClass('col-md-4');
        col.append(dayFavsCardGroup);
        row.append(col);

        cardHolder.append(row);
    }
}

function createCardGroup(title, transactions) {
    var cardGroup = $('<div>').addClass('card-group');

    var card = $('<div>').addClass('card');
    var cardHeader = $('<div>').addClass('card-header').text(title);
    var cardBody = $('<div>').addClass('card-body');

    if (transactions.length === 0) {
        cardBody.text('No transactions for this day.');
    } else {
        var ul = $('<ul>').addClass('list-group');
        if (Array.isArray(transactions)) {
            transactions.forEach(function(transaction) {
                if (typeof transaction === 'object' && transaction.hasOwnProperty('stock')) {
                    var li = $('<li>').addClass('list-group-item').text(transaction.stock);
                    ul.append(li);
                } else if (typeof transaction === 'string') {
                    var li = $('<li>').addClass('list-group-item').text(transaction);
                    ul.append(li);
                }
            });
        } else if (typeof transactions === 'string') {
            var li = $('<li>').addClass('list-group-item').text(transactions);
            ul.append(li);
        }
        cardBody.append(ul);
    }

    card.append(cardHeader);
    card.append(cardBody);
    cardGroup.append(card);

    return cardGroup;
}