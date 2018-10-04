// http://adaptivecards.io/samples/ActivityUpdate.html
// https://docs.microsoft.com/en-us/adaptive-cards/authoring-cards/card-schema

module.exports = (buildData) => ({ 
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
                                    url: "https://cdn-images-1.medium.com/max/501/1*vGoxefPo4asUVmNL1VpEig.png",
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
                                    text: `Build #${buildData.number}`,
                                    weight: "bolder",
                                    size: "Large",
                                },
                                {
                                    type: "TextBlock",
                                    text: `Triggered by ${buildData.commit.substring(0,12)} ${buildData.event_type}`,
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
                    text: `Kicked off by ${buildData.author_name} on {{DATE(${buildData.started_at}, SHORT)}} @ {{TIME(${buildData.started_at})}}. Build took ${buildData.duration} seconds`,
                    wrap: true,
                    isSubtle: true
                },
                {
                    type: "TextBlock",
                    text: buildData.message
                }
            ]
         
        }
    ],
    actions: [
        {
            type: "Action.OpenUrl",
            title: "Compare changes in GitHub",
            url: buildData.compare_url,
        },
        {
            type: "Action.OpenUrl",
            title: "Open in TravisCI",
            url: `https://travis-ci.org/firestones/RubberDuckie/builds/${buildData.id}`
        }
    ]
})