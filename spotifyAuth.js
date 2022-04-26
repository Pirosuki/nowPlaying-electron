const fs = require('fs');
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
const axios = require('axios')
const express = require('express')
const open = require('open');

// const querystring = require('querystring');
// const { app } = require("electron");
// const { Server } = require('http');
// const { Http2ServerRequest } = require('http2');

// Based on this: https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

// This is where the refresh token will be stored. This might be a security risk, pls fix.
const refreshTokenPath = './cache/refreshToken';

// These variables exist up here so I can pass the between functions easier
var refreshToken;
var accessToken;
var codeVerifier;

// Checks if ./cache path exists and creates that path and makes a refreshToken file if it doesn't
if (!fs.existsSync('./cache')){
    fs.mkdirSync('./cache');
    fs.openSync(refreshTokenPath, 'w');
}
// Checks if  refreshToken file exists in ./cache and creates it if it doesn't
else if (!fs.existsSync(refreshTokenPath)){
    fs.openSync(refreshTokenPath, 'w');
}
// Reads refreshToken file
else if (fs.readFileSync(refreshTokenPath).length !== 0) {
    refreshToken = fs.readFileSync(refreshTokenPath).toString();
}

// This is a spotify app client id. Using this will help the user keep track of what apps have been granted access to their account.
const client_id = '7602bd676b664028a229ad5f54583740';

// url to redirect to after receiving a spotify authentication code, this HAS to match what the Spotify app is set to, otherwise it will just error out.
const redirect_uri = 'http://localhost:8085/';

module.exports = {
    doSpotifyAuth: function(callback) {
        // Defines web server
        const app = express();
        const port = process.env.PORT || 8085;
    
        // Creates codeChallenge for authentication
        codeVerifier = randomstring.generate(128);
    
        const base64Digest = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64");

        const codeChallenge = base64url.fromBase64(base64Digest);
    
        // Sets parameters for requesting Spotify authentication code
        // spotify recommends adding "state" here, I have no idea what that is.
        const getSpotifyAuthParams = {
            'client_id': client_id,
            'response_type': 'code',
            'redirect_uri': redirect_uri,
            'code_challenge_method': 'S256',
            'code_challenge': codeChallenge,
            'scope': 'user-read-currently-playing'
        };
    
        // Makes options into string
        const getSpotifyAuthParamsString = new URLSearchParams(getSpotifyAuthParams);
    
        // Creates url for authentication including our options.
        const authURL = 'https://accounts.spotify.com/authorize?' + getSpotifyAuthParamsString;
    
        // Makes the web server listen and read whatever query it receives, we're specifically looking for 'code'.
        app.get('/', function(req, res) {
            // Defines variables for the 'code' and 'error' queries
            let code = req.query.code;
            let error = req.query.error;
    
            // If the 'code' query isn't empty, assume that everything worked.
            if (code !== undefined) {
                res.send("Authentication successful, you can close this window now.");
    
                // Closes web server
                server.close();
    
                let option = {
                    'client_id': client_id,
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': redirect_uri,
                    'code_verifier': codeVerifier
                }
    
                // Attempts to trade authentication code for refresh token
                axios({
                    method: 'post',
                    url: 'https://accounts.spotify.com/api/token',
                    params: option,
                    Headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (response) {
                    accessToken = response.data.access_token;
                    refreshToken = response.data.refresh_token;
    
                    if (accessToken !== undefined) {
                        fs.writeFileSync(refreshTokenPath, refreshToken);
    
                        console.log(refreshToken)
    
                        callback();
                    }
                    else {
                        console.log("Did not receive tokens. Spotify returned:");
                        console.log(response.data);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
            // Something went wrong since 'code' was empty, check errors
            else if (error !== undefined) {
                res.send("Spotify returned error: " + error);
            }
    
            // Catch for if the web server was pinged without parameters
            else {
                res.send("Error: Expected parameters but got none.");
            }
        });
    
        // Starts web server
        var server = app.listen(port);
    
        // Opens auth url
        open(authURL);
    },

    refreshAccessToken: function(callback) {
        let option = {
            'client_id': client_id,
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken,
            'code_verifier': codeVerifier
        }
    
        // Attempts to trade authentication code for refresh token
        axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            params: option,
            Headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(function (response) {
            accessToken = response.data.access_token;
            refreshToken = response.data.refresh_token;
    
            if (accessToken !== undefined) {
                fs.writeFileSync(refreshTokenPath, refreshToken);
                callback();
            }
            else {
                console.log("Did not receive tokens. Spotify returned:");
                console.log(response.data);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    },

    getAccessToken: function(callback) {
        {
            if (refreshToken !== undefined) {
                console.log('triggering refreshAccessToken()');
                module.exports.refreshAccessToken(function() {
                    callback(accessToken);
                });
            }
            else {
                console.log('triggering doSpotifyAuth()');
                module.exports.doSpotifyAuth(function() {
                    callback(accessToken);
                });
            }
        }
    }
}