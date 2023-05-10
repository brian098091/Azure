'use strict';
const line  = require('@line/bot-sdk'),
      express = require('express'),
      axios = require('axios'),
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
    const results = await analyticsClient.analyzeSentiment(documents,"zh-Hant",{includeOpinionMining: true});
    console.log("[results] ",JSON.stringify(results));
    
    //Save to JSON Server
    let newData = {
        "sentiment" : results[0].sentiment,
        "confidenceScore": results[0].confidenceScores[results[0].sentiment],
        "opinionText": ""
    };
    if(results[0].sentences[0].opinions[0] != null){
        newData.opinionText = results[0].sentences[0].opinions[0].target.text 
    }
    let axios_add_data = {
        method : "post",
        url:"https://ntnu-lat-bot-jsonserver.azurewebsites.net/reviews",
        headers:{
            "content-type":"application/json"
        },
        data:newData
    };
    axios(axios_add_data)
    .then(function(response){
        console.log(JSON.stringify(response.data));
    })
    .catch(function(){console.log("error");});





    const echo = {
        type:'text',
        text:results[0].sentiment
    };
    // 正面回應
    if(echo.text == "positive")
    {
        // 是否回傳主詞
        if(results[0].sentences[0].opinions[0] != null)
        {
            echo.text = "您對"+results[0].sentences[0].opinions[0].target.text + "的評價是正向的\n分數:" +  results[0].confidenceScores.positive
        }
        else
        {
            echo.text = "正向,分數:" + results[0].confidenceScores.positive
        }
        
        
    }
    // 中立回應    
    else if(echo.text == "neutral")
    {
        if(results[0].sentences[0].opinions[0] != null)
        {
            echo.text = "您對"+results[0].sentences[0].opinions[0].target.text + "的評價是中立的\n分數:" +  results[0].confidenceScores.neutral
        }
        else
        {
            echo.text = "中立,分數:" + results[0].confidenceScores.neutral
        }
    } 
    // 負面回應
    else 
    {
        if(results[0].sentences[0].opinions[0] != null)
        {
            echo.text = "您對"+results[0].sentences[0].opinions[0].target.text + "的評價是負面的\n分數:" +  results[0].confidenceScores.negative
        }
        else
        {
            echo.text = "負面,分數:" + results[0].confidenceScores.negative
        }
    }
        

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

