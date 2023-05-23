$(document).ready(function(){
    //do something
    $("#thisButton").click(function(){
        processImage();
        
    });
    $("#inputImageFile").change(function(e){
        processImageFile(e.target.files[0]);
    });
});

function processImage() {
    
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v3.1/ocr";
    
    var params = {
        'language': 'unk',
        'detectOrientation': 'true'
    };
    //顯示分析的圖片
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        // Request body
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        // 若沒找到文字則顯示"No text found"
        if(data.orientation == "NotDetected")
            $("#picDescription").append("No text found")
        // 有找到文字，將單字拼起來
        else{
            $("#picDescription").append("Text : <br>")
            for (var x = 0; x < data.regions[0].lines.length;x++){
                for(var y = 0; y<data.regions[0].lines[x].words.length ; y++)
                    $("#picDescription").append(data.regions[0].lines[x].words[y].text + " ")
                $("#picDescription").append("<br>")
            }
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};

function processImageFile(imageObject) {
    
    //確認區域與所選擇的相同或使用客製化端點網址
    var url = "https://eastus.api.cognitive.microsoft.com/";
    var uriBase = url + "vision/v3.1/ocr";
    
    var params = {
        'language': 'unk',
        'detectOrientation': 'true'
    };
    //顯示分析的圖片
    var sourceImageUrl = URL.createObjectURL(imageObject);
    document.querySelector("#sourceImage").src = sourceImageUrl;
    //送出分析
    $.ajax({
        url: uriBase + "?" + $.param(params),
        // Request header
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },
        type: "POST",
        processData:false,
        contentType:false,
        // Request body
        data: imageObject,
    })
    .done(function(data) {
        //顯示JSON內容
        $("#responseTextArea").val(JSON.stringify(data, null, 2));
        $("#picDescription").empty();
        // 若沒找到文字則顯示"No text found"
        if(data.orientation == "NotDetected")
            $("#picDescription").append("No text found")
        // 有找到文字，將單字拼起來
        else{
            $("#picDescription").append("Text : <br>")
            for (var x = 0; x < data.regions[0].lines.length;x++){
                for(var y = 0; y<data.regions[0].lines[x].words.length ; y++)
                    $("#picDescription").append(data.regions[0].lines[x].words[y].text + " ")
                $("#picDescription").append("<br>")
            }
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        //丟出錯誤訊息
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};
