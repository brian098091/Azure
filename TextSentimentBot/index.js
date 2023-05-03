'use strict';
const line  = require('@line/bot-sdk'),
      express = require('express'),
      configGet = require('config');

const {TextAnalyticsClient, AzureKeyCredential} = require("@azure/ai-text-analytics");

// Line config
const configLine = {
    channelAccessToken:configGet.get("CHANNEL_ACCESS_TOKEN"),
    channelSecret:configGet.get("CHANNEL_SECRET")
};

// Azure Text Sentiment
const endpoint = configGet.get("ENDPOINT");
const apiKey = configGet.get("TEXT_ANALYTICS_API_KEY")

const client = new line.Client(configLine)
const app = express();

const port = process.env.port || process.env.PORT || 3001;
app.listen(port,()=>{
    // `str ${variable}`
    console.log(`listening on ${port}`)
    // MS_TextSentimentAnalysis()
    // .catch((err)=>{
    //     console.error("Error",err);
    // })
});

async function MS_TextSentimentAnalysis(thisEvent){
    console.log("[MS_TextSentimentAnalysis] in");
    const analyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(apiKey));
    let documents = [];
    documents.push(thisEvent.message.text);
    const results = await analyticsClient.analyzeSentiment(documents);
    console.log("[results] ",JSON.stringify(results));

    const echo = {
        type:'text',
        text:results[0].sentiment
    };
    
    if(echo.text == "positive")
        echo.text = "正向,分數:" + results[0].confidenceScores.positive
    else if(echo.text == "neutral")
        echo.text = "中立,分數:" + results[0].confidenceScores.neutral
    else 
        echo.text = "負面,分數:" + results[0].confidenceScores.negative

    return client.replyMessage(thisEvent.replyToken, echo);
}


app.post('/callback',line.middleware(configLine),(req,res)=>{
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result)=>res.json(result))
        .catch((err)=>{
            console.error(err);
            res.status(500).end();
        });
});


function handleEvent(event){
    if(event.type !== 'message' || event.message.type !== 'text'){
        return Promise.resolve(null);
    }
    MS_TextSentimentAnalysis(event)
    .catch((err)=>{
        console.error("Error",err);
    });
    
}

