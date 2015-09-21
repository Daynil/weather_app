"use strict";

var util = {
    changeUnits : function (curTemp, curUnit) {
        var newTemp = 0;
        if (curUnit === 'imperial') {
            newTemp = (curTemp - 32) * 5/9;
        } else {
            newTemp = (curTemp * 9/5) + 32;
        }
        return newTemp;
    }
}

var userSettings = {
    config : {
        units : 'imperial',
        location : {
            coords : {lat: 0.0, long: 0.0},
            name : 'City Name'
        }
    },
    
    getCoords : function () {
        return this.config.location.coords;
    },
    
    setLocation : function () {
        return ajaxRqst.geoLocate();
    },
    
    changeUnits : function (tempStr) {
        let tempNum = tempStr.match(/\d+.\d/)[0];
        var newUnits = util.changeUnits(tempNum, this.config.units);
        if (this.config.units === 'imperial') {
            this.config.units = 'metric';
        } else {
            this.config.units = 'imperial';
        }
        displayItems.tempText(newUnits.toString());
    },
    
    appendUnit : function () {
        if (this.config.units === 'imperial') {
            return "F";
        } else {
            return "C";
        }
    }
}

var displayItems = {
    init : function ($location, $temperature, $weatherDescr, $weatherIcon, $pageWrapper) {
        this.$location = $location;
        this.$temperature = $temperature;
        this.$weatherDescr = $weatherDescr;
        this.$weatherIcon = $weatherIcon;
        this.$pageWrapper = $pageWrapper;
    },
    
    locationText : function (text) {
        this.$location.html(text);
    },
    
    tempText : function (text) {
        // Round temperature to nearest tenth
        let textRounded = parseFloat(text).toFixed(1).toString();
        this.$temperature.html(textRounded + "° " + userSettings.appendUnit());
    },
    
    descrText : function (text) {
        // Capitalize first letter of each description word
        let arr = text.split(" ");
        for (let i = 0; i < arr.length; i++) {
            arr[i] = arr[i][0].toUpperCase() + arr[i].slice(1);
        }
        let textCap = arr.join(" ");
        this.$weatherDescr.html(textCap);
    },
    
    setWeatherIcon : function (jsonWeather) {
        var iconNum = jsonWeather.weather[0].icon;
        this.$weatherIcon.attr("src", "http://openweathermap.org/img/w/" + iconNum + ".png")
        this.setBackgroundJson(jsonWeather);
    },
    
    backgrounds : {
        day: {
            hot: [
                'http://i.imgur.com/wGOdwla.jpg', 'http://i.imgur.com/jBg67iW.jpg',
                'http://i.imgur.com/EMJuS5S.jpg', 'http://i.imgur.com/pn0tSOp.jpg' 
            ],
            warm: [
                'http://i.imgur.com/wGOdwla.jpg', 'http://i.imgur.com/jBg67iW.jpg',
                'http://i.imgur.com/ULzrHE9.jpg'
            ],
            cool: [
                'http://i.imgur.com/ULzrHE9.jpg', 'http://i.imgur.com/Vrd7laG.jpg',
                'http://i.imgur.com/V6bejj6.jpg', 'http://i.imgur.com/1cqEYyW.jpg'
            ],
            cold: [
                'http://i.imgur.com/NEZ8dsh.jpg', 'http://i.imgur.com/Vrd7laG.jpg',
                'http://i.imgur.com/V6bejj6.jpg', 'http://i.imgur.com/1cqEYyW.jpg',
                'http://i.imgur.com/9vweFZm.jpg', 'http://i.imgur.com/ZjZOcDf.jpg',
                'http://i.imgur.com/W90XWtC.jpg', 'http://i.imgur.com/LbAwXcY.jpg'
            ]
        },
        night: {
            hot: [
                'http://i.imgur.com/GC4nbDn.jpg', 'http://i.imgur.com/unA1Hoo.jpg',
                'http://i.imgur.com/k9U2BVQ.jpg', 'http://i.imgur.com/i3nmJGp.jpg',
                'http://i.imgur.com/uG6KF5G.jpg'
            ],
            warm: [
                'http://i.imgur.com/GC4nbDn.jpg', 'http://i.imgur.com/unA1Hoo.jpg',
                'http://i.imgur.com/k9U2BVQ.jpg', 'http://i.imgur.com/i3nmJGp.jpg'
            ],
            cool: [
                'http://i.imgur.com/bMTqLWy.jpg', 'http://i.imgur.com/DaeOzeB.jpg',
                'http://i.imgur.com/ZKjreJW.jpg'
            ],
            cold: [
                'http://i.imgur.com/bMTqLWy.jpg', 'http://i.imgur.com/DaeOzeB.jpg',
                'http://i.imgur.com/9brhBwO.jpg'
            ]
        }
    },
    
    setBackgroundJson : function (jsonWeather) {
        function randomBackground(imageArr) {
            var arrLen = imageArr.length;
            var randIndex = Math.floor(Math.random() * arrLen);
            return imageArr[randIndex];
        }
        // Set the background randomly based on day/night and temperature
        var today = new Date();
        //var msNow = today.getTime();
        var msNow = jsonWeather.dt;
        var isDay = false;
        if (msNow >= jsonWeather.sys.sunrise && msNow <= jsonWeather.sys.sunset) {
            isDay = true;
        }
        var curTemp = parseFloat(jsonWeather.main.temp);
        if (userSettings.config.units !== 'imperial') {
            curTemp = util.changeUnits(curTemp, userSettings.config.units);
        }
        var imageArray = [];
        
        if ( curTemp < 50 ) { // COLD
            imageArray = ( (isDay) ? this.backgrounds.day.cold : this.backgrounds.night.cold );
        } else if ( curTemp >= 50 && curTemp < 65 ) { // COOL
            imageArray = ( (isDay) ? this.backgrounds.day.cool : this.backgrounds.night.cool );
        } else if ( curTemp >= 65 && curTemp < 80 ) { // WARM
            imageArray = ( (isDay) ? this.backgrounds.day.warm : this.backgrounds.night.warm );
        } else if ( curTemp >= 80 ) { // HOT
            imageArray = ( (isDay) ? this.backgrounds.day.hot : this.backgrounds.night.hot );
        }
        
        var strImageUrl = randomBackground(imageArray);
        this.$pageWrapper.css("background", "url('" + strImageUrl + "')");
    },
    
    setBackgroundUrl : function (stringUrl) {
        this.$pageWrapper.css("background", "url('" + stringUrl + "')");
    }
    
};

