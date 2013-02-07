/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var emulatorBridge = require('ripple/emulatorBridge'),
    db = require('ripple/db'),
    event = require('ripple/event');

function _omnibar() {
    return document.querySelector(".omni-bar input");
}

function _persist(url) {
    db.save("current-url", url);
}

function _persistRoot(url) {
    db.save("root-url", url);
}

function _currentURL() {
    return db.retrieve("current-url") || "about:blank";
}

function _rootURL() {
    return db.retrieve("root-url") || "about:blank";
}

function _back() {
    emulatorBridge.window().history.back();
}

function _forward() {
    emulatorBridge.window().history.forward();
}

function _reload() {
    emulatorBridge.window().location.reload();
}

event.on("FrameHistoryChange", function (url) {
    _omnibar().value = url;
    _persist(url);
    _persistRoot(url);
});

module.exports = {
    initialize: function (prev, baton) {
        var omnibar = _omnibar(),
            position, loc, tmp,
            url, filename, matching,
            xhr,
            newHeight = screen.availHeight/2;

        jQuery(".logo, .beta, .left, .right, .left-panel-collapse, .right-panel-collapse").css({
            "marginTop": "35px"
        });

        jQuery("#settings-xhr-proxy").parent().parent().hide();

        $(".omni-bar").show();

        position = document.documentURI.indexOf("?url=");
        window.resizeTo(1000, newHeight);
        window.moveTo((screen.availWidth - window.outerWidth)/2, 0);
        if (position !== -1) {
            url = document.documentURI.substring(position + 5, document.documentURI.length);
            if (url.match(/^\.[\.]?/) !== null) {
                loc = document.location;
                filename = loc.pathname.replace(/^.*[\\\/]/, '')
                matching = new RegExp(filename,"g");
                tmp = loc.protocol + "//" + loc.hostname + loc.pathname.replace(matching, "") + url;
                url = tmp;
            }
            _persist(url);
            _persistRoot(url);
            require('ripple/widgetConfig').initialize();
            require('ripple/ui/plugins/widgetConfig').initialize();
        }

        omnibar.value = _currentURL();

        omnibar.addEventListener("keydown", function (event) {
            if (event.keyCode === '13' || event.keyCode === 13 || event.keyCode === '0' || event.keyCode === 0) { // enter or return
                if (omnibar.value.trim() !== "") {
                    if (_currentURL().match(/^file:/) && omnibar.value.match(/^file:/)) { // Use ajax to know whether that file exists
                        xhr = new XMLHttpRequest();
                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4) {
                                if (xhr.responseText !== '') {
                                    _persist(omnibar.value);
                                    _persistRoot(omnibar.value);
                                    emulatorBridge.window().location.assign(omnibar.value);
                                } else {
                                    alert("File doesn't exist!");
                                    return;
                                }
                            }
                        };
                        xhr.open('GET', omnibar.value, true);
                        xhr.send(null);
                    } else {
                        //default the protocal if not provided
                        omnibar.value = omnibar.value.indexOf("://") < 0 ? "http://" + omnibar.value : omnibar.value;
                        _persist(omnibar.value);
                        _persistRoot(omnibar.value);
                        emulatorBridge.window().location.assign(omnibar.value);
                    }
                }
            }
        });

        window.addEventListener("keydown", function (event) {
            var hasMetaOrAltPressed = (event.metaKey || event.ctrlKey),
                key = parseInt(event.keyCode, 10);

            if (key === 37 && hasMetaOrAltPressed) { // cmd/ctrl + left arrow
                event.preventDefault();
                _back();
            }

            if (key === 39 && hasMetaOrAltPressed) { // cmd/ctrl + right arrow
                event.preventDefault();
                _forward();
            }

            if (key === 82 && hasMetaOrAltPressed) { // cmd/ctrl + r
                event.preventDefault();
                _reload();
            }

            if (key === 116) { // F5
                event.preventDefault();
                _reload();
            }
        });

        document.getElementById("history-back").addEventListener("click", _back);
        document.getElementById("history-forward").addEventListener("click", _forward);
        document.getElementById("history-reload").addEventListener("click", _reload);
    },
    currentURL: function () {
        return _currentURL();
    },
    rootURL: function () {
        return _rootURL();
    }
};
