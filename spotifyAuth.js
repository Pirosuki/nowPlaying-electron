const fs = require('fs');
const randomstring = require("randomstring");
const crypto = require("crypto");
const base64url = require("base64url");
const axios = require('axios')
const express = require('express')
const querystring = require('querystring');
const open = require('open');
const { app } = require("electron");
const { Server } = require('http');
const { Http2ServerRequest } = require('http2');

// follow this: https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

// This is where the refresh token will be stored. This is a security risk, pls fix.
const refreshTokenPath = './cache/refreshToken';

var refreshToken;

// Creates refreshToken file if it doesn't exist
if (!fs.existsSync('./cache')){
    fs.mkdirSync('./cache');
    fs.openSync(refreshTokenPath, 'w');
}
else if (!fs.existsSync(refreshTokenPath)){
    fs.openSync(refreshTokenPath, 'w');
}
else if (fs.readFileSync(refreshTokenPath).length !== 0) {
    refreshToken = fs.readFileSync(refreshTokenPath).toString();
}

var accessToken;

var codeVerifier

const client_id = '7602bd676b664028a229ad5f54583740';

const redirect_uri = 'http://localhost:8085/';

module.exports = {
    doSpotifyAuth: function(callback) {
        // Web callback server stuff
        const app = express();
        const port = process.env.PORT || 8085;
    
        // Creating codeChallenge for authentication
        codeVerifier = randomstring.generate(128);
    
        const base64Digest = crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64");
    
        // Finished!
        const codeChallenge = base64url.fromBase64(base64Digest);
    
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
    
        // Web server details
        app.get('/', function(req, res) {
            let code = req.query.code;
            let error = req.query.error;
    
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
    
            else if (error !== undefined) {
                res.send("Spotify returned error: " + error);
            }
    
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