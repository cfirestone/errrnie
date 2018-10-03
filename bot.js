// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const { ActivityTypes } = require('botbuilder');
const { TextPrompt, DialogSet, WaterfallDialog } = require('botbuilder-dialogs');

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

//Waterfall Dialog flow
const DEPLOY_SEMVER='deploy_semver';

//Individual Prompt Names
const PROMPT_FOR_NAME='prompt_for_name';
const PROMPT_FOR_SEMVER='prompt_for_semver';
const PROMPT_FOR_ENV='prompt_for_env';

class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;

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
                await turnContext.sendActivity(`${ count }: You said "${ turnContext.activity.text }"`);
                // increment and set turn counter.
                await this.countProperty.set(turnContext, count);
            }


        } else { 
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

exports.EchoBot = EchoBot;
