// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const { ActivityTypes, CardFactory } = require('botbuilder');
const { TextPrompt, DialogSet, WaterfallDialog } = require('botbuilder-dialogs');
const { LuisRecognizer } = require('botbuilder-ai');
const GitHub = require('github-api');

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

//Waterfall Dialog flow
const DEPLOY_SEMVER='deploy_semver';

//Individual Prompt Names
const PROMPT_FOR_NAME='prompt_for_name';
const PROMPT_FOR_SEMVER='prompt_for_semver';
const PROMPT_FOR_ENV='prompt_for_env';

// Make sure you add code to validate these fields
var luisAppId = "408a3db5-9f39-4ac5-aed7-9e487ea16864";
var luisAPIKey = "6351789663af46dfa7985bbd59a0f421";
var luisAPIHostName = 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/408a3db5-9f39-4ac5-aed7-9e487ea16864?subscription-key=6351789663af46dfa7985bbd59a0f421";

// dialogs
const releaseCardDialog = require('./dialogs/releaseCard');

class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(application, luisPredictionOptions) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = application.conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = application.conversationState;
        this.luisApiInfo = application.luisApiInfo;
        this.luisRecognizer = new LuisRecognizer(this.luisApiInfo, luisPredictionOptions, true);

        this.dialogState = this.conversationState.createProperty('dialogState');

        this.dialogs = new DialogSet(this.dialogState)

        this.dialogs.add( new TextPrompt(PROMPT_FOR_NAME));
        this.dialogs.add( new TextPrompt(PROMPT_FOR_SEMVER));
        this.dialogs.add( new TextPrompt(PROMPT_FOR_ENV));
        
        this.dialogs.add(new WaterfallDialog(DEPLOY_SEMVER, [
            this.promptForAppName.bind(this),
            this.promptForSemanticVersion.bind(this),
            this.promptForEnvironment.bind(this)
        ]))
    }
    async promptForAppName(step) {
        return await step.prompt(PROMPT_FOR_NAME,'What app do you want to deploy?');
    }
    async promptForSemanticVersion(step) {
        return await step.prompt(PROMPT_FOR_SEMVER,'What semantic version do you want to deploy?');
    }
    async promptForEnvironment(step) {
        return await step.prompt(PROMPT_FOR_ENV, 'Where do you want to deploy?');
    }

    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {
            const dc = await this.dialogs.createContext(turnContext);
            
            const utterance = (turnContext.activity.text || '').trim().toLowerCase();
            if (utterance === 'deploy') {
                console.log('entering deploy utterance');
                await dc.beginDialog(DEPLOY_SEMVER);
            } else {
                // read from state.
                let count = await this.countProperty.get(turnContext);
                count = count === undefined ? 1 : ++count;

                const results = await this.luisRecognizer.recognize(turnContext);
                // console.log('JSON(results): ', JSON.stringify(results));
                // console.dir(results);
                const topIntent = LuisRecognizer.topIntent(results);
                const confidence = results.luisResult.topScoringIntent.score;

                // const entity = results.luisResult.entities[0]['entity'];
                //await turnContext.sendActivity(`Dunno, but I'm ${Math.floor(confidence * 100)}% sure your intent is ${ topIntent }, and the thing you're asking about is ${ entity }!`);

                const appName = results.entities.appName;
                const releaseData = await this.retrieveLatestGithubRelease(appName);
                // console.dir(releaseData);
                await turnContext.sendActivity(`The latest release for ${appName} is '${releaseData.name}', created by ${releaseData.author.login} on ${releaseData.created_at}`);
                // await turnContext.sendActivity(`Dunno, but I'm ${Math.floor(confidence * 100)}% sure your intent is ${ topIntent }!`);
                // return;

                const ReleaseCard = releaseCardDialog(releaseData);
                const releaseCard = CardFactory.adaptiveCard(ReleaseCard)
                await turnContext.sendActivity({attachments: [releaseCard]});
                


                // await turnContext.sendActivity(`${ count }: You said "${ turnContext.activity.text }! Good job! Now you're watching index.js!"`);
                // // increment and set turn counter.
                await this.countProperty.set(turnContext, count);
            }
        } else { 
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }

    async retrieveLatestGithubRelease(repositoryName) {
        const owner = 'firestones';
        const gh = new GitHub();
        const repository = await gh.getRepo(owner, repositoryName);
        const releases = await repository.listReleases();
        //even though there's an endpoint in the API, there isn't one in the npm package
        // so we grab the 0th element of the list
        if(!releases.data || releases.data.length == 0) {
            throw new Error(`No releases found for ${repositoryName}`)
        }
        return releases.data[0];
    }
}

exports.EchoBot = EchoBot;
