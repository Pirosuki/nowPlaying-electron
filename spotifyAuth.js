const request = require('request')

// spotify recommends adding "state" here, I have no idea what that is.
const getSpotifyAuthOptions = {
    'client_id': 'applcatio n id',
    'response_type': 'code',
    'redirect_uri': 'http://localhost:8080',
    'scope': 'user-read-currently-playing'
};

// follow this: https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

// The refresh token will be stored here. This is a security risk so it will have to be fixed eventually.
refreshTokenPath = './cache/refreshToken';