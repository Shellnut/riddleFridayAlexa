'use strict';
const request = require('request');

/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            text: output,
            ssml: output
        },
        card: {
            type: 'Simple',
            title: `SessionSpeechlet - ${title}`,
            content: `SessionSpeechlet - ${output}`,
        },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText,
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {

    // Invoke new riddle
    getRiddle((err, riddle) => {
        if (err) {
            console.log('err is', err);
            callback(err);
        }
        else {
            // If we wanted to initialize the session to have some attributes we could add those here.
            const sessionAttributes = {};
            const cardTitle = 'Welcome';
            const speechOutput = `<speak>${riddle.question}.<break time="3s"/> ${riddle.answer}</speak>`;
            // If the user either does not reply to the welcome message or says something that is not
            // understood, they will be prompted again with this text.
            const repromptText = '';
            const shouldEndSession = true;

            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

        }
    });


}


// --------------- Events -----------------------

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log(`onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}`);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {

    try {

        onLaunch(event.request, event.session, (sessionAttributes, speechletResponse) => {

            console.log('sessionAttributes', sessionAttributes);

            console.log('speechletResponse', speechletResponse);

            callback(null, buildResponse(sessionAttributes, speechletResponse));
        });

    } catch (err) {
        callback(err);
    }
};


// GET riddle
const getRiddle = (cb) => {
    // Declare riddles
    let riddle = {
        question: '',
        answer: ''
    };
    // GET params
    const options = {
        url: `https://www.riddles.com/riddle-of-the-day?page=${Math.ceil(Math.random() * 50)}`
    };
    // GET riddle info
    request.get(options, (err, resp, data) => {
        if (err) {
            cb(err, null);
        }
        else {
            // Get random question
            const questions = (data.match(/Riddle:(.*)<\/p>/gi) || []).map(val => val.match(/<p>(.*)<\/p>/)[1]);
            const answers = (data.match(/Answer:(.*)<\/p>/gi) || []).map(val => val.match(/<p>(.*)<\/p>/)[1]);
            const index = Math.floor(Math.random()*questions.length);
            riddle.question = questions[index];
            riddle.answer = answers[index];
            cb(null, riddle);
        }
    });

};
