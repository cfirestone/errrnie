// http://adaptivecards.io/samples/ActivityUpdate.html
// https://docs.microsoft.com/en-us/adaptive-cards/authoring-cards/card-schema

module.exports = (releaseData) => ({ 
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
                                    url: "https://avatars3.githubusercontent.com/u/2988541?s=200&v=4",
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
                                    type: "TextBlock",
                                    text: releaseData.name,
                                    weight: "bolder",
                                    size: "Large",
                                },
                                {
                                    type: "TextBlock",
                                    text: `Created by ${releaseData.author.login} on {{DATE(${releaseData.created_at}, SHORT)}} @ {{TIME(${releaseData.created_at})}}`,
                                    wrap: true,
                                    isSubtle: true
                                }
                            ]
                        }
                    ]
                    
                }
            ]
        },
        {
            type: "Container",
            items: [
                {
                    type: "TextBlock",
                    text: releaseData.body
                }
            ]
         
        }
    ],
    actions: [
        {
            type: "Action.OpenUrl",
            title: "Open in GitHub",
            url: releaseData.html_url,
        },
        {
            type: "Action.OpenUrl",
            title: "Download Zip",
            url: releaseData.zipball_url
        }
    ]
})