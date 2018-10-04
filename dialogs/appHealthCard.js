// http://adaptivecards.io/samples/ActivityUpdate.html
// https://docs.microsoft.com/en-us/adaptive-cards/authoring-cards/card-schema

module.exports = (versionData = {}, healthData = {}, appName) => ({ 
    $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
    type: "AdaptiveCard",
    version: "1.0",
    body: [
        {
            type: "Container",
            items: [
                {
                    type: "ColumnSet",
                    columns: [
                        {
                            type: "Column",
                            width: "auto",
                            items: [
                                {
                                    type: "Image",
                                    url: versionData.data ? 'https://cdn0.iconfinder.com/data/icons/simple-icons-ii/69/04-512.png' : 'https://www.emojirequest.com/images/ThumbsDownEmoji.jpg',
                                    size: "small",
                                    style: "person"
                                }
                            ]
                        },
                        {
                            type: "Column",
                            width: "stretch",
                            items: [
                                {
                                    type: 'TextBlock',
                                    text: versionData.data ? `${appName} is healthy!` : `${appName} is down!`,
                                    weight: "bolder",
                                    size: 'Large'
                                },
                                { 
                                    type: "TextBlock",
                                    text: versionData.data ? `Release ${versionData.data}` : '',
                                    isSubtle: true
                                }
                            ]
                        }
                    ]
                    
                }
            ]
        },
    ],
})