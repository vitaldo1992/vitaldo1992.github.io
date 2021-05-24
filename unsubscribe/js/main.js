function load() {
    var mydata = JSON.parse(data);
    alert(mydata);
}
(function () {

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
                    title: 'Avregistrering'
                },
                title: {
                    common: 'Du är nu avregistrerad',
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
            styleUrls = [
            'https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900&display=swap',
            '/assets/css/style.css'
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
                if (preference_id && group_id) {
                    var url = getBaseUrl() + '/preference/encrypted-preferences?account_id=' + account_id + '&preference_group_id=' + group_id + '&subscriber_id=' + subscriber_id;
                    request({
                        url: url,
                        callback: function(res) {
                            request( {
                                url: 'preference-mock.json',
                                callback: function(categories) {
                                    categories.forEach(function(category) {
                                        category.preferences.forEach(function(preference) {
                                            res.preference_group.preferences.forEach(function(pref) {
                                                if(preference.name === pref.name) {
                                                    preference.is_opted_in = pref.is_opted_in;
                                                    preference.position = pref.position;
                                                    preference.id = pref.id;
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
                    // rule_unsubscribe_portal.innerHTML = getPreferencesPage(subscriber);
                    listenToggleSubscribe(subscriber_id, account_id);
                }
            }
        });
    }

    function getPreferencesPage(subscriber, categories) {
        var is_subscribed = subscriber.preference_group.preferences.some(function (preference) { return preference.is_opted_in === 1;} )

        return '' +
            '<div class="unsubscribe-page">' +
            '<p class="page-title">Sydsvenskans nyhetsbref</p>' +
            '<p class="page-description">Valj de nyhetsbrev som intresserar dig mest. Klicka pa knappen under respektiv nyhetsbrev for att anmala eller avanmala dig.</p>' +
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
                                            '<div class="pref-button  opt-in">' +
                                                '<label>' +
                                                    '<input class="btn" type="checkbox" value="1" id="preference-checkbox-' + preference.id + '" checked="checked"/><span>Anmäl dig</span>' +
                                                '</label>' +
                                            '</div>'
                                            )
                                            : (
                                            '<div class="pref-button  opt-out">' +
                                                '<label>' +
                                                    '<input class="btn" type="checkbox" value="1" id="preference-checkbox-' + preference.id + '"/><span>Avanmäl dig</span>' +
                                                '</label>' +
                                            '</div>'
                                            )
                                    ) +
                                    '</li>'
                            }).join(' ')
                    }).join(' ') +
                    '</ul>' +
            '</div>' +
            '<footer class="footer">' +
            (is_subscribed
                ? (
                    '<p id="footer-text"  class="footer-text"> Inte langre intresserad? Avanmal dig till samtliga nuhetsbrev </p>' +
                    '<button class="pref-button opt-out" id="footer-button" data-unsubscribed="true">Avanmäl dig</button>'
                ) : ''
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
            url;

        if (footer_button) {
            footer_button.addEventListener('click', function () {
                var is_subscribed = footer_button.getAttribute('data-unsubscribed');

                if (is_subscribed) {
                    url = getBaseUrl() + '/preference/unsubscribe?account_id=' + account_id + '&subscriber_id=' + subscriber_id;

                    request({
                        url: url,
                        callback: function (response) {
                            if (response && response.success === 'true') {
                               var elements = document.getElementsByClassName('opt-in');
                                for (var i = 0, len = elements.length; i < len; i++) {
                                    elements[i].classList.remove('opt-in');
                                }
                            }
                        }
                    });
                }
            });
        }
    }

    function listenUpdatePreferences(subscriber_id, account_id, preference_group) {
        document.addEventListener('click', function (event) {
            if (event.target instanceof HTMLInputElement) {
                preference_group.preferences.forEach(function (preference) {
                    var checkbox = document.querySelector('#preference-checkbox-' + preference.id);
                    preference.is_opted_in = checkbox && checkbox.checked;
                });
                if(!event.target.hasAttribute('checked')) {
                    event.target.parentNode.parentNode.classList.add('checked');
                    event.target.parentNode.parentNode.classList.remove('opt-out');
                    event.target.setAttribute('checked', 'true');
                } else {
                    event.target.parentNode.parentNode.classList.add('opt-out');
                    event.target.parentNode.parentNode.classList.remove('opt-in');
                    event.target.parentNode.parentNode.classList.remove('checked');
                    event.target.removeAttribute('checked');
                }
                console.log('preference_group', preference_group)
                var url = getBaseUrl() + '/preference/update-subscriber-preferences';

                request({
                    url: url,
                    method: 'PATCH',
                    body: { preference_group: preference_group },
                    callback: function () {}
                });
            }
        });
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
