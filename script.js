"use strict";

var userSettings = {
    config : {
        units : 'imperial',
        coords : {lat: 0.0, long: 0.0}
    },
    
    getCoords : function () {
        return this.config.coords;
    },
    
    setLocation : function () {
        return ajaxRqst.geoLocate();
    },
    
    changeUnits : function () {
        if (this.units === 'imperial') {
            this.units = 'metric';
        } else {
            this.units = 'imperial';
        }
    }
}

var displayItems = {
    init : function ($location, $temperature) {
        this.$location = $location;
        this.$temperature = $temperature;
    },
    
    locationText : function (text) {
        this.$location.html(text);
    },
    
    tempText : function (text) {
        this.$temperature.html(text);
    }
};

var ajaxRqst = {
    config : {
        owmApiKey : 'aca3b2df6e00acafd57f2690c4212189',
        owmBaseUrl: 'http://api.openweathermap.org/data/2.5/weather?',
        callback: '&callback=?'
    },
    
    geoLocate : function () {
        this.geoPromise = new Promise( function (resolve, reject) {
            navigator.geolocation.getCurrentPosition(function success(position) {
                userSettings.getCoords.lat = position.coords.latitude.toFixed(2);
                userSettings.getCoords.long = position.coords.longitude.toFixed(2);
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
                    url : `${ajaxRqst.config.owmBaseUrl}lat=${userSettings.getCoords.lat}` +
                    `&lon=${userSettings.getCoords.long}${ajaxRqst.config.callback}` + 
                    `&units=${userSettings.config.units}`,
                    dataType : "jsonp"
                });
                ajaxRqst.weatherPromise.then(function (result, textStatus, xhr) {
                    displayItems.locationText(result.name);
                    displayItems.tempText(result.main.temp);
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
    displayItems.init( $('#location'), $('#temperature') );
    userSettings.setLocation();
    ajaxRqst.getWeather();
});

//`${ajaxRqst.config.owmBaseUrl}lat=${userSettings.getCoords.lat}&
//long=${userSettings.getCoords.long}${ajaxRqst.config.callback}`