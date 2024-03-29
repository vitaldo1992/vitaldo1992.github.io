function load_css(filename){

    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);

    document.getElementsByTagName("head")[0].appendChild(fileref);
}



function load() {
    var mydata = JSON.parse(data);
    alert(mydata);
}
(function () {


    switch(window.location.hostname) {
        case "hanteranyhetsbrev.hd.se":
            var site_name = "HD.se";
            var logo_url = "https://kundservice.bonniernewslocal.se/wp-content/uploads/2021/06/hd-1.png";
            var json_url = "/assets/settings/preferences-hd.json?1";
            var page_title = "Hantera dina nyhetsbrev";
            var bg_color = "#1D3965";
            load_css("/assets/css/hd.css");
            break;

        case "hanteranyhetsbrev.sydsvenskan.se":
            var site_name = "Sydsvenskan.se";
            var logo_url = "https://kundservice.bonniernewslocal.se/sydsvenskan/wp-content/uploads/sites/39/2021/03/sds-logga.png";
            var json_url =  "/assets/settings/preferences-sydsvenskan.json";
            var page_title = "Hantera dina nyhetsbrev";
            var bg_color = "#71131C";
            load_css("/assets/css/sydsvenskan.css");
            break;

        case "vitaldo1992.github.io":
            var site_name = "Sydsvenskan.se";
            var logo_url = "https://kundservice.bonniernewslocal.se/sydsvenskan/wp-content/uploads/sites/39/2021/03/sds-logga.png";
            var json_url =  "assets/settings/preferences-sydsvenskan.json";
            var page_title = "Hantera dina nyhetsbrev";
            var bg_color = "#71131C";
            load_css("assets/css/sydsvenskan.css");
            break;

        default:
        // code block
    }



    var page_description = "";

    function getTranslations() {

        var translations = {
            en: {
                document: {
                    title: 'Unsubscribe'
                },
                title: {
                    common: 'Now You are unsubscribed from',
                    preferences: 'Preferences settings',
                    updating_success: 'Preferences are successfully updated',
                    unsubscribed: 'You are unsubscribed from all emails',
                    unsubscribing_success: 'Now You are unsubscribed from all emails',
                    resubscribed: 'Now You are successfully resubscribed!',
                    subscribed: 'Subscription settings'
                },
                description: 'You can update your preferences by checking the relevant checkboxes below and then clicking "update"',
                button_update: 'Update',
                footer: {
                    text: {
                        resubscribe: 'Resubscribe to get emails in future',
                        unsubscribe: 'Unsubscribe from all emails in future'
                    },
                    button: {
                        resubscribe: 'Resubscribe',
                        unsubscribe: 'Unsubscribe'
                    }
                }
            },
            sv: {
                document: {
                    title: page_title + ' - avregistrering'
                },
                title: {
                    common: 'Du är nu avregistrerad på ',
                    preferences: 'Preferenser inställningar',
                    updating_success: 'Inställningarna har uppdaterats',
                    unsubscribed: 'Du är nu avregistrerad från alla email',
                    unsubscribing_success: 'Nu är du avregistrerad från alla email',
                    resubscribed: 'Nu är du återregistrerad!',
                    subscribed: 'Prenumerations inställningar'
                },
                description: 'Du kan uppdatera dina preferenser genom att markera de relevanta checkboxarna och sen klicka på "uppdatera"',
                button_update: 'Uppdatera',
                footer: {
                    text: {
                        resubscribe: 'Återregistrera för att få framtida email',
                        unsubscribe: 'Avregistrera från alla framtida email'
                    },
                    button: {
                        resubscribe: 'Återregistrera',
                        unsubscribe: 'Avregistrera'
                    }
                }
            }
        }

        var default_language = 'sv';
        var language = getParameterByName('lang') || default_language;
        if (!translations[language]) {
            language = default_language;
        }

        return translations[language];
    }

    (function loadPage() {

        var stylesLoadTime = 200;

        loadStyles();

        document.title = getTranslations().document.title;

        setTimeout(function () {
            loadContent();
        }, stylesLoadTime);
    })();

    function loadStyles() {
        var baseUrl = window.location.href.split('/').slice(0,4).join('/');
        styleUrls = [
            'https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900&display=swap',
            baseUrl + '/assets/css/style.css'
        ];
        styleUrls.forEach(function (styleUrl) {
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', styleUrl);
            document.head.appendChild(link);
        });
    }

    function loadContent() {
        var subscriber_id = getParameterByName('subscriber_id'),
            account_id = getParameterByName('account_id'),
            group_id = getParameterByName('preference_group_id'),
            preference_id = getParameterByName('preference_id'),
            rule_unsubscribe_portal = document.querySelector('#rule-unsubscribe-portal');

        request({
            url: getBaseUrl() + '/check-suppression?account_id=' + account_id + '&subscriber_id=' + subscriber_id,
            callback: function(subscriber) {
                if (group_id) {
                    var url = getBaseUrl() + '/preference/encrypted-preferences?account_id=' + account_id + '&preference_group_id=' + group_id + '&subscriber_id=' + subscriber_id;
                    request({
                        url: url,
                        callback: function(res) {
                            request( {
                                url: json_url /*'preference-mock.json'*/,
                                callback: function(categories) {
                                    categories.forEach(function(category) {
                                        category.preferences.forEach(function(preference) {
                                            res.preference_group.preferences.forEach(function(pref) {
                                                if(preference.name === pref.name) {
                                                    preference.is_opted_in = pref.is_opted_in;
                                                    preference.position = pref.position;
                                                    preference.id = pref.id;
                                                    preference.img = 'https://hanteranyhetsbrev.sydsvenskan.se/' + preference.img // to remove
                                                }
                                            })
                                        })
                                    })

                                    subscriber.preference_id = preference_id;
                                    subscriber.preference_group = res.preference_group;

                                    rule_unsubscribe_portal.innerHTML = getPreferencesPage(subscriber, categories);

                                    listenUpdatePreferences(subscriber_id, account_id, subscriber.preference_group);
                                    listenToggleSubscribe(subscriber_id, account_id);
                                }
                            })

                        }
                    });
                } else {
                    listenToggleSubscribe(subscriber_id, account_id);
                }
            }
        });
    }


    /*************************NY***********/

    function getInitialTitle(is_suppressed) {
        var translation = getTranslations();
        return is_suppressed ? translation.title.unsubscribed : null;
    }

    /*************************NY***********/


    function getPreferencesPage(subscriber, categories) {

        /*******************/

        var is_suppressed = subscriber.is_suppressed;

        /********************/

        var title_off = getInitialTitle(is_suppressed);
        var title_unsubscribed = "<p class='opt-out-head blink'" + (title_off ? title_off : " style='display: none'") +  " id='opt-out-head-top'>" + title_off + "</p>";
        return '' +
            '<div class="unsubscribe-page">' +
            '<div class="logo_top"><img src="'+ logo_url +'" class="logo"></div>' +
            title_unsubscribed +
            '<p class="page-title">'+ page_title +'</p>' +
            '<p class="page-description">'+ page_description + 'Välj de nyhetsbrev som intresserar dig mest. Klicka på knappen under respektiv nyhetsbrev för att anmäla eller avanmäla dig.</p>' +
            '<div class="content" id="preferences-content">' +
            categories.map(function (category) {
                return '' +
                    '<p class="category-name">' + category.name + '</p>' +
                    '<div class="email-preferences-group">' +
                    '<ul class="email-preferences">' +
                    category.preferences.map(function (preference) {
                      return '' +
                        '<li class="preference" id="preference-id-' + preference.id + '">' +
                        '<img  class="image" src="' + preference.img + '">' +
                        '<p class="preference-name">' +
                        preference.name +
                        '</p>' +
                        '<p class="description">' +
                        preference.description +
                        '</p>' +
                        (preference.is_opted_in
                          ? (
                            '<input class="checkbox" type="checkbox" id="preference-checkbox-' + preference.id + '" checked="checked"/>' +
                            '<label class="pref-button" for="preference-checkbox-' + preference.id + '">' +
                              'Avanmäl dig' +
                            '</label>'
                            ) : (
                            '<input class="checkbox" type="checkbox" id="preference-checkbox-' + preference.id + '"/>' +
                            '<label class="pref-button" for="preference-checkbox-' + preference.id + '">' +
                              'Anmäl dig' +
                            '</label>'
                          )
                        ) +
                        '</li>'
                    }).join(' ') + '</ul></div>'
            }).join(' ') +
            '</div>' +
            '<footer class="footer">' +
              (is_suppressed
                ? (
                    '<p id="footer-text"  class="footer-text"> Vill du få nyheter? </p>' +
                    '<button class="pref-button footer-button" id="footer-button" data-unsubscribed="true">Prenumerera igen</button>'
                ) : (
                    '<p id="footer-text"  class="footer-text"> Inte längre intresserad? Avanmäl dig från samtliga nyhetsbrev </p>' +
                    '<button class="pref-button footer-button" id="footer-button" data-unsubscribed="false">Avanmäl dig</button>'
                )
              ) +
            '</footer>' +
            '</div>';
    }

    function getParameterByName(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(window.location.href);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    function listenToggleSubscribe(subscriber_id, account_id) {
        var footer_button = document.querySelector('#footer-button'),
            footer_text = document.querySelector('#footer-text'),
            preferences_content = document.getElementById('preferences-content');

        if (footer_button) {
            footer_button.addEventListener('click', function () {
                var is_subscribed = !JSON.parse(footer_button.getAttribute('data-unsubscribed'));
                var url = getBaseUrl() + '/preference/' + (is_subscribed ? 'unsubscribe' : 'resubscribe') + '?account_id=' + account_id + '&subscriber_id=' + subscriber_id;
                    request({
                        url: url,
                        callback: function (response) {
                            if (response && response.success === 'true') {
                                is_subscribed = !is_subscribed;
                                footer_button.setAttribute('data-unsubscribed', !is_subscribed);
                                if (is_subscribed) {
                                    footer_text.textContent = 'Inte längre intresserad? Avanmäl dig från samtliga nyhetsbrev';
                                    footer_button.textContent = 'Avanmäl dig';
                                    preferences_content.classList.remove('suppressed');
                                } else {
                                    footer_text.textContent = 'Vill du få nyheter?';
                                    footer_button.textContent = 'Prenumerera igen';
                                    preferences_content.classList.add('suppressed');
                                }
                        }
                    }
                });
            });
        }
    }


    function listenUpdatePreferences(subscriber_id, account_id, preference_group) {

        document.querySelectorAll('.checkbox').forEach( function(checkbox) {
            checkbox.addEventListener('change', function (event) {

                preference_group.preferences.forEach(function (preference) {
                    var preference_checkbox = document.querySelector('#preference-checkbox-' + preference.id);
                    if (preference_checkbox) {
                        preference.is_opted_in = preference_checkbox.checked;
                    }
                });

                show_stat();
                var checkbox_label = checkbox.parentNode.querySelector('label');
                if(checkbox.checked) {
                    checkbox_label.textContent = 'Avanmäl dig';
                } else {
                    checkbox_label.textContent = 'Anmäl dig';
                }
                var url = getBaseUrl() + '/preference/update-subscriber-preferences';

                request({
                    url: url,
                    method: 'PATCH',
                    body: { preference_group: preference_group },
                    callback: function () {}
                });


            });
        });
    }

    /* XXX ***/
    function show_stat(){
        var elem = document.getElementById("opt-out-head-top");
        if(elem){
            elem.textContent = "Inställningarna har uppdaterats.";
            elem.style.color="#000";
            elem.style.display="inline-block";
        }
    }

    function getBaseUrl() {
        return getParameterByName('domain');
    }

    function request(params) {
        var url = params.url,
            method = params.method || 'GET',
            callback = params.callback,
            errorCallback = params.errorCallback,
            body = JSON.stringify(params.body),
            test = params.test;

        callback = callback || function () {
        };
        errorCallback = errorCallback || function () {
        };

        if (test) {
            return setTimeout(callback, 500);
        }

        var xhr = new XMLHttpRequest();

        xhr.open(method, url);
        if (['PATCH', 'POST', 'PUT'].indexOf(method) !== -1) {
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        }
        xhr.send(body);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(JSON.parse(xhr.response));
            }
        };
        xhr.onerror = errorCallback;
    }

})();
