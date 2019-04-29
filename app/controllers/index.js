$.index.open();

function login(e) {
    var email = $.email.value;
    var password = $.password.value;
    let url =
        'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyAStYpcDOFdGH3vKh549ZnIFBU4wRB1M30';

    var xhr = Ti.Network.createHTTPClient({
        onload: function(e) {
            console.log(this.responseText);

            setUser(this.responseText);
            openLanding();
        },
        onerror: function(e) {
            console.log('ERROR: ' + this.responseText);
        },
        timeout: 5000,
    });
    xhr.open('POST', url);
    xhr.send({
        email: email,
        password: password,
        returnSecureToken: true,
    });
}

function setUser(response) {
    response = JSON.parse(response);

    var expiration = new Date();
    expiration.setSeconds(
        expiration.getSeconds() + parseInt(response.expiresIn)
    );

    user = Alloy.createModel('user', {
        uid: response.localId,
        email: response.email,
        idToken: response.idToken,
        refreshToken: response.refreshToken,
        expiration: expiration,
    });
}

function skipLogin() {
    openLanding();
}

function openLanding() {
    Alloy.createController('landing')
        .getView()
        .open();
}
