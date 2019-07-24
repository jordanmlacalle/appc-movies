var currentPage = 1;
var baseURL = '';

/**
 * Adds the clicked media item (Movie, TV series, etc.) to the current
 * user's shelf.
 *
 * @param {event} e
 */
function addToShelf(e) {
    e.cancelBubble = true;

    var selected = $.searchResults.sections[0].getItemAt(e.itemIndex);

    if (shelf.where({ id: selected.id }).length !== 0) {
        console.log('Item already on Shelf');
        Alloy.Globals.error(L('item_already_added'));
        return;
    }

    var media = {
        title: selected.name,
        year: selected.year,
        poster: selected.img.image,
        id: selected.id,
        shelf_id: shelf.length + 1,
    };

    Alloy.Events.trigger('addToShelf', { media: media });
}


function searchClick(e) {
    console.log('Search clicked...' + $.searchInput.value);
    $.searchInput.blur();
    $.searchResults.scrollToItem(0, 0, { animated: false });
    currentPage = 1;

    var searchTerm = $.searchInput.value;
    if (searchTerm.length == 0) {
        return;
    }
    var type = $.typePicker.getSelectedRow(0).id;

    if (type === 'pickerMovie') {
        searchTerm += '&type=movie';
    } else {
        searchTerm += '&type=series';
    }

    baseURL = 'http://www.omdbapi.com/?apikey=2b7ea350&s=' + searchTerm;
    searchAPI(baseURL, 1, true);
}

function clearSearch() {
    $.searchInput.value = '';
    $.searchResults.sections[0].items = [];
}

/**
 * Calls the OMDB API with the user input search term and populates the results.
 *
 * @param {event} e
 */
function searchAPI(url, page, clear) {
    let finalUrl = url + '&page=' + page;

    if (!checkConnection()) return;

    xhr.GET({
        url: finalUrl,
        onSuccess: function(e) {
            populateResults(e.data, url, clear);
        },
        onError: function(e) {
            alert(L('generic_error'));
            console.log(e);
        },
    });
}

function getBaseURL() {
    return baseURL;
}

/**
 * Populates the #searchResults ListView with the result set returned by
 * the OMDB API call.
 *
 * @param {*} results
 * @param {String} url
 */
function populateResults(results, url, clear) {
    console.log('Populating Results...');

    var rows = [];

    if (!clear) {
        rows = $.searchResults.sections[0].items;
    }

    // console.log(results);
    results = JSON.parse(results);
    let numResults = results.totalResults;

    if (results.Error) {
        alert(results.Error);
        return;
    }

    results = results.Search;
    // console.log(results);

    if (numResults > 10 && numResults - currentPage * 10 > 0) {
        $.searchResults.setMarker({
            sectionIndex: 0,
            itemIndex: currentPage * 10 - 5,
        });
        $.searchResults.addEventListener('marker', function(e) {
            console.log('Hit marker.');
            currentPage++;

            searchAPI(baseURL, currentPage, false);
        });
    }

    if (results.length > 0) {
        for (let item of results) {
            rows.push({
                title: {
                    text: item.Title + ' (' + item.Year + ')',
                },
                id: item.imdbID,
                year: item.Year,
                name: item.Title,
                img: {
                    image: item.Poster,
                },
            });
        }
    }

    $.searchResults.sections[0].items = rows;
}

/**
 * Handles the click event for items in the #searchResults ListView.
 * Navigates to a the details view for the clicked item.
 *
 * @param {event} e
 */
function itemClicked(e) {
    console.log('Item clicked! Index: ' + e.itemIndex);
    // var item = $.searchResults.sections[0].getItemAt(e.itemIndex);
    var item = e.section.items[e.itemIndex];
    console.log('Clicked item with ID: ' + item.id);

    var url = 'http://www.omdbapi.com/?apikey=2b7ea350' + '&i=' + item.id;

    if (!checkConnection()) return;

    xhr.GET({
        url: url,
        onSuccess: function(e) {
            console.log(e);
            var result = JSON.parse(e.data);
            console.log(result);
            var details = result;
            console.log('Opening window for ' + details.Title);
            Alloy.createController('movieDetails', details)
                .getView()
                .open();
        },
        onError: function(e) {
            console.log(e);
        },
    });
}

function checkConnection() {
    if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
        console.log('No Network Connection...Failed');
        return false;
    } else {
        console.log('Network Connection OK...');
        return true;
    }
}