var ajaxRqst = {
    config : {
        owmApiKey : 'aca3b2df6e00acafd57f2690c4212189',
        googMapsApiKey : 'AIzaSyDD2Gf48kocW5H7Iv8fY-eyesKpPdOpOnc',
        owmBaseUrl: 'http://api.openweathermap.org/data/2.5/weather?',
        callback: '&callback=?'
    },
    
    geoLocate : function () {
        this.geoPromise = new Promise( function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(function success(position) {
                userSettings.getCoords.lat = position.coords.latitude.toFixed(4);
                userSettings.getCoords.long = position.coords.longitude.toFixed(4);
                
                // Get a good city name from google maps
                $.ajax({
                    url : "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
                    userSettings.getCoords.lat + "," + userSettings.getCoords.long +
                    "&key=" + ajaxRqst.config.googMapsApiKey,
                    dataType : "json"
                })
                .done(function (result, textStatus, xhr) {
                    userSettings.config.location.name = result.results[0].address_components[2].long_name + 
                        ", " + result.results[0].address_components[4].short_name;
                    displayItems.locationText(userSettings.config.location.name);
                })
                .fail(ajaxRqst.ajaxError);
                
                resolve("All when well.");
            }, function error() {
                reject("Unable to retrieve your location");
            });
        });
        return this.geoPromise;
    },
    
    getWeather : function () {
        // Listen for coords being set
        this.geoPromise.then(
            function fin () {
                ajaxRqst.weatherPromise = $.ajax({
                    url : ajaxRqst.config.owmBaseUrl+ "lat=" + userSettings.getCoords.lat +
                        "&lon=" + userSettings.getCoords.long + ajaxRqst.config.callback + 
                        "&units=" + userSettings.config.units,
                    dataType : "jsonp"
                });
                ajaxRqst.weatherPromise.then(function (result, textStatus, xhr) {
                    displayItems.tempText(result.main.temp);
                    displayItems.descrText(result.weather[0].description);
                    displayItems.setWeatherIcon(result);
                }, ajaxRqst.ajaxError);
            },
            function fail (message) {
                displayItems.locationText(message);
            }
        );
    },
    
    ajaxError : function (xhr, textStatus, errorThrown) {
            console.log("readyState: " + xhr.readyState);
            console.log("responseText: " + xhr.responseText);
            console.log("status: " + xhr.status);
            console.log("text status: " + textStatus);
            console.log("error: " + errorThrown);
    }
};


$(document).ready(function () {
    displayItems.init( $('#location'), $('#temperature'), $('#weather-descr'),
                      $('#weather-icon'), $('.page-wrapper') );
    userSettings.setLocation();
    ajaxRqst.getWeather();
    
    var $temperature = $('#temperature');
    $temperature.click( function() {
        userSettings.changeUnits($temperature.text());
    });
});