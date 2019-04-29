// Arguments passed into this controller can be accessed via the `$.args` object directly or:
/**
 * Need to add functionality to load shelf from Firestore and update shelf in Firestore when
 * a new title is added or removed. If this fails, we should not add or remove the title locally.
 *
 * GET the shelves collection:
 * 		https://firestore.googleapis.com/v1beta1/projects/jml-mediashelf/databases/(default)/documents/shelves
 * GET a single user shelf:
 * 		https://firestore.googleapis.com/v1beta1/projects/jml-mediashelf/databases/(default)/documents/shelves/w5TSfsFMayleyd65xO6Y
 * PATCH a single user shelf with new data (replacing all previous data):
 * 		https://firestore.googleapis.com/v1beta1/projects/jml-mediashelf/databases/(default)/documents/shelves/w5TSfsFMayleyd65xO6Y
 * PATCH a single user shelf with new data (specifying fields to update)
 * 		https://firestore.googleapis.com/v1beta1/projects/jml-mediashelf/databases/(default)/documents/shelves/w5TSfsFMayleyd65xO6Y?&updateMask.fieldsPaths={field}
 *
 */
var args = $.args;
var baseAPI =
    'https://firestore.googleapis.com/v1beta1/projects/jml-mediashelf/databases/(default)/documents/shelves';
shelf.fetch();
// $.email.text = user.email;

// Preparing "listeners" for dispatch
Alloy.Events.on('addToShelf', addToShelfTest);

/**
 * Adds the given media to the shelf locally and (eventually) server-side.
 *
 * @param {object} media
 */
function addToShelfTest(media) {
    media = media.media;
    console.log('HOME: Add to Shelf');

    if (!user) {
        var mediaModel = Alloy.createModel('media', {
            title: media.title,
            year: media.year,
            poster: media.poster,
            id: media.id,
            shelf_id: media.shelf_id,
        });

        shelf.add(mediaModel);
        mediaModel.save();
        Alloy.Globals.toast(L('item_added'));
        return;
    }

    // Call API to add item to shelf
    // *** NEED user UID
    var apiURL =
        baseAPI + '/' + user.uid + '?&updateMask.fieldPaths=' + media.id;

    if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
        console.log('No Network Connection...Failed');
        return;
    }
    console.log('Network Connection OK...');

    // Prepare payload
    var payloadFields = {};
    var mediaId = media.id;
    payloadFields[mediaId] = {
        stringValue: media.title,
    };

    var payload = {
        fields: payloadFields,
    };
	
	xhr.PATCH({
		url: apiURL,
		onSuccess: function(e) {
			console.log(e);
		},
		onError: function(e) {
			alert(L('generic_error'));
		},
		data: payload
	});
}

/**
 * Removes the clicked object from the Shelf locally and (eventually) server-side.
 *
 * @param {event} e
 */
function removeFromShelf(e) {
    e.cancelBubble = true;
    console.log('Remove from Shelf');

    var selected = $.shelfList.sections[0].getItemAt(e.itemIndex);

    var media = shelf.where({ id: selected.id.text });
    media = media[0];
    media.destroy();

    console.log(shelf);
}

/**
 * Event-handler for sort switch. Checks the switch value and sets the sorting method
 * for the Shelf items accordingly.
 *
 * @param {event} e
 */
function sort(e) {
    console.log($.sortSwitch.value);

    var switchState = $.sortSwitch.value;

    if (switchState === true) {
        shelf.comparator = function(media) {
            return media.get('title');
        };
        $.sortLabel.text = 'Sort By Title';
    } else {
        shelf.comparator = function(media) {
            return media.get('shelf_id');
        };
        $.sortLabel.text = 'Sort By Order';
    }

    shelf.sort();
}

/**
 * showCamera: handle required permissions and display camera for video capture
 *             and photo capture
 *
 * @param type: capture type, can be Ti.Media.MEDIA_TYPE_VIDEO or Ti.Media.MEDIA_TYPE_PHOTO
 * @param callback: callback from camera
 *     @param error: defined when an error has occurred, otherwise null
 *     @param result: result from the camera containing captured media information
 */
function showCamera(type, callback) {
    var camera = function() {
        // call Titanium.Media.showCamera and respond callbacks
        Ti.Media.showCamera({
            success: function(e) {
                callback(null, e);
            },
            cancel: function(e) {
                callback(e, null);
            },
            error: function(e) {
                callback(e, null);
            },
            saveToPhotoGallery: false,
            mediaTypes: [type],
        });
    };

    // check if we already have permissions to capture media
    if (!Ti.Media.hasCameraPermissions()) {
        // request permissions to capture media
        Ti.Media.requestCameraPermissions(function(e) {
            // success! display the camera
            if (e.success) {
                camera();

                // oops! could not obtain required permissions
            } else {
                callback(
                    new Error('could not obtain camera permissions!'),
                    null
                );
            }
        });
    } else {
        camera();
    }
}

/**
 * Event handler for "Change Poster" button. Opens the device camera to take a picture
 * as the new Poster for the clicked item. If a picture is taken successfully,
 * the image is used as the poster for that item in the local Shelf.
 *
 * @param {event} e
 */
function cameraBtnListener(e) {
    var item = $.shelfList.sections[0].getItemAt(e.itemIndex);
    console.log(item);

    // attempt to take a photo with the camera
    showCamera(Ti.Media.MEDIA_TYPE_PHOTO, function(error, result) {
        if (error) {
            console.log(error);
            alert('Could not take photo');
            return;
        }

        // validate we taken a photo
        if (result.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
            item.img.image = result.media;
            // get model
            var media = shelf.where({ id: item.id.text });
            console.log(media);
            media = media[0];

            media.save({ poster: result.media });
        }
    });
}
